import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

export const useChatRoomSettings = (chatRoomId, navigation) => {
  const [chatRoomName, setChatRoomName] = useState('');
  const [chatRoomDescription, setChatRoomDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [admins, setAdmins] = useState([]);
// Tilføj i din useChatRoomSettings hook:

const handleDeleteRoom = async () => {
  try {
    const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);

    // Slet chatrummet
    await chatRoomRef.delete();

    // Fjern chatRoomId fra alle brugeres chatRooms array
    const usersSnapshot = await firestore().collection('Users').get();

    const batch = firestore().batch();

    usersSnapshot.docs.forEach(doc => {
      const userRef = firestore().collection('Users').doc(doc.id);
      const userChatRooms = doc.data().chatRooms || [];

      if (userChatRooms.includes(chatRoomId)) {
        batch.update(userRef, {
          chatRooms: userChatRooms.filter(id => id !== chatRoomId),
        });
      }
    });

    await batch.commit();

    Alert.alert('Succes', 'Chatrum er slettet.');
    navigation.goBack();  // Naviger tilbage (evt. også i kaldet til hook)
  } catch (error) {
    console.error('Fejl ved sletning af chatrum:', error);
    Alert.alert('Fejl', 'Kunne ikke slette chatrummet. Prøv igen.');
  }
};

  // Tjek om bruger er admin
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          console.warn('Ingen bruger logget ind');
          setIsAdmin(false);
          return;
        }

        const roomDoc = await firestore().collection('chatRooms').doc(chatRoomId).get();
        const roomData = roomDoc.data();

        if (!roomData) {
          console.warn('Chatrum ikke fundet');
          setIsAdmin(false);
          return;
        }

        const currentUserId = currentUser.uid;
        const userIsAdmin =
          (Array.isArray(roomData.admins) && roomData.admins.includes(currentUserId)) ||
          roomData.creator === currentUserId;

        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error('Fejl ved hentning af admin-status:', error);
      }
    };
    fetchRoomData();
  }, [chatRoomId]);

  // Hent chatrum og brugere
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersSnapshot, chatRoomDoc] = await Promise.all([
          firestore().collection('Users').get(),
          firestore().collection('chatRooms').doc(chatRoomId).get(),
        ]);

        const chatRoomData = chatRoomDoc.data();

        if (!chatRoomData) {
          console.warn('Chatrum ikke fundet');
          setLoading(false);
          return;
        }

        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setChatRoomName(chatRoomData.name || '');
        setChatRoomDescription(chatRoomData.description || '');
        setUsers(usersList);

        // Brug chatrummets medlemmer hvis sat, ellers alle brugere
        const initialSelected = new Set(
          Array.isArray(chatRoomData.members) ? chatRoomData.members : usersList.map(u => u.id)
        );
        setSelectedUsers(initialSelected);
        setSelectAll(initialSelected.size === usersList.length);

        const adminIds = chatRoomData.admins || (chatRoomData.creator ? [chatRoomData.creator] : []);
        const adminUsers = usersList.filter(user => adminIds.includes(user.id));
        setAdmins(adminUsers);

        setLoading(false);
      } catch (error) {
        console.error('Fejl ved hentning af data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [chatRoomId]);

  // Toggle valg af enkelt bruger
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      setSelectAll(newSelected.size === users.length);
      return newSelected;
    });
  };

  // Toggle select all / deselect all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
      setSelectAll(true);
    }
  };

  // Gem ændringer i chatrummet
  const handleSaveChanges = async () => {
    if (!chatRoomName.trim()) {
      Alert.alert('Fejl', 'Chatrummets navn må ikke være tomt.');
      return;
    }
    if (selectedUsers.size === 0) {
      Alert.alert('Fejl', 'Vælg mindst én bruger.');
      return;
    }

    setLoading(true);
    try {
      const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);

      // Opdater chatrum data
      await chatRoomRef.update({
        name: chatRoomName.trim(),
        description: chatRoomDescription.trim(),
        members: Array.from(selectedUsers),
      });

      // Opdater brugernes chatRooms arrays 
      const batch = firestore().batch();

      // Først hent alle brugere
      const usersSnapshot = await firestore().collection('Users').get();

      usersSnapshot.docs.forEach(doc => {
        const userRef = firestore().collection('Users').doc(doc.id);
        const userChatRooms = doc.data().chatRooms || [];

        if (selectedUsers.has(doc.id)) {
          // Hvis brugeren skal være med, tilføj chatRoomId hvis ikke allerede tilføjet
          if (!userChatRooms.includes(chatRoomId)) {
            batch.update(userRef, {
              chatRooms: [...userChatRooms, chatRoomId],
            });
          }
        } else {
          // Hvis brugeren ikke skal være med, fjern chatRoomId hvis den findes
          if (userChatRooms.includes(chatRoomId)) {
            batch.update(userRef, {
              chatRooms: userChatRooms.filter(id => id !== chatRoomId),
            });
          }
        }
      });

      await batch.commit();

      Alert.alert('Succes', 'Ændringer gemt.');
      navigation.goBack();
    } catch (error) {
      console.error('Fejl ved gemning:', error);
      Alert.alert('Fejl', 'Kunne ikke gemme ændringer. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  return {
    chatRoomName,
    setChatRoomName,
    chatRoomDescription,
    setChatRoomDescription,
    users,
    selectedUsers,
    toggleUserSelection,
    selectAll,
    toggleSelectAll,
    loading,
    isAdmin,
    admins,
    handleSaveChanges,
    handleDeleteRoom, 
  };
};

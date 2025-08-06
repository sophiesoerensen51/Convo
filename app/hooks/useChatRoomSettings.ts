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

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const roomDoc = await firestore().collection('chatRooms').doc(chatRoomId).get();
        const roomData = roomDoc.data();
        const currentUserId = auth().currentUser.uid;
        const userIsAdmin =
          (Array.isArray(roomData?.admins) && roomData.admins.includes(currentUserId)) ||
          roomData?.creator === currentUserId;
        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error('Fejl ved hentning af admin-status:', error);
      }
    };
    fetchRoomData();
  }, [chatRoomId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersSnapshot, chatRoomDoc] = await Promise.all([
          firestore().collection('Users').get(),
          firestore().collection('chatRooms').doc(chatRoomId).get(),
        ]);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const chatRoomData = chatRoomDoc.data();

        setChatRoomName(chatRoomData?.name || '');
        setChatRoomDescription(chatRoomData?.description || '');
        setUsers(usersList);

        const initialSelected = new Set(chatRoomData?.members || usersList.map(u => u.id));
        setSelectedUsers(initialSelected);
        setSelectAll(initialSelected.size === usersList.length);

        const adminIds = chatRoomData?.admins || (chatRoomData?.creator ? [chatRoomData.creator] : []);
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

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
      setSelectAll(true);
    }
  };

  const handleSaveChanges = async () => {
    if (!chatRoomName.trim()) {
      Alert.alert('Fejl', 'Chatrummets navn må ikke være tomt.');
      return;
    }
    if (selectedUsers.size === 0) {
      Alert.alert('Fejl', 'Der skal være mindst ét medlem i chatrummet.');
      return;
    }
    try {
      await firestore().collection('chatRooms').doc(chatRoomId).update({
        name: chatRoomName.trim(),
        description: chatRoomDescription.trim(),
        members: Array.from(selectedUsers),
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
      });

      const batch = firestore().batch();
      const allUserDocs = await firestore().collection('Users').get();

      allUserDocs.docs.forEach(doc => {
        const userId = doc.id;
        const userRef = firestore().collection('Users').doc(userId);
        if (selectedUsers.has(userId)) {
          batch.set(userRef, { chatRooms: firestore.FieldValue.arrayUnion(chatRoomId) }, { merge: true });
        } else {
          batch.set(userRef, { chatRooms: firestore.FieldValue.arrayRemove(chatRoomId) }, { merge: true });
        }
      });

      await batch.commit();

      Alert.alert('Succes', 'Ændringer gemt.');
      navigation.goBack();
    } catch (error) {
      console.error('Fejl ved opdatering:', error);
      Alert.alert('Fejl', 'Noget gik galt. Prøv igen.');
    }
  };

  const handleDeleteRoom = () => {
    Alert.alert(
      'Bekræft sletning',
      'Er du sikker på, at du vil slette dette chatrum? Det kan ikke fortrydes.',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('chatRooms').doc(chatRoomId).delete();

              const allUserDocs = await firestore().collection('Users').get();
              const batch = firestore().batch();

              allUserDocs.docs.forEach(doc => {
                const userRef = firestore().collection('Users').doc(doc.id);
                batch.set(userRef, { chatRooms: firestore.FieldValue.arrayRemove(chatRoomId) }, { merge: true });
              });

              await batch.commit();

              Alert.alert('Succes', 'Chatrummet er slettet.');
              navigation.goBack();
            } catch (error) {
              console.error('Fejl ved sletning:', error);
              Alert.alert('Fejl', 'Noget gik galt. Prøv igen.');
            }
          },
        },
      ]
    );
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
    handleSaveChanges,
    handleDeleteRoom,
    isAdmin,
    admins,
    loading,
  };
};

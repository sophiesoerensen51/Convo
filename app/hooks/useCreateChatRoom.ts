import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

type UseCreateChatRoomProps = {
  navigation: any; 
};

export const useCreateChatRoom = ({ navigation }: UseCreateChatRoomProps) => {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

// Hent alle brugere fra Firestore, når hook’en startes første gang
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore().collection('Users').get();
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);

        // Sæt alle brugere som valgte som default
        const allUserIds = usersList.map(u => u.id);
        setSelectedUsers(new Set(allUserIds));
        setSelectAll(true);
      } catch (error) {
        console.error('Fejl ved hentning af brugere:', error);
      }
    };

    fetchUsers();
  }, []);

  // Funktion til at toggle valg af enkelt bruger eller alle brugere
  const toggleUserSelection = (userId: string) => {
    if (userId === 'select_all') {
      // Hvis selectAll er true, fravælg alle, ellers vælg alle
      if (selectAll) {
        setSelectedUsers(new Set());
        setSelectAll(false);
      } else {
        const allUserIds = users.map(u => u.id);
        setSelectedUsers(new Set(allUserIds));
        setSelectAll(true);
      }
    } else {
      // Toggle en enkelt bruger
      setSelectedUsers(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(userId)) {
          newSelected.delete(userId);
        } else {
          newSelected.add(userId);
        }
        // Opdater selectAll, hvis alle brugere er valgt
        setSelectAll(newSelected.size === users.length);
        return newSelected;
      });
    }
  };

  // Funktion til at oprette et nyt chatrum i Firestore
  const handleCreateRoom = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Fejl', 'Du skal være logget ind for at oprette et chatrum.');
      return;
    }
    if (!roomName.trim()) {
      Alert.alert('Fejl', 'Navnet på chatrummet må ikke være tomt.');
      return;
    }
    if (selectedUsers.size === 0) {
      Alert.alert('Fejl', 'Du skal vælge mindst én bruger.');
      return;
    }

    try {
      const members = Array.from(selectedUsers);

      // Sørg for, at den oprettende bruger altid er medlem
      if (!members.includes(user.uid)) {
        members.push(user.uid);
      }

      // Opret chatrum i Firestore
      const newRoomRef = await firestore().collection('chatRooms').add({
        name: roomName.trim(),
        description: description.trim(),
        createdBy: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
        members,
        admins: [user.uid], // Opretter er admin
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
        lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
      });

      // Opdater alle medlemmer med det nye chatrum
      const batch = firestore().batch();
      members.forEach(uid => {
        const userRef = firestore().collection('Users').doc(uid);
        batch.set(
          userRef,
          { chatRooms: firestore.FieldValue.arrayUnion(newRoomRef.id) },
          { merge: true }
        );
      });
      await batch.commit();

      // Naviger tilbage efter succesfuld oprettelse
      navigation.goBack();
    } catch (error) {
      console.error('Fejl ved oprettelse af chatrum:', error);
      Alert.alert('Fejl', 'Noget gik galt. Prøv igen.');
    }
  };

  return {
    roomName,
    setRoomName,
    description,
    setDescription,
    users,
    selectedUsers,
    selectAll,
    toggleUserSelection,
    handleCreateRoom,
  };
};

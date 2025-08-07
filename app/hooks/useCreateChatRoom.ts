import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

type UseCreateChatRoomProps = {
  navigation: any; // evt. mere præcis type hvis du vil
};

export const useCreateChatRoom = ({ navigation }: UseCreateChatRoomProps) => {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore().collection('Users').get();
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);

        // Marker alle som valgt som default
        const allUserIds = usersList.map(u => u.id);
        setSelectedUsers(new Set(allUserIds));
        setSelectAll(true);
      } catch (error) {
        console.error('Fejl ved hentning af brugere:', error);
      }
    };

    fetchUsers();
  }, []);

  const toggleUserSelection = (userId: string) => {
    if (userId === 'select_all') {
      if (selectAll) {
        setSelectedUsers(new Set());
        setSelectAll(false);
      } else {
        const allUserIds = users.map(u => u.id);
        setSelectedUsers(new Set(allUserIds));
        setSelectAll(true);
      }
    } else {
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
    }
  };

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
      if (!members.includes(user.uid)) {
        members.push(user.uid);
      }

      const newRoomRef = await firestore().collection('chatRooms').add({
        name: roomName.trim(),
        description: description.trim(),
        createdBy: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
        members,
        admins: [user.uid],
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
        lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
      });

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

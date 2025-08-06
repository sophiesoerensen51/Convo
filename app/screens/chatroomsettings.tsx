import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ChatRoomSettings = ({ route, navigation }) => {
  const { chatRoomId } = route.params;

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
        setChatRoomDescription(chatRoomData?.description || ''); // Sæt description
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
        description: chatRoomDescription.trim(),  // Gem beskrivelse også
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

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.has(item.id);
    const currentUserId = auth().currentUser?.uid;
    const disabled = item.id === currentUserId;

    return (
      <TouchableOpacity
        style={[styles.userItem, (!isAdmin || disabled) && { opacity: 0.5 }]}
        onPress={() => isAdmin && !disabled && toggleUserSelection(item.id)}
        disabled={!isAdmin || disabled}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.userName}>
          {item.displayName?.trim() || item.email?.trim() || 'Ukendt bruger'}
          {disabled && ' (Dig)'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSelectAllItem = () => (
    <TouchableOpacity
      style={[styles.userItem, !isAdmin && { opacity: 0.5 }]}
      onPress={() => isAdmin && toggleSelectAll()}
      disabled={!isAdmin}
    >
      <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
        {selectAll && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.userName, { fontWeight: '700' }]}>Tilføj alle brugere</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Indlæser...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Indstillinger for chatrum</Text>

      {admins.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 4 }}>Admin{admins.length > 1 ? 's' : ''}:</Text>
          {admins.map(admin => (
            <Text key={admin.id} style={{ fontSize: 14, color: '#007AFF' }}>
              {admin.displayName || admin.email || 'Ukendt bruger'}
            </Text>
          ))}
        </View>
      )}

      {!isAdmin && (
        <Text style={{ color: 'gray', fontStyle: 'italic', marginBottom: 10 }}>
          Du har ikke tilladelse til at redigere dette chatrum.
        </Text>
      )}

      <TextInput
        style={styles.input}
        value={chatRoomName}
        onChangeText={setChatRoomName}
        placeholder="Navn på chatrum"
        editable={isAdmin}
      />

      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        value={chatRoomDescription}
        onChangeText={setChatRoomDescription}
        placeholder="Beskrivelse af chatrum"
        multiline
        editable={isAdmin}
      />

      <Text style={styles.selectUsersTitle}>Vælg medlemmer:</Text>

      <FlatList
        data={[{ id: 'select_all' }, ...users]}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (item.id === 'select_all' ? renderSelectAllItem() : renderUserItem({ item }))}
        extraData={selectedUsers}
        style={styles.usersList}
      />

      <TouchableOpacity
        style={[styles.button, !isAdmin && { backgroundColor: '#ccc' }]}
        onPress={handleSaveChanges}
        disabled={!isAdmin}
      >
        <Text style={styles.buttonText}>Gem ændringer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDeleteRoom}
        disabled={!isAdmin}
        style={{ opacity: isAdmin ? 1 : 0.4, marginTop: 16 }}
      >
        <Text style={[styles.buttonText, { color: '#FF3B30' }]}>Slet chatrum</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatRoomSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  selectUsersTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  usersList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userName: {
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});

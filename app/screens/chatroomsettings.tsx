import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ChatRoomSettings = ({ route, navigation }) => {
  const { chatRoomId } = route.params;

  const [chatRoomName, setChatRoomName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(true);

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
        setUsers(usersList);

        // Marker alle brugere som standard (sæt i selectedUsers)
        const initialSelected = new Set(chatRoomData?.members || usersList.map(u => u.id));
        setSelectedUsers(initialSelected);
        setSelectAll(initialSelected.size === usersList.length);
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

      // Opdater selectAll, hvis ikke alle er valgt
      setSelectAll(newSelected.size === users.length);
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      // Fjern alle
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      // Tilføj alle
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
      Alert.alert('Fejl', 'Der skal være mindst én medlem i chatrummet.');
      return;
    }

    try {
      await firestore().collection('chatRooms').doc(chatRoomId).update({
        name: chatRoomName.trim(),
        members: Array.from(selectedUsers),
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
      });

      // Opdater chatRooms for alle brugere (tilføj/fjern chatRoomId)
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

              // Fjern chatRoomId fra alle brugere
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

    // Forhindre, at den aktuelle bruger kan fjernes fra rummet (valgfrit)
    const currentUserId = auth().currentUser?.uid;
    const disabled = item.id === currentUserId;

    return (
      <TouchableOpacity
        style={[styles.userItem, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && toggleUserSelection(item.id)}
        disabled={disabled}
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
    <TouchableOpacity style={styles.userItem} onPress={toggleSelectAll}>
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

      <TextInput
        style={styles.input}
        value={chatRoomName}
        onChangeText={setChatRoomName}
        placeholder="Navn på chatrum"
      />

      <Text style={styles.selectUsersTitle}>Vælg medlemmer:</Text>

      <FlatList
        data={[{ id: 'select_all' }, ...users]}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (item.id === 'select_all' ? renderSelectAllItem() : renderUserItem({ item }))}
        extraData={selectedUsers}
        style={styles.usersList}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Gem ændringer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteRoom}>
        <Text style={styles.deleteButtonText}>Slet chatrum</Text>
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
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});

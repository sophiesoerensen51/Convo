import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;
  
    setUser(currentUser);
  
    let chatRoomUnsubscribers = [];
  
    const unsubscribeUser = firestore()
      .collection('Users')
      .doc(currentUser.uid)
      .onSnapshot(async (userDoc) => {
        if (!userDoc.exists) return;
  
        const userData = userDoc.data();
        const userChatRoomIds = userData.chatRooms || [];
  
        // Fjern gamle lyttere
        chatRoomUnsubscribers.forEach(unsub => unsub && unsub());
        chatRoomUnsubscribers = [];
  
        if (userChatRoomIds.length === 0) {
          setChatRooms([]);
          return;
        }
  
        userChatRoomIds.forEach(roomId => {
          const unsub = firestore()
            .collection('chatRooms')
            .doc(roomId)
            .onSnapshot((doc) => {
              if (!doc.exists) return;
  
              setChatRooms(prevRooms => {
                const updatedRoom = { id: doc.id, ...doc.data() };
                const otherRooms = prevRooms.filter(r => r.id !== doc.id);
                const newRooms = [...otherRooms, updatedRoom];
                return newRooms.sort((a, b) => {
                  const aTime = a.lastMessageAt?.toDate?.() || new Date(0);
                  const bTime = b.lastMessageAt?.toDate?.() || new Date(0);
                  return bTime - aTime;
                });
              });
            });
  
          chatRoomUnsubscribers.push(unsub);
        });
      });
  
    return () => {
      unsubscribeUser();
      chatRoomUnsubscribers.forEach(unsub => unsub && unsub());
    };
  }, []);
  
  const handleChatPress = (chatRoom) => {
    navigation.navigate('ChatRoomScreen', {
      chatRoomId: chatRoom.id,
      chatRoomName: chatRoom.name,
    });
  };

  const onLogoutPress = async () => {
    try {
      await auth().signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatRoom} onPress={() => handleChatPress(item)}>
      <Text style={styles.chatRoomText}>{item.name}</Text>
      {item.description && (
        <Text style={styles.chatRoomDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chat Rooms</Text>

      {user && <Text style={styles.userText}>Logged in as: {user.email}</Text>}

      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.button} onPress={onLogoutPress}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  userText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  chatRoom: {
    width: '100%', 
    backgroundColor: '#f9f9f9',
    paddingVertical: 20, 
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  chatRoomText: {
    fontSize: 18, 
    color: '#333',
    fontWeight: '600',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, 
    textAlign: 'center',
    fontWeight: '600',
  },
  chatRoomDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },  
});

export default HomeScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    console.log("No authenticated user found");
    return;
  }

  setUser(currentUser);

  // Migration
  firestore()
    .collection('chatRooms')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.lastMessageTimestamp && data.lastMessageAt) {
          console.log(`Migrating chatRoom ${doc.id}`);
          doc.ref.update({ lastMessageTimestamp: data.lastMessageAt });
        }
      });
    })
    .catch(error => console.error('Migration error:', error));

 
  let cleanupRooms = () => {};

  const unsubscribeUser = firestore()
    .collection('Users')
    .doc(currentUser.uid)
    .onSnapshot(userDoc => {
      if (!userDoc.exists) {
        console.log("User document does not exist");
        return;
      }

      const userData = userDoc.data();
      const userChatRoomIds = userData.chatRooms || [];

      if (userChatRoomIds.length === 0) {
        setChatRooms([]);
        return;
      }

      const unsubscribeRooms = userChatRoomIds.map((roomId) => {
        return firestore()
          .collection('chatRooms')
          .doc(roomId)
          .onSnapshot(docSnapshot => {
            if (!docSnapshot.exists) return;

            const updatedRoom = { id: docSnapshot.id, ...docSnapshot.data() };

            setChatRooms(prevRooms => {
              const otherRooms = prevRooms.filter(r => r.id !== updatedRoom.id);
              const updatedList = [...otherRooms, updatedRoom];

              return updatedList.sort((a, b) => {
                const aTime = a?.lastMessageTimestamp?.toDate?.()?.getTime?.() ?? 0;
                const bTime = b?.lastMessageTimestamp?.toDate?.()?.getTime?.() ?? 0;
                return bTime - aTime;
              });
            });
          });
      });

     
      cleanupRooms = () => {
        unsubscribeRooms.forEach(unsub => unsub());
      };
    });

  return () => {
    unsubscribeUser();
    cleanupRooms();
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
      <View style={styles.chatRoomContent}>
        <View>
          <Text style={styles.chatRoomText}>{item.name}</Text>
          {item.description && (
            <Text style={styles.chatRoomDescription}>{item.description}</Text>
          )}
        </View>
        <Image
          source={require('../assets/chevron.png')}
          style={styles.chevronIcon}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {user && (
        <Text style={styles.welcomeText}>
          Velkommen, {user.displayName?.split(' ')[0] || user.email}
        </Text>
      )}
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
  chevronIcon: {
    width: 24,
    height: 24,
    tintColor: '#999',
  },
  chatRoomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
});

export default HomeScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ChatRoomItem from '../components/ChatRoomItem';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    setUser(currentUser);

    // Migration (evt. pak det ud i en separat funktion)
    firestore()
      .collection('chatRooms')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (!data.lastMessageTimestamp && data.lastMessageAt) {
            doc.ref.update({ lastMessageTimestamp: data.lastMessageAt });
          }
        });
      })
      .catch(err => {
        console.error('Migration error:', err);
        setError('Kunne ikke migrere chatrum.');
      });

    const userDocRef = firestore().collection('Users').doc(currentUser.uid);

    const unsubscribeUser = userDocRef.onSnapshot(userDoc => {
      if (!userDoc.exists) {
        setChatRooms([]);
        setLoading(false);
        return;
      }

      const userChatRoomIds = userDoc.data().chatRooms || [];

      if (userChatRoomIds.length === 0) {
        setChatRooms([]);
        setLoading(false);
        return;
      }

      const chatRoomsQuery = firestore()
        .collection('chatRooms')
        .where(firestore.FieldPath.documentId(), 'in', userChatRoomIds);

      const unsubscribeRooms = chatRoomsQuery.onSnapshot(
        snapshot => {
          const rooms = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          rooms.sort((a, b) => {
            const aTime = a?.lastMessageTimestamp?.toDate?.()?.getTime?.() ?? 0;
            const bTime = b?.lastMessageTimestamp?.toDate?.()?.getTime?.() ?? 0;
            return bTime - aTime;
          });

          setChatRooms(rooms);
          setLoading(false);
          setError('');
        },
        err => {
          console.error('ChatRooms listener error:', err);
          setError('Kunne ikke hente chatrum.');
          setLoading(false);
        }
      );

      return () => unsubscribeRooms();
    }, err => {
      console.error('User listener error:', err);
      setError('Kunne ikke hente brugerdata.');
      setLoading(false);
    });

    return () => unsubscribeUser();
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
    <ChatRoomItem chatRoom={item} onPress={() => handleChatPress(item)} />
  );


  return (
    <SafeAreaView style={styles.container}>
      {user && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Velkommen, {user.displayName?.split(' ')[0] || user.email}
          </Text>
        </View>
      )}
      {loading && <Text style={{ textAlign: 'center', marginTop: 20 }}>Henter chatrum...</Text>}
      {error !== '' && (
        <View style={{ padding: 10 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.replace('HomeScreen')} style={styles.button}>
            <Text style={styles.buttonText}>Prøv igen</Text>
          </TouchableOpacity>
        </View>
      )}


      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
      {!loading && chatRooms.length === 0 && error === '' && (
       <Text style={{ textAlign: 'center', fontSize: 16 }}>
       Du er ikke medlem af nogen chatrum endnu.{'\n'}
       Tryk på plusset for at oprette et nyt chatrum.
     </Text>
      )}


      <TouchableOpacity style={styles.button} onPress={onLogoutPress}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateChatRoom')}
        style={styles.floatingPlus}
      >
        <Image
          source={require('../assets/plus.png')} // Sørg for dette er det sorte plus-ikon
          style={styles.plusIcon}
        />
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
    textAlign: 'left',
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
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  floatingPlus: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'transparent',
    elevation: 0,
  },
  plusIcon: {
    width: 24,
    height: 24,
    tintColor: 'black',
  },
});

export default HomeScreen;

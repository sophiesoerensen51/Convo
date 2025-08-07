import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ChatRoomItem from '../components/ChatRoomItem';
import { useLayoutEffect } from 'react';
import settings from '../assets/settings.png';

const HomeScreen = ({ navigation }) => {

  // Sætter navigationens header med titel og et ikon til usersettings 
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Hjem', 
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('UserSettings')} // Navigerer til usersettings-skærm
          style={{ marginRight: 16 }}
        >
          <Image
            source={settings} 
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // State til den aktuelle bruger, chatrum, fejlbesked og loading-status
  const [user, setUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // useEffect til at hente brugerdata og tilknyttede chatrum fra Firestore
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return; 

    setUser(currentUser);

    // Migration: Opdatering af felt 'lastMessageTimestamp' hvis det mangler i chatrum
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

    // Lytter til ændringer i brugerens dokument 
    const unsubscribeUser = userDocRef.onSnapshot(userDoc => {
      if (!userDoc.exists) {
        // Hvis brugerdata ikke findes, sæt tom liste og stop loading
        setChatRooms([]);
        setLoading(false);
        return;
      }

      const userChatRoomIds = userDoc.data().chatRooms || [];

      if (userChatRoomIds.length === 0) {
        // Hvis brugeren ikke er medlem af nogen chatrum
        setChatRooms([]);
        setLoading(false);
        return;
      }

      // Henter chatrum hvor bruger er medlem baseret på chatroom IDs
      const chatRoomsQuery = firestore()
        .collection('chatRooms')
        .where(firestore.FieldPath.documentId(), 'in', userChatRoomIds);

      // Lytter til chatrum opdateringer i realtid
      const unsubscribeRooms = chatRoomsQuery.onSnapshot(
        snapshot => {
          const rooms = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sorter chatrum efter seneste beskedstidspunkt, nyeste først
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
          // Håndter fejl i chatrum-lytteren
          console.error('ChatRooms listener error:', err);
          setError('Kunne ikke hente chatrum.');
          setLoading(false);
        }
      );

      // Stopper med at lytte ved at unsubscribe, når komponenten fjernes eller dependencies ændres
      return () => unsubscribeRooms();
    }, err => {
      // Håndter fejl i brugerdata-lytteren
      console.error('User listener error:', err);
      setError('Kunne ikke hente brugerdata.');
      setLoading(false);
    });

    // Stopper med at lytte til brugerdata ved at unsubscribe, når komponenten fjernes
    return () => unsubscribeUser();
  }, []);

  // Navigerer til valgt chatrum ved tryk på chatrum i listen
  const handleChatPress = (chatRoom) => {
    navigation.navigate('ChatRoomScreen', {
      chatRoomId: chatRoom.id,
      chatRoomName: chatRoom.name,
    });
  };

  // Renderer hvert chatrum i FlatList
  const renderItem = ({ item }) => (
    <ChatRoomItem chatRoom={item} onPress={() => handleChatPress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Viser velkomsttekst med brugerens fornavn eller email */}
      {user && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Velkommen, {user.displayName?.split(' ')[0] || user.email}
          </Text>
        </View>
      )}

      {/* Viser loading-tekst mens chatrum hentes */}
      {loading && <Text style={{ textAlign: 'center', marginTop: 20 }}>Henter chatrum...</Text>}

      {/* Viser fejlmeddelelse og mulighed for at prøve igen */}
      {error !== '' && (
        <View style={{ padding: 10 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.replace('HomeScreen')} style={styles.button}>
            <Text style={styles.buttonText}>Prøv igen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste over chatrum brugeren er medlem af */}
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      {/* Vis besked hvis brugeren ikke er medlem af nogen chatrum */}
      {!loading && chatRooms.length === 0 && error === '' && (
       <Text style={{ textAlign: 'center', fontSize: 16 }}>
       Du er ikke medlem af nogen chatrum endnu.{'\n'}
       Tryk på plusset for at oprette et nyt chatrum.
     </Text>
      )}

      {/* Knap til at oprette nyt chatrum */}
      <TouchableOpacity
        onPress={() => navigation.navigate('CreateChatRoom')}
        style={styles.floatingPlus}
      >
        <Image
          source={require('../assets/plus.png')} 
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

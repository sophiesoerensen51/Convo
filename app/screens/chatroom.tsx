import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { View, Image, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useRoute, useNavigation } from '@react-navigation/native';
import camara from '../assets/camera.png';
import library from '../assets/library.png';
import settings from '../assets/settings.png';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import MessageItem from '../components/MessageItem';

const ChatRoomScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { chatRoomId, chatRoomName } = route.params;

  const [description, setDescription] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const flatListRef = useRef(null);
  const lastVisibleRef = useRef(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: chatRoomName,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatRoomSettings', { chatRoomId })}
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
  }, [navigation, chatRoomName, chatRoomId]);

  const parseCreatedAt = (data) => {
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      return data.createdAt.toDate();
    } else if (data.createdAt instanceof Date) {
      return data.createdAt;
    } else {
      return new Date(0);
    }
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chatRooms')
      .doc(chatRoomId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .onSnapshot(snapshot => {
        if (!snapshot || snapshot.empty) return;

        const fetchedMessages = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: parseCreatedAt(data),
            };
          })
          .filter(msg => msg.createdAt.getTime() !== 0);

        fetchedMessages.sort((a, b) => a.createdAt - b.createdAt);

        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
        setMessages(fetchedMessages);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      });

    return () => unsubscribe();
  }, [chatRoomId]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || !lastVisibleRef.current) return;

    setLoadingMore(true);

    try {
      const snapshot = await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .startAfter(lastVisibleRef.current)
        .limit(50)
        .get();

      if (snapshot.empty) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const moreMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: parseCreatedAt(data),
        };
      }).filter(msg => msg.createdAt.getTime() !== 0);

      lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
      moreMessages.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(prev => [...moreMessages, ...prev]);
    } catch (error) {
      console.error("Fejl ved indlæsning af flere beskeder:", error);
      alert('Kunne ikke indlæse flere beskeder. Prøv igen senere.');
    } finally {
      setLoadingMore(false);
    }
  };

  async function handleSend() {
    setErrorMessage(null);

    const user = auth().currentUser;

    if (!newMessage && !imageUri) return;

    if (imageUri) {
      const base64Data = imageUri.split(',')[1];
      if (base64Data.length > 1000000) {
        console.warn("Billedet er stadig for stort!");
        return;
      }
    }

    const messageToSend = {
      senderId: user.uid,
      senderName: user.displayName || user.email,
      createdAt: firestore.FieldValue.serverTimestamp(),
      text: newMessage || null,
      imageBase64: imageUri || null,
    };

    const localMessageObj = {
      ...messageToSend,
      createdAt: new Date(),
      id: `local-${Date.now()}`
    };

    setMessages(prev => [...prev, localMessageObj]);
    setNewMessage('');
    setImageUri(null);

    try {
      const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);

      await chatRoomRef.collection('messages').add(messageToSend);

      await chatRoomRef.update({
        lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Fejl ved afsendelse:", error);
      setErrorMessage("Kunne ikke sende beskeden. Prøv igen.");
    }
  }

  const handleImagePick = async (fromCamera = false) => {
    setErrorMessage(null);

    const result = await (fromCamera ? launchCamera : launchImageLibrary)({
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: false,
    });

    if (result.didCancel || result.errorCode) {
      console.log('Billedvalg annulleret eller fejl:', result.errorMessage);
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      console.warn("Intet billede fundet.");
      return;
    }

    try {
      const resizedImage = await ImageResizer.createResizedImage(
        asset.uri,
        600,
        600,
        'JPEG',
        60,
      );

      const base64Data = await RNFS.readFile(resizedImage.uri, 'base64');
      setImageUri(`data:image/jpeg;base64,${base64Data}`);
    } catch (error) {
      console.error('Fejl ved billedbehandling:', error);
      setErrorMessage("Fejl ved billedbehandling. Prøv igen.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {description ? <Text style={styles.description}>{description}</Text> : null}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <MessageItem item={item} />}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 16 }}
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y <= 0) {
              loadMoreMessages();
            }
          }}
          scrollEventThrottle={100}
        />

        {imageUri && (
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: 100, height: 100, borderRadius: 8 }}
            />
            <TouchableOpacity onPress={() => setImageUri(null)}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Fjern billede</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputContainer, { paddingHorizontal: 16 }]}>
          <TouchableOpacity onPress={() => handleImagePick(true)}>
            <Image source={camara} style={styles.iconButton} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleImagePick(false)}>
            <Image source={library} style={styles.iconButton} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Skriv en besked..."
          />

          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myMessageBubble: {
    backgroundColor: '#DCF8C6',
  },
  theirMessageBubble: {
    backgroundColor: '#ECECEC',
  },
  senderName: {
    fontSize: 12,
    color: '#555',
    marginBottom: 3,
  },
  timeText: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  iconButton: {
    width: 30,
    height: 30,
    marginHorizontal: 4,
  },
  description: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ChatRoomScreen;

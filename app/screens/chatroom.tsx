import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {View, Image, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useRoute, useNavigation } from '@react-navigation/native';
import camara from '../assets/camera.png';
import library from '../assets/library.png';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

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

  // Sæt navigation title til chatRoomName
  useLayoutEffect(() => {
    navigation.setOptions({ title: chatRoomName });
  }, [navigation, chatRoomName]);

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
    setLoadingMore(false);
  };

  async function handleSend() {
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
    }
  }

  const handleImagePick = async (fromCamera = false) => {
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
    }
  };

  const renderItem = ({ item }) => {
    const isMyMessage = item.senderId === auth().currentUser?.uid;

    const avatar = item.senderAvatar
      ? item.senderAvatar
      : auth().currentUser?.photoURL
        ? auth().currentUser.photoURL
        : null;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        {!isMyMessage && (
          avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {item.senderName?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )
        )}

        <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
          <Text style={styles.senderName}>{item.senderName}</Text>

          {item.text && (
            <Text style={{ color: isMyMessage ? 'white' : 'black', marginBottom: item.imageBase64 ? 5 : 0 }}>
              {item.text}
            </Text>
          )}

          {item.imageBase64 && (
            <Image
              source={{ uri: item.imageBase64 }}
              style={{ width: 200, height: 200, borderRadius: 10 }}
              resizeMode="cover"
            />
          )}

          <Text style={[styles.timestamp, { color: isMyMessage ? '#eee' : '#888' }]}>
            {item.createdAt?.toLocaleString('da-DK', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
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
          renderItem={renderItem}
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#ddd',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  messageBubble: {
    backgroundColor: '#e1e1e1',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    color: '#fff',
  },
  theirMessage: {
    backgroundColor: '#e1e1e1',
    color: 'black',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  iconButton: {
    width: 30,
    height: 30,
    marginRight: 8,
    alignSelf: 'center',
  },
});

export default ChatRoomScreen;

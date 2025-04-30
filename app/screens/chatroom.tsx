import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useRoute } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';


const ChatRoomScreen = () => {
  const route = useRoute();
  const { chatRoomId, chatRoomName } = route.params;
  const [description, setDescription] = useState('');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);
  const lastVisibleRef = useRef(null);
const [loadingMore, setLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(true); // Hvis der ikke er flere beskeder at hente


useEffect(() => {
  const unsubscribe = firestore()
    .collection('chatRooms')
    .doc(chatRoomId)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .onSnapshot(snapshot => {
      if (snapshot.empty) return;

      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1]; // Gem sidste dokument

      setMessages(fetchedMessages.reverse());
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    });

  return () => unsubscribe();
}, [chatRoomId]);



  const handleSend = async () => {
    if (newMessage.trim() === '') return;
  
    const currentUser = auth().currentUser;
  
    await firestore()
      .collection('chatRooms')
      .doc(chatRoomId)
      .collection('messages')
      .add({
        text: newMessage,
        createdAt: firestore.FieldValue.serverTimestamp(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || 'Ukendt bruger',
        senderAvatar: currentUser.photoURL || null,
      });
      await firestore().collection('chatRooms').doc(chatRoomId).update({
        lastMessage: newMessage,
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
      });
    setNewMessage('');
  };  
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
  
    const moreMessages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  
    lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
  
    setMessages(prev => [...moreMessages.reverse(), ...prev]);
    setLoadingMore(false);
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
          <Text style={{ color: isMyMessage ? 'white' : 'black' }}>{item.text}</Text>
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
        <Text style={styles.header}>{chatRoomName}</Text>
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

  
        <View style={[styles.inputContainer, { paddingHorizontal: 16 }]}>
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
    marginVertical: 
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
  container: { flex: 1, padding: 16 },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },  
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },  
});

export default ChatRoomScreen;

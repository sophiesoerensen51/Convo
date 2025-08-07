import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const MessageItem = ({ item }) => {
  // Tjek om beskeden er sendt af den nuværende bruger
  const isMyMessage = item.senderId === auth().currentUser?.uid;

  // Find avatar: brug først beskedens senderAvatar, ellers brugerens billede fra Firebase, ellers intet
  const avatar = item.senderAvatar
    ? item.senderAvatar
    : auth().currentUser?.photoURL
      ? auth().currentUser.photoURL
      : null;

  return (
    <View
      style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
      ]}
    >
      {/* Vis kun avatar hvis det ikke er min egen besked */}
      {!isMyMessage && (
        avatar ? (
          // Hvis der findes et avatar-link, vis billedet
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          // Hvis ikke, vis en cirkel med forbogstavet fra navnet
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {item.senderName?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )
      )}

      {/* Beskedens boble */}
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {/* Afsenderens navn vises altid */}
        <Text style={styles.senderName}>{item.senderName}</Text>

        {/* Hvis beskeden har tekst, vis det */}
        {item.text && (
          <Text
            style={{
              color: isMyMessage ? 'white' : 'black',
              marginBottom: item.imageBase64 ? 5 : 0,
            }}
          >
            {item.text}
          </Text>
        )}

        {/* Hvis beskeden indeholder et billede (base64), vis billedet */}
        {item.imageBase64 && (
          <Image
            source={{ uri: item.imageBase64 }}
            style={{ width: 200, height: 200, borderRadius: 10 }}
            resizeMode="cover"
          />
        )}

        {/* Vis tidsstempel i dansk format */}
        <Text
          style={[
            styles.timestamp,
            { color: isMyMessage ? '#eee' : '#888' },
          ]}
        >
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
  senderName: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default MessageItem;

import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

type Props = {
    chatRoom: any;
    onPress: () => void;
  };
  
  const ChatRoomItem: React.FC<Props> = ({ chatRoom, onPress }) => (
    <TouchableOpacity style={styles.chatRoom} onPress={onPress}>
      <View style={styles.chatRoomContent}>
        <View>
          <Text style={styles.chatRoomText}>{chatRoom.name}</Text>
          {chatRoom.lastMessage && (
            <Text style={styles.chatRoomDescription} numberOfLines={1}>
              {chatRoom.lastMessage}
            </Text>
          )}
          {!chatRoom.lastMessage && chatRoom.description && (
            <Text style={styles.chatRoomDescription} numberOfLines={1}>
              {chatRoom.description}
            </Text>
          )}
        </View>
        <Image
          source={require('../assets/chevron.png')}
          style={styles.chevronIcon}
        />
      </View>
    </TouchableOpacity>
  );
  

const styles = StyleSheet.create({
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
  chatRoomDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'left',
  },
  chatRoomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  chevronIcon: {
    width: 24,
    height: 24,
    tintColor: '#999',
  },
});

export default ChatRoomItem;

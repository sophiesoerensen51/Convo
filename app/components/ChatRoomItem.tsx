import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  chatRoom: any; // Objekt med chatrummets data (navn, beskrivelse, sidste besked, osv.)
  onPress: () => void; // Funktion der kaldes, når man trykker på chatrummet
};

/**
 * Komponent til at vise ét chatrum som en række i en liste.
 * Viser chatrummets navn, en kort beskrivelse eller sidste besked, og en pil til højre.
 */
const ChatRoomItem: React.FC<Props> = ({ chatRoom, onPress }) => (
  <TouchableOpacity style={styles.chatRoom} onPress={onPress}>
    <View style={styles.chatRoomContent}>
      <View>
        <Text style={styles.chatRoomText}>{chatRoom.name}</Text>

        {/* Vis sidste besked, hvis der findes en */}
        {chatRoom.lastMessage && (
          <Text style={styles.chatRoomDescription} numberOfLines={1}>
            {chatRoom.lastMessage}
          </Text>
        )}

        {/* Hvis der ikke er en sidste besked, vis i stedet beskrivelsen */}
        {!chatRoom.lastMessage && chatRoom.description && (
          <Text style={styles.chatRoomDescription} numberOfLines={1}>
            {chatRoom.description}
          </Text>
        )}
      </View>

      {/* Højre pil-ikon */}
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

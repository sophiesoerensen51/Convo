import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View, GestureResponderEvent } from 'react-native';

// Props-type for knappen, der modtager en onPress-funktion
interface GoogleLoginButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

// En knap-komponent til login eller oprettelse via Google
const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onPress }) => (
  <View style={styles.buttonContainer}>
    {/* Når brugeren trykker på knappen, kaldes onPress */}
    <TouchableOpacity style={styles.googleButton} onPress={onPress}>
      {/* Google-logoet vises til venstre for teksten */}
      <Image
        source={require('../assets/google.png')}
        style={styles.googleLogo}
      />
      {/* Teksten på knappen */}
      <Text style={styles.googleButtonText}>Sign in / Sign up with Google</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  buttonContainer: {
    width: '75%',
    marginTop: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
  },
});

export default GoogleLoginButton;

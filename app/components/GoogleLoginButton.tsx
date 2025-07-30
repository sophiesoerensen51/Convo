import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View, GestureResponderEvent } from 'react-native';

interface GoogleLoginButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onPress }) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.googleButton} onPress={onPress}>
      <Image
        source={require('../assets/google.png')}
        style={styles.googleLogo}
      />
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

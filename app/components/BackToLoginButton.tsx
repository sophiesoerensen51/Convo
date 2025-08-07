import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

// Props-type der kræver en onPress-funktion (når knappen trykkes)
interface BackToLoginButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

/**
 * BackToLoginButton viser en enkel tekstknap med teksten "Back to Login".
 * Bruges typisk på registrerings- eller fejlskærme, hvor man kan navigere tilbage til login.
 */
const BackToLoginButton: React.FC<BackToLoginButtonProps> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={styles.backText}>Back to Login</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backText: {
    color: '#007BFF',
    marginTop: 20,
    fontSize: 16,
  },
});

export default BackToLoginButton;

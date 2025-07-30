import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

interface BackToLoginButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

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

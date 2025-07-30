import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CreateAccountButtonProps {
  onPress: () => void;
}

const CreateAccountButton: React.FC<CreateAccountButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Create Account</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#28A745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '75%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateAccountButton;

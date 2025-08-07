import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface CreateAccountButtonProps {
  onPress: () => void;
  loading?: boolean; // valgfri prop til loading state
}

const CreateAccountButton: React.FC<CreateAccountButtonProps> = ({ onPress, loading = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Create Account</Text>
      )}
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
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateAccountButton;

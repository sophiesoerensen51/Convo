import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface CreateAccountButtonProps {
  onPress: () => void;
  loading?: boolean; // Valgfri prop: hvis true, vises en spinner og knappen deaktiveres
}

/**
 * En knapkomponent til oprettelse af en konto.
 * Viser en loading-spinner, når `loading` er true, og forhindrer tryk.
 */
const CreateAccountButton: React.FC<CreateAccountButtonProps> = ({ onPress, loading = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]} // Grå farve hvis loading
      onPress={onPress}
      disabled={loading} // Forhindrer tryk når loading er aktiv
    >
      {/* Viser spinner hvis der loades, ellers knaptekst */}
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

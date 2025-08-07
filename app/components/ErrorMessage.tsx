import React from 'react';
import { Text, StyleSheet } from 'react-native';

// Komponent til visning af en fejlbesked
// Viser kun teksten, hvis der faktisk er en fejlbesked
const ErrorMessage = ({ message }: { message: string }) => {
  
  // Hvis der ikke er nogen fejlbesked, vises ingenting
  if (!message) return null;

  // Ellers vises fejlbeskeden med en bestemt tekststil
  return <Text style={styles.errorText}>{message}</Text>;
};


const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ErrorMessage;

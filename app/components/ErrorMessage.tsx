import React from 'react';
import { Text, StyleSheet } from 'react-native';

const ErrorMessage = ({ message }: { message: string }) => {
  if (!message) return null; // Returner ingenting hvis ingen fejl

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

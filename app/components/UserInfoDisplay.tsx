import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  displayName?: string; // Valgfrit brugernavn til visning
  email?: string;       // Valgfri email til visning
}

const UserInfoDisplay: React.FC<Props> = ({ displayName, email }) => (
  // Container der viser brugernavn og email med grundlæggende styling
  <View style={styles.container}>
    <Text style={styles.text}>Hello, {displayName || 'user'}!</Text> 
    <Text style={styles.text}>Email: {email}</Text>                 
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '75%',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default UserInfoDisplay;

import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

// Props: modtager email og password samt funktioner til at opdatere dem
type Props = {
  email: string;
  password: string;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
};

// Komponent til visning af to inputfelter: ét til email og ét til adgangskode
const EmailPasswordForm = ({ email, password, onEmailChange, onPasswordChange }: Props) => {
  return (
    <View style={styles.container}>
      {/* Inputfelt til email – bruger e-mail tastatur og slår auto-capitalization fra */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Inputfelt til password – skjuler input og slår auto-capitalization fra */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        autoCapitalize="none"
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '75%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default EmailPasswordForm;

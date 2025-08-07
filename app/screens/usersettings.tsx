import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const UserSettings = ({ navigation }) => {
  const user = auth().currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      Alert.alert('Fejl', 'Kunne ikke logge ud. Prøv igen.');
      console.error('Logout error:', error);
    }
  };

  const updateDisplayName = async () => {
    if (displayName.trim() === '') {
      Alert.alert('Fejl', 'Navnet kan ikke være tomt.');
      return;
    }
    setUpdatingName(true);
    try {
      await user.updateProfile({ displayName: displayName.trim() });
      Alert.alert('Succes', 'Brugernavn opdateret!');
    } catch (error) {
      console.error('Update displayName error:', error);
      Alert.alert('Fejl', 'Kunne ikke opdatere brugernavn. Prøv igen.');
    }
    setUpdatingName(false);
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Fejl', 'Adgangskode skal være mindst 6 tegn.');
      return;
    }
    setUpdatingPassword(true);
    try {
      await user.updatePassword(newPassword);
      Alert.alert('Succes', 'Adgangskode opdateret!');
      setNewPassword('');
    } catch (error) {
      console.error('Update password error:', error);
      Alert.alert('Fejl', 'Kunne ikke opdatere adgangskode. Prøv igen.');
    }
    setUpdatingPassword(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Brugerindstillinger</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Navn:</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Indtast nyt navn"
          autoCapitalize="words"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={updateDisplayName}
          disabled={updatingName}
        >
          <Text style={styles.buttonText}>
            {updatingName ? 'Opdaterer...' : 'Opdater navn'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Ny adgangskode:</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Indtast ny adgangskode"
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={updatePassword}
          disabled={updatingPassword}
        >
          <Text style={styles.buttonText}>
            {updatingPassword ? 'Opdaterer...' : 'Opdater adgangskode'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Log ud</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 30,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#666',
    alignSelf: 'flex-start',
    marginLeft: '12.5%',
    marginBottom: 8,
  },
  input: {
    width: '75%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  email: {
    width: '75%',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#23422F',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
    width: '75%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UserSettings;

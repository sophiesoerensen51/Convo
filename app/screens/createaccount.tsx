import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Logo from '../components/Logo';
import ErrorMessage from '../components/ErrorMessage';
import CreateAccountButton from '../components/CreateAccountButton';
import CreateAccountForm from '../components/CreateAccountForm';
import BackToLoginButton from '../components/BackToLoginButton';
import TextInputField from '../components/TextInputFields';


// Skærm til oprettelse af ny bruger
// Håndterer registrering via Firebase Authentication og oprettelse af bruger i Firestore
const CreateAccountScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');


  // Opretter brugerkonto med email og password
  // Opdaterer profil med navn og gemmer brugerdata i Firestore
  const onCreateAccountPress = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User account created & signed in!');

      await auth().currentUser?.updateProfile({
        displayName: name,
        photoURL: null,
      });

      await auth().currentUser?.reload();

      await firestore()
        .collection('Users')
        .doc(auth().currentUser.uid)
        .set({
          displayName: name,
          email: email,
          chatRooms: [],
          createdAt: firestore.FieldValue.serverTimestamp(),
        });


      setErrorMessage('');

      // Naviger til Home-skærm og nulstil navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });


    } catch (error) {
      // Håndter specifikke Firebase Auth fejl
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('That email address is invalid!');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters.');
      } else {
        setErrorMessage('Account creation failed. Please try again.');
      }
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Logo style={{ width: 200, height: 200 }} />
      <CreateAccountForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
      />
      <CreateAccountButton onPress={onCreateAccountPress} />
      <ErrorMessage message={errorMessage} />
      <BackToLoginButton onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
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
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  backText: {
    color: '#007BFF',
    marginTop: 20,
    fontSize: 16,
  },
});

export default CreateAccountScreen;

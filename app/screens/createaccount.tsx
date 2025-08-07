import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Logo from '../components/Logo';
import ErrorMessage from '../components/ErrorMessage';
import CreateAccountButton from '../components/CreateAccountButton';
import CreateAccountForm from '../components/CreateAccountForm';
import BackToLoginButton from '../components/BackToLoginButton';

// Håndterer registrering via Firebase Authentication og oprettelse af bruger i Firestore
const CreateAccountScreen = ({ navigation }) => {

  // State til inputfelter og statusbeskeder
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Funktion der kaldes ved tryk på "Opret konto" knappen
  // Tjekker inputfelter, opretter bruger i Firebase Auth og gemmer brugerdata i Firestore
  const onCreateAccountPress = async () => {
    if (!email || !password || !name) {
      setErrorMessage('Udfyld venligst alle felter.');  // Validering af input
      return;
    }  
    setLoading(true);      
    setErrorMessage('');    
    try {
      // Opret bruger med email og password i Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User account created & signed in!');

      // Opdater brugerprofil med displayName
      await auth().currentUser?.updateProfile({
        displayName: name,
        photoURL: null,
      });

      await auth().currentUser?.reload();  

      // Opret bruger dokument i Firestore med data
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
      // Håndter almindelige Firebase Auth fejl og vis fejlbeskeder
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Denne email-adresse er allerede i brug!');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Email-adressen er ugyldig!');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Adgangskoden skal være mindst 6 tegn.');
      } else {
        setErrorMessage('Oprettelse af konto mislykkedes. Prøv igen.');
      }
      console.error(error);  

    } finally {
      setLoading(false);  
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo komponent */}
      <Logo style={{ width: 200, height: 200 }} />

      {/* Formular til indtastning af navn, email og password */}
      <CreateAccountForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
      />

      {/* Knap til at oprette konto */}
      <CreateAccountButton onPress={onCreateAccountPress} loading={loading} />

      {/* Vis fejlbesked hvis der opstår fejl */}
      <ErrorMessage message={errorMessage} />

      {/* Knap til at gå tilbage til login skærmen */}
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

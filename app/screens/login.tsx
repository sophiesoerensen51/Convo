import React, { useState } from 'react';
import { Text, View, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import Logo from '../components/Logo';
import EmailPasswordForm from '../components/EmailPasswordForm';
import AuthButtons from '../components/AuthButtons';
import GoogleLoginButton from '../components/GoogleLoginButton';
import UserInfoDisplay from '../components/UserInfoDisplay';


// Login-skærm med e-mail og Google login
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Logge ind med e-mail og adgangskode
  const onLoginPress = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('User signed in with email:', userCredential.user);
      setUserInfo(userCredential.user);
      setErrorMessage('');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Login failed:', error);
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password.');
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    }
  };

  // Logge ind eller oprette bruger med Google
  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.signOut(); // Ryd tidligere login-data
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Start Google-login flow
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo', userInfo);

      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const signedInUser = userCredential.user;

      // Opdatér Firebase-profil hvis nødvendigt
      if (!signedInUser.displayName || !signedInUser.photoURL) {
        await signedInUser.updateProfile({
          displayName: userInfo.user.name,
          photoURL: userInfo.user.photo,
        });
      }

      await signedInUser.reload(); // Hent nyeste brugerdata

      console.log('Google login success:', signedInUser);

      // Sikre at brugerdokument i Firestore findes
      const userDocRef = firestore().collection('Users').doc(signedInUser.uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        await userDocRef.set({
          name: signedInUser.displayName || '',
          email: signedInUser.email || '',
          chatRooms: [],
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        console.log('Firestore user document created for:', signedInUser.uid);
      }

      setUserInfo(signedInUser);
      setErrorMessage('');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setErrorMessage('Google Sign-In failed. Try again.');
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <Logo />


      {/* Vise brugerinfo hvis logget ind */}
      {userInfo && (
        <UserInfoDisplay
          displayName={userInfo.displayName}
          email={userInfo.email}
        />
      )}


      {/* Formular til e-mail login */}
      <Text style={styles.title}>Login using Email</Text>

      <EmailPasswordForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
      />
      {/* Login knap og oprettelse af konto knap */}
      <AuthButtons
        onLoginPress={onLoginPress}
        onCreateAccountPress={() => navigation.navigate('CreateAccount')}
      />

      {/* Vise fejlbesked */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <GoogleLoginButton onPress={onGoogleButtonPress} />

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
  buttonContainer: {
    width: '75%',
    marginTop: 10,
  },
  title: {
    fontSize: 20,
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
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  userInfoContainer: {
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
  userInfoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
  },
});

export default LoginScreen;

import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, View, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import Logo from '../components/Logo';
import EmailPasswordForm from '../components/EmailPasswordForm';
import AuthButtons from '../components/AuthButtons';
import GoogleLoginButton from '../components/GoogleLoginButton';
import UserInfoDisplay from '../components/UserInfoDisplay';

// Login-skærm med e-mail/password og Google-login
const LoginScreen = ({ navigation }) => {

  // State til input, brugerinfo, fejl og loading-status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Log ind med email og password via Firebase Auth
  const onLoginPress = async () => {
    setLoading(true); // Vis loader
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      setUserInfo(userCredential.user); // Gem brugerdata
      setErrorMessage('');

      // Naviger til 'Home' skærmen og ryder stacken
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      // Håndter fejl med passende beskeder
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('Ingen bruger fundet med denne e-mail.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Forkert adgangskode.');
      } else {
        setErrorMessage('Login fejlede. Prøv igen.');
      }
    } finally {
      setLoading(false); // Stop loader
    }
  };

  // Log ind eller opret bruger med Google-login via Firebase Auth
  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.signOut(); // Ryd tidligere sessioner

      // Tjek Google Play Services for at kunne starte login flow
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn(); // Start Google login flow
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) throw new Error('No ID token found');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const signedInUser = userCredential.user;

      // Opdater profil hvis nødvendigt
      if (!signedInUser.displayName || !signedInUser.photoURL) {
        await signedInUser.updateProfile({
          displayName: userInfo.user.name,
          photoURL: userInfo.user.photo,
        });
      }
      await signedInUser.reload(); // Opdater brugerdata

      // Sikre bruger findes i Firestore
      const userDocRef = firestore().collection('Users').doc(signedInUser.uid);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        await userDocRef.set({
          name: signedInUser.displayName || '',
          email: signedInUser.email || '',
          chatRooms: [],
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      setUserInfo(signedInUser);
      setErrorMessage('');
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      setErrorMessage('Google Sign-In failed. Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Logo />

      {/* Vis brugerinfo hvis logget ind */}
      {userInfo && (
        <UserInfoDisplay
          displayName={userInfo.displayName}
          email={userInfo.email}
        />
      )}

      {/* Formular til login med e-mail */}
      <Text style={styles.title}>Login using Email</Text>
      <EmailPasswordForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
      />

      {/* Loader vises under login */}
      {loading && <Text style={{ marginBottom: 10 }}>Logger ind...</Text>}
      {loading && <ActivityIndicator size="large" color="#007BFF" />}

      {/* Knapper til login og oprettelse af konto */}
      <AuthButtons
        onLoginPress={onLoginPress}
        onCreateAccountPress={() => navigation.navigate('CreateAccount')}
        disabled={loading}
      />

      {/* Vis fejlbesked hvis login fejler */}
      {errorMessage && !loading ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={onLoginPress} style={styles.retryButton}>
            <Text style={styles.buttonText}>Prøv igen</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Google login knap */}
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
  errorContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },

});
export default LoginScreen;

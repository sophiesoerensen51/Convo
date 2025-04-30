import React, { useState } from 'react';
import {Text, View, TextInput, Button, StyleSheet, SafeAreaView, TouchableOpacity, Image} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  

  const onLoginPress = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('User signed in with email');
      setUserInfo(userCredential.user);
      setErrorMessage('');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password.');
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    }
  };
  
  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult?.idToken || signInResult.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token found');
      }
  
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      setUserInfo(userCredential.user);
      console.log('User signed in with Google:', userCredential.user);
  
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error during Google Sign-In', error);
      setErrorMessage('Google Sign-In failed. Try again.');
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
         <Image
        source={require('../assets/ConvoLogo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
        {userInfo && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoText}>
            Hello, {userInfo.displayName || 'user'}!
          </Text>
          <Text style={styles.userInfoText}>Email: {userInfo.email}</Text>
        </View>
        )}
      <Text style={styles.title}>Login using Email</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

    <View style={styles.buttonContainer}>
     <TouchableOpacity style={styles.button} onPress={onLoginPress}>
    <Text style={styles.buttonText}>Log In</Text>
     </TouchableOpacity>
    </View>

    <View style={styles.buttonContainer}>
     <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#28A745' }]} 
     onPress={() => navigation.navigate('CreateAccount')}
     >
     <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
    </View>

    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

    <View style={styles.buttonContainer}>
     <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
    <Image
      source={require('../assets/google.png')} 
      style={styles.googleLogo}
    />
    <Text style={styles.googleButtonText}>Sign in / Sign up with Google</Text>
    </TouchableOpacity>
    </View>
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
    width: '75%', // Ens bredde for alle knapper
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
    marginTop: 10, // Lidt luft efter logo
    marginBottom: 20, // Mere luft før "Login"
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

import React, { useEffect, useRef } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import LoginScreen from './app/screens/login';
import CreateAccountScreen from './app/screens/createaccount';
import HomeScreen from './app/screens/home';
import ChatRoomScreen from './app/screens/chatroom';
import { Platform } from 'react-native';

// Konfigurerer Google Sign-In med web- og iOS-klient-id'er
GoogleSignin.configure({
  webClientId: '547176052859-nkreic9g73837nhp127gj5jgr6e90mg7.apps.googleusercontent.com',
  iosClientId: '547176052859-0su3s7282k3qu6u6tncto53dibu7b4g9.apps.googleusercontent.com',
  offlineAccess: false,
});

// Opret stack-navigator
const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

// Skjul splash-screen på iOS ved opstart
 useEffect(() => {
   if (Platform.OS === 'ios') {
     SplashScreen.hide();
   }
 }, []);
 
  // Definér skærmindstillinger for stack-navigator
  const scrOptions = {
    headerStyle: { backgroundColor: '#23422F' },
    headerTitleStyle: { color: 'white' },
    headerBackTitleVisible: false,
    headerTintColor: 'white',
  };

  // Returner NavigationContainer med stack og skærmindstillinger
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={scrOptions}>
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} component={LoginScreen} />
        <Stack.Screen name="CreateAccount" options={{ title: 'Create Account' }} component={CreateAccountScreen} />
        <Stack.Screen name="Home" options={{ title: 'Chatrooms' }} component={HomeScreen} />
        <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

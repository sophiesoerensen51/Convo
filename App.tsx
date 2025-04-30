import React, { useEffect } from 'react'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import LoginScreen from './app/screens/login';
import CreateAccountScreen from './app/screens/createaccount';
import HomeScreen from './app/screens/home';
import ChatRoomScreen from './app/screens/chatroom';

// GoogleSignin configuration
GoogleSignin.configure({
  webClientId: '547176052859-nkreic9g73837nhp127gj5jgr6e90mg7.apps.googleusercontent.com',
  iosClientId: '547176052859-0su3s7282k3qu6u6tncto53dibu7b4g9.apps.googleusercontent.com',
});

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    if (SplashScreen && SplashScreen.hide) {
      SplashScreen.hide();
    }
  }, []);
  
  

  const scrOptions = { 
    headerStyle: { backgroundColor: '#6200ee' },
    headerTitleStyle: { color: 'white'}, 
    headerBackTitleVisible: false,
    headerTintColor: 'white'
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={scrOptions}>
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} component={LoginScreen} />
        <Stack.Screen name="CreateAccount" options={{ title: 'Create Account' }} component={CreateAccountScreen} />
        <Stack.Screen name="Home" options={{ title: 'Welcome Home' }} component={HomeScreen} />
        <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

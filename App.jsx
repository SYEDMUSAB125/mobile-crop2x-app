import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
// Import your screens
import Login from './screens/Login';
import Sensor from './screens/Sensor';

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    // Hide splash screen on Android after component mounts
    if (Platform.OS === 'android') {
      SplashScreen.hide();
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Define your screens here */}
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="sensor" component={Sensor} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

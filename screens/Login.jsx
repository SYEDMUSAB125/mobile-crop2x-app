import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { isPointWithinRadius } from 'geolib';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import useSignIn from '../hooks/useSignIn';
import logo from '../assets/human-front.png';
export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkingLocation, setCheckingLocation] = useState(false);
  const { signIn, loading, error } = useSignIn();

  const TARGET_COORDINATES = { latitude: 24.934564, longitude: 67.113089 };
  const RANGE_IN_METERS = 500;

  const requestLocationPermission = async () => {
    try {
      const result = await request(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      );

      return result === RESULTS.GRANTED;
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  };

  const validateFields = () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    const result = await signIn(email, password);

    if (result.success) {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        Alert.alert('Permission Denied', 'Location permission is required to proceed.');
        return;
      }

      setCheckingLocation(true);
      Geolocation.getCurrentPosition(
        (position) => {
          setCheckingLocation(false);
          const { latitude, longitude } = position.coords;
          const isInRange = isPointWithinRadius(
            { latitude, longitude },
            TARGET_COORDINATES,
            RANGE_IN_METERS
          );

          if (isInRange) {
            Alert.alert('Success', 'You are within the range!');
            navigation.navigate('sensor', { username: email });
          } else {
            Alert.alert('Out of Range', 'You are outside the allowed area.');
          }
        },
        (error) => {
          setCheckingLocation(false);
          Alert.alert('Error', 'Unable to get your location.');
          console.error(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert('Error', result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        🌾Crop2<Text style={styles.span}>x</Text>
      </Text>
      <View style={styles.imageContainer}>
        <Image
          fadeDuration={300}
          style={styles.image}
          source={logo}
        />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="mail" size={24} color="#333" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#333"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            accessible
            accessibilityLabel="Email Input"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="lock-closed" size={24} color="#333" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#333"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            accessible
            accessibilityLabel="Password Input"
          />
        </View>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading || checkingLocation}
          accessible
          accessibilityLabel="Login Button"
        >
          {loading || checkingLocation ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  span: {
    color: '#28a745',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  imageContainer: {
    marginBottom: 30,
  },
  formContainer: {
    width: '90%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff7001',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 2,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  forgotPasswordText: {
    color: '#007bff',
    marginTop: 15,
    textDecorationLine: 'underline',
  }
});

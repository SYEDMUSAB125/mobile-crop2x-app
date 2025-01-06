import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import useSignIn from '../hooks/useSignIn';
import logo from '../assets/human-front.png';
export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkingLocation, setCheckingLocation] = useState(false);
  const { signIn, loading, error } = useSignIn();
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
            navigation.navigate('home', { username: email });
    } else {
      Alert.alert('Error', result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <>
    <View style={styles.container}>
    <Text style={styles.header}>
    🌾Crop2<Text style={styles.span}>x</Text>
  </Text>
      <View style={styles.imageContainer}>
        {/* <Image
          style={styles.image}
          source={logo}
        /> */}
        <LottieView
        source={require('../assets/login.json')} // Path to your Lottie JSON file
        autoPlay
        loop
        style={styles.image}
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
    </>
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
    position: 'absolute',
    top: 30,
    fontSize: 50,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
  },
  span: {
    color: '#005f56',
  },
  image: {
    width: 300,
    height: 300,
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
    backgroundColor: '#005f56',
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

});

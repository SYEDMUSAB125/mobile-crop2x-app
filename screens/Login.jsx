import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing icon library

export default function Login({navigation}) {
    const [username, setUsername] = useState('');
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🍭Design F<Text style={styles.span}>o</Text>rest</Text>
      <View style={styles.imageContainer}>
        <Image
        fadeDuration={300}
          style={styles.image}
          source={require('../assets/human-front.png')}
        />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="person" size={24} color="#333" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#333"
            onChangeText={setUsername}
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="lock-closed" size={24} color="#333" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#333"
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.loginButton}
         onPress={() => navigation.navigate('home',{username}) }
            >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
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
});

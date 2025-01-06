import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Intro = ({navigation}) => {
  return (
    <View style={styles.mainContainer}>
      {/* Image with Curve */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/home-page.png")} // Replace with your illustration image path
          style={styles.image}
        />
       
      </View>

      {/* Text and Button */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>THE NEXT GENERATION OF FARMING</Text>
        <Text style={styles.subtitle}>
          We collect data that enables the goals of healthy agriculture.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('login')}>
          <Text style={styles.buttonText}>Get Started
              
             </Text>
             <Icon name="arrow-forward-outline" size={24} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Intro;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    flex: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#005f56',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon:{
   position: "relative",
   left:15,

  }
 
});

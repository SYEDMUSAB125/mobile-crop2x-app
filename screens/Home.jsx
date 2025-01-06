import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Platform, Modal, RefreshControl } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { isPointInPolygon } from 'geolib';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ImageBackground } from 'react-native';
import useFetchData from '../hooks/useFetchData';

const FarmDashboard = (props) => {
  const navigation = props.navigation;
  const email = props.route.params.username;
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const { fetchData, data, loading, error } = useFetchData();

  const requestLocationPermission = async () => {
    try {
      const result = await request(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      );

      if (result === RESULTS.GRANTED) {
        getCurrentLocation(); // Fetch location if permission granted
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to access this feature.');
      }
    } catch (err) {
      console.error('Permission error:', err);
      Alert.alert('Error', 'An error occurred while requesting location permission.');
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
      },
      (error) => {
        Alert.alert('Location Error', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleFetch = async () => {
    const result = await fetchData(email);
    if (!result.success) {
      console.error(result.error);
    }
  };

  useEffect(() => {
    handleFetch();
    requestLocationPermission(); // Request location permission on component mount
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await handleFetch();
    setRefreshing(false);
  };

  const fields = data
    ? Object.entries(data.data).map(([key, value]) => ({
        name: key,
        coord: value,
      }))
    : [];

  const handleFieldClick = (field) => {
    const latitudes = field.coord.lat.split(',').map((lat) => parseFloat(lat.trim()));
    const longitudes = field.coord.long.split(',').map((long) => parseFloat(long.trim()));

    const polygon = latitudes.map((lat, index) => ({
      latitude: lat,
      longitude: longitudes[index],
    }));

    if (lat && long) {
      const currentPoint = { latitude: lat, longitude: long };
      const isInRange = isPointInPolygon(currentPoint, polygon);

      if (isInRange) {
        navigation.navigate('sensor', { username: email });
      } else {
        Alert.alert('Out of Range', 'You are outside the field boundary.');
      }
    } else {
      Alert.alert('Location Not Available', 'Unable to get your current location.');
    }
  };

  const handleAvatarChange = () => {
    setModalVisible(false);
    Alert.alert("Avatar Change", "Change Avatar functionality triggered.");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('./../assets/images/user.png')} style={styles.menuIcon2} />
        <Text style={styles.title}>{email.split('@')[0]}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Weather Info */}
      <View style={styles.weatherCard}>
        <ImageBackground
          source={require('./../assets/images/weather-bg.jpeg')}
          style={styles.weatherCardBackground}
          imageStyle={{ borderRadius: 15 }}
        >
          <View style={styles.overlay}>
            <Text style={styles.temperature}>18°C</Text>
            <Text style={styles.weatherCondition}>Cloudy</Text>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>Good</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.detailLabel}>Soil Moisture</Text>
                <Text style={styles.detailValue}>Good</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.detailLabel}>Precipitation</Text>
                <Text style={styles.detailValue}>Low</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Manage Your Fields */}
      <View style={styles.Farms}>
        <Text style={styles.sectionTitle}>Manage your fields</Text>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {fields.map((field, index) => (
            <View key={index} style={styles.fieldCard}>
              <Image source={require('./../assets/images/farms.png')} style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>{field.name}</Text>
              <TouchableOpacity
                style={styles.fieldMenuButton}
                onPress={() => handleFieldClick(field)}
              >
                <Image source={require('./../assets/images/loc.png')} style={styles.menuIcon} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Options</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAvatarChange}
            >
              <Text style={styles.modalButtonText}>Change Avatar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // (same styles as before)
  Farms: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    width: '100%',
    padding: 20,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    fontSize: 20,
  },
  weatherCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  weatherCardBackground: {
    height: 200,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'space-between',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFCC00',
  },
  weatherCondition: {
    fontSize: 20,
    color: 'white',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  weatherDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'gray',
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  fieldIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    flex: 1,
  },
  fieldMenuButton: {
    padding: 5,
  },
  fieldMenuIcon: {
    fontSize: 18,
    color: '#9E9E9E',
  },
  menuIcon2: {
    height: 30,
    width: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 250,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#005f56',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
});

export default FarmDashboard;

import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { PermissionsAndroid , Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import useSaveData from '../hooks/useSaveData';
import useLogout from '../hooks/useLogout';
import { CommonActions } from '@react-navigation/native';
const Sensor = ( props) => {
    const { saveData, loading,error} = useSaveData();
     const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [devices, setDevices] = useState([]);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [receivedData, setReceivedData] = useState(null);
    const [deviceId ,setDeviceid] = useState('');
    const [temperature, setTemperature] = useState('');
    const [conductivity, setConductivity] = useState('');
    const [pH, setPH] = useState('');
    const [moisture, setMoisture] = useState('');
    const [nitrogen, setNitrogen] = useState('');
    const [phosphorus, setPhosphorus] = useState('');
    const [potassium, setPotassium] = useState('');
    const [count , setCount] = useState(0);
    const { logout} = useLogout();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const navigation = props.navigation;
    const email = props.route.params.username;
    // Update date and time every second

    const requestBluetoothPermissions = async () => {
        try {
            if (Platform.OS === 'android' && Platform.Version >= 31) {
                // Android 12+ (API 31+)
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);
    
                if (
                    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
                        PermissionsAndroid.RESULTS.GRANTED &&
                    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
                        PermissionsAndroid.RESULTS.GRANTED &&
                    granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
                        PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('Bluetooth permissions granted.');
                    return true;
                } else {
                    console.log('Bluetooth permissions denied.');
                    return false;
                }
            } else if (Platform.OS === 'android') {
                // Android < 12 (API < 31)
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Location permission granted for Bluetooth.');
                    return true;
                } else {
                    console.log('Location permission denied.');
                    return false;
                }
            } else {
                return true; // iOS permissions handled differently
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    };
    // Enable Bluetooth if it's off
    const enableBluetooth = async () => {
        try {
            const isEnabled = await RNBluetoothClassic.isBluetoothEnabled();
            if (!isEnabled) {
                Alert.alert(
                    'Bluetooth Disabled',
                    'Bluetooth is off. Would you like to enable it?',
                    [
                        { text: 'No', style: 'cancel' },
                        { text: 'Yes', onPress: () => RNBluetoothClassic.enable() },
                    ]
                );
            }
        } catch (error) {
            console.error('Error enabling Bluetooth:', error);
        }
    };

    // Discover Bluetooth devices
    const discoverDevices = async () => {
        try {
            const permissionsGranted = await requestBluetoothPermissions();
            if (!permissionsGranted) {
                Alert.alert('Permissions Required', 'Bluetooth permissions are needed to proceed.');
                return;
            }
    
            setIsLoading(true);
            const availableDevices = await RNBluetoothClassic.startDiscovery();
            console.log('Discovered devices:', availableDevices);
            setDevices(availableDevices);
        } catch (error) {
            console.error('Error discovering devices:', error);
            Alert.alert('Error', 'Could not start Bluetooth discovery.');
        } finally {
            setIsLoading(false);
        }
    };
    

    // Open the modal and start discovering devices
    const handleDiscoverDevices = async () => {
        await enableBluetooth();
        setModalVisible(true);
        discoverDevices();
    };

    const startListeningForData = (device) => {
        let buffer = ''; // To store incomplete data chunks
    
        try {
            const subscription = device.onDataReceived((data) => {
                try {
                    // Decode the incoming data chunk
                    const chunk = atob(data.data);
                    
                    // Append the chunk to the buffer
                    buffer += chunk;
    
                    // Check if we have a complete JSON object (starts with { and ends with })
                    if (buffer.startsWith('{') && buffer.endsWith('}')) {
                        // Parse the complete JSON object
                        const parsedData = JSON.parse(buffer);
                        
                        // Clear the buffer after processing
                        buffer = '';
                        setReceivedData(parsedData);
                    }
                } catch (error) {
                    // Log parsing errors (e.g., incomplete JSON)
                    console.warn('Incomplete or invalid JSON chunk received:', buffer, error);
                }
            });
    
            return () => subscription.remove();
        } catch (error) {
            console.error('Error starting data listener:', error);
        }
    };

    // Connect to a selected device
    const connectToDevice = async (device) => {
        try {
            console.log(`Attempting to connect to device: ${device.name} (${device.address})`);
            const connected = await device.connect({
                connectionType: 'binary',
         } );
            if (connected) {
                console.log(`Successfully connected to: ${device.name} (${device.address})`);
                setConnectedDevice(device);
                Alert.alert('Connected', `Successfully connected to ${device.name}`);
                setModalVisible(false);
                startListeningForData(device);
            }
        } catch (error) {
            console.error('Error connecting to device:', error);

            if (error.message.includes('ConnectionFailedException')) {
                Alert.alert(
                    'Connection Failed',
                    `Could not connect to ${device.name} (${device.address}). Pairing might have been rejected.`
                );
            } else {
                Alert.alert('Error', `An error occurred while connecting to ${device.name}.`);
            }

            console.log(`Failed to connect to device: ${device.name} (${device.address})`);
        }
    };
    useEffect(() => {
        if (!receivedData) {
          return;
        }
    
        try {
      
          const { c,id,k,m,n,p,pH ,t } = receivedData;
    
          // Step 4: Update state
          setDeviceid(id);
          setConductivity(c);
          setTemperature(t);
          setPH(pH);
          setMoisture(m);
          setNitrogen(n);
          setPhosphorus(p);
          setPotassium(k);
    
        } catch (error) {
          // If parsing fails, log the error
          return;
        }
      }, [receivedData]); // Dependency ensures this only runs when `receivedData` changes
    



    // Disconnect from the current device
    const disconnectDevice = async () => {
        try {
            if (connectedDevice) {
                await connectedDevice.disconnect();
                Alert.alert('Disconnected', `Successfully disconnected from ${connectedDevice.name}`);
                setConnectedDevice(null);
                setReceivedData('');
                setDeviceid("");
          setConductivity("");
          setTemperature("");
          setPH("");
          setMoisture("");
          setNitrogen("");
          setPhosphorus("");
          setPotassium("");
            }
        } catch (error) {
            console.error('Error disconnecting from device:', error);
        }
    };

    let data = {
        deviceId ,
        temperature ,
        conductivity,
        pH,
        moisture,
        nitrogen,
        phosphorus,
        potassium,
      }
    const handleSave = async () => {
      
        const result = await saveData(data,email);
       
          if (result.success) {
            Alert.alert('Success', 'Data saved successfully!');
            setCount(count+1)
          } else {
            Alert.alert('Error', `Failed to save data: ${result.error}`);
          }
      };
      

 const back = ()=>{
   navigation.navigate('home', { username: email });
 }


const handleLogout = async () => {
  Alert.alert(
    'Confirm Logout',
    'Are you sure you want to log out?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          const result = await logout();
          if (result.success) {
            // Reset the navigation stack to prevent going back to previous pages
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'login' }], // Navigate to the login page
              })
            );
          } else {
            Alert.alert('Error', `Failed to log out: ${result.error}`);
          }
        },
      },
    ],
    { cancelable: true } // Allows tapping outside the alert to dismiss it
  );
};

const handleRefresh = () => {
    setDeviceid("");
          setConductivity("");
          setTemperature("");
          setPH("");
          setMoisture("");
          setNitrogen("");
          setPhosphorus("");
          setPotassium("");
    setIsRefreshing(true);
    // Simulate a delay for 0.5 seconds
    setTimeout(() => {
        setIsRefreshing(false);
        // Add your refresh logic here
    }, 500);
};


    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
            <Icon name="arrow-back-outline" size={24} color="#fff"  style={styles.iconback} onPress={back}  />
                <Text style={styles.headerText}>عنوان</Text>
                <Icon name="log-out-outline" size={24} color="#fff"  onPress={handleLogout}  />
            </View>
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    width: '100%',
                }}
            >
                <TouchableOpacity
                    style={styles.BlueButton}
                    onPress={handleDiscoverDevices}
                >
                    <Text style={styles.saveButtonText}>منسلک کریں</Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.BlueButton}
                 onPress={disconnectDevice}
                >
                    <Text style={styles.saveButtonText}>منقطع</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btn}>
                <Text style={styles.btnText}>
                    {connectedDevice
                        ? `منسلک: ${connectedDevice.name || 'نامعلوم آلہ'}`
                        : 'منسلک نہیں'}
                </Text>
            </TouchableOpacity>

            {/* Content Section */}
            <View style={styles.content}>
                <View style={styles.header1}>
                <TouchableOpacity title="Refresh" onPress={handleRefresh}  >
                    {isRefreshing ? <ActivityIndicator size="small" color="#333" />
                :<Icon name="refresh-outline" size={24} color="#333" style={styles.icon} />    
                }
                    
                    </TouchableOpacity>
                    <Text style={styles.Heading}>
                        address: {connectedDevice ? connectedDevice.address  : "دستیاب نہیں" }
                    </Text>
                    
                </View>

                <Text style={styles.label}>درجہ حرارت %:{connectedDevice ? temperature : ` انتظار کریں...`}</Text>
                <Text style={styles.label}>کنڈکٹیویٹی uS/cm: {connectedDevice ? conductivity : "انتظار کریں... " } </Text>
                <Text style={styles.label}>پی ایچ: {connectedDevice ? pH : ` انتظار کریں...`} </Text>
                <Text style={styles.label}>نمی: % {connectedDevice ? moisture : " انتظار کریں..." }</Text>
                <Text style={styles.label} > نائٹروجن: mg/Kg {connectedDevice ? nitrogen : "انتظار کریں..."}  </Text>
                <Text style={styles.label}>فاسفورس: mg/Kg {connectedDevice ? phosphorus : "انتظار کریں..." }  </Text>
                <Text style={styles.label}> پوٹاشیم: mg/Kg {connectedDevice ? potassium : " انتظار کریں..." } </Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>ڈیٹا گنتی:0{count}</Text>
                <Text style={styles.label}>
                    تاریخ: {currentDateTime.toLocaleDateString('ur-PK')}
                </Text>
                <Text style={styles.label}>
                    وقت: {currentDateTime.toLocaleTimeString('ur-PK')}
                </Text>
            </View>

           
      
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave} 
          disabled={loading}>
          <Text style={styles.saveButtonText}>
            {loading ? 'محفوظ ہو رہا ہے...' : 'ڈیٹا محفوظ کریں'}
          </Text>
        </TouchableOpacity>
   

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Modal for Bluetooth Devices */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>دستیاب آلات</Text>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#005f56" />
                        ) : (
                            <FlatList
                                data={devices}
                                keyExtractor={(item) => item.address}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.deviceItem}
                                        onPress={() => connectToDevice(item)}
                                    >
                                        <Text style={styles.deviceText}>
                                            {item.name || 'نامعلوم آلہ'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>بند کریں</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Sensor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f3f8fc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#005f56',
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    iconback :{
        
        textAlign : 'center',
    },
    headerText: {
        fontSize: 26,
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        marginVertical: 10,
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        width: '90%',
        alignItems: 'flex-end',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    label: {
        fontSize: 18,
        marginVertical: 5,
        color: '#005f56',
    },
    header1: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    saveButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#005f56',
        borderRadius: 30,
        width: '90%',
        alignItems: 'center',
    },
    btn: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 30,
        width: '90%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#005f56',
    },
    btnText: {
        color: '#005f56',
        fontSize: 18,
        fontWeight: 'bold',
    },
    BlueButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#005f56',
        borderRadius: 30,
        width: '40%',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    deviceItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    deviceText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#005f56',
        borderRadius: 10,
        alignItems: 'center',
        width: '50%',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});


















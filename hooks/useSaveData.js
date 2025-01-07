import { useState } from 'react';
import { ref, set } from 'firebase/database'; // Ensure you import correctly
import { db } from '../firebase-config'; // Your Firebase config file

const useSaveData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveData = async (data,email) => {
    setLoading(true);
    setError(null);

 let userName = email.split('@')[0];
let version = 1.0;
    const { deviceId, temperature, conductivity, pH, moisture, nitrogen, phosphorus, potassium  } = data;

    if (!deviceId) {
      setError('Device ID is required to save data.');
      setLoading(false);
      return { success: false, error: 'Device ID is required.' };
    }

    try {
      // Ensure db is correctly initialized
  
      console.log("check",db)
      // Create a reference to the device path
      const dataRef = ref(db, `devices/${userName}/${deviceId}`); // Example path: devices/M19-2407300001

      // Save data to Realtime Database
      await set(dataRef, {
        temperature: temperature || null,
        conductivity: conductivity || null,
        pH: pH || null,
        moisture: moisture || null,
        nitrogen: nitrogen || null,
        phosphorus: phosphorus || null,
        potassium: potassium || null,
        version: version,
        timestamp: Date.now() // Optional: Add a timestamp
      });

      console.log('Data saved successfully');
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return { saveData, loading, error };
};

export default useSaveData;

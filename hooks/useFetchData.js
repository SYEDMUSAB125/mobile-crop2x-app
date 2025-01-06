import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database'; // Ensure correct import
import { db } from '../firebase-config'; // Your Firebase config file

const useFetchData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (email) => {
    setLoading(true);
    setError(null);

    try {
      if (!email) {
        throw new Error('Email are required to fetch data.');
      }

      const userName = email.split('@')[0]; // Derive the userName from the email

      // Create a reference to the device path
      const dataRef = ref(db, `farmer/${userName}`);

      // Fetch data from Firebase
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const fetchedData = snapshot.val();
        setData(fetchedData);
        setLoading(false);
        return { success: true, data: fetchedData };
      } else {
        throw new Error('No data found for the specified device.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return { fetchData, data, loading, error };
};

export default useFetchData;

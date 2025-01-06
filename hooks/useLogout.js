import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase-config'; // Path to your firebaseConfig.js

const useLogout = () => {
  const [load, setLoading] = useState(false);
  const [err, setError] = useState(null);

  const logout = async () => {
    // Reset error and start loading
    setError(null);
    setLoading(true);

    try {
      // Get the auth instance from Firebase
      const auth = getAuth(app);

      // Sign out the user
      await signOut(auth);

      console.log('Logout successful');
      return { success: true };
    } catch (err) {
      console.error('Error logging out:', err);
      let errorMessage = 'An error occurred during logout.';

      // Set the error message
      setError(err.message || errorMessage);
      return { success: false, error: err.message || errorMessage };
    } finally {
      // Stop loading regardless of outcome
      setLoading(false);
    }
  };

  return { logout, load, err };
};

export default useLogout;

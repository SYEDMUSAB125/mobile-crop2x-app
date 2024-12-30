import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase-config'; // Path to your firebaseConfig.js

const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async (email, password) => {
    // Reset error and start loading
    setError(null);
    setLoading(true);
    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      // Get the auth instance from Firebase
      const auth = getAuth(app);

      // Sign in using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log('Sign-in successful:', userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (err) {
      console.error('Error signing in:', err);
      let errorMessage = 'An error occurred during sign-in.';

      // Map Firebase error codes to friendly messages
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // Stop loading regardless of outcome
      setLoading(false);
    }
  };

  return { signIn, loading, error };
};

export default useSignIn;

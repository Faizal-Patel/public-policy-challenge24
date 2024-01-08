// entry point for app

import { useEffect } from 'react';
import { app } from '../config/firebase.js';
import { getAuth } from 'firebase/auth';
import 'tailwindcss/tailwind.css';
import '../css/styles.module.css';
import '../css/global.css';


function MyApp({ Component, pageProps }) {
  useEffect(() => {

    // initialize firebase when app mounts

    try {
      const authInstance = getAuth(app);

    } catch (error) {

      // error in initialization

      console.error('Error initializing Firebase:', error);
    }
  }, []);

  // main component

  return <Component {...pageProps} />;
}

export default MyApp;
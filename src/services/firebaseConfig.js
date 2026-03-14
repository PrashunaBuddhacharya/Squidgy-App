import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ---  KEYS FROM FIREBASE CONSOLE HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyDHIwthrKsTi0lovijPgF_Lj0giweq2pmc",
  authDomain: "squidgy-app.firebaseapp.com",
  projectId: "squidgy-app",
  storageBucket: "squidgy-app.firebasestorage.app",
  messagingSenderId: "655882321456",
  appId: "1:655882321456:web:684b6786bed47aed4a77f5",
  measurementId: "G-BRBGFHHRKJ",
  databaseURL: "https://squidgy-app-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getDatabase(app);

export { auth, db };
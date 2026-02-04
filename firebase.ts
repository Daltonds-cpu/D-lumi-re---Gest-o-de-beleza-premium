
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbAjHoTJQ_9lNQiBDabBjTm_3gDwCpdWI",
  authDomain: "dominio-lash.firebaseapp.com",
  projectId: "dominio-lash",
  storageBucket: "dominio-lash.firebasestorage.app",
  messagingSenderId: "424443498125",
  appId: "1:424443498125:web:44f72fe790e038f8421cc4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

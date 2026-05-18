// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBogfHrhMG9oHm_rnMrFjCb9_K0rDL5-X8",
  authDomain: "kedai-kopi-ecommerce.firebaseapp.com",
  projectId: "kedai-kopi-ecommerce",
  storageBucket: "kedai-kopi-ecommerce.firebasestorage.app",
  messagingSenderId: "108059727079",
  appId: "1:108059727079:web:324dc25c8539cbe08dbe42",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

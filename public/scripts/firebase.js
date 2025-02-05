// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyC_Ncc5_1N87B0mJwot1z48lfQvIIpyB48",
//   authDomain: "skelbimuprojektas.firebaseapp.com",
//   projectId: "skelbimuprojektas",
//   storageBucket: "skelbimuprojektas.firebasestorage.app",
//   messagingSenderId: "75838344852",
//   appId: "1:75838344852:web:947d7733ab3cf648a92e81"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// firebase.js

// Paimame savo firebaseConfig – t.y. duomenis, kuriuos gavome iš konsole
const firebaseConfig = {
  apiKey: "AIzaSyC_Ncc5_1N87B0mJwot1z48lfQvIIpyB48",
  authDomain: "skelbimuprojektas.firebaseapp.com",
  projectId: "skelbimuprojektas",
  storageBucket: "skelbimuprojektas.firebasestorage.app",
  messagingSenderId: "75838344852",
  appId: "1:75838344852:web:947d7733ab3cf648a92e81"
};
  
  // Inicijuojame Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  
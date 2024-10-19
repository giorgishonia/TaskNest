import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBnER-YtHNLuoHRHUk9sYG2LJQf7RGfFeM",
    authDomain: "tasknest-97ab9.firebaseapp.com",
    projectId: "tasknest-97ab9",
    storageBucket: "tasknest-97ab9.appspot.com",
    messagingSenderId: "643674545565",
    appId: "1:643674545565:web:5490956a77e8609bade374",
    measurementId: "G-05DY064YSX"
  }

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export the auth object
export const db = getFirestore(app); // Export the db object

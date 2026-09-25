import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

 
const firebaseConfig = {
    apiKey: "AIzaSyCeCma1-MrRT01SmDiS-XJb0cnFI-aTumQ",
    authDomain: "ecommercer-tati.firebaseapp.com",
    projectId: "ecommercer-tati",
    storageBucket: "ecommercer-tati.firebasestorage.app",
    messagingSenderId: "372320498455",
    appId: "1:372320498455:web:e5628e5519102ac251fd52",
    measurementId: "G-K14RKELGYZ"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { app, db, auth };
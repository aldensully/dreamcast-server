const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require("firebase/auth")
const { getStorage } = require("firebase/storage");

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBwwMIWgAwA7Fs3gbZbmEGLqLqANdqOfaM",
  authDomain: "dreamcast-88cc9.firebaseapp.com",
  projectId: "dreamcast-88cc9",
  storageBucket: "dreamcast-88cc9.appspot.com",
  messagingSenderId: "263905522084",
  appId: "1:263905522084:web:d009b52be33e38e8d21131",
  measurementId: "G-Z2NJVBK5LL"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app)
const auth = getAuth(app)

module.exports = {
  app,
  db,
  storage,
  auth
}
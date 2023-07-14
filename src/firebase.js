const { initializeApp } = require('firebase/app');

const firebaseConfig = {
  apiKey: "AIzaSyBwwMIWgAwA7Fs3gbZbmEGLqLqANdqOfaM",
  authDomain: "dreamcast-88cc9.firebaseapp.com",
  projectId: "dreamcast-88cc9",
  storageBucket: "dreamcast-88cc9.appspot.com",
  messagingSenderId: "263905522084",
  appId: "1:263905522084:web:d009b52be33e38e8d21131",
  measurementId: "G-Z2NJVBK5LL"
};

const firebaseApp = initializeApp(firebaseConfig);

module.exports = firebaseApp;
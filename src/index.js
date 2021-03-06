import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { BrowserRouter } from 'react-router-dom';
import "./App.css";
import firebase from "firebase/compat/app";
import 'firebase/compat/database';
import 'firebase/compat/storage';

/* 
Idea to implement:
Users need to firsk ask to collaborate, then they can download the file if the artist agrees.
Right now: Public download links and no way to message artist (or messages in general)
 */

// Firebase MusheShare app credentials
const firebaseConfig = {
  apiKey: "AIzaSyCpC441zDhyzmLRQst5scMgsRtRXz1CHZ0",
  authDomain: "museshare-5e6ed.firebaseapp.com",
  databaseURL: "https://museshare-5e6ed-default-rtdb.firebaseio.com",
  projectId: "museshare-5e6ed",
  storageBucket: "museshare-5e6ed.appspot.com",
  messagingSenderId: "446196761869",
  appId: "1:446196761869:web:719ba043119b5f10241c44",
  measurementId: "G-WKJ5Y4S4F1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth
export const auth = firebase.auth();

// Global variables for database
export var database = firebase.database(); // Realtime database
export var storage = firebase.storage(); // Cloud storage

ReactDOM.render(
    <BrowserRouter><App /></BrowserRouter>,
  document.getElementById('root')
);

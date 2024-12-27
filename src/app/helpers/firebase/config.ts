import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyAxL4phTEpC61FXuH-o4mfnNSj93GENeUE",
  authDomain: "remaster-in.firebaseapp.com",
  projectId: "remaster-in",
  storageBucket: "remaster-in.firebasestorage.app",
  messagingSenderId: "815608291451",
  appId: "1:815608291451:web:11bdf5e6d154ff566d42de",
  measurementId: "G-71CC8GSY36",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

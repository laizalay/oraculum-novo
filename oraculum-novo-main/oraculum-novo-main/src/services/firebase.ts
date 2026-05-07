import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5WhHBQqJdgJsKW-vMPY08GrIi5HL-OE4",
  authDomain: "oraculum-bb.firebaseapp.com",
  projectId: "oraculum-bb",
  storageBucket: "oraculum-bb.firebasestorage.app",
  messagingSenderId: "836954822442",
  appId: "1:836954822442:web:3fb0f2f203603cd5813053"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
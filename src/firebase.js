// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBdxbMPGy0PL2rCB1M3y2cxehJB0Ou2zeE",
  authDomain: "react-test-project-c100a.firebaseapp.com",
  projectId: "react-test-project-c100a",
  storageBucket: "react-test-project-c100a.appspot.com",
  messagingSenderId: "4397980195",
  appId: "1:4397980195:web:574d57ee042d165a4c2f96",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

// const querySnapshot = await getDocs(collection(db, "users"));
// querySnapshot.forEach((doc) => {
//   console.log(`${doc.id} => ${doc.data()}`);
// });

export default db;

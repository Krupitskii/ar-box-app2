// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2oj4BCoAE8ckeAPxr5PeCGj7s2spm3eo",
  authDomain: "oracle-22e45.firebaseapp.com",
  projectId: "oracle-22e45",
  storageBucket: "oracle-22e45.firebasestorage.app",
  messagingSenderId: "940045440240",
  appId: "1:940045440240:web:73f10a0ea80ec2e38f1e35",
  measurementId: "G-8DBSH8RX55"
};

// Initialize Firebase
console.log("Initializing Firebase with config:", firebaseConfig);
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized:", app);
const db = getFirestore(app);
console.log("Firestore database initialized:", db);

// Interface for Oracle response data
export interface OracleResponse {
  userQuestion: string;
  aiResponse: string;
  timestamp: any; // Firestore timestamp
  userAgent?: string;
  sessionId?: string;
}

// Function to save Oracle response to Firestore
export async function saveOracleResponse(userQuestion: string, aiResponse: string): Promise<void> {
  console.log("Starting to save Oracle response to Firebase...");
  console.log("User question:", userQuestion);
  console.log("AI response:", aiResponse);
  
  try {
    const responseData: OracleResponse = {
      userQuestion,
      aiResponse,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      sessionId: generateSessionId()
    };

    console.log("Response data prepared:", responseData);
    console.log("Firebase db instance:", db);
    
    const docRef = await addDoc(collection(db, "oracle_responses"), responseData);
    console.log("Oracle response saved to Firebase with ID:", docRef.id);
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    // Don't throw error to avoid breaking the user experience
  }
}

// Generate a simple session ID for tracking
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export { db };

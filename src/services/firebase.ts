import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { JobFitResult, ExtractedProfile } from '../utils/scoring';

// Your web app's Firebase configuration
// In a real app, these would also be environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jobfit-analyzer.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jobfit-analyzer",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jobfit-analyzer.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000:web:mock123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Firebase Login Error:", error);
        return null;
    }
};

export const saveJobFitScan = async (
    uid: string,
    profile: ExtractedProfile,
    result: JobFitResult,
    targetNiche: string
) => {
    try {
        const docRef = await addDoc(collection(db, "users", uid, "scans"), {
            timestamp: serverTimestamp(),
            targetNiche,
            profileSnapshot: {
                fullName: profile.fullName,
                currentRole: profile.currentRole,
                url: profile.url
            },
            score: result.score,
            coreScore: result.coreScore,
            adjScore: result.adjScore,
            analysis: result.analysis,
            skillBreakdown: result.skillBreakdown || []
        });
        return docRef.id;
    } catch (err) {
        console.error("Error saving to Firestore:", err);
        throw err;
    }
};

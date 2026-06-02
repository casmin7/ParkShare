import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration using the screenshot provided by the user
const firebaseConfig = {
    apiKey: "AIzaSyAoV_DzrW_cXeDzU9cjTbZx7qZUdGpDeMc",
    authDomain: "parkshare-chxvu18.firebaseapp.com",
    projectId: "parkshare-chxvu18",
    storageBucket: "parkshare-chxvu18.firebasestorage.app",
    messagingSenderId: "853348510320",
    appId: "1:853348510320:web:ee08962a924dd7d5c322b5",
    measurementId: "G-3S6BVZJSWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export instances to global window object for app.js to use
window.fbApp = app;
window.fbAuth = auth;
window.fbDb = db;

// Firebase API wrappers for ParkShare
window.fbAPI = {
    // ---- AUTHENTICATION ----
    register: async (email, password, userData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Save additional user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                ...userData,
                email: email,
                createdAt: new Date().toISOString()
            });
            
            return user;
        } catch (error) {
            console.error("Firebase Register Error:", error);
            throw error;
        }
    },
    
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Firebase Login Error:", error);
            throw error;
        }
    },
    
    logout: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Firebase Logout Error:", error);
            throw error;
        }
    },
    
    getUserProfile: async (uid) => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting user profile:", error);
            return null;
        }
    },

    // ---- SPOTS (PARCĂRI) ----
    addSpot: async (spotData) => {
        try {
            const docRef = await addDoc(collection(db, "spots"), {
                ...spotData,
                createdAt: new Date().toISOString()
            });
            return docRef.id;
        } catch (error) {
            console.error("Firebase Add Spot Error:", error);
            throw error;
        }
    },
    
    updateSpot: async (spotId, updateData) => {
        try {
            const spotRef = doc(db, "spots", spotId);
            await updateDoc(spotRef, updateData);
            return true;
        } catch (error) {
            console.error("Firebase Update Spot Error:", error);
            throw error;
        }
    },

    deleteSpot: async (spotId) => {
        try {
            await deleteDoc(doc(db, "spots", spotId));
            return true;
        } catch (error) {
            console.error("Firebase Delete Spot Error:", error);
            throw error;
        }
    },
    
    // Încarcă TOATE parcările active (Pentru moment)
    getAllActiveSpots: async () => {
        try {
            const spotsCol = collection(db, "spots");
            // Momentan luăm tot ce nu e rejected, ca să le arătăm tuturor
            const q = query(spotsCol, where("status", "!=", "rejected"));
            const querySnapshot = await getDocs(q);
            const spots = [];
            querySnapshot.forEach((doc) => {
                spots.push({ id: doc.id, ...doc.data() });
            });
            return spots;
        } catch (error) {
            console.error("Firebase Get Spots Error:", error);
            return [];
        }
    },

    // --- REZERVĂRI (BOOKINGS) ---
    bookSpot: async (spotId, bookingData) => {
        try {
            // Adaugă rezervarea
            const docRef = await addDoc(collection(db, "bookings"), {
                spotId: spotId,
                ...bookingData,
                status: 'active',
                createdAt: new Date().toISOString()
            });
            
            // Schimbă statusul locului de parcare și asignează utilizatorul care l-a rezervat
            await window.fbAPI.updateSpot(spotId, { 
                status: 'booked',
                bookedBy: bookingData.bookedBy,
                bookedAt: Date.now()
            });
            
            return docRef.id;
        } catch (error) {
            console.error("Firebase Booking Error:", error);
            throw error;
        }
    },

    // --- REVIEWS & RATINGS ---
    addReview: async (reviewData) => {
        try {
            const docRef = await addDoc(collection(db, "reviews"), {
                ...reviewData,
                timestamp: new Date().toISOString()
            });
            return docRef.id;
        } catch (error) {
            console.error("Firebase Add Review Error:", error);
            throw error;
        }
    },
    
    getSpotRating: async (spotId) => {
        try {
            const q = query(collection(db, "reviews"), where("spotId", "==", spotId));
            const querySnapshot = await getDocs(q);
            
            let totalRating = 0;
            let count = 0;
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.rating) {
                    totalRating += data.rating;
                    count++;
                }
            });
            
            if (count === 0) return { average: 0, count: 0 };
            return { average: (totalRating / count).toFixed(1), count: count };
        } catch (error) {
            console.error("Firebase Get Rating Error:", error);
            return { average: 0, count: 0 };
        }
    }
};

console.log("Firebase SDK Initialize Complete.");

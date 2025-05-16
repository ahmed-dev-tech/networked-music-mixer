import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBBY7jVS5Vew1gtbuqf_CCLDRc9J4ar8Ic",
    authDomain: "network-music-6186e.firebaseapp.com",
    databaseURL:
        "https://network-music-6186e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "network-music-6186e",
    storageBucket: "network-music-6186e.firebasestorage.app",
    messagingSenderId: "1040373101753",
    appId: "1:1040373101753:web:6ec228dc34e36255e21768",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://aeros-16c5e-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const firebaseDatabaseUrl = firebaseConfig.databaseURL;

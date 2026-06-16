import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const getServiceAccount = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
};

export const getFirebaseAdminApp = () => {
  if (getApps().length > 0) {
    return getApp();
  }

  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ||
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const serviceAccount = getServiceAccount();

  if (!databaseURL) {
    throw new Error("FIREBASE_DATABASE_URL is required for the admin SDK.");
  }

  if (!serviceAccount) {
    throw new Error(
      "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are required for the admin SDK.",
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL,
  });
};

export const getAdminDatabase = () => getDatabase(getFirebaseAdminApp());

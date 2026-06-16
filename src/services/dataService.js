import { get, onValue, ref } from "firebase/database";

import { database } from "./firebase";
import {
  collectReadings,
  generateMockData,
  normalizeReading,
  sortByTimestamp,
} from "../utils/readings";

const getDatabaseReference = () => {
  const dataPath = process.env.NEXT_PUBLIC_FIREBASE_DATA_PATH?.trim();
  return dataPath ? ref(database, dataPath) : ref(database);
};

const readRealtimeDatabase = async () => {
  const snapshot = await get(getDatabaseReference());

  if (!snapshot.exists()) {
    return [];
  }

  return sortByTimestamp(collectReadings(snapshot.val()));
};

// Fetch a snapshot from Firebase Realtime Database.
export const fetchEmissionsData = async (useMockData = false) => {
  if (useMockData || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return generateMockData();
  }

  try {
    const data = await readRealtimeDatabase();

    if (data.length === 0) {
      throw new Error("No emissions data was found in Firebase.");
    }

    return data;
  } catch (error) {
    console.error(
      "Error fetching Firebase data. Falling back to mock data.",
      error,
    );
    return generateMockData();
  }
};

// Subscribe to live changes in Firebase Realtime Database.
export const subscribeToEmissionsData = (
  onData,
  onError,
  useMockData = false,
) => {
  if (useMockData || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    const mockData = sortByTimestamp(generateMockData());
    onData(mockData);
    return () => {};
  }

  return onValue(
    getDatabaseReference(),
    (snapshot) => {
      const data = snapshot.exists()
        ? sortByTimestamp(collectReadings(snapshot.val()))
        : [];

      onData(data);
    },
    (error) => {
      console.error("Firebase realtime listener failed.", error);
      if (onError) {
        onError(error);
      }
    },
  );
};

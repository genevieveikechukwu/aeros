import { getAdminDatabase } from "../../lib/firebaseAdmin";
import {
  collectReadings,
  normalizeReading,
  sortByTimestamp,
} from "../../src/utils/readings";

const getDataPath = () => process.env.FIREBASE_DATA_PATH?.trim() || "";

const getReadingsRef = () => {
  const database = getAdminDatabase();
  const dataPath = getDataPath();
  return dataPath ? database.ref(dataPath) : database.ref();
};

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method === "GET") {
      const snapshot = await getReadingsRef().get();
      const readings = snapshot.exists()
        ? sortByTimestamp(collectReadings(snapshot.val()))
        : [];

      return res.status(200).json({ readings });
    }

    if (req.method === "POST") {
      const payload =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const reading = normalizeReading(
        payload,
        payload?.device_id || payload?.deviceId,
        {
          allowGeneratedTimestamp: true,
        },
      );

      if (!reading) {
        return res.status(400).json({
          error:
            "Invalid reading payload. Expected device_id, CO, CO2, and optionally location/timestamp.",
        });
      }

      const createdRef = getReadingsRef().push();
      await createdRef.set(reading);

      return res.status(201).json({
        id: createdRef.key,
        reading,
      });
    }

    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("/api/readings failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

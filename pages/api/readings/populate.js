import { getAdminDatabase } from "../../../lib/firebaseAdmin";
import { normalizeReading } from "../../../src/utils/readings";

const seedReadings = [
  {
    device_id: "24:6F:28:A1:B2:C3",
    timestamp: "2026-06-16T17:30:00",
    location: "PET Auditorium, FUTO",
    CO_ppm: 1.2,
    CO2_ppm: 550.0,
    NH3_ppm: 1.5,
    VOC_ppm: 0.05,
    alert_status: "NORMAL",
  },
  {
    device_id: "8C:AA:B5:77:90:1F",
    timestamp: "2026-06-16T17:30:15",
    location: "Mechanical Studio, FUTO",
    CO_ppm: 12.5,
    CO2_ppm: 700.0,
    NH3_ppm: 4.0,
    VOC_ppm: 0.8,
    alert_status: "SAFETY_WARNING",
  },
  {
    device_id: "8C:AA:B5:77:90:1F",
    timestamp: "2026-06-16T17:35:15",
    location: "Mechanical Studio, FUTO",
    CO_ppm: 45.0,
    CO2_ppm: 850.5,
    NH3_ppm: 6.5,
    VOC_ppm: 2.2,
    alert_status: "CRITICAL_DANGER",
  },
  {
    device_id: "3A:1B:4C:9D:E2:F5",
    timestamp: "2026-06-16T17:30:30",
    location: "Mechatronics Lecture hall 1, FUTO",
    CO_ppm: 2.0,
    CO2_ppm: 1250.0,
    NH3_ppm: 3.0,
    VOC_ppm: 0.1,
    alert_status: "SAFETY_WARNING",
  },
];

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const getDataPath = () => process.env.FIREBASE_DATA_PATH?.trim() || "";

const getReadingsRef = () => {
  const database = getAdminDatabase();
  const dataPath = getDataPath();
  return dataPath ? database.ref(dataPath) : database.ref();
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const normalized = seedReadings
      .map((reading) => normalizeReading(reading, reading.device_id))
      .filter(Boolean);

    const createdRefs = await Promise.all(
      normalized.map(async (reading) => {
        const createdRef = getReadingsRef().push();
        await createdRef.set(reading);
        return createdRef;
      }),
    );

    return res.status(201).json({
      inserted: createdRefs.length,
      ids: createdRefs.map((entry) => entry.key),
      readings: normalized,
    });
  } catch (error) {
    console.error("/api/readings/populate failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

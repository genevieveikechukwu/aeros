import { getAdminDatabase } from "../../../lib/firebaseAdmin";
import { normalizeReading } from "../../../src/utils/readings";

const generateRandomReading = () => {
  const CO = parseFloat((Math.random() * 50).toFixed(1));
  const CO2 = parseFloat((Math.random() * 1000 + 400).toFixed(1));
  const NH3 = parseFloat((Math.random() * 10).toFixed(1));
  const VOC = parseFloat((Math.random() * 5).toFixed(2));

  let alertStatus = "NORMAL";
  if (CO > 35 || CO2 > 1200 || NH3 > 6) {
    alertStatus = "CRITICAL_DANGER";
  } else if (CO > 9 || CO2 > 800 || NH3 > 3) {
    alertStatus = "SAFETY_WARNING";
  }

  return {
    device_id: "44:1B:F6:D6:30:90",
    timestamp: new Date().toISOString(),
    location: "COOU engineering Auditorium",
    CO_ppm: CO,
    CO2_ppm: CO2,
    NH3_ppm: NH3,
    VOC_ppm: VOC,
    alert_status: alertStatus,
  };
};

export default async function handler(req, res) {
  // Optional: Secure your cron route so only Vercel can trigger it

  try {
    const database = getAdminDatabase();
    const dataPath = process.env.FIREBASE_DATA_PATH?.trim() || "";
    const readingsRef = dataPath ? database.ref(dataPath) : database.ref();

    const rawReading = generateRandomReading();
    const normalized = normalizeReading(rawReading, rawReading.device_id);

    if (!normalized) {
      return res.status(400).json({ error: "Normalization failed" });
    }

    const createdRef = readingsRef.push();
    await createdRef.set(normalized);

    return res.status(200).json({
      success: true,
      insertedId: createdRef.key,
      reading: normalized,
    });
  } catch (error) {
    console.error("Cron failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

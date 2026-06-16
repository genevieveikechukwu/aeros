const locations = [
  "Obinze",
  "Futo Road",
  "Ihiagwa market",
  "Umuchima market",
  "FUTO backgate",
];

export const generateMockData = () => {
  const now = Date.now();

  return Array.from({ length: 25 }, (_, index) => ({
    device_id:
      index === 0 ? "ESP32-001" : `ESP32-${String(index + 1).padStart(3, "0")}`,
    CO: Math.floor(Math.random() * 100) + 10,
    CO2: Math.floor(Math.random() * 800) + 300,
    NH3: Number((Math.random() * 8).toFixed(2)),
    VOC: Number((Math.random() * 2).toFixed(2)),
    location: locations[Math.floor(Math.random() * locations.length)],
    timestamp: new Date(now - (24 - index) * 3600000).toISOString(),
  }));
};

export const sortByTimestamp = (readings) =>
  [...readings].sort(
    (left, right) => new Date(left.timestamp) - new Date(right.timestamp),
  );

export const normalizeReading = (
  reading,
  fallbackDeviceId = "",
  options = {},
) => {
  if (!reading || typeof reading !== "object" || Array.isArray(reading)) {
    return null;
  }

  const deviceId =
    reading.device_id ??
    reading.deviceId ??
    reading.deviceID ??
    fallbackDeviceId;
  const timestamp =
    reading.timestamp ??
    reading.time ??
    reading.createdAt ??
    (options.allowGeneratedTimestamp ? new Date().toISOString() : undefined);
  const co = Number(
    reading.CO ?? reading.co ?? reading.CO_ppm ?? reading.co_ppm,
  );
  const co2 = Number(
    reading.CO2 ?? reading.co2 ?? reading.CO2_ppm ?? reading.co2_ppm,
  );
  const nh3 = Number(
    reading.NH3 ?? reading.nh3 ?? reading.NH3_ppm ?? reading.nh3_ppm,
  );
  const voc = Number(
    reading.VOC ?? reading.voc ?? reading.VOC_ppm ?? reading.voc_ppm,
  );

  if (!deviceId || !timestamp || Number.isNaN(co) || Number.isNaN(co2)) {
    return null;
  }

  const normalized = {
    ...reading,
    device_id: deviceId,
    CO: co,
    CO2: co2,
    timestamp,
  };

  if (!Number.isNaN(nh3)) {
    normalized.NH3 = nh3;
  }

  if (!Number.isNaN(voc)) {
    normalized.VOC = voc;
  }

  return normalized;
};

export const collectReadings = (node, fallbackDeviceId = "") => {
  if (!node || typeof node !== "object") {
    return [];
  }

  if (Array.isArray(node)) {
    return node.flatMap((item, index) => collectReadings(item, String(index)));
  }

  const normalizedReading = normalizeReading(node, fallbackDeviceId);
  if (normalizedReading) {
    return [normalizedReading];
  }

  return Object.entries(node).flatMap(([key, value]) =>
    collectReadings(value, key),
  );
};

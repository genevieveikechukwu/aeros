import { collectReadings, sortByTimestamp } from "./dataService";

test("collectReadings normalizes nested realtime database records", () => {
  const readings = collectReadings({
    deviceA: {
      first: {
        device_id: "ESP32-001",
        CO: 31,
        CO2: 510,
        location: "Obinze",
        timestamp: "2026-06-16T10:00:00.000Z",
      },
    },
    deviceB: {
      second: {
        device_id: "ESP32-001",
        CO: 22,
        CO2: 405,
        location: "Obinze",
        timestamp: "2026-06-16T09:00:00.000Z",
      },
    },
  });

  const ordered = sortByTimestamp(readings);

  expect(ordered).toHaveLength(2);
  expect(ordered[0].CO).toBe(22);
  expect(ordered[1].CO).toBe(31);
  expect(ordered[0].device_id).toBe("ESP32-001");
});

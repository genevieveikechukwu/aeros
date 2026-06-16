# Indoor Gas Emissions Monitoring Dashboard

A fullstack Next.js dashboard for monitoring indoor gas emissions in real time. The app is designed for enclosed spaces such as laboratories, lecture halls, workshops, studios, and other indoor environments where air quality matters.

It tracks multiple pollutants, visualizes trends, stores readings in Firebase Realtime Database, and exposes API routes that ESP32 devices can post to directly.

## What It Monitors

- Carbon Monoxide, `CO`
- Carbon Dioxide, `CO2`
- Ammonia, `NH3`
- Volatile Organic Compounds, `VOC`
- Alert status values such as `NORMAL`, `SAFETY_WARNING`, and `CRITICAL_DANGER`

## Key Features

- Live indoor air quality dashboard with summary cards
- Trend charts for `CO`, `CO2`, `NH3`, and `VOC`
- Status distribution chart for current readings
- Recent readings table with timestamps and locations
- Firebase Realtime Database integration
- Fullstack Next.js API routes for reading and creating data
- Seed/populate endpoint for inserting sample records quickly

## Stack

- Next.js 15
- React 19
- Recharts
- Firebase Realtime Database
- Firebase Admin SDK for server-side writes

## Project Flow

```text
ESP32 Device -> POST /api/readings -> Firebase Realtime Database -> Dashboard UI
```

## API Routes

### `GET /api/readings`
Returns the stored readings from Firebase Realtime Database.

### `POST /api/readings`
Creates a new reading in the database.

Example payload:

```json
{
  "device_id": "24:6F:28:A1:B2:C3",
  "timestamp": "2026-06-16T17:30:00",
  "location": "PET Auditorium, FUTO",
  "CO_ppm": 1.2,
  "CO2_ppm": 550,
  "NH3_ppm": 1.5,
  "VOC_ppm": 0.05,
  "alert_status": "NORMAL"
}
```

### `POST /api/readings/populate`
Inserts the sample indoor gas readings used for demo/testing.

Use this endpoint to seed the database before connecting your ESP32:

```text
https://your-domain.com/api/readings/populate
```

## Environment Variables

Create a `.env` file in the project root.

```env
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_DATA_PATH=
NEXT_PUBLIC_USE_MOCK_DATA=false

FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Notes:

- `NEXT_PUBLIC_FIREBASE_DATA_PATH` is optional.
- Leave it empty if your readings live at the database root.
- Set it to a node path like `readings` or `sensors/indoor` if your data is nested.
- `FIREBASE_*` values are required for the API routes that write to Firebase.

## Getting Firebase Admin Credentials

Go to Firebase Console:

```text
Project settings -> Service accounts -> Generate new private key
```

That downloaded JSON file contains the `project_id`, `client_email`, and `private_key` values needed by the server.

## ESP32 Usage

Point your ESP32 to the create endpoint:

```text
POST https://your-domain.com/api/readings
Content-Type: application/json
```

Send JSON with your sensor values. The API accepts either of these field styles:

- `CO`, `CO2`, `NH3`, `VOC`
- `CO_ppm`, `CO2_ppm`, `NH3_ppm`, `VOC_ppm`

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```text
pages/
  api/
    readings.js
    readings/
      populate.js
  index.js
  _app.js
lib/
  firebaseAdmin.js
src/
  App.js
  services/
  utils/
```

## Dashboard Behavior

- The app loads readings from Firebase and renders the latest indoor air quality data.
- If no `ESP32-001` record exists, the dashboard falls back to all available readings.
- Charts currently visualize `CO`, `CO2`, `NH3`, and `VOC` trends over time.
- The table shows the most recent readings with location, status, and time.

## Sample Seed Data

The populate endpoint inserts readings for these indoor environments:

- PET Auditorium, FUTO
- Mechanical Studio, FUTO
- Mechatronics Lecture Hall 1, FUTO

These samples are useful for demos and for verifying the dashboard before live hardware data is connected.

## Deployment

Deploy the app as a Next.js project. Make sure your host supports server routes so these endpoints work:

- `/api/readings`
- `/api/readings/populate`

Also set the Firebase environment variables in your deployment environment, not only in local `.env`.

## Security Notes

- Do not expose Firebase Admin credentials on the client.
- Keep `.env` out of git.
- Protect the populate endpoint if you do not want it publicly callable in production.

## Troubleshooting

- If the dashboard is empty, confirm the Realtime Database path in `NEXT_PUBLIC_FIREBASE_DATA_PATH`.
- If POST requests fail, verify `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
- If the endpoint returns a 500, check the server logs for Firebase Admin initialization errors.

## License

No license has been added yet.
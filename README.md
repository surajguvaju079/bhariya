# Bhariya 🚛

A freight/load management platform. Drivers can browse and accept pending loads via a **React Native (Expo)** mobile app connected to a **Node.js + Express + MongoDB** backend — both in TypeScript.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Scripts Reference](#scripts-reference)
- [API Reference](#api-reference)
- [Architecture Notes](#architecture-notes)
- [Common Errors & Fixes](#common-errors--fixes)

---

## Prerequisites

| Tool                   | Version   | Notes                                                      |
| ---------------------- | --------- | ---------------------------------------------------------- |
| Node.js                | `>= 18.x` | Required for both server and Expo CLI                      |
| npm                    | `>= 9.x`  | Used in server; client also has a `bun.lock` but npm works |
| MongoDB                | `>= 6.x`  | Local instance or MongoDB Atlas                            |
| Expo Go app            | Latest    | Install on your Android/iOS device for testing             |
| Android Studio / Xcode | Latest    | Only needed for building native apps                       |

---

## Project Structure

```
bhariya/
├── client/                        # React Native app (Expo + expo-router)
│   ├── src/
│   │   ├── api/load.ts            # API calls (axios)
│   │   ├── app/index.tsx          # Main loads screen
│   │   ├── components/            # UI components
│   │   ├── constants/BaseUrl.ts   # Reads EXPO_PUBLIC_BASE_URL
│   │   └── service/axios.ts       # Axios instance
│   ├── .env                       # Your local env (git-ignored)
│   ├── .env.template              # Env template for new devs
│   └── package.json               # Expo ~53, React Native 0.79, React 19
│
├── server/                        # Express API
│   ├── src/
│   │   ├── app.ts                 # Express app setup, routes, middleware
│   │   ├── server.ts              # Entry point — DB connect + listen
│   │   ├── config/db.ts           # Mongoose connection
│   │   ├── constants/loadStatus.ts
│   │   ├── controllers/           # Request handlers
│   │   ├── middlewares/           # asyncHandler, validate, error, logger
│   │   ├── models/load.model.ts   # Mongoose Load schema
│   │   ├── routes/load.routes.ts  # Route definitions
│   │   ├── services/load.service.ts
│   │   ├── utils/                 # ApiError, StatusCodes, Winston logger
│   │   └── validations/           # Zod schemas
│   ├── .env.template              # Env template
│   └── package.json               # Express 5, Mongoose 9, Zod 4
└── README.md
```

---

## Environment Variables

### Backend — `server/.env`

The `.env.template` in `server/` is empty — create `.env` manually:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/bhariya
```

> The base API path is `/bhariya/api` — hardcoded in `app.ts`. All routes are prefixed with `/bhariya/api/loads`.

### Frontend — `client/.env`

The template has:

```env
EXPO_PUBLIC_BASE_URL=http://localhost:8080/bhariya/api
```

**Important:** When testing on a physical device, `localhost` won't work — use your machine's local IP address instead:

```env
# Find your IP: ipconfig (Windows) / ifconfig or ip a (Linux/Mac)
EXPO_PUBLIC_BASE_URL=http://192.168.x.x:8080/bhariya/api
```

> All `EXPO_PUBLIC_` prefixed variables are automatically exposed to the client bundle by Expo. Missing this prefix = `undefined` at runtime.

---

## Running the Backend

```bash
# 1. Navigate to server
cd server

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.template .env    # then fill in PORT and MONGO_URI

# 4. Start development server (hot reload via ts-node-dev)
npm run dev
```

Server starts at `http://localhost:8080`.

Verify it's working:

```bash
curl http://localhost:8080/bhariya/api/loads
```

---

## Running the Frontend

```bash
# 1. Navigate to client (open a new terminal)
cd client

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.template .env    # update IP if testing on a physical device

# 4. Start Expo dev server
npm start
```

Then:

- **Physical device** — scan the QR code with the **Expo Go** app
- **Android emulator** — press `a`
- **iOS simulator** — press `i`
- **Browser** — press `w` or run `npm run web`

---

## Scripts Reference

### Server (`server/`)

| Script          | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `npm run dev`   | Dev server with hot reload (`ts-node-dev`) and path alias support |
| `npm run build` | Compile TypeScript → `dist/`                                      |
| `npm start`     | Run compiled production build from `dist/server.js`               |

### Client (`client/`)

| Script            | Description                       |
| ----------------- | --------------------------------- |
| `npm start`       | Start Expo dev server             |
| `npm run android` | Launch on Android emulator/device |
| `npm run ios`     | Launch on iOS simulator/device    |
| `npm run web`     | Launch in browser via Metro       |
| `npm run lint`    | Run Expo ESLint                   |

---

## API Reference

**Base URL:** `http://localhost:8080/bhariya/api`

### Loads

| Method  | Endpoint            | Description                 |
| ------- | ------------------- | --------------------------- |
| `GET`   | `/loads`            | Get paginated pending loads |
| `POST`  | `/loads`            | Create a new load           |
| `PATCH` | `/loads/:id/accept` | Accept a load by ID         |

---

### `GET /loads`

Query parameters:

| Param   | Type   | Description                     |
| ------- | ------ | ------------------------------- |
| `page`  | string | Page number (default `1`)       |
| `limit` | string | Results per page (default `10`) |

Response:

```json
{
  "success": true,
  "data": {
    "loads": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "hasMore": true
    }
  }
}
```

---

### `POST /loads`

Request body:

```json
{
  "origin": "Kathmandu",
  "destination": "Pokhara",
  "weight": 500,
  "vehicleTypeRequired": "Truck",
  "price": 15000,
  "status": "PENDING",
  "driverId": "optional"
}
```

---

### `PATCH /loads/:id/accept`

Request body:

```json
{
  "driverId": "driver_id_string"
}
```

> A load can only be accepted if its current status is `PENDING`. Trying to accept an already-accepted load returns `400 Bad Request`.

---

## Architecture Notes

### Path Aliases

Both `server/` and `client/` use `@/` as an alias for `src/`. In the server, this is resolved at runtime by `tsconfig-paths` — notice the `-r tsconfig-paths/register` flag in the `dev` script. If you ever run `ts-node` directly without this flag, all `@/` imports will fail.

### Request Validation

All routes go through Zod validation via the `validate()` middleware. Every schema wraps fields under `body`, `params`, and `query` keys — this is intentional and must be maintained:

```typescript
// All schemas follow this structure
export const mySchema = z.object({
  body: z.object({ ... }),
  params: z.object({ ... }),
  query: z.object({ ... }),
});
```

The middleware calls `schema.parse({ body: req.body, query: req.query, params: req.params })`.

### Error Handling Flow

```
Route → asyncHandler → Controller → Service
                 ↓ (any thrown error)
          errorHandler middleware
```

- `asyncHandler` wraps async controllers so unhandled rejections are forwarded to `next(error)` automatically.
- `validate` middleware calls `next(error)` on Zod failures — it does **not** throw.
- All intentional errors use `new ApiError(statusCode, message)`.

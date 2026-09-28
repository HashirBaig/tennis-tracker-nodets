# Match Tracker API

A simple Express + TypeScript + MongoDB (Mongoose) API for tracking tennis players and matches.

## Tech Stack

- **Node.js** / **Express**
- **TypeScript**
- **MongoDB** with **Mongoose**

## Data Models

### Player

| Field         | Type     | Notes                                    |
| ------------- | -------- | ---------------------------------------- |
| `playerName`  | `string` | Required, trimmed, max 500 chars, unique |
| `createdDate` | `Date`   | Defaults to now                          |

### Match

| Field                 | Type                       | Notes                   |
| --------------------- | -------------------------- | ----------------------- |
| `playerOne`           | `ObjectId` (ref: `Player`) | Required                |
| `playerTwo`           | `ObjectId` (ref: `Player`) | Required                |
| `numberOfSets`        | `number`                   | Required                |
| `numberOfGames`       | `number`                   | Required                |
| `gamesWonByPlayerOne` | `number`                   | Required, defaults to 0 |
| `gamesWonByPlayerTwo` | `number`                   | Required, defaults to 0 |
| `createdDate`         | `Date`                     | Defaults to now         |

Both models expose a clean JSON shape via a `toJSON` transform that replaces Mongo's `_id` with `id` and drops the version key.

## API Endpoints

### `POST /api/matches`

Creates a new match. Players are identified **by name**, not by ID — if a player with the given name doesn't exist yet, they're created automatically; if they already exist, their existing record is reused.

**Request body**

```json
{
  "playerOne": "John Doe",
  "playerTwo": "Jane Smith",
  "numberOfSets": 3,
  "numberOfGames": 6,
  "gamesWonByPlayerOne": 4,
  "gamesWonByPlayerTwo": 2
}
```

**Behavior**

1. Validates that all fields are present and that `playerOne` and `playerTwo` are different names.
2. Looks up existing players by name.
3. Bulk-inserts any player names that don't already exist.
4. Creates the match using the resolved player IDs.
5. Returns the created match with both players populated.

**Responses**

| Status | Meaning                                        |
| ------ | ---------------------------------------------- |
| `201`  | Match created successfully                     |
| `400`  | Missing fields, or `playerOne` === `playerTwo` |
| `500`  | Server/database error                          |

**Example response**

```json
{
  "id": "6656f1e2a1b2c3d4e5f6a7b8",
  "playerOne": {
    "id": "6656f1e2a1b2c3d4e5f6a7b1",
    "playerName": "John Doe",
    "createdDate": "2026-09-28T10:00:00.000Z"
  },
  "playerTwo": {
    "id": "6656f1e2a1b2c3d4e5f6a7b2",
    "playerName": "Jane Smith",
    "createdDate": "2026-09-28T10:00:00.000Z"
  },
  "numberOfSets": 3,
  "numberOfGames": 6,
  "gamesWonByPlayerOne": 4,
  "gamesWonByPlayerTwo": 2,
  "createdDate": "2026-09-28T10:05:00.000Z"
}
```

---

### `GET /api/matches`

Fetches all matches, newest first, with both players populated.

**Responses**

| Status | Meaning                   |
| ------ | ------------------------- |
| `200`  | Array of matches returned |
| `500`  | Server/database error     |

**Example response**

```json
[
  {
    "id": "6656f1e2a1b2c3d4e5f6a7b8",
    "playerOne": {
      "id": "...",
      "playerName": "John Doe",
      "createdDate": "..."
    },
    "playerTwo": {
      "id": "...",
      "playerName": "Jane Smith",
      "createdDate": "..."
    },
    "numberOfSets": 3,
    "numberOfGames": 6,
    "gamesWonByPlayerOne": 4,
    "gamesWonByPlayerTwo": 2,
    "createdDate": "2026-09-28T10:05:00.000Z"
  }
]
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your MongoDB connection string in an `.env` file:
   ```
   MONGO_URI=mongodb://localhost:27017/match-tracker
   PORT=3000
   ```
3. Run the server:
   ```bash
   npm run dev
   ```

## Notes / Future Improvements

- Add a unique index on `Player.playerName` to prevent duplicate players under concurrent requests.
- Consider `findOneAndUpdate` with `upsert: true` per player instead of find-then-bulk-insert, for full race-condition safety.
- Add pagination to `GET /api/matches` if the match history grows large.
- Add validation that `gamesWonByPlayerOne`/`gamesWonByPlayerTwo` don't exceed `numberOfGames`.

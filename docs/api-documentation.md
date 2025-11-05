# API Documentation

## Overview

REST API for managing chess games and mistakes. All endpoints return JSON.

## Games

### Create Game

**POST** `/api/games`

Import a chess game from PGN format.

**Request Body:**

```json
{
  "pgn": "string (required) - Full PGN string"
}
```

**Response** (201 Created):

```json
{
  "game": {
    "id": "string",
    "pgn": "string",
    "playerColor": "white" | "black",
    "opponentRating": "number | undefined",
    "timeControl": "string | undefined",
    "datePlayed": "ISO 8601 date | undefined",
    "createdAt": "ISO 8601 date"
  }
}
```

**Errors:**

- `400` - Invalid PGN format or missing PGN field
- `500` - Internal server error

**Example:**

```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"pgn":"[Event \"Test\"]\n1. e4 e5"}'
```

---

### List Games

**GET** `/api/games`

Get all games, ordered by creation date (most recent first).

**Response** (200 OK):

```json
{
  "games": [
    {
      "id": "string",
      "pgn": "string",
      "playerColor": "white" | "black",
      "opponentRating": "number | undefined",
      "timeControl": "string | undefined",
      "datePlayed": "ISO 8601 date | undefined",
      "createdAt": "ISO 8601 date"
    }
  ]
}
```

---

### Get Game

**GET** `/api/games/[id]`

Get a single game with all its mistakes.

**Response** (200 OK):

```json
{
  "game": {
    "id": "string",
    "pgn": "string",
    "playerColor": "white" | "black",
    "opponentRating": "number | undefined",
    "timeControl": "string | undefined",
    "datePlayed": "ISO 8601 date | undefined",
    "createdAt": "ISO 8601 date",
    "mistakes": [
      {
        "id": "string",
        "gameId": "string",
        "moveNumber": "number",
        "fenPosition": "string",
        "briefDescription": "string",
        "primaryTag": "string",
        "detailedReflection": "string | undefined",
        "createdAt": "ISO 8601 date",
        "updatedAt": "ISO 8601 date"
      }
    ]
  }
}
```

**Errors:**

- `404` - Game not found
- `500` - Internal server error

---

### Delete Game

**DELETE** `/api/games/[id]`

Delete a game and all its mistakes (cascade).

**Response** (200 OK):

```json
{
  "success": true
}
```

---

## Mistakes

### Create Mistake

**POST** `/api/mistakes`

Create a new mistake for a game.

**Request Body:**

```json
{
  "gameId": "string (required)",
  "moveNumber": "number (required)",
  "fenPosition": "string (required)",
  "briefDescription": "string (required)",
  "primaryTag": "string (required)",
  "detailedReflection": "string (optional)"
}
```

**Response** (201 Created):

```json
{
  "mistake": {
    "id": "string",
    "gameId": "string",
    "moveNumber": "number",
    "fenPosition": "string",
    "briefDescription": "string",
    "primaryTag": "string",
    "detailedReflection": "string | undefined",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

**Errors:**

- `400` - Missing required fields
- `500` - Internal server error

---

### List Mistakes

**GET** `/api/mistakes`

Get all mistakes, or filter by game.

**Query Parameters:**

- `gameId` (optional) - Filter mistakes by game ID

**Response** (200 OK):

```json
{
  "mistakes": [
    {
      "id": "string",
      "gameId": "string",
      "moveNumber": "number",
      "fenPosition": "string",
      "briefDescription": "string",
      "primaryTag": "string",
      "detailedReflection": "string | undefined",
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    }
  ]
}
```

---

### Get Mistake

**GET** `/api/mistakes/[id]`

Get a single mistake.

**Response** (200 OK):

```json
{
  "mistake": {
    "id": "string",
    "gameId": "string",
    "moveNumber": "number",
    "fenPosition": "string",
    "briefDescription": "string",
    "primaryTag": "string",
    "detailedReflection": "string | undefined",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

**Errors:**

- `404` - Mistake not found
- `500` - Internal server error

---

### Update Mistake

**PATCH** `/api/mistakes/[id]`

Update a mistake. All fields are optional.

**Request Body:**

```json
{
  "briefDescription": "string (optional)",
  "primaryTag": "string (optional)",
  "detailedReflection": "string (optional)"
}
```

**Response** (200 OK):

```json
{
  "mistake": {
    "id": "string",
    "gameId": "string",
    "moveNumber": "number",
    "fenPosition": "string",
    "briefDescription": "string",
    "primaryTag": "string",
    "detailedReflection": "string | undefined",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

**Errors:**

- `404` - Mistake not found
- `500` - Internal server error

---

### Delete Mistake

**DELETE** `/api/mistakes/[id]`

Delete a mistake.

**Response** (200 OK):

```json
{
  "success": true
}
```

---

## Tags

### List Tags

**GET** `/api/tags`

Get all unique tags (for autocomplete).

**Response** (200 OK):

```json
{
  "tags": ["string", "string", ...]
}
```

Tags are sorted alphabetically.

---

## Architecture Notes

- All API routes use repository pattern with Prisma
- Domain types (not Prisma types) are returned
- PGN parsing happens in the API layer
- Thin controllers - validation + repository calls
- No authentication in Phase 1 (single-user mode)

## Testing

To test API endpoints during development:

```bash
# Start dev server
npm run dev

# Test game creation
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"pgn":"[Event \"Test\"]\n1. e4 e5"}'

# List games
curl http://localhost:3000/api/games

# List tags
curl http://localhost:3000/api/tags
```

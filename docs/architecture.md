# Chess Mistake Journal - Architecture Documentation

> **Purpose**: This document provides a comprehensive overview of the application's architecture, data flows, and key design decisions. It's intended for both human developers and AI assistants working on this codebase.

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Key Workflows](#key-workflows)
6. [Chess Logic & Utilities](#chess-logic--utilities)
7. [Frontend Pages](#frontend-pages)

---

## System Overview

The Chess Mistake Journal is a Next.js application for tracking and analyzing chess mistakes. Users can:

- Import games via PGN
- Navigate through game moves with a visual board
- Record mistakes at specific positions with tags and reflections
- Browse and filter mistakes by tags
- Delete mistakes

**Tech Stack**:

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM
- **Chess Engine**: chess.js
- **Chess UI**: react-chessboard
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety throughout

---

## Database Schema

```mermaid
erDiagram
    Game ||--o{ Mistake : "has many"

    Game {
        string id PK "cuid"
        string pgn UK "Unique PGN text"
        string playerColor "white or black"
        int opponentRating "Optional"
        string timeControl "Optional"
        datetime datePlayed "Optional"
        datetime createdAt
    }

    Mistake {
        string id PK "cuid"
        string gameId FK
        int moveNumber "Which move the mistake occurred"
        string fenPosition "Board position as FEN"
        string briefDescription "Short summary"
        string primaryTag "Category tag"
        string detailedReflection "Optional markdown"
        datetime createdAt
        datetime updatedAt
    }
```

### Key Design Decisions:

1. **PGN as Unique Key**: Each game's PGN is unique to prevent duplicate imports
2. **Cascade Delete**: Deleting a game deletes all its mistakes (`onDelete: Cascade`)
3. **FEN Storage**: Each mistake stores the exact board position as FEN for display
4. **Indexing**:
   - `datePlayed` on Game for chronological sorting
   - `gameId`, `primaryTag`, `createdAt` on Mistake for efficient filtering

---

## API Endpoints

```mermaid
graph TB
    subgraph "Games API"
        G1[GET /api/games]
        G2[POST /api/games]
        G3[GET /api/games/:id]
        G4[PATCH /api/games/:id]
        G5[DELETE /api/games/:id]
    end

    subgraph "Mistakes API"
        M1[GET /api/mistakes]
        M2[POST /api/mistakes]
        M3[GET /api/mistakes/:id]
        M4[PATCH /api/mistakes/:id]
        M5[DELETE /api/mistakes/:id]
    end

    subgraph "Tags API"
        T1[GET /api/tags]
    end

    G1 --> DB[(Database)]
    G2 --> DB
    G3 --> DB
    G4 --> DB
    G5 --> DB
    M1 --> DB
    M2 --> DB
    M3 --> DB
    M4 --> DB
    M5 --> DB
    T1 --> DB
```

### API Details

#### Games Endpoints

| Method | Path             | Description                        | Request                                                            | Response                                   |
| ------ | ---------------- | ---------------------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| GET    | `/api/games`     | List all games                     | -                                                                  | `{ games: Game[] }`                        |
| POST   | `/api/games`     | Create game from PGN               | `{ pgn, playerColor, opponentRating?, timeControl?, datePlayed? }` | `{ game: Game }`                           |
| GET    | `/api/games/:id` | Get single game with mistakes      | -                                                                  | `{ game: Game & { mistakes: Mistake[] } }` |
| PATCH  | `/api/games/:id` | Update game metadata               | `{ playerColor?, opponentRating?, timeControl?, datePlayed? }`     | `{ game: Game }`                           |
| DELETE | `/api/games/:id` | Delete game (cascades to mistakes) | -                                                                  | `{ success: true }`                        |

#### Mistakes Endpoints

| Method | Path                | Description                      | Request                                                                                  | Response                                     |
| ------ | ------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| GET    | `/api/mistakes`     | List all mistakes with game data | -                                                                                        | `{ mistakes: (Mistake & { game: Game })[] }` |
| POST   | `/api/mistakes`     | Create mistake                   | `{ gameId, moveNumber, fenPosition, briefDescription, primaryTag, detailedReflection? }` | `{ mistake: Mistake }`                       |
| GET    | `/api/mistakes/:id` | Get single mistake with game     | -                                                                                        | `{ mistake: Mistake & { game: Game } }`      |
| PATCH  | `/api/mistakes/:id` | Update mistake                   | `{ briefDescription?, primaryTag?, detailedReflection? }`                                | `{ mistake: Mistake }`                       |
| DELETE | `/api/mistakes/:id` | Delete mistake                   | -                                                                                        | `{ success: true }`                          |

#### Tags Endpoint

| Method | Path        | Description         | Response             |
| ------ | ----------- | ------------------- | -------------------- |
| GET    | `/api/tags` | Get all unique tags | `{ tags: string[] }` |

---

## Data Flow Diagrams

### 1. Game Import Flow

```mermaid
sequenceDiagram
    actor User
    participant Page as Import Page
    participant API as POST /api/games
    participant Parser as pgn-parser
    participant DB as Database

    User->>Page: Paste PGN
    Page->>Page: Client validation
    Page->>API: POST { pgn, playerColor, ... }
    API->>Parser: parsePGN(pgn)
    Parser->>Parser: Clean annotations
    Parser->>Parser: chess.js validation
    Parser-->>API: Parsed data
    API->>DB: Check unique PGN
    alt PGN exists
        DB-->>API: Error: duplicate
        API-->>Page: 409 Conflict
        Page-->>User: "Game already imported"
    else PGN unique
        DB-->>API: OK
        API->>DB: Create game
        DB-->>API: Game record
        API-->>Page: 201 { game }
        Page->>Page: router.push('/games/:id')
        Page-->>User: Show game viewer
    end
```

### 2. Game Viewer Navigation Flow

```mermaid
sequenceDiagram
    actor User
    participant Page as Game Viewer
    participant State as React State
    participant ChessJS as chess.js
    participant Board as Chessboard Component

    User->>Page: Load page
    Page->>API: GET /api/games/:id
    API-->>Page: Game + Mistakes
    Page->>ChessJS: loadPgn(cleanedPgn)
    ChessJS->>ChessJS: Parse all moves
    ChessJS-->>Page: history[]
    Page->>State: setMoves(history)
    Page->>State: setChessGame(new Chess())
    Page->>Board: Render initial position

    User->>Page: Click "Next" button
    Page->>State: goToMove(currentIndex + 1)
    State->>ChessJS: new Chess()
    loop For each move up to index
        State->>ChessJS: move(moves[i])
    end
    ChessJS-->>State: Updated position
    State->>State: setChessGame(newGame)
    State->>State: setCurrentMoveIndex(index)
    State->>Board: Re-render with new FEN
    Board-->>User: Updated board position
```

**Key Implementation Detail**: The board uses `key={chessGame.fen()}` to force React to re-render when the position changes, ensuring the chessboard updates correctly.

### 3. Mistake Recording Flow

```mermaid
sequenceDiagram
    actor User
    participant Viewer as Game Viewer
    participant Form as Mistake Form
    participant API as POST /api/mistakes
    participant DB as Database

    User->>Viewer: Navigate to move 15
    Viewer->>Viewer: Display position
    User->>Viewer: Click "Add Mistake"
    Viewer->>Form: Navigate with gameId, moveNumber, fen
    Form->>Form: Display position preview
    User->>Form: Enter description
    User->>Form: Enter/select tag
    User->>Form: Add reflection (optional)
    User->>Form: Submit
    Form->>API: POST /api/mistakes
    API->>DB: Create mistake record
    DB-->>API: Mistake created
    API-->>Form: 201 { mistake }
    Form->>Viewer: Navigate back to game
    Viewer->>Viewer: Highlight move 15 in red
```

### 4. Mistake Deletion Flow

```mermaid
sequenceDiagram
    actor User
    participant Page as Mistake Detail/List
    participant API as DELETE /api/mistakes/:id
    participant DB as Database

    User->>Page: Click "Delete" button
    Page->>Page: Show confirmation dialog
    User->>Page: Confirm deletion
    Page->>Page: setDeleting(true)
    Page->>API: DELETE /api/mistakes/:id
    API->>DB: deleteMistake(id)
    DB-->>API: Deleted
    API-->>Page: 200 { success: true }
    alt On Detail Page
        Page->>Page: router.push('/mistakes')
    else On List Page
        Page->>Page: Remove from local state
        Page->>Page: Update tag counts
    end
    Page-->>User: Updated view
```

---

## Key Workflows

### PGN Parsing & Validation

```mermaid
flowchart TD
    A[Raw PGN Input] --> B{Contains headers?}
    B -->|Yes| C[Extract Result header]
    B -->|No| D[No result info]
    C --> E[Clean annotations]
    D --> E
    E --> F{Remove clock times}
    F --> G{Remove comments}
    G --> H[Cleaned PGN]
    H --> I[chess.js loadPgn]
    I --> J{Valid?}
    J -->|Yes| K[Extract moves]
    J -->|No| L[Throw error]
    K --> M[Return parsed data]
```

**Location**: `lib/chess/pgn-parser.ts`

**Cleaning Steps**:

1. Remove clock annotations: `{ [%clk 0:03:00] }`
2. Remove evaluation comments: `{ [%eval 0.5] }`
3. Remove opening names and other bracketed data
4. Trim whitespace

### Move Navigation Logic

```mermaid
flowchart TD
    A[User clicks move button] --> B[goToMove function]
    B --> C[Create new Chess instance]
    C --> D[Loop through moves 0 to index]
    D --> E[Apply each move]
    E --> F[Set new Chess instance]
    F --> G[Update current move index]
    G --> H[Chessboard re-renders]
    H --> I{Key changed?}
    I -->|Yes| J[Force component remount]
    I -->|No| K[Component might not update]
    J --> L[Display new position]
```

**Location**: `app/games/[id]/page.tsx`

**Critical Implementation**:

```typescript
// The key prop forces React to remount the component when position changes
<Chessboard
  key={chessGame.fen()}  // Forces re-render on position change
  options={{
    position: chessGame.fen(),
    allowDragging: false,
  }}
/>
```

---

## Chess Logic & Utilities

### Module Overview

```mermaid
graph LR
    subgraph "Chess Utilities"
        A[pgn-parser.ts]
        B[fen-extractor.ts]
        C[move-navigator.ts]
    end

    subgraph "Database Layer"
        D[games-repository.ts]
        E[mistakes-repository.ts]
    end

    subgraph "External"
        F[chess.js]
    end

    A --> F
    B --> F
    C --> F
    D --> DB[(SQLite)]
    E --> DB
```

### pgn-parser.ts

**Purpose**: Parse and validate PGN strings

**Key Functions**:

- `parsePGN(pgn: string)`: Main parsing function
  - Cleans annotations
  - Validates with chess.js
  - Extracts game result from headers
  - Returns structured data

**Test Coverage**: ✅ Full unit tests in `__tests__/lib/chess/pgn-parser.test.ts`

### fen-extractor.ts

**Purpose**: Extract FEN positions from specific moves in a PGN

**Key Functions**:

- `getFenAtMove(pgn: string, moveNumber: number)`: Get position after move N
  - Parses PGN
  - Replays moves up to target
  - Returns FEN string

**Test Coverage**: ✅ Full unit tests in `__tests__/lib/chess/fen-extractor.test.ts`

### move-navigator.ts

**Purpose**: Navigate through game positions

**Key Functions**:

- `getMoveHistory(pgn: string)`: Get array of all moves
- `getPositionAtMove(pgn: string, moveIndex: number)`: Get board state at index

**Test Coverage**: ✅ Full unit tests in `__tests__/lib/chess/move-navigator.test.ts`

### Repository Pattern

Both `games-repository.ts` and `mistakes-repository.ts` follow a repository pattern:

**Benefits**:

1. Separates data access from API logic
2. Easier to test (can mock repositories)
3. Consistent error handling
4. Single source of truth for queries

**Example**:

```typescript
// games-repository.ts
export async function createGame(prisma: PrismaClient, data: CreateGameInput): Promise<Game> {
  return prisma.game.create({ data });
}

// Used in API route
const game = await gamesRepo.createGame(prisma, gameData);
```

---

## Frontend Architecture

### Page Structure

```mermaid
graph TD
    A[/ Root] --> B[/games]
    A --> C[/mistakes]

    B --> B1[/games/:id - Game Viewer]

    C --> C1[/mistakes - List All]
    C --> C2[/mistakes/:id - Detail View]
    C --> C3[/mistakes/new - Create Form]
```

### State Management

**Game Viewer State**:

- `chessGame`: Current chess.js instance
- `currentMoveIndex`: Which move is displayed (0-indexed, 0 = start position)
- `moves`: Array of all moves from PGN

**Mistakes List State**:

- `mistakes`: All mistakes with game data
- `selectedTag`: Current filter
- `deletingId`: Track which mistake is being deleted

**Mistake Form URL Parameters**:

- `gameId`: Which game the mistake belongs to
- `moveNumber`: Which move
- `fen`: Board position (passed from game viewer)

---

## Design Decisions & Trade-offs

### 1. PGN as Unique Constraint

**Decision**: Use PGN text as unique key, not game metadata

**Rationale**:

- Two games with same players/date/result could be different games
- PGN contains the complete game record
- Prevents accidental duplicate imports
- Simple to check before insert

**Trade-off**: Large text field as unique key (not ideal for performance at scale)

### 2. Storing FEN with Each Mistake

**Decision**: Store `fenPosition` on each Mistake, not just `moveNumber`

**Rationale**:

- Direct display without replaying game
- Protects against PGN modifications
- Faster queries (no need to parse PGN)

**Trade-off**: Redundant data storage

### 3. Repository Pattern

**Decision**: Abstract database access into repository modules

**Rationale**:

- Testability
- Consistency
- Easier to switch ORMs/databases
- Clear separation of concerns

**Trade-off**: Extra abstraction layer

### 4. Client-Side Move Navigation

**Decision**: Use chess.js on the client for move navigation, not server

**Rationale**:

- Instant UI updates
- No API calls for each move
- Works offline once game is loaded

**Trade-off**: Larger bundle size (chess.js is ~200KB)

### 5. SQLite Database

**Decision**: Use SQLite instead of PostgreSQL/MySQL

**Rationale**:

- Simple deployment (no separate DB server)
- Perfect for single-user journal
- Fast for small datasets
- Easy backups (single file)

**Trade-off**: Not suitable for multi-user deployment

---

## Testing Strategy

### Unit Tests (Implemented)

- ✅ PGN Parser (`pgn-parser.test.ts`)
- ✅ FEN Extractor (`fen-extractor.test.ts`)
- ✅ Move Navigator (`move-navigator.test.ts`)

**Test Philosophy** (from development-rules.md):

- Focus on core chess logic
- Test edge cases (empty games, invalid positions)
- Behavioral tests, not brittle implementation tests
- No UI testing (too brittle)

### Integration Tests (Not Yet Implemented)

Future areas to test:

- API endpoint contracts
- Repository CRUD operations
- PGN import end-to-end

---

## Future Considerations

### Scalability

Current limitations if scaling to multi-user:

1. SQLite → Need PostgreSQL
2. No authentication
3. No multi-tenancy
4. File-based storage

### Performance

Potential bottlenecks:

1. Large PGN parsing on import
2. Listing all games/mistakes without pagination
3. Move list rendering for 100+ move games

### Features Not Yet Implemented

Ideas for future development:

- Game analysis integration (Stockfish)
- Spaced repetition for mistakes
- Statistics dashboard
- Export mistakes as PDF
- Opening repertoire tracker

---

## Known Issues & Solutions

### React Chessboard Not Re-rendering

**Issue**: The `react-chessboard` v5.8.3 component with React 19 doesn't automatically re-render when position prop changes.

**Solution**: Use `key={chessGame.fen()}` on the `<Chessboard>` component to force remounting when position changes.

**Location**: `app/games/[id]/page.tsx`

---

**Last Updated**: 2025-11-05
**Maintainer**: This document should be updated whenever significant architectural changes are made.

# Technical Architecture - Chess Mistake Journal

## Overview

This document defines the detailed technical implementation strategy for Phase 1 of the Chess Mistake Journal, emphasizing clean code practices, testability, and separation of concerns.

## Core Principles

1. **Separation of Concerns**: Business logic separate from UI, data access abstracted
2. **Test-Driven Development**: Core logic has tests before integration
3. **Simple > Clever**: Readable code over elegant abstractions
4. **Incremental Delivery**: Each feature is independently testable and deployable
5. **YAGNI**: Build only what's needed for current phase

## Technology Stack (Finalized)

### Core Framework

- **Next.js 14.2+** (App Router)
  - TypeScript (strict mode)
  - Server Components by default
  - Client Components only when needed (interactivity)

### Database & ORM

- **SQLite** (development and production)
- **Prisma 5.x** (ORM + migrations)
  - Type generation for models
  - Migration system for schema changes

### Chess Libraries

- **chess.js** - PGN parsing, move validation, FEN handling
- **react-chessboard** - Board UI component

### UI & Styling

- **Tailwind CSS 3.x** - Utility-first styling
- **shadcn/ui** - Pre-built accessible components (optional, if needed)
- **React Hook Form** - Form state management

### Testing

- **Vitest** - Unit test runner (faster than Jest)
- **Testing Library** - Component testing (minimal use)
- **Supertest** - API route testing (Phase 2)

### Development Tools

- **ESLint** - Linting (Next.js defaults)
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** - Pre-commit hooks (optional)

## Project Structure

```
chess-mistake-journal/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page (game list)
│   │   ├── games/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Game detail + mistake entry
│   │   │   └── new/
│   │   │       └── page.tsx          # Import new game
│   │   ├── mistakes/
│   │   │   └── page.tsx              # Mistake list view
│   │   └── api/                      # API routes
│   │       ├── games/
│   │       │   ├── route.ts          # GET /api/games, POST /api/games
│   │       │   └── [id]/
│   │       │       └── route.ts      # GET /api/games/:id
│   │       └── mistakes/
│   │           ├── route.ts          # GET /api/mistakes, POST /api/mistakes
│   │           └── [id]/
│   │               └── route.ts      # PATCH /api/mistakes/:id, DELETE
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── TagAutocomplete.tsx
│   │   ├── chess/                    # Chess-specific components
│   │   │   ├── ChessBoard.tsx        # Wrapper around react-chessboard
│   │   │   ├── MoveNavigation.tsx    # Move forward/back controls
│   │   │   └── GameViewer.tsx        # Board + navigation combined
│   │   ├── game/                     # Game-related components
│   │   │   ├── GameImportForm.tsx
│   │   │   ├── GameList.tsx
│   │   │   └── GameCard.tsx
│   │   └── mistake/                  # Mistake-related components
│   │       ├── MistakeForm.tsx
│   │       ├── MistakeList.tsx
│   │       └── MistakeCard.tsx
│   │
│   ├── lib/                          # Core business logic (pure functions)
│   │   ├── chess/
│   │   │   ├── pgn-parser.ts         # Parse PGN → game metadata
│   │   │   ├── fen-extractor.ts      # Get FEN at specific move
│   │   │   ├── move-navigator.ts     # Navigate through game moves
│   │   │   └── game-validator.ts     # Validate game data
│   │   ├── db/
│   │   │   ├── games.ts              # Game CRUD operations
│   │   │   ├── mistakes.ts           # Mistake CRUD operations
│   │   │   └── tags.ts               # Tag operations (autocomplete)
│   │   └── utils/
│   │       ├── date.ts               # Date formatting utilities
│   │       └── validation.ts         # Input validation helpers
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── chess.ts                  # Chess-related types
│   │   ├── game.ts                   # Game domain types
│   │   └── mistake.ts                # Mistake domain types
│   │
│   └── __tests__/                    # Test files (mirror src structure)
│       ├── lib/
│       │   ├── chess/
│       │   │   ├── pgn-parser.test.ts
│       │   │   ├── fen-extractor.test.ts
│       │   │   └── move-navigator.test.ts
│       │   └── db/
│       │       ├── games.test.ts
│       │       └── mistakes.test.ts
│       └── fixtures/                 # Test data
│           ├── sample-pgns.ts
│           └── sample-games.ts
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Auto-generated migrations
│   └── seed.ts                       # Seed data for development
│
├── public/                           # Static assets
│   └── sample-game.pgn               # Example PGN for testing
│
├── docs/                             # Documentation
│   ├── chess-mistake-journal-prd.md
│   ├── architectural-plan.md
│   └── technical-architecture.md
│
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## Separation of Concerns

### Layer 1: Business Logic (`src/lib/`)

- **Pure functions** - No dependencies on Next.js, React, or Prisma
- **Fully testable** - Can test without database or UI
- **Domain-focused** - Chess logic, data transformations

Example:

```typescript
// src/lib/chess/pgn-parser.ts
export function parsePGN(pgn: string): ParsedGame {
  // Uses chess.js internally but exports clean domain types
  // Throws descriptive errors for invalid PGN
}
```

### Layer 2: Data Access (`src/lib/db/`)

- **Abstracts Prisma** - Components don't import Prisma directly
- **Repository pattern** - Each model has a dedicated file
- **Type-safe** - Uses Prisma-generated types + domain types

Example:

```typescript
// src/lib/db/games.ts
import { prisma } from '@/lib/prisma';
import { Game } from '@/types/game';

export async function createGame(data: CreateGameInput): Promise<Game> {
  // Prisma operations here
}

export async function getGameById(id: string): Promise<Game | null> {
  // Prisma operations here
}
```

### Layer 3: API Routes (`src/app/api/`)

- **Thin controllers** - Validate input, call data layer, return response
- **Standard REST** - Use HTTP methods correctly
- **Error handling** - Consistent error format

Example:

```typescript
// src/app/api/games/route.ts
import { createGame } from '@/lib/db/games';
import { parsePGN } from '@/lib/chess/pgn-parser';

export async function POST(request: Request) {
  try {
    const { pgn } = await request.json();
    const parsedGame = parsePGN(pgn);
    const game = await createGame(parsedGame);
    return Response.json(game, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

### Layer 4: Components (`src/components/`)

- **Presentational vs Container** - Separate data fetching from rendering
- **Server Components by default** - Client components only for interactivity
- **Props over hooks** - Pass data down, minimize context

Example:

```typescript
// src/components/game/GameList.tsx (Server Component)
import { getGames } from '@/lib/db/games';
import GameCard from './GameCard';

export default async function GameList() {
  const games = await getGames();
  return (
    <div>
      {games.map(game => <GameCard key={game.id} game={game} />)}
    </div>
  );
}

// src/components/chess/ChessBoard.tsx (Client Component)
'use client';
import { Chessboard } from 'react-chessboard';

export default function ChessBoard({ position, onSquareClick }) {
  // Interactive board logic
}
```

### Layer 5: Pages (`src/app/`)

- **Routing only** - Pages compose components, minimal logic
- **Data loading** - Use Server Components to fetch data
- **Layout composition** - Share layouts for consistent UI

## Testing Strategy

### What to Test (with examples)

#### 1. Business Logic (src/lib/chess/)

**PGN Parser** (`pgn-parser.test.ts`):

```typescript
describe('parsePGN', () => {
  it('extracts game metadata from valid Lichess PGN', () => {
    const pgn = `[Event "Casual Game"]
[White "Player1"]
[Black "Player2"]
1. e4 e5 2. Nf3`;

    const result = parsePGN(pgn);
    expect(result.white).toBe('Player1');
    expect(result.black).toBe('Player2');
    expect(result.moves.length).toBe(3);
  });

  it('throws descriptive error for invalid PGN', () => {
    expect(() => parsePGN('invalid pgn')).toThrow('Invalid PGN format');
  });

  it('handles PGN with variations (strips them)', () => {
    const pgn = `1. e4 e5 (1... c5 2. Nf3) 2. Nf3`;
    const result = parsePGN(pgn);
    expect(result.moves).not.toContain('c5'); // Variations stripped
  });
});
```

**FEN Extractor** (`fen-extractor.test.ts`):

```typescript
describe('getFenAtMove', () => {
  it('returns starting position for move 0', () => {
    const pgn = '1. e4 e5 2. Nf3';
    const fen = getFenAtMove(pgn, 0);
    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });

  it('returns correct position after move 1. e4', () => {
    const pgn = '1. e4 e5 2. Nf3';
    const fen = getFenAtMove(pgn, 1);
    expect(fen).toContain('8/8/8/4p3'); // Pawn on e4
  });

  it('handles promotions correctly', () => {
    const pgn = '1. e4 e5 ... 50. e8=Q';
    const fen = getFenAtMove(pgn, 50);
    expect(fen).toContain('Q'); // Queen on e8
  });
});
```

#### 2. Data Access Layer (src/lib/db/)

**Games Repository** (`games.test.ts`):

```typescript
import { createGame, getGameById } from '@/lib/db/games';

// Use in-memory SQLite for tests
beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await clearTestDatabase();
});

describe('createGame', () => {
  it('creates game and returns with generated id', async () => {
    const gameData = {
      pgn: '1. e4 e5',
      playerColor: 'white',
      datePlayed: new Date('2024-01-01'),
    };

    const game = await createGame(gameData);
    expect(game.id).toBeDefined();
    expect(game.pgn).toBe('1. e4 e5');
  });

  it('cascades delete to associated mistakes', async () => {
    const game = await createGame({ pgn: '1. e4 e5', playerColor: 'white' });
    await createMistake({ gameId: game.id, moveNumber: 1, ... });

    await deleteGame(game.id);
    const mistakes = await getMistakesByGameId(game.id);
    expect(mistakes).toHaveLength(0);
  });
});
```

#### 3. API Routes (Phase 2)

**Game API** (`games.test.ts`):

```typescript
import request from 'supertest';

describe('POST /api/games', () => {
  it('creates game from valid PGN', async () => {
    const response = await request(app).post('/api/games').send({ pgn: '1. e4 e5' }).expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.pgn).toBe('1. e4 e5');
  });

  it('returns 400 for invalid PGN', async () => {
    const response = await request(app).post('/api/games').send({ pgn: 'invalid' }).expect(400);

    expect(response.body.error).toContain('Invalid PGN');
  });
});
```

### What NOT to Test

- React component rendering (trust React)
- Tailwind classes applied correctly (visual QA)
- Prisma query execution (trust Prisma)
- Next.js routing (trust Next.js)
- Third-party libraries (chess.js, react-chessboard)

### Test File Structure

```
src/__tests__/
├── lib/
│   ├── chess/
│   │   ├── pgn-parser.test.ts        # ~50 lines, 5-7 tests
│   │   ├── fen-extractor.test.ts     # ~40 lines, 4-5 tests
│   │   └── move-navigator.test.ts    # ~60 lines, 6-8 tests
│   └── db/
│       ├── games.test.ts             # ~80 lines, 6-8 tests
│       └── mistakes.test.ts          # ~100 lines, 8-10 tests
└── fixtures/
    ├── sample-pgns.ts                # 10+ example PGNs
    └── sample-games.ts               # Pre-created game objects
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode during development
npm test -- --watch

# Coverage report (Phase 2 goal: 80% for lib/)
npm test -- --coverage

# Run specific test file
npm test pgn-parser
```

## Type System

### Domain Types (src/types/)

**chess.ts** - Chess-specific types:

```typescript
export type Color = 'white' | 'black';
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Square = 'a1' | 'a2' | ... | 'h8'; // All 64 squares

export interface Move {
  from: Square;
  to: Square;
  piece: PieceSymbol;
  color: Color;
  san: string;          // "Nf3", "e4", "O-O"
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
}

export interface ParsedGame {
  headers: Record<string, string>;
  moves: Move[];
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
}
```

**game.ts** - Game domain types:

```typescript
import { Color } from './chess';

export interface Game {
  id: string;
  pgn: string;
  playerColor: Color;
  opponentRating?: number;
  timeControl?: string;
  datePlayed?: Date;
  createdAt: Date;
}

export interface CreateGameInput {
  pgn: string;
  playerColor: Color;
  opponentRating?: number;
  timeControl?: string;
  datePlayed?: Date;
}

export interface GameWithMistakes extends Game {
  mistakes: Mistake[];
}
```

**mistake.ts** - Mistake domain types:

```typescript
export interface Mistake {
  id: string;
  gameId: string;
  moveNumber: number;
  fenPosition: string;
  briefDescription: string;
  primaryTag: string;
  detailedReflection?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMistakeInput {
  gameId: string;
  moveNumber: number;
  fenPosition: string;
  briefDescription: string;
  primaryTag: string;
  detailedReflection?: string;
}

export interface UpdateMistakeInput {
  briefDescription?: string;
  primaryTag?: string;
  detailedReflection?: string;
}
```

### Prisma Generated Types

Prisma generates types from schema. Use them internally in `src/lib/db/`, but convert to domain types for public APIs:

```typescript
// Internal (data layer)
import { Game as PrismaGame } from '@prisma/client';

// Public (components, API)
import { Game } from '@/types/game';

// Conversion function
function toDomainGame(prismaGame: PrismaGame): Game {
  return {
    id: prismaGame.id,
    pgn: prismaGame.pgn,
    playerColor: prismaGame.playerColor as Color,
    opponentRating: prismaGame.opponentRating ?? undefined,
    timeControl: prismaGame.timeControl ?? undefined,
    datePlayed: prismaGame.datePlayed ?? undefined,
    createdAt: prismaGame.createdAt,
  };
}
```

## Error Handling Strategy

### Error Types

```typescript
// src/lib/utils/errors.ts
export class ChessJournalError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ChessJournalError';
  }
}

export class PGNParseError extends ChessJournalError {
  constructor(message: string) {
    super(message, 'PGN_PARSE_ERROR');
  }
}

export class ValidationError extends ChessJournalError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends ChessJournalError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
  }
}
```

### API Error Responses

```typescript
// Consistent error format
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

// In API routes
export async function POST(request: Request) {
  try {
    // ... operation
  } catch (error) {
    if (error instanceof PGNParseError) {
      return Response.json(
        { error: { message: error.message, code: error.code } },
        { status: 400 }
      );
    }
    if (error instanceof NotFoundError) {
      return Response.json(
        { error: { message: error.message, code: error.code } },
        { status: 404 }
      );
    }
    // Unknown error
    return Response.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Game {
  id              String    @id @default(cuid())
  pgn             String
  playerColor     String    // "white" or "black"
  opponentRating  Int?
  timeControl     String?
  datePlayed      DateTime?
  createdAt       DateTime  @default(now())

  mistakes        Mistake[]

  @@index([datePlayed])
}

model Mistake {
  id                 String   @id @default(cuid())
  gameId             String
  game               Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  moveNumber         Int
  fenPosition        String
  briefDescription   String
  primaryTag         String
  detailedReflection String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([gameId])
  @@index([primaryTag])
  @@index([createdAt])
}
```

### Migration Strategy

```bash
# Create migration after schema changes
npx prisma migrate dev --name add_game_model

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate
```

### Seed Data (Development)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.game.create({
    data: {
      pgn: '1. e4 e5 2. Nf3 Nc6',
      playerColor: 'white',
      datePlayed: new Date('2024-01-01'),
      mistakes: {
        create: [
          {
            moveNumber: 2,
            fenPosition: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
            briefDescription: 'Played too fast without checking opponent threats',
            primaryTag: 'Time pressure',
          },
        ],
      },
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Environment Configuration

```bash
# .env.example
DATABASE_URL="file:./dev.db"
NODE_ENV="development"

# .env (gitignored)
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

## Development Workflow

### Phase 1 Development Loop

1. **Define types** (`src/types/`) - Domain model first
2. **Write tests** (`src/__tests__/`) - Test cases for core logic
3. **Implement logic** (`src/lib/`) - Make tests pass
4. **Create data layer** (`src/lib/db/`) - Database operations
5. **Build API routes** (`src/app/api/`) - HTTP endpoints
6. **Create components** (`src/components/`) - UI components
7. **Compose pages** (`src/app/`) - Route pages
8. **Manual QA** - Test in browser
9. **Commit** - Git commit with descriptive message

### Example: Game Import Feature

**Step 1: Define types**

```typescript
// src/types/game.ts
export interface CreateGameInput { ... }
```

**Step 2: Write test**

```typescript
// src/__tests__/lib/chess/pgn-parser.test.ts
describe('parsePGN', () => {
  it('parses valid Lichess PGN', () => { ... });
});
```

**Step 3: Implement**

```typescript
// src/lib/chess/pgn-parser.ts
export function parsePGN(pgn: string): ParsedGame { ... }
```

**Step 4: Data layer**

```typescript
// src/lib/db/games.ts
export async function createGame(input: CreateGameInput) { ... }
```

**Step 5: API route**

```typescript
// src/app/api/games/route.ts
export async function POST(request: Request) { ... }
```

**Step 6: Component**

```typescript
// src/components/game/GameImportForm.tsx
export default function GameImportForm() { ... }
```

**Step 7: Page**

```typescript
// src/app/games/new/page.tsx
export default function NewGamePage() { ... }
```

**Step 8: Test in browser**

- Paste PGN, verify game created
- Check database with Prisma Studio: `npx prisma studio`

**Step 9: Commit**

```bash
git add .
git commit -m "feat: add game import from PGN paste"
```

## Code Style Guidelines

### Naming Conventions

- **Files**: kebab-case (`pgn-parser.ts`, `game-list.tsx`)
- **Components**: PascalCase (`GameList`, `MistakeForm`)
- **Functions**: camelCase (`parsePGN`, `createGame`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_FEN`, `MAX_MOVES`)
- **Types/Interfaces**: PascalCase (`Game`, `CreateGameInput`)

### Function Guidelines

```typescript
// Good: Pure function, single responsibility
export function parsePGN(pgn: string): ParsedGame {
  if (!pgn.trim()) {
    throw new PGNParseError('PGN cannot be empty');
  }
  // ... parsing logic
  return parsedGame;
}

// Bad: Multiple responsibilities, side effects
export function parsePGNAndSave(pgn: string): Game {
  const parsed = parsePGN(pgn);
  const game = await createGame(parsed); // Side effect!
  return game;
}
```

### Component Guidelines

```typescript
// Good: Server Component (default)
export default async function GameList() {
  const games = await getGames();
  return <div>{games.map(game => <GameCard game={game} />)}</div>;
}

// Good: Client Component (explicit)
'use client';
export default function ChessBoard({ position }: Props) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  return <Chessboard position={position} onSquareClick={...} />;
}

// Bad: Client Component without 'use client' directive
export default function ChessBoard({ position }: Props) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  // This will error at runtime!
}
```

### Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. External libraries
import { Chess } from 'chess.js';

// 3. Internal absolute imports
import { parsePGN } from '@/lib/chess/pgn-parser';
import { Game } from '@/types/game';

// 4. Internal relative imports
import Button from './Button';

// 5. Styles (if any)
import styles from './GameList.module.css';
```

## Git Workflow

### Commit Message Format

```
<type>: <short description>

<optional longer description>

<optional footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Build process, dependencies, etc.

**Examples:**

```
feat: add PGN import with validation

Implements chess.js-based PGN parser with error handling for
invalid formats. Includes tests for Lichess and Chess.com exports.

---

fix: FEN extraction off-by-one for black moves

Move number calculation was using half-move ply incorrectly.
Now correctly maps move number to ply index.

---

test: add edge cases for promotion handling

Added tests for promotion to queen, rook, bishop, knight.
Validates FEN generation after promotion moves.
```

### Branch Strategy (Phase 1)

- `main` branch only (single developer)
- Commit frequently (working state)
- Squash commits before major milestones if desired
- No PR process (overkill for solo project)

## Performance Considerations (Phase 1)

### What to Optimize

- **Nothing yet**. SQLite + Server Components are fast enough for MVP.

### What NOT to Optimize

- Database queries (Prisma is efficient, no N+1 queries by default)
- Component rendering (React is fast, no need for memo/useMemo yet)
- Bundle size (Next.js code-splitting handles this)

### When to Optimize (Phase 2+)

- If game list loads >1 second with 100+ games → add pagination
- If mistake search is slow → add SQLite FTS5 index
- If bundle size >1MB → analyze with `next bundle-analyzer`

## Security Considerations (Phase 1)

### Current Threats: Minimal (Single User, No Auth)

- **No XSS risk**: React escapes by default, markdown rendering in Phase 3
- **No CSRF risk**: No authentication, no session
- **No SQL injection**: Prisma uses parameterized queries
- **No auth bypass**: No auth to bypass

### Phase 2+ Considerations

- Add input validation for all user inputs
- Sanitize markdown rendering (use `react-markdown` with safe defaults)
- Rate limiting on API routes (if deployed publicly)

## Deployment (Phase 1)

### Local Development Only

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev
npx prisma db seed

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Database Backup

```bash
# Backup SQLite file
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# Export to SQL
sqlite3 prisma/dev.db .dump > backup.sql
```

## Next Steps

1. **Initialize project** with Next.js, Prisma, Tailwind
2. **Set up Prisma schema** and run first migration
3. **Write core utilities** with tests (PGN parser, FEN extractor)
4. **Build game import flow** (API route → form → database)
5. **Test with 5 real games** before proceeding

---

## Decision Log

### TypeScript: Strict Mode

**Decision**: Use TypeScript with strict mode enabled.
**Rationale**: Prisma generates types, Next.js supports it natively, catches bugs early.
**Trade-off**: Slightly slower development, but worth it for type safety.

### Server Components Default

**Decision**: Use Server Components by default, Client Components only when needed.
**Rationale**: Better performance, less JavaScript shipped, simpler data fetching.
**Trade-off**: Need to mark interactive components with 'use client' explicitly.

### No Abstraction Layers (Yet)

**Decision**: Don't create service layer, repository interfaces, or dependency injection.
**Rationale**: YAGNI for Phase 1. Can refactor later if codebase grows complex.
**Trade-off**: Tighter coupling to Prisma, but easier to understand and modify.

### SQLite File Location

**Decision**: Store `dev.db` in `prisma/` directory, gitignore it.
**Rationale**: Keeps database with migrations, easy to back up.
**Trade-off**: Need to manually copy DB file for backups (acceptable for MVP).

### Vitest over Jest

**Decision**: Use Vitest for unit tests.
**Rationale**: Faster, better TypeScript support, Vite-native.
**Trade-off**: Smaller ecosystem than Jest, but Next.js supports both.

### Tailwind CSS v3.4.x (Not v4)

**Decision**: Use Tailwind CSS v3.4.x, explicitly avoid v4.
**Rationale**: Tailwind v4 changed PostCSS plugin architecture, requiring `@tailwindcss/postcss` package. V3 is stable, well-documented, and works with standard PostCSS config.
**Trade-off**: Missing latest v4 features, but v3 has everything we need for Phase 1.
**Implementation**: `npm install -D tailwindcss@^3.4.0 postcss autoprefixer`

---

**Last Updated**: 2024-11-04
**Phase**: Phase 1 (Core Journaling Loop)
**Status**: Ready for implementation

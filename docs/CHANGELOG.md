# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2024-11-04

### Project Setup

**Update (Evening):** Fixed ESLint configuration for Next.js 16 compatibility and added Prettier formatting.

Next.js 16 removed the `next lint` command. Migrated to ESLint 9 with flat config format (`eslint.config.mjs`). Added Prettier for code formatting. The new configuration:

- Uses native ESLint 9 flat config (not legacy `.eslintrc.json`)
- Configures TypeScript via `typescript-eslint`
- Adds React and React Hooks plugins
- Handles Node.js CommonJS files separately (config files, scripts)
- Integrates with Prettier (disables conflicting ESLint rules)
- Pre-commit hooks with Husky + lint-staged (auto-lint and format on commit)
- Commands: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run format:check`

#### Added

- Next.js 14+ with App Router and TypeScript
- Tailwind CSS 3.4.x for styling (explicitly using v3, not v4)
- Prisma ORM with SQLite database
- Vitest for unit testing
- chess.js for PGN parsing and move validation
- react-chessboard for board UI
- ESLint and Prettier for code quality

#### Configuration

- TypeScript strict mode enabled
- Prisma schema with Game and Mistake models
- Tailwind with PostCSS (v3 compatible configuration)
- Vitest configured with jsdom environment
- Path aliases (`@/`) for clean imports

#### Core Features Implemented

- **PGN Parser** (`lib/chess/pgn-parser.ts`)
  - Parses PGN from Lichess, Chess.com, and standard formats
  - Extracts game headers (ratings, time control, opening, etc.)
  - Extracts moves with full metadata (color, piece, captures, flags)
  - Helper functions for player color, opponent rating, date extraction
  - **17/17 tests passing** with real game data

- **FEN Extractor** (`lib/chess/fen-extractor.ts`)
  - Extracts board position (FEN string) at any move number
  - Leverages chess.js `.fen()` method (no wheel reinvention)
  - Validates move numbers and provides clear error messages
  - Returns starting FEN for move 0
  - **13/13 tests passing** with comprehensive validation

- **Move Navigator** (`lib/chess/move-navigator.ts`)
  - Navigate forward/backward through game moves
  - Jump to any move or start/end positions
  - Query navigation state (isAtStart, isAtEnd, canGoForward, etc.)
  - Leverages chess.js `.undo()` for backward navigation
  - Maintains Chess instance for efficient position tracking
  - **35/35 tests passing** covering all navigation scenarios

- **Data Access Layer** (`lib/db/`)
  - Repository pattern with dependency injection
  - Games repository: CRUD operations for games
  - Mistakes repository: CRUD operations with tag management
  - Domain types separate from Prisma types (clean boundaries)
  - **41/41 tests passing** using Prisma migrations for test schema
  - Test helper (`__tests__/helpers/test-db.ts`) ensures schema consistency

#### Documentation

- `technical-architecture.md` - Comprehensive technical design
- `architectural-plan.md` - High-level product strategy
- `development-rules.md` - Critical development guidelines
  - Never hand-write PGN data (use real games only)
  - Tailwind CSS v3.4.x requirement (not v4)
  - Don't reinvent the wheel (use existing libraries)
- `testing-strategy.md` - Database testing approach
  - Use Prisma migrations for test schemas
  - Isolated file-based databases per test suite
  - Domain-driven repository pattern
- `README.md` - Project overview and setup instructions
- `CHANGELOG.md` - This file

#### Development Tools

- Setup verification script (`npm run verify`)
  - Checks dependency versions
  - Validates Tailwind CSS is v3, not v4
  - Verifies configuration files exist
  - Ensures PostCSS is configured correctly

#### Type Definitions

- `types/chess.ts` - Chess-specific types (Color, Move, ParsedGame, etc.)
- `types/game.ts` - Game domain types
- `types/mistake.ts` - Mistake domain types

#### Test Infrastructure

- Test fixtures with real PGN data from Lichess
- Vitest setup with @testing-library/jest-dom
- Test coverage reporting configured

### Technical Decisions

1. **Tailwind CSS v3.4.x over v4**
   - V4 requires separate `@tailwindcss/postcss` package
   - V3 is stable, well-documented, works with standard PostCSS
   - Decision documented in technical architecture

2. **SQLite over PostgreSQL**
   - Zero ops burden for single-user MVP
   - File-based, easy backups
   - Can migrate to PostgreSQL later if needed

3. **Server Components by default**
   - Less JavaScript shipped to client
   - Better performance
   - Client Components only for interactivity

4. **Strict separation of concerns**
   - Business logic in `lib/` (pure functions)
   - Data access in `lib/db/` (repository pattern)
   - API routes are thin controllers
   - Components don't import Prisma directly

### Known Issues

None

### Next Steps

- [x] Implement FEN extractor with tests
- [x] Implement move navigator with tests
- [x] Create data access layer (games, mistakes repositories)
- [ ] Build game import API endpoint
- [ ] Build game import UI form
- [ ] Build mistake entry form
- [ ] Build game viewer with move navigation

---

## Development Guidelines

### Adding Dependencies

Always verify Tailwind CSS version after `npm install`:

```bash
npm run verify
```

### Writing Tests

Use real PGN data from actual games. Never hand-write PGN strings.

### Committing Changes

Follow conventional commit format:

- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Adding tests
- `docs:` - Documentation changes
- `refactor:` - Code restructuring

Example: `feat: add PGN parser with full test coverage`

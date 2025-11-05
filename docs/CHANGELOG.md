# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2024-11-04

### Project Setup

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

#### Documentation
- `technical-architecture.md` - Comprehensive technical design
- `architectural-plan.md` - High-level product strategy
- `development-rules.md` - Critical development guidelines
  - Never hand-write PGN data (use real games only)
  - Tailwind CSS v3.4.x requirement (not v4)
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
- [ ] Implement FEN extractor with tests
- [ ] Implement move navigator with tests
- [ ] Create data access layer (games, mistakes repositories)
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

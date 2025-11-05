# Changelog

## 2025-11-05 - Phase 1 Complete

### Infrastructure

- ✅ Next.js 16 with App Router and TypeScript
- ✅ React 19
- ✅ Tailwind CSS 3.4.18
- ✅ Prisma 6.18 + SQLite
- ✅ Vitest 4.0.7
- ✅ ESLint 9 with flat config
- ✅ Prettier + Husky pre-commit hooks

### Chess Logic

- ✅ PGN parser with annotation cleaning
- ✅ FEN extractor
- ✅ Move navigator
- ✅ All utilities fully tested (65+ tests passing)

### Data Layer

- ✅ Database schema (Game, Mistake models)
- ✅ Repository pattern (games, mistakes)
- ✅ Unique PGN constraint
- ✅ FEN storage on mistakes
- ✅ Cascade deletes

### API

- ✅ Games: GET, POST, GET/:id, PATCH/:id, DELETE/:id
- ✅ Mistakes: GET, POST, GET/:id, PATCH/:id, DELETE/:id
- ✅ Tags: GET

### Frontend

- ✅ Game viewer with move navigation
- ✅ Mistake form with tag autocomplete
- ✅ Mistakes list with filtering
- ✅ Mistake detail page
- ✅ Delete functionality on both pages

### Bug Fixes

- ✅ Fixed chessboard not updating (added `key={fen}`)
- ✅ Fixed board sizing issues (max-width constraints)
- ✅ Improved move list layout (2-column table format)

---

## 2024-11-04 - Initial Setup

### Project Setup

- Next.js 16 project initialization
- Prisma schema and migrations
- TypeScript configuration
- Tailwind CSS 3.4.x setup
- Vitest testing infrastructure
- ESLint 9 + Prettier configuration

### Core Features

- PGN parser (17/17 tests)
- FEN extractor (13/13 tests)
- Move navigator (35/35 tests)
- Data access layer (41/41 tests)

### Documentation

- Technical architecture document
- Development rules
- Testing strategy
- API documentation

---

**Note**: This changelog tracks major milestones. For detailed commit history, use `git log`.

# Chess Mistake Journal

A systematic tool for tracking and analyzing chess mistakes to accelerate improvement.

## Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS 3.4.x** (utility-first styling)
- **Prisma + SQLite** (database ORM)
- **chess.js** (PGN parsing, move validation)
- **react-chessboard** (board UI)
- **Vitest** (testing)

## Setup

```bash
# Install dependencies
npm install

# Verify setup is correct
npm run verify

# Set up database
npx prisma migrate dev

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code (ESLint 9 flat config)
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is formatted
npm run format:check

# Build for production
npm run build
```

**Note:** Next.js 16 removed `next lint`. We use ESLint 9 directly with flat config format.

**Formatting:** We use Prettier for consistent code formatting. Pre-commit hooks automatically format staged files.

**Pre-commit Hook:**

- Automatically runs ESLint (with auto-fix) and Prettier on staged files
- To bypass if needed: `git commit --no-verify`

## Project Structure

```
├── app/              # Next.js App Router pages & API routes
├── components/       # React components
├── lib/              # Core business logic (pure functions)
├── types/            # TypeScript type definitions
├── prisma/           # Database schema & migrations
├── __tests__/        # Test files
└── docs/             # Documentation
```

## Key Documents

- [Technical Architecture](./docs/technical-architecture.md) - Detailed architecture decisions
- [Architectural Plan](./docs/architectural-plan.md) - High-level product strategy
- [Development Rules](./docs/development-rules.md) - Critical development guidelines

## Important Notes

### Tailwind CSS Version

**Use Tailwind v3.4.x, NOT v4.**

Tailwind v4 changed the PostCSS plugin system. If you accidentally install v4:

```bash
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
```

### PGN Data in Tests

**Never hand-write PGN game data.** AI models will generate illegal chess moves.

Always use real PGN data from Lichess, Chess.com, or other platforms. See [Development Rules](./docs/development-rules.md) for details.

## Phase 1 Goals

- [x] Project setup with Next.js, Prisma, Tailwind
- [x] PGN parser with full test coverage
- [ ] FEN extractor with tests
- [ ] Data access layer (games, mistakes)
- [ ] Game import UI and API
- [ ] Mistake entry form
- [ ] Basic game viewer with move navigation

## License

Private project - not licensed for distribution.

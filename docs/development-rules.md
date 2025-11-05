# Development Rules

## Dependencies

### Next.js 16 - Breaking Changes

**Next.js 16 removed the `next lint` command.**

Use ESLint directly with the flat config format (`eslint.config.mjs`):

```bash
# Run linting
npm run lint

# Auto-fix issues
npm run lint:fix
```

The project uses ESLint 9 with flat config format:

- Native support for TypeScript via `typescript-eslint`
- React and React Hooks plugins configured
- Separate configuration for Node.js files (CommonJS)
- Ignores `.next/`, `node_modules/`, etc.

**Next.js 16 - `params` is now a Promise in API routes**

In dynamic API routes (e.g., `app/api/games/[id]/route.ts`), the `params` object is now a Promise and must be awaited:

```typescript
// ❌ WRONG - Next.js 15 and earlier
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = params; // This will error in Next.js 16!
  // ...
}

// ✅ CORRECT - Next.js 16
type RouteContext = {
  params: Promise<{ id: string }>; // Note: Promise type
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params; // Must await!
  // ...
}
```

This applies to ALL route handlers (GET, POST, PATCH, DELETE) in dynamic routes like:

- `app/api/games/[id]/route.ts`
- `app/api/mistakes/[id]/route.ts`
- Any other `[param]` routes

### Tailwind CSS v3.x (Not v4)

**Use Tailwind CSS v3.4.x**, not v4.

Tailwind v4 changed the PostCSS plugin architecture and requires `@tailwindcss/postcss` as a separate package. For stability and compatibility with the Next.js ecosystem, we use v3.

```bash
# Correct version
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
```

The standard PostCSS config works with v3:

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Code Quality

### Don't Reinvent the Wheel

**Always check if existing libraries already solve the problem before implementing from scratch.**

Examples:

- ✅ Use `chess.js` `.fen()` method instead of building FEN generator
- ✅ Use `chess.js` `.undo()` method for navigation instead of custom state tracking
- ✅ Search npm/GitHub for established solutions to common problems

Before implementing any non-trivial algorithm:

1. Check if chess.js has it built-in
2. Search for specialized libraries (e.g., chess analysis, opening databases)
3. Only implement custom code if no suitable library exists

### PGN Data Integrity

**NEVER** manually write or generate PGN game data.

AI language models (including the one writing this) will inevitably hallucinate illegal chess moves when generating PGN strings. Always:

1. **Use real PGN data** from actual games played on Lichess, Chess.com, or other platforms
2. **Fetch PGN from the web** using the Lichess API or game export URLs
3. **Validate PGN** by loading it with chess.js before using in tests
4. **Keep test PGNs simple** - shorter games are easier to validate

### PGN Annotation Cleaning

**chess.js cannot parse PGN annotations** like clock times `{ [%clk 0:03:00] }` that Lichess and other platforms include.

Always clean PGN before passing it to chess.js:

```typescript
// Strip all {…} annotations before parsing
const cleanedPgn = pgn.replace(/\{[^}]*\}/g, '').trim();
chess.loadPgn(cleanedPgn);
```

This cleaning happens in:

- `lib/chess/pgn-parser.ts` - when importing games via API
- `app/games/[id]/page.tsx` - when displaying games in the viewer

### Examples

#### Good: Real game from Lichess

```typescript
// Fetched from https://lichess.org/game/export/q7ZvsdUF
export const REAL_GAME = `[Event "Winter Arena"]
[Site "lichess.org"]
[Date "2017.12.28"]
...
1. d4 d5 2. c4 c6 ...`;
```

#### Bad: Hand-written PGN

```typescript
// DON'T DO THIS - will have illegal moves
export const FAKE_GAME = `1. e4 e5 2. Nf3 Nc6 3. Bb5 Nce7 ...`;
```

## Testing Philosophy

- Write tests for core logic (PGN parsing, FEN extraction, move validation)
- Don't test UI components or libraries we don't own
- Use real, validated data in test fixtures
- Test behaviors, not implementation details

## Architecture

- Keep business logic in `lib/` separate from Next.js/React
- Use domain types, not Prisma types, in public APIs
- Server Components by default, Client Components only when needed
- API routes are thin controllers - validation + data layer calls

## Database Constraints

### Unique PGN Constraint

The `Game` model has a unique constraint on the `pgn` field to prevent duplicate game imports. This means:

- Two identical PGN strings cannot be imported
- The API returns a 409 Conflict status with message "This game has already been imported"
- PGN is cleaned (annotations removed) before storage, so the comparison is based on the raw PGN string

If you need to reimport a game, delete it first via the API or database.

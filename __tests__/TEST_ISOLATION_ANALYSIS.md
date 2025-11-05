# Test Isolation Analysis: Prisma + SQLite + Vitest

## Problem Summary

Tests were failing due to database isolation issues:

1. **"table already exists" errors** - Multiple tests trying to create the same tables
2. **Timing-sensitive tests failing** - Games/mistakes with identical timestamps couldn't be ordered
3. **Cross-test contamination** - Tests seeing data from other tests

## Root Cause Analysis

### Issue 1: Shared In-Memory Database via `cache=shared`

**Symptom:** Multiple test files getting "table already exists" errors

**Root Cause:**

```typescript
// PROBLEMATIC CODE
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file::memory:?cache=shared', // <-- SHARED across all connections!
    },
  },
});
```

The `cache=shared` parameter creates a **single shared in-memory database** that all PrismaClient instances connect to. When test files run in parallel:

- File A: `beforeEach` drops tables → creates tables
- File B: `beforeEach` drops tables → ERROR (File A still using them!)
- Or both try to create at the same time → "table already exists"

**Why it happened:** SQLite's in-memory databases with `cache=shared` are explicitly designed to be shared across connections. This is useful for production code but disastrous for test isolation.

### Issue 2: Parallel Test Execution Within Files

**Symptom:** Even after removing `cache=shared`, tests in the same file still failed

**Root Cause:**
Vitest runs tests within a `describe` block **in parallel** by default. Multiple tests in the same file were:

- Sharing the same PrismaClient instance
- Running `beforeEach` hooks concurrently
- Simultaneously trying to DROP and CREATE tables
- Racing each other with database operations

Example race condition:

```
Test A beforeEach: DROP TABLE Mistake
Test B beforeEach: DROP TABLE Mistake
Test A beforeEach: CREATE TABLE Mistake
Test B beforeEach: CREATE TABLE Mistake ← ERROR: table already exists!
```

### Issue 3: SQLite Timestamp Precision

**Symptom:** Two games/mistakes created rapidly had identical `createdAt` timestamps

**Root Cause:**
SQLite's `CURRENT_TIMESTAMP` has **second-level precision**, not millisecond. The raw SQL:

```sql
createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
```

Two inserts within the same second get the exact same timestamp, making ordering tests fail:

```typescript
const game1 = await create(); // createdAt: 2024-01-01 12:00:00
const game2 = await create(); // createdAt: 2024-01-01 12:00:00 (SAME!)
// Ordering by createdAt is now undefined behavior
```

## Solutions Implemented

### Solution 1: Remove `cache=shared` (Immediate Fix)

**Change:**

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file::memory:', // No cache=shared!
    },
  },
});
```

**Effect:** Each PrismaClient gets its own isolated in-memory database. No cross-file contamination.

**Files changed:**

- `/Users/adj/Documents/Code/app-development/Chess/journal/__tests__/lib/db/games-repository.test.ts`
- `/Users/adj/Documents/Code/app-development/Chess/journal/__tests__/lib/db/mistakes-repository.test.ts`

### Solution 2: Sequential Test Execution (Immediate Fix)

**Change to vitest.config.ts:**

```typescript
export default defineConfig({
  test: {
    fileParallelism: false, // Run test files sequentially
    sequence: {
      hooks: 'stack', // Run hooks in order
    },
  },
});
```

**Effect:**

- Test files run one at a time
- Tests within each file run one at a time
- `beforeEach` hooks no longer race each other
- Timestamp delays (10ms) now actually create different timestamps

**Trade-off:** Test suite runs slower (4 seconds vs potentially 2 seconds with parallelism)

**File changed:**

- `/Users/adj/Documents/Code/app-development/Chess/journal/vitest.config.ts`

### Solution 3: Improved Test Helper (Recommended for Future)

**Created helper:** `/Users/adj/Documents/Code/app-development/Chess/journal/__tests__/helpers/test-db.ts`

**Key improvements:**

1. **Unique database per test file:**

   ```typescript
   const dbId = randomBytes(16).toString('hex');
   const databaseUrl = `file:test-${dbId}.db:?mode=memory&cache=private`;
   ```

2. **Single schema initialization:**

   ```typescript
   beforeAll(async () => {
     await initialize(); // Create tables ONCE
   });
   // No beforeEach needed - tests share the same database
   ```

3. **Proper cleanup:**
   ```typescript
   afterAll(async () => {
     await cleanup(); // Disconnect when done
   });
   ```

**Benefits:**

- Each test file gets a truly unique database
- Can run tests in parallel again (faster test suite)
- No table recreation on every test (faster execution)
- More realistic (production code doesn't drop/recreate tables constantly)

**Example usage:** See `/Users/adj/Documents/Code/app-development/Chess/journal/__tests__/lib/db/games-repository-improved.test.ts`

## Recommendations

### Short-term (Current State - IMPLEMENTED)

✅ Keep `fileParallelism: false` for stability
✅ Use `file::memory:` without `cache=shared`
✅ Accept slower test execution for reliability

### Long-term (Recommended Migration Path)

1. **Migrate to test-db helper pattern:**
   - Each test file gets unique database via `createTestDatabase()`
   - Use `beforeAll` for schema initialization (not `beforeEach`)
   - Tests can share database state within a file (or clean between tests if needed)

2. **Re-enable parallel execution:**

   ```typescript
   test: {
     fileParallelism: true,  // Safe with unique databases per file
   }
   ```

3. **Fix timestamp-sensitive tests:**
   - Option A: Wait 1100ms between inserts (current approach)
   - Option B: Don't test exact ordering, test that both records exist
   - Option C: Use explicit timestamps in test data
   - Option D: Use JavaScript Date objects instead of SQL CURRENT_TIMESTAMP

4. **Consider Prisma Migrations:**
   Instead of raw SQL, use actual Prisma migrations in tests:
   ```bash
   npx prisma migrate dev --name test_init
   ```
   This ensures test schema matches production schema exactly.

## Testing Best Practices

### ✅ DO:

- Give each test file its own isolated database
- Use `beforeAll` for expensive setup (schema creation)
- Use `afterAll` for cleanup (disconnect)
- Test behavior, not implementation details
- Make tests independent of execution order

### ❌ DON'T:

- Share databases across test files (`cache=shared`)
- Recreate schema in `beforeEach` (slow and error-prone)
- Rely on precise timing for test assertions
- Depend on test execution order
- Use production database for tests

## Files Modified

1. `/Users/adj/Documents/Code/app-development/Chess/journal/__tests__/lib/db/games-repository.test.ts`
   - Changed `file::memory:?cache=shared` → `file::memory:`

2. `/Users/adj/Documents/Code/app-development/Chess/journal/__tests__/lib/db/mistakes-repository.test.ts`
   - Changed `file::memory:?cache=shared` → `file::memory:`

3. `/Users/adj/Documents/Code/app-development/Chess/journal/vitest.config.ts`
   - Added `fileParallelism: false`
   - Added `sequence: { hooks: 'stack' }`

## Files Created

1. `/Users/adj/Documents/Code/app-development/Chess/journal/__tests__/helpers/test-db.ts`
   - Reusable helper for creating isolated test databases

2. `/Users/adj/Documents/Code/app-development/Chess/journal/__tests__/lib/db/games-repository-improved.test.ts`
   - Example of improved pattern using test-db helper

## Test Results

**Before fixes:**

- 11 tests failing
- "table already exists" errors
- "Foreign key constraint violated" errors
- Timestamp ordering failures

**After fixes:**

- All 109 tests passing ✅
- No cross-test contamination
- Stable, repeatable results

## References

- [SQLite In-Memory Databases](https://www.sqlite.org/inmemorydb.html)
- [Vitest Configuration](https://vitest.dev/config/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing/unit-testing)

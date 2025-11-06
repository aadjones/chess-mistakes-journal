-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mistake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "moveIndex" INTEGER NOT NULL,
    "fenPosition" TEXT NOT NULL,
    "briefDescription" TEXT NOT NULL,
    "primaryTag" TEXT NOT NULL,
    "detailedReflection" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mistake_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Mistake" ("briefDescription", "createdAt", "detailedReflection", "fenPosition", "gameId", "id", "moveIndex", "primaryTag", "updatedAt") SELECT "briefDescription", "createdAt", "detailedReflection", "fenPosition", "gameId", "id", "moveIndex", "primaryTag", "updatedAt" FROM "Mistake";
DROP TABLE "Mistake";
ALTER TABLE "new_Mistake" RENAME TO "Mistake";
CREATE INDEX "Mistake_gameId_idx" ON "Mistake"("gameId");
CREATE INDEX "Mistake_primaryTag_idx" ON "Mistake"("primaryTag");
CREATE INDEX "Mistake_createdAt_idx" ON "Mistake"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

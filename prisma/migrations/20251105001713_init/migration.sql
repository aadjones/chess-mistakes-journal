-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pgn" TEXT NOT NULL,
    "playerColor" TEXT NOT NULL,
    "opponentRating" INTEGER,
    "timeControl" TEXT,
    "datePlayed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "moveNumber" INTEGER NOT NULL,
    "fenPosition" TEXT NOT NULL,
    "briefDescription" TEXT NOT NULL,
    "primaryTag" TEXT NOT NULL,
    "detailedReflection" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mistake_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Game_datePlayed_idx" ON "Game"("datePlayed");

-- CreateIndex
CREATE INDEX "Mistake_gameId_idx" ON "Mistake"("gameId");

-- CreateIndex
CREATE INDEX "Mistake_primaryTag_idx" ON "Mistake"("primaryTag");

-- CreateIndex
CREATE INDEX "Mistake_createdAt_idx" ON "Mistake"("createdAt");

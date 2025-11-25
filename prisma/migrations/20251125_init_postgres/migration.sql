-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "playerColor" TEXT NOT NULL,
    "opponentRating" INTEGER,
    "timeControl" TEXT,
    "datePlayed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "moveIndex" INTEGER NOT NULL,
    "fenPosition" TEXT NOT NULL,
    "briefDescription" TEXT NOT NULL,
    "primaryTag" TEXT NOT NULL,
    "detailedReflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mistakesAnalyzed" INTEGER NOT NULL,
    "mistakeIdsMap" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_pgn_key" ON "Game"("pgn");

-- CreateIndex
CREATE INDEX "Game_datePlayed_idx" ON "Game"("datePlayed");

-- CreateIndex
CREATE INDEX "Mistake_gameId_idx" ON "Mistake"("gameId");

-- CreateIndex
CREATE INDEX "Mistake_primaryTag_idx" ON "Mistake"("primaryTag");

-- CreateIndex
CREATE INDEX "Mistake_createdAt_idx" ON "Mistake"("createdAt");

-- CreateIndex
CREATE INDEX "Insight_createdAt_idx" ON "Insight"("createdAt");

-- AddForeignKey
ALTER TABLE "Mistake" ADD CONSTRAINT "Mistake_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

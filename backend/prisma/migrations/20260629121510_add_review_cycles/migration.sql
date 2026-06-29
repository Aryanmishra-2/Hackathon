-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "reviewMonth" INTEGER,
    "reviewYear" INTEGER NOT NULL DEFAULT 2026,
    "aiRating" INTEGER,
    "aiPerformanceSummary" TEXT,
    "aiStrengths" TEXT,
    "aiAreasForImprovement" TEXT,
    "aiRecommendations" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("aiAreasForImprovement", "aiPerformanceSummary", "aiRating", "aiRecommendations", "aiStrengths", "createdAt", "feedback", "id", "rating", "status", "updatedAt", "userId") SELECT "aiAreasForImprovement", "aiPerformanceSummary", "aiRating", "aiRecommendations", "aiStrengths", "createdAt", "feedback", "id", "rating", "status", "updatedAt", "userId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

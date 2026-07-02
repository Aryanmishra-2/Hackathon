-- AlterTable
ALTER TABLE "Goal" ADD COLUMN "jiraIssueKey" TEXT;
ALTER TABLE "Goal" ADD COLUMN "jiraIssueUrl" TEXT;
ALTER TABLE "Goal" ADD COLUMN "jiraStatus" TEXT;
ALTER TABLE "Goal" ADD COLUMN "jiraSyncStatus" TEXT DEFAULT 'NOT_SYNCED';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "designation" TEXT,
    "managerId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "deletedBy" TEXT,
    "jiraAccountId" TEXT,
    "jiraInvited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "deletedAt", "deletedBy", "department", "designation", "email", "id", "isDeleted", "managerId", "name", "password", "role", "updatedAt") SELECT "createdAt", "deletedAt", "deletedBy", "department", "designation", "email", "id", "isDeleted", "managerId", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "tokenBalance" REAL NOT NULL DEFAULT 0,
    "boundTokenBalance" REAL NOT NULL DEFAULT 0,
    "lastFaucetClaim" DATETIME,
    "hashpowerVirtual" REAL NOT NULL DEFAULT 0,
    "energyPoints" INTEGER NOT NULL DEFAULT 100,
    "energyRegenTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" DATETIME,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("boundTokenBalance", "createdAt", "email", "energyPoints", "energyRegenTimestamp", "hashpowerVirtual", "id", "lastFaucetClaim", "level", "passwordHash", "tokenBalance", "updatedAt", "username", "xp") SELECT "boundTokenBalance", "createdAt", "email", "energyPoints", "energyRegenTimestamp", "hashpowerVirtual", "id", "lastFaucetClaim", "level", "passwordHash", "tokenBalance", "updatedAt", "username", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

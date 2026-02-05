-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "tokenBalance" REAL NOT NULL DEFAULT 0,
    "boundTokenBalance" REAL NOT NULL DEFAULT 0,
    "energyPoints" INTEGER NOT NULL DEFAULT 100,
    "hashpowerVirtual" REAL NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastFaucetClaim" DATETIME,
    "lastEnergyUpdate" DATETIME
);
INSERT INTO "new_User" ("balance", "boundTokenBalance", "createdAt", "email", "energyPoints", "hashpowerVirtual", "id", "lastFaucetClaim", "level", "password", "tokenBalance", "username", "xp") SELECT "balance", "boundTokenBalance", "createdAt", "email", "energyPoints", "hashpowerVirtual", "id", "lastFaucetClaim", "level", "password", "tokenBalance", "username", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

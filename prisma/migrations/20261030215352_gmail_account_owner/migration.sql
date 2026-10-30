/*
  Warnings:

  - Added the required column `ownerEmail` to the `GmailAccount` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GmailAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerEmail" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "appPassword" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_GmailAccount" ("appPassword", "createdAt", "email", "id", "isActive") SELECT "appPassword", "createdAt", "email", "id", "isActive" FROM "GmailAccount";
DROP TABLE "GmailAccount";
ALTER TABLE "new_GmailAccount" RENAME TO "GmailAccount";
CREATE UNIQUE INDEX "GmailAccount_ownerEmail_email_key" ON "GmailAccount"("ownerEmail", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

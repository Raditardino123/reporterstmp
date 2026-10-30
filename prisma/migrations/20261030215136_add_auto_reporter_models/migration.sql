-- CreateTable
CREATE TABLE "GmailAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "appPassword" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReportConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetEmails" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "loopCount" INTEGER NOT NULL,
    "delaySeconds" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReportLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportConfigId" TEXT NOT NULL,
    "gmailSenderId" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportLog_reportConfigId_fkey" FOREIGN KEY ("reportConfigId") REFERENCES "ReportConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportLog_gmailSenderId_fkey" FOREIGN KEY ("gmailSenderId") REFERENCES "GmailAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReportLog_reportConfigId_idx" ON "ReportLog"("reportConfigId");

-- CreateIndex
CREATE INDEX "ReportLog_gmailSenderId_idx" ON "ReportLog"("gmailSenderId");

-- CreateIndex
CREATE INDEX "ReportLog_sentAt_idx" ON "ReportLog"("sentAt");

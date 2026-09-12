/*
  Warnings:

  - Added the required column `whatsappTemplateName` to the `message_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN "renderedContent" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_message_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stage" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "whatsappTemplateName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_message_templates" ("active", "content", "id", "name", "stage", "updatedAt") SELECT "active", "content", "id", "name", "stage", "updatedAt" FROM "message_templates";
DROP TABLE "message_templates";
ALTER TABLE "new_message_templates" RENAME TO "message_templates";
CREATE UNIQUE INDEX "message_templates_stage_key" ON "message_templates"("stage");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'RECEPCION',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "species" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "speciesId" TEXT,
    "breed" TEXT,
    "sex" TEXT,
    "birthDate" DATETIME,
    "color" TEXT,
    "weight" REAL,
    "fileNumber" TEXT,
    "microchip" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pets_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "species" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vaccines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "speciesId" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "vaccines_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "species" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vaccinations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petId" TEXT NOT NULL,
    "vaccineTypeId" TEXT NOT NULL,
    "commercialName" TEXT,
    "appliedDate" DATETIME NOT NULL,
    "nextDate" DATETIME NOT NULL,
    "batchNumber" TEXT,
    "veterinarian" TEXT,
    "notes" TEXT,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,
    CONSTRAINT "vaccinations_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vaccinations_vaccineTypeId_fkey" FOREIGN KEY ("vaccineTypeId") REFERENCES "vaccines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vaccinations_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stage" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "vaccinationId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "templateId" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "sentAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "externalId" TEXT,
    "error" TEXT,
    "response" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "messages_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messages_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messages_vaccinationId_fkey" FOREIGN KEY ("vaccinationId") REFERENCES "vaccinations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clinic_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'UNIVERZOO Clínica Veterinaria',
    "logoUrl" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "email" TEXT
);

-- CreateTable
CREATE TABLE "reminder_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "daysBefore1" INTEGER NOT NULL DEFAULT 30,
    "daysBefore2" INTEGER NOT NULL DEFAULT 7,
    "daysBefore3" INTEGER NOT NULL DEFAULT 1,
    "dayOf" INTEGER NOT NULL DEFAULT 0,
    "daysAfter" INTEGER NOT NULL DEFAULT 7,
    "retryOnError" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "whatsapp_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "species_name_key" ON "species"("name");

-- CreateIndex
CREATE INDEX "pets_ownerId_idx" ON "pets"("ownerId");

-- CreateIndex
CREATE INDEX "vaccinations_petId_idx" ON "vaccinations"("petId");

-- CreateIndex
CREATE INDEX "vaccinations_nextDate_idx" ON "vaccinations"("nextDate");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_stage_key" ON "message_templates"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "messages_vaccinationId_stage_key" ON "messages"("vaccinationId", "stage");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

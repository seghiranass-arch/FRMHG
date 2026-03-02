-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('club', 'national_team');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('pending', 'active', 'suspended', 'archived');

-- CreateEnum
CREATE TYPE "MemberCategory" AS ENUM ('joueur_club', 'ecole_glace');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('draft', 'pending', 'active', 'expired', 'rejected');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('photo', 'id_card', 'medical_certificate', 'insurance', 'contract', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY['user']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orgs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "type" "OrgType" NOT NULL DEFAULT 'club',
    "status" "OrgStatus" NOT NULL DEFAULT 'pending',
    "region" TEXT,
    "city" TEXT,
    "address" TEXT,
    "primary_phone" TEXT,
    "secondary_phone" TEXT,
    "official_email" TEXT,
    "website" TEXT,
    "president_name" TEXT,
    "president_email" TEXT,
    "president_phone" TEXT,
    "logo_document_id" TEXT,
    "suspension_reason" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "nationality" TEXT,
    "category" "MemberCategory" NOT NULL DEFAULT 'joueur_club',
    "license_number" TEXT,
    "licenseStatus" "LicenseStatus" NOT NULL DEFAULT 'draft',
    "license_expiry" TIMESTAMP(3),
    "position" TEXT,
    "jersey_number" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "org_id" TEXT,
    "user_id" TEXT,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'other',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "org_id" TEXT,
    "member_id" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

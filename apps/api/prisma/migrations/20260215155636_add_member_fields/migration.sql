/*
  Warnings:

  - You are about to drop the column `category` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `license_expiry` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `members` table. All the data in the column will be lost.
  - Added the required column `member_status` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `members` table without a default value. This is not possible if the table is not empty.
  - Made the column `date_of_birth` on table `members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "category",
DROP COLUMN "license_expiry",
DROP COLUMN "position",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "age_category" TEXT,
ADD COLUMN     "assigned_club_id" TEXT,
ADD COLUMN     "assignment_end_date" TIMESTAMP(3),
ADD COLUMN     "assignment_start_date" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "discipline" TEXT,
ADD COLUMN     "emergency_contact_name" TEXT,
ADD COLUMN     "emergency_contact_phone" TEXT,
ADD COLUMN     "federation_doctor" TEXT,
ADD COLUMN     "fitness_expiration_date" TIMESTAMP(3),
ADD COLUMN     "id_number" TEXT,
ADD COLUMN     "id_type" TEXT,
ADD COLUMN     "last_medical_visit_date" TIMESTAMP(3),
ADD COLUMN     "license_expiration_date" TIMESTAMP(3),
ADD COLUMN     "license_issue_date" TIMESTAMP(3),
ADD COLUMN     "license_season" TEXT,
ADD COLUMN     "license_type" TEXT,
ADD COLUMN     "medical_certificate_id" TEXT,
ADD COLUMN     "medical_fitness" TEXT,
ADD COLUMN     "medical_status" TEXT,
ADD COLUMN     "member_status" TEXT NOT NULL,
ADD COLUMN     "payment_date" TIMESTAMP(3),
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "payment_reference" TEXT,
ADD COLUMN     "payment_status" TEXT,
ADD COLUMN     "positions" TEXT[],
ADD COLUMN     "region" TEXT,
ADD COLUMN     "registration_date" TIMESTAMP(3),
ADD COLUMN     "season_id" TEXT,
ADD COLUMN     "sex" TEXT NOT NULL,
ADD COLUMN     "status" TEXT DEFAULT 'active',
ADD COLUMN     "subscription_amount" INTEGER,
ADD COLUMN     "subscription_type" TEXT,
ALTER COLUMN "date_of_birth" SET NOT NULL;

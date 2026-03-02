/*
  Warnings:

  - You are about to drop the column `subscription_id` on the `members` table. All the data in the column will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_subscription_id_fkey";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "subscription_id";

-- DropTable
DROP TABLE "subscriptions";

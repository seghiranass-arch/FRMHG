-- AlterTable
ALTER TABLE "competitions" ADD COLUMN     "cup_team_count" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'league';

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "round" TEXT;

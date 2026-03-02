-- AlterTable
ALTER TABLE "competitions" ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'league_double_round_robin',
ADD COLUMN     "locked_at" TIMESTAMP(3),
ADD COLUMN     "phase" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "match_events" ADD COLUMN     "period" TEXT NOT NULL DEFAULT 'regulation';

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "bracket_position" INTEGER,
ADD COLUMN     "leg" INTEGER,
ADD COLUMN     "round_number" INTEGER,
ADD COLUMN     "winner_team_id" TEXT;

-- CreateTable
CREATE TABLE "cup_links" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "from_match_id" TEXT NOT NULL,
    "to_match_id" TEXT NOT NULL,
    "to_slot" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cup_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cup_links_from_match_id_key" ON "cup_links"("from_match_id");

-- CreateIndex
CREATE INDEX "cup_links_competition_id_idx" ON "cup_links"("competition_id");

-- CreateIndex
CREATE INDEX "cup_links_to_match_id_idx" ON "cup_links"("to_match_id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cup_links" ADD CONSTRAINT "cup_links_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cup_links" ADD CONSTRAINT "cup_links_from_match_id_fkey" FOREIGN KEY ("from_match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cup_links" ADD CONSTRAINT "cup_links_to_match_id_fkey" FOREIGN KEY ("to_match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

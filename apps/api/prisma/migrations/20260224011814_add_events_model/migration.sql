-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'expired');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'canceled');

-- DropForeignKey
ALTER TABLE "manual_player_stats" DROP CONSTRAINT "manual_player_stats_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "manual_player_stats" DROP CONSTRAINT "manual_player_stats_member_id_fkey";

-- DropForeignKey
ALTER TABLE "match_events" DROP CONSTRAINT "match_events_sheet_id_fkey";

-- DropForeignKey
ALTER TABLE "match_sheets" DROP CONSTRAINT "match_sheets_match_id_fkey";

-- AlterTable
ALTER TABLE "match_events" ALTER COLUMN "assist_ids" DROP DEFAULT;

-- AlterTable
ALTER TABLE "match_sheets" ALTER COLUMN "home_roster" DROP DEFAULT,
ALTER COLUMN "away_roster" DROP DEFAULT;

-- CreateTable
CREATE TABLE "member_subscriptions" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "season_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_payments" (
    "id" TEXT NOT NULL,
    "member_subscription_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "method" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "min_quantity" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "owner_org_id" TEXT,
    "notes" TEXT,
    "photo_document_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_movements" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "from_org_id" TEXT,
    "to_org_id" TEXT,
    "to_member_id" TEXT,
    "requested_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "equipment_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_movement_history" (
    "id" TEXT NOT NULL,
    "movement_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_movement_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_clubs" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competition_clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'event',
    "target_roles" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateIndex
CREATE INDEX "competition_clubs_competition_id_idx" ON "competition_clubs"("competition_id");

-- CreateIndex
CREATE INDEX "competition_clubs_club_id_idx" ON "competition_clubs"("club_id");

-- CreateIndex
CREATE UNIQUE INDEX "competition_clubs_competition_id_club_id_key" ON "competition_clubs"("competition_id", "club_id");

-- AddForeignKey
ALTER TABLE "member_subscriptions" ADD CONSTRAINT "member_subscriptions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_subscriptions" ADD CONSTRAINT "member_subscriptions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_payments" ADD CONSTRAINT "member_payments_member_subscription_id_fkey" FOREIGN KEY ("member_subscription_id") REFERENCES "member_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_owner_org_id_fkey" FOREIGN KEY ("owner_org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_from_org_id_fkey" FOREIGN KEY ("from_org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_to_org_id_fkey" FOREIGN KEY ("to_org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_to_member_id_fkey" FOREIGN KEY ("to_member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movement_history" ADD CONSTRAINT "equipment_movement_history_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "equipment_movements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_clubs" ADD CONSTRAINT "competition_clubs_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_clubs" ADD CONSTRAINT "competition_clubs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_sheets" ADD CONSTRAINT "match_sheets_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "match_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_player_stats" ADD CONSTRAINT "manual_player_stats_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_player_stats" ADD CONSTRAINT "manual_player_stats_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

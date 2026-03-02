import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error: "Missing VAPID public key",
        hint: "Définir NEXT_PUBLIC_VAPID_PUBLIC_KEY (ou VAPID_PUBLIC_KEY) et redémarrer le serveur."
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ key });
}

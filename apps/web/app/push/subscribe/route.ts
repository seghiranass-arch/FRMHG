import { NextResponse } from "next/server";
import { getServerUser } from "../../../lib/server-auth";
import { upsertSubscription, type WebPushSubscription } from "../../../lib/push-subscriptions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const sub = body as WebPushSubscription;
  if (!sub?.endpoint || typeof sub.endpoint !== "string") {
    return new NextResponse("Invalid subscription", { status: 400 });
  }

  await upsertSubscription(user.id, sub);
  return NextResponse.json({ ok: true });
}


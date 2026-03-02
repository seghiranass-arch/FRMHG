import { NextResponse } from "next/server";
import { getServerUser } from "../../../lib/server-auth";
import { removeUserSubscription } from "../../../lib/push-subscriptions";

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

  const endpoint = (body as { endpoint?: unknown })?.endpoint;
  if (!endpoint || typeof endpoint !== "string") {
    return new NextResponse("Invalid endpoint", { status: 400 });
  }

  await removeUserSubscription(user.id, endpoint);
  return NextResponse.json({ ok: true });
}

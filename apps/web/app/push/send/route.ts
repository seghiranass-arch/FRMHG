import { NextResponse } from "next/server";
import { getServerUser } from "../../../lib/server-auth";
import { listSubscriptions, removeSubscriptionByEndpoint } from "../../../lib/push-subscriptions";
import webpush, { type PushSubscription } from "web-push";

export const runtime = "nodejs";

type SendPayload = {
  title?: string;
  body?: string;
  url?: string;
};

function getStatusCode(e: unknown) {
  if (!e || typeof e !== "object") return undefined;
  const statusCode = (e as { statusCode?: unknown }).statusCode;
  return typeof statusCode === "number" ? statusCode : undefined;
}

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (!user.roles.includes("federation_admin")) return new NextResponse("Forbidden", { status: 403 });

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@frmhg.local";
  if (!publicKey || !privateKey) {
    return new NextResponse("VAPID keys missing", { status: 500 });
  }

  let payload: SendPayload = {};
  try {
    payload = (await req.json()) as SendPayload;
  } catch {
    payload = {};
  }

  const title = payload.title || "FRMHG";
  const body = payload.body || "";
  const url = payload.url || "/";

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const subs = await listSubscriptions();
  const results = await Promise.all(
    subs.map(async (s) => {
      try {
        const keys = s.subscription.keys;
        if (!keys?.p256dh || !keys?.auth) {
          return { sent: 0, removed: 0 };
        }

        const sub: PushSubscription = {
          endpoint: s.subscription.endpoint,
          expirationTime: s.subscription.expirationTime ?? null,
          keys: { p256dh: keys.p256dh, auth: keys.auth }
        };

        await webpush.sendNotification(sub, JSON.stringify({ title, body, url }));
        return { sent: 1, removed: 0 };
      } catch (e: unknown) {
        const statusCode = getStatusCode(e);
        if (statusCode === 404 || statusCode === 410) {
          await removeSubscriptionByEndpoint(s.endpoint);
          return { sent: 0, removed: 1 };
        }
        return { sent: 0, removed: 0 };
      }
    })
  );

  const sent = results.reduce((acc, r) => acc + r.sent, 0);
  const removed = results.reduce((acc, r) => acc + r.removed, 0);
  return NextResponse.json({ ok: true, sent, removed });
}

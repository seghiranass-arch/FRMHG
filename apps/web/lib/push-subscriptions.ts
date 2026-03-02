import fs from "node:fs/promises";
import path from "node:path";

type SubscriptionKeys = {
  p256dh?: string;
  auth?: string;
};

export type WebPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys?: SubscriptionKeys;
};

type StoredSubscription = {
  userId: string;
  endpoint: string;
  subscription: WebPushSubscription;
  createdAt: string;
  updatedAt: string;
};

const dataDir = path.join(process.cwd(), ".data");
const filePath = path.join(dataDir, "push-subscriptions.json");

async function readAll(): Promise<StoredSubscription[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredSubscription[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(items: StoredSubscription[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf8");
}

export async function upsertSubscription(userId: string, subscription: WebPushSubscription) {
  const now = new Date().toISOString();
  const items = await readAll();
  const idx = items.findIndex((x) => x.userId === userId && x.endpoint === subscription.endpoint);
  if (idx >= 0) {
    items[idx] = { ...items[idx], subscription, updatedAt: now };
  } else {
    items.push({ userId, endpoint: subscription.endpoint, subscription, createdAt: now, updatedAt: now });
  }
  await writeAll(items);
}

export async function removeSubscriptionByEndpoint(endpoint: string) {
  const items = await readAll();
  const next = items.filter((x) => x.endpoint !== endpoint);
  if (next.length !== items.length) await writeAll(next);
}

export async function removeUserSubscription(userId: string, endpoint: string) {
  const items = await readAll();
  const next = items.filter((x) => !(x.userId === userId && x.endpoint === endpoint));
  if (next.length !== items.length) await writeAll(next);
}

export async function listSubscriptions() {
  return readAll();
}


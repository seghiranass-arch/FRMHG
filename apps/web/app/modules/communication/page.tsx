import { CommunicationPanel } from "../../../components/communication/communication-panel";
import { PageHeader } from "../../../components/dashboard/page-header";
import { requireAuth } from "../../../lib/server-auth";
import { cookies, headers } from "next/headers";

type NewsRow = {
  id: string;
  title: string;
  body: string;
  status: string;
  published_at?: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  subject: string;
  body: string;
  created_at: string;
  from_org_name?: string | null;
  to_org_name?: string | null;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at: string;
};

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("frmhg_token")?.value;
}

async function getWebBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

async function getNews(): Promise<NewsRow[]> {
  const token = await getAuthToken();
  const baseUrl = await getWebBaseUrl();
  const authHeaders: HeadersInit = token ? { authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${baseUrl}/api/communication/news`, { cache: "no-store", headers: authHeaders });
  if (!res.ok) return [];
  return res.json();
}

async function getMessages(): Promise<MessageRow[]> {
  const token = await getAuthToken();
  const baseUrl = await getWebBaseUrl();
  const authHeaders: HeadersInit = token ? { authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${baseUrl}/api/communication/messages`, { cache: "no-store", headers: authHeaders });
  if (!res.ok) return [];
  return res.json();
}

async function getNotifications(): Promise<NotificationRow[]> {
  const token = await getAuthToken();
  const baseUrl = await getWebBaseUrl();
  const authHeaders: HeadersInit = token ? { authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${baseUrl}/api/communication/notifications`, { cache: "no-store", headers: authHeaders });
  if (!res.ok) return [];
  return res.json();
}

export default async function CommunicationModule() {
  const me = await requireAuth();
  const [news, messages, notifications] = await Promise.all([getNews(), getMessages(), getNotifications()]);
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Communication"
        subtitle="News internes, messagerie, notifications (MVP)"
        user={me}
        usePlainStyle={false}
      />

      <CommunicationPanel
        initialNews={news}
        initialMessages={messages}
        initialNotifications={notifications}
        canSendPushTest={me.roles.includes("federation_admin")}
      />
    </div>
  );
}


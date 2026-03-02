"use client";

import * as React from "react";
import { User, Trophy, ClipboardList, Stethoscope, BadgeCheck, FileText, BarChart3 } from "lucide-react";
import { MemberFormData } from "./member-form";
import { LicenseCard } from "./license-card";

interface MemberProfileViewProps {
  data: Partial<MemberFormData>;
  isAdmin?: boolean;
  canDownloadLicense?: boolean;
  clubs?: any[];
  seasons?: any[];
  disciplines?: any[];
  subscriptionTypes?: any[];
  categories?: any[];
  subscriptionHistory?: any[];
  onCreateSubscription?: (payload: {
    subscriptionType?: string;
    seasonId?: string;
    subscriptionAmount?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    paymentDate?: string;
    paymentReference?: string;
  }) => Promise<void>;
  onRenewSubscription?: (subscriptionId: string) => Promise<void>;
  onCancelSubscription?: (subscriptionId: string) => Promise<void>;
  onDeleteSubscription?: (subscriptionId: string) => Promise<void>;
  onAddPayment?: (subscriptionId: string) => Promise<void>;
}

export function MemberProfileView({
  data,
  isAdmin = false,
  canDownloadLicense = false,
  clubs = [],
  seasons = [],
  disciplines = [],
  subscriptionTypes = [],
  categories = [],
  subscriptionHistory = [],
  onCreateSubscription,
  onRenewSubscription,
  onCancelSubscription,
  onDeleteSubscription,
  onAddPayment,
}: MemberProfileViewProps) {
  const [activeSection, setActiveSection] = React.useState("overview");
  const [receipt, setReceipt] = React.useState<{ payment: any; subscription?: any } | null>(null);
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = React.useState(false);
  const [licenseAction, setLicenseAction] = React.useState<"download" | "print" | null>(null);
  const licenseCardRef = React.useRef<HTMLDivElement>(null);
  const [subscriptionForm, setSubscriptionForm] = React.useState({
    subscriptionType: "",
    seasonId: "",
    subscriptionAmount: "",
    paymentMethod: "",
    paymentStatus: "",
    paymentDate: "",
    paymentReference: "",
  });
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [statsError, setStatsError] = React.useState<string | null>(null);
  const [statsRows, setStatsRows] = React.useState<
    Array<{
      competitionId: string;
      competitionName: string;
      season: string;
      matchesPlayed: number;
      goals: number;
      assists: number;
      points: number;
      source?: "manual" | "auto";
      lastUpdated?: string;
    }>
  >([]);
  const [statsEdit, setStatsEdit] = React.useState<
    Record<string, { matchesPlayed: string; goals: string; assists: string }>
  >({});
  const statsTotals = React.useMemo(() => {
    return statsRows.reduce(
      (acc, row) => {
        acc.matchesPlayed += row.matchesPlayed;
        acc.goals += row.goals;
        acc.assists += row.assists;
        acc.points += row.points;
        return acc;
      },
      { matchesPlayed: 0, goals: 0, assists: 0, points: 0 },
    );
  }, [statsRows]);

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return "—";
    }
  };

  const getPhotoId = () => {
    const fromData =
      data.profilePhotoId ||
      (data as any).profile_photo_id ||
      (data as any).documents?.find((doc: any) => doc.type === "photo")?.id;
    return fromData || null;
  };

  const getPhotoUrl = () => {
    const photoId = getPhotoId();
    if (!photoId) return null;
    return `/api/documents/view?id=${photoId}`;
  };

  const memberId = (data as any).id as string | undefined;

  const loadStats = React.useCallback(async () => {
    if (!memberId) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const standingsRes = await fetch("/api/public/sport/competitions/active/standings");
      if (!standingsRes.ok) {
        throw new Error("Erreur lors du chargement des classements");
      }
      const standings = await standingsRes.json();

      let manual: any[] = [];
      let competitions: any[] = [];
      if (isAdmin) {
        const [manualRes, competitionsRes] = await Promise.all([
          fetch("/api/sport/manual-player-stats"),
          fetch("/api/sport/competitions"),
        ]);
        if (manualRes.ok) {
          manual = await manualRes.json();
        }
        if (competitionsRes.ok) {
          competitions = await competitionsRes.json();
        }
      }

      const manualByCompetition = new Map<string, any>();
      manual
        .filter((m) => m.memberId === memberId)
        .forEach((m) => manualByCompetition.set(m.competitionId, m));

      const standingsByCompetition = new Map<string, any>();
      standings.forEach((block: any) => {
        if (block?.competition?.id) {
          standingsByCompetition.set(block.competition.id, block);
        }
      });

      const nextRows: Array<{
        competitionId: string;
        competitionName: string;
        season: string;
        matchesPlayed: number;
        goals: number;
        assists: number;
        points: number;
        source?: "manual" | "auto";
        lastUpdated?: string;
      }> = [];

      const nextEdit: Record<string, { matchesPlayed: string; goals: string; assists: string }> = {};

      const competitionsToShow =
        competitions.length > 0
          ? competitions
          : standings.map((block: any) => block.competition).filter(Boolean);

      competitionsToShow.forEach((competition: any) => {
        const block = standingsByCompetition.get(competition.id);
        const entry = Array.isArray(block?.leaderboard)
          ? block.leaderboard.find((p: any) => p.playerId === memberId)
          : null;
        const manualEntry = manualByCompetition.get(competition.id);

        const baseMatches = entry?.matchesPlayed ?? manualEntry?.stats?.matchesPlayed ?? 0;
        const baseGoals = entry?.goals ?? manualEntry?.stats?.goals ?? 0;
        const baseAssists = entry?.assists ?? manualEntry?.stats?.assists ?? 0;
        const basePoints =
          entry?.points ??
          (manualEntry ? baseGoals + baseAssists : 0);

        nextRows.push({
          competitionId: competition.id,
          competitionName: competition.name,
          season: competition.season ?? competition.seasonCode ?? competition.seasonId ?? "—",
          matchesPlayed: baseMatches,
          goals: baseGoals,
          assists: baseAssists,
          points: basePoints,
          source: manualEntry ? "manual" : (entry?.source as "manual" | "auto" | undefined),
          lastUpdated: manualEntry?.updatedAt ?? entry?.lastUpdated,
        });

        nextEdit[competition.id] = manualEntry
          ? {
              matchesPlayed: String(manualEntry.stats?.matchesPlayed ?? 0),
              goals: String(manualEntry.stats?.goals ?? 0),
              assists: String(manualEntry.stats?.assists ?? 0),
            }
          : {
              matchesPlayed: String(baseMatches),
              goals: String(baseGoals),
              assists: String(baseAssists),
            };
      });

      setStatsRows(nextRows);
      setStatsEdit(nextEdit);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : "Erreur lors du chargement des statistiques");
    } finally {
      setStatsLoading(false);
    }
  }, [isAdmin, memberId]);

  React.useEffect(() => {
    if (activeSection !== "stats") return;
    void loadStats();
  }, [activeSection, loadStats]);

  const saveManualStats = async (competitionId: string) => {
    if (!memberId) return;
    const values = statsEdit[competitionId];
    if (!values) return;
    setStatsError(null);

    const payload = {
      memberId,
      competitionId,
      matchesPlayed: Number(values.matchesPlayed || 0),
      goals: Number(values.goals || 0),
      assists: Number(values.assists || 0),
    };

    const res = await fetch("/api/sport/manual-player-stats", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setStatsError("Impossible d’enregistrer les statistiques");
      return;
    }

    await loadStats();
  };

  const getClubName = (id?: string) => {
    return clubs.find((c) => c.id === id)?.name || "Non assigné";
  };

  const getSeasonName = (id?: string) => {
    return seasons.find((s) => s.id === id)?.name || id || "—";
  };

  const getSeasonPeriod = (id?: string) => {
    const season = seasons.find((s) => s.id === id);
    if (!season) return "—";
    const start = season.startDate ? formatDate(season.startDate) : "—";
    const end = season.endDate ? formatDate(season.endDate) : "—";
    return `${start} → ${end}`;
  };

  const getCategoryName = (idOrName?: string) => {
    return categories.find((c) => c.id === idOrName || c.name === idOrName)?.name || idOrName || "—";
  };

  const getDisciplineName = (idOrName?: string) => {
      return disciplines.find(d => d.id === idOrName || d.name === idOrName)?.name || idOrName || "—";
  };

  const getPositionName = (id: string) => {
    const positions: Record<string, string> = {
        goalkeeper: "Gardien de but",
        left_defense: "Défenseur gauche",
        right_defense: "Défenseur droit",
        center: "Centre",
        left_wing: "Ailier gauche",
        right_wing: "Ailier droit"
    };
    return positions[id] || id;
  };

  const getPaymentMethodName = (id?: string) => {
    const methods: Record<string, string> = {
        bank_transfer: "Virement bancaire",
        cash: "Espèces",
        check: "Chèque",
        card: "Carte bancaire"
    };
    return id ? (methods[id] || id) : "—";
  };

  const getLicenseTypeName = (id?: string) => {
    const types: Record<string, string> = {
        player: "Licence Joueur",
        coach: "Licence Entraîneur",
        referee: "Licence Arbitre",
        staff: "Licence Staff"
    };
    return id ? (types[id] || id) : "—";
  };

  const getSubscriptionTypeName = (idOrName?: string) => {
      // Check managed types first
      const managed = subscriptionTypes.find(t => t.id === idOrName || t.name === idOrName);
      if (managed) return managed.name;

      const types: Record<string, string> = {
        annual: "Abonnement annuel",
        semester: "Abonnement semestriel",
        monthly: "Abonnement mensuel",
        free_session: "Séance libre"
      };
      return idOrName ? (types[idOrName] || idOrName) : "—";
  };

  const paymentMethods = [
    { id: "bank_transfer", name: "Virement bancaire" },
    { id: "cash", name: "Espèces" },
    { id: "check", name: "Chèque" },
    { id: "card", name: "Carte bancaire" },
  ];

  const formatMoney = (amountCents?: number, currency?: string) => {
    if (amountCents === null || amountCents === undefined) return "—";
    return `${(amountCents / 100).toFixed(2)} ${currency || "MAD"}`;
  };

  const sortedSubscriptions = React.useMemo(() => {
    return [...subscriptionHistory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [subscriptionHistory]);

  const latestSubscription = sortedSubscriptions[0];
  const latestPayment =
    latestSubscription?.payments?.[0] ||
    sortedSubscriptions.flatMap((s) => s.payments || [])[0];
  const paymentHistory = React.useMemo(() => {
    const items = sortedSubscriptions.flatMap((s) =>
      (s.payments || []).map((p: any) => ({ ...p, subscription: s })),
    );
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [sortedSubscriptions]);

  const handleCreateSubscription = async () => {
    if (!onCreateSubscription) return;
    setActionId("create");
    await onCreateSubscription({
      subscriptionType: subscriptionForm.subscriptionType,
      seasonId: subscriptionForm.seasonId,
      subscriptionAmount: subscriptionForm.subscriptionAmount
        ? Number(subscriptionForm.subscriptionAmount)
        : undefined,
      paymentMethod: subscriptionForm.paymentMethod,
      paymentStatus: subscriptionForm.paymentStatus,
      paymentDate: subscriptionForm.paymentDate,
      paymentReference: subscriptionForm.paymentReference,
    });
    setActionId(null);
    setIsSubscriptionModalOpen(false);
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    if (!onRenewSubscription) return;
    setActionId(subscriptionId);
    await onRenewSubscription(subscriptionId);
    setActionId(null);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!onCancelSubscription) return;
    setActionId(subscriptionId);
    await onCancelSubscription(subscriptionId);
    setActionId(null);
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!onDeleteSubscription) return;
    setActionId(subscriptionId);
    await onDeleteSubscription(subscriptionId);
    setActionId(null);
  };

  const handleAddPayment = async (subscriptionId: string) => {
    if (!onAddPayment) return;
    setActionId(`pay-${subscriptionId}`);
    await onAddPayment(subscriptionId);
    setActionId(null);
  };

  const openSubscriptionModal = () => {
    const amountValue =
      latestSubscription?.amountCents !== undefined
        ? String(latestSubscription.amountCents / 100)
        : data.subscriptionAmount !== undefined
        ? String(data.subscriptionAmount)
        : "";
    setSubscriptionForm({
      subscriptionType: latestSubscription?.subscriptionId || data.subscriptionType || "",
      seasonId: latestSubscription?.seasonId || data.seasonId || "",
      subscriptionAmount: amountValue,
      paymentMethod: data.paymentMethod || "",
      paymentStatus: data.paymentStatus || "",
      paymentDate: data.paymentDate ? String(data.paymentDate) : "",
      paymentReference: data.paymentReference || "",
    });
    setIsSubscriptionModalOpen(true);
  };

  const getSubscriptionVerifyUrl = (subscriptionId?: string) => {
    if (!subscriptionId) return null;
    return `${window.location.origin}/verify/subscription/${subscriptionId}`;
  };

  const getSubscriptionQrUrl = (subscriptionId?: string) => {
    const verifyUrl = getSubscriptionVerifyUrl(subscriptionId);
    if (!verifyUrl) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}`;
  };

  const getReceiptHtml = (payment: any, subscription?: any) => {
    const subscriptionId = subscription?.id || latestSubscription?.id;
    const amountCents =
      payment?.amountCents ?? Math.round((data.subscriptionAmount || 0) * 100);
    const amount = formatMoney(amountCents, payment?.currency || "MAD");
    const subscriptionName =
      subscription?.subscription?.name ||
      getSubscriptionTypeName(subscription?.subscriptionId || data.subscriptionType);
    const seasonName = getSeasonName(subscription?.seasonId || data.seasonId);
    const paidAt = formatDate(payment?.paidAt || payment?.createdAt || data.paymentDate);
    const ref = payment?.reference || data.paymentReference || "—";
    const memberName = `${data.lastName?.toUpperCase()} ${data.firstName}`;
    const logoUrl = `${window.location.origin}/logo_frmhg.png`;
    const verifyUrl = getSubscriptionVerifyUrl(subscriptionId);
    const qrUrl = verifyUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}`
      : "";
    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Reçu</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: A4; margin: 12mm; }
            body { font-family: Inter, Arial, sans-serif; background: #eef2f7; margin: 0; padding: 0; color:#0f172a; }
            .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 14mm; background: #fff; border-radius: 24px; box-shadow: 0 18px 50px rgba(15,23,42,.12); border: 1px solid #e9eef5; }
            @media print {
              body { background: #fff; }
              .page { margin: 0; width: auto; min-height: auto; box-shadow: none; border-radius: 0; border: none; padding: 0; }
            }
            .card { background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #eef2f7; }
            .hero { padding: 24px 24px 16px; background: linear-gradient(135deg, #f4f6ff 0%, #ffffff 55%, #f7fbff 100%); }
            .header { display:flex; justify-content: space-between; align-items: center; }
            .logo { width: 56px; height: 56px; background:#0f172a; border-radius: 16px; display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
            .logo img { width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0 6px 10px rgba(0,0,0,.25)); }
            .meta { margin-top: 18px; display:flex; gap: 12px; flex-wrap: wrap; }
            .pill { background: #0f172a; color:#fff; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
            .ref { background:#fff; border: 1px dashed #d6dde9; color:#0f172a; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .08em; }
            .title { font-size: 20px; font-weight: 900; color:#0f172a; }
            .subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: .25em; color:#8b97ad; font-weight: 700; margin-bottom: 6px; }
            .content { padding: 18px 24px 24px; }
            .grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .block { background:#f8fafc; border: 1px solid #eef2f7; border-radius: 18px; padding: 14px; }
            .label { font-size: 10px; text-transform: uppercase; letter-spacing: .25em; color:#94a3b8; font-weight: 700; }
            .value { font-size: 14px; font-weight: 800; color:#0f172a; margin-top: 6px; }
            .amount { margin-top: 18px; display:flex; align-items:center; justify-content: space-between; padding: 16px 18px; border-radius: 18px; background: linear-gradient(135deg, #0f172a, #111827); color:#fff; }
            .amount strong { font-size: 22px; }
            .qr { margin-top: 18px; display:flex; align-items:center; gap: 16px; padding: 14px; border-radius: 18px; background:#fff; border: 1px solid #eef2f7; }
            .qr img { width: 110px; height: 110px; }
            .qr-title { font-size: 11px; font-weight: 800; color:#0f172a; text-transform: uppercase; letter-spacing: .2em; }
            .qr-desc { font-size: 12px; color:#64748b; margin-top: 6px; }
            .footer { margin-top: 18px; font-size: 11px; color:#64748b; text-align:center; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="card">
              <div class="hero">
                <div class="header">
                  <div>
                    <div class="subtitle">Reçu officiel</div>
                    <div class="title">Fédération Royale Marocaine de Hockey sur Glace</div>
                  </div>
                  <div class="logo"><img src="${logoUrl}" alt="FRMHG"/></div>
                </div>
                <div class="meta">
                  <div class="pill">Payé</div>
                  <div class="ref">Réf. ${ref}</div>
                </div>
              </div>
              <div class="content">
                <div class="grid">
                  <div class="block">
                    <div class="label">Membre</div>
                    <div class="value">${memberName}</div>
                  </div>
                  <div class="block">
                    <div class="label">Abonnement</div>
                    <div class="value">${subscriptionName}</div>
                  </div>
                  <div class="block">
                    <div class="label">Saison</div>
                    <div class="value">${seasonName}</div>
                  </div>
                  <div class="block">
                    <div class="label">Date paiement</div>
                    <div class="value">${paidAt}</div>
                  </div>
                  <div class="block">
                    <div class="label">Mode</div>
                    <div class="value">${getPaymentMethodName(payment.method)}</div>
                  </div>
                  <div class="block">
                    <div class="label">Montant</div>
                    <div class="value">${amount}</div>
                  </div>
                </div>
              ${verifyUrl ? `
              <div class="qr">
                <img src="${qrUrl}" alt="QR Code"/>
                <div>
                  <div class="qr-title">Vérification</div>
                  <div class="qr-desc">Scannez pour vérifier la validité de l'abonnement et la date d'expiration.</div>
                  <div class="qr-desc">${verifyUrl}</div>
                </div>
              </div>
              ` : ""}
                <div class="amount">
                  <div class="label" style="color:#cbd5f5">Total</div>
                  <strong>${amount}</strong>
                </div>
                <div class="footer">Merci pour votre confiance</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const printReceipt = async (payment: any, subscription?: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(getReceiptHtml(payment, subscription));
    win.document.close();
    const waitForImages = () =>
      Promise.all(
        Array.from(win.document.images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve(true);
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            }),
        ),
      );
    const fontsReady = (win.document as any).fonts?.ready ?? Promise.resolve();
    await Promise.all([waitForImages(), fontsReady]);
    win.focus();
    win.print();
  };

  const isAdherent =
    data.memberStatus === "adherent" ||
    (!data.assignedClubId && data.memberStatus !== "club_player");
  const licenseStatus = (data as any).licenseStatus as string | undefined;

  const handleLicenseExport = async (action: "download" | "print") => {
    // New implementation using server-side PDF generation for 100% identical render
    const url = `/downloads/licenses/${data.id}/pdf?action=${action}`;
    window.open(url, "_blank");
  };

  const getQrCodeUrl = () => {
    const code = data.memberNumber || (data as any).licenseNumber;
    if (!code) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`;
  };

  const assignedClubId =
    data.assignedClubId || (data as any).assignedClubId || (data as any).orgId || (data as any).org_id;
  const assignedClub = React.useMemo(
    () => clubs.find((club) => club.id === assignedClubId),
    [clubs, assignedClubId],
  );
  const assignedClubLogoId = assignedClub?.logoDocumentId || assignedClub?.logo_document_id;
  const assignedClubLogoUrl = assignedClubLogoId ? `/api/documents/view?id=${assignedClubLogoId}` : null;

  const getLicenseQrCodeUrl = () => {
    const code = data.memberNumber || (data as any).licenseNumber;
    if (isAdherent && latestSubscription?.id) {
      const verifyUrl = getSubscriptionVerifyUrl(latestSubscription.id);
      if (verifyUrl) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
      }
    }
    if (code) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`;
    }
    if (latestSubscription?.id) {
      const verifyUrl = getSubscriptionVerifyUrl(latestSubscription.id);
      if (verifyUrl) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
      }
    }
    return null;
  };

  const getLatestPaidSeasonName = () => {
    const paidPayments = paymentHistory.filter((p) => p.status === "paid");
    if (paidPayments.length === 0) {
      return getSeasonName(latestSubscription?.seasonId || data.seasonId);
    }
    const latestPaid = [...paidPayments].sort((a, b) => {
      const aDate = new Date(a.paidAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.paidAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    })[0];
    return getSeasonName(latestPaid.subscription?.seasonId || latestSubscription?.seasonId || data.seasonId);
  };

  const getLatestPaidSeasonId = () => {
    const paidPayments = paymentHistory.filter((p) => p.status === "paid");
    if (paidPayments.length === 0) {
      return latestSubscription?.seasonId || data.seasonId;
    }
    const latestPaid = [...paidPayments].sort((a, b) => {
      const aDate = new Date(a.paidAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.paidAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    })[0];
    return latestPaid.subscription?.seasonId || latestSubscription?.seasonId || data.seasonId;
  };

  const getActiveSeasonId = () => {
    return seasons.find((s) => s.isActive)?.id || data.licenseSeason;
  };
  
  const sections = [
    { id: "overview", label: "Vue d'ensemble", icon: User },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "sports", label: "Profil Sportif", icon: Trophy },
    { id: "admin", label: "Administration", icon: ClipboardList },
    { id: "medical", label: "Médical", icon: Stethoscope },
    { id: "license", label: "Licence", icon: BadgeCheck },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sectionParam = new URLSearchParams(window.location.search).get("section");
    if (!sectionParam) return;
    const isValid = sections.some((s) => s.id === sectionParam);
    if (isValid && sectionParam !== activeSection) {
      setActiveSection(sectionParam);
    }
  }, [activeSection, sections]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {sections.map((s) => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all border ${
                  isActive
                    ? "bg-brand-50 text-brand-700 border-brand-100 shadow-sm"
                    : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isActive ? "bg-white text-brand-600" : "bg-gray-50 text-gray-500"
                }`}>
                  <s.icon className="w-5 h-5" />
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar / Profile Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="relative mx-auto w-32 h-32 mb-4">
            <div className="w-full h-full rounded-full bg-gray-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
              {getPhotoUrl() ? (
                <img src={getPhotoUrl()!} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white shadow-sm ${
              data.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {data.lastName?.toUpperCase()} {data.firstName}
          </h2>
          <p className="text-sm font-medium text-brand-600 mt-1">{data.memberNumber}</p>
          
          {/* Prominent Member Category Badge */}
          <div className="mt-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
              data.memberStatus === 'adherent' || (!data.assignedClubId && data.memberStatus !== 'club_player')
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                data.memberStatus === 'adherent' || (!data.assignedClubId && data.memberStatus !== 'club_player')
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`} />
              {data.memberStatus === 'adherent' || (!data.assignedClubId && data.memberStatus !== 'club_player')
                ? 'Adhérent École de Hockey'
                : 'Joueur de Club'}
            </span>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
              {getCategoryName(data.ageCategory)}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              data.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.status || 'active'}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
             <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className={`font-semibold ${
                  data.memberStatus === 'adherent' || (!data.assignedClubId && data.memberStatus !== 'club_player')
                    ? 'text-green-700'
                    : 'text-blue-700'
                }`}>
                    {data.memberStatus === 'adherent' || (!data.assignedClubId && data.memberStatus !== 'club_player')
                      ? 'Adhérent École'
                      : 'Joueur de Club'}
                </span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Organisation</span>
                <span className="font-semibold text-gray-800">{getClubName(data.assignedClubId)}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sexe</span>
                <span className="font-semibold text-gray-800">{data.sex === 'M' ? 'Masculin' : 'Féminin'}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Nationalité</span>
                <span className="font-semibold text-gray-800">{data.nationality || '—'}</span>
             </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[600px] overflow-hidden">
          {/* Header of Content */}
          <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
            <h3 className="text-lg font-bold text-gray-800">
                {sections.find(s => s.id === activeSection)?.label}
            </h3>
          </div>

          <div className="p-8">
            {activeSection === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoGroup label="Coordonnées">
                    <InfoItem icon="📞" label="Téléphone" value={data.phone} />
                    <InfoItem icon="✉️" label="Email" value={data.email} />
                    <InfoItem icon="📍" label="Adresse" value={data.address} />
                    <InfoItem icon="🏙️" label="Ville" value={data.city && data.region ? `${data.city}, ${data.region}` : data.city || data.region} />
                </InfoGroup>

                <InfoGroup label="Identité">
                    <InfoItem icon="📅" label="Date de naissance" value={formatDate(data.dateOfBirth)} />
                    <InfoItem icon="🆔" label="N° Pièce d'identité" value={data.idNumber ? `${data.idNumber} (${data.idType?.toUpperCase()})` : "—"} />
                    <InfoItem icon="🌍" label="Nationalité" value={data.nationality} />
                </InfoGroup>

                <InfoGroup label="Contact d'urgence" className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem icon="👤" label="Nom du contact" value={data.emergencyContactName} />
                        <InfoItem icon="📱" label="Téléphone d'urgence" value={data.emergencyContactPhone} />
                    </div>
                </InfoGroup>
              </div>
            )}

            {activeSection === "stats" && (
              <div className="space-y-6">
                {statsError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {statsError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="text-xs font-semibold text-gray-500">MJ</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">{statsTotals.matchesPlayed}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="text-xs font-semibold text-gray-500">B</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">{statsTotals.goals}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="text-xs font-semibold text-gray-500">A</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">{statsTotals.assists}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="text-xs font-semibold text-gray-500">PTS</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">{statsTotals.points}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 bg-gray-50/40 border-b border-gray-100">
                    <div className="font-semibold text-gray-800">Détail par compétition</div>
                    {statsLoading ? <div className="text-sm text-gray-500">Chargement…</div> : null}
                  </div>

                  {statsRows.length === 0 && !statsLoading ? (
                    <div className="px-5 py-4 text-sm text-gray-600">Aucune compétition en cours.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] border-separate border-spacing-0">
                        <thead>
                          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-4 py-3 border-b border-gray-100">Compétition</th>
                            <th className="px-4 py-3 border-b border-gray-100 text-center">MJ</th>
                            <th className="px-4 py-3 border-b border-gray-100 text-center">B</th>
                            <th className="px-4 py-3 border-b border-gray-100 text-center">A</th>
                            <th className="px-4 py-3 border-b border-gray-100 text-center">PTS</th>
                            <th className="px-4 py-3 border-b border-gray-100 text-center">Source</th>
                            <th className="px-4 py-3 border-b border-gray-100 text-center">MAJ</th>
                            {isAdmin ? <th className="px-4 py-3 border-b border-gray-100 text-right">Action</th> : null}
                          </tr>
                        </thead>
                        <tbody>
                          {statsRows.map((row) => {
                            const edit = statsEdit[row.competitionId];
                            return (
                              <tr key={row.competitionId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 border-b border-gray-50">
                                  <div className="font-semibold text-gray-900">{row.competitionName}</div>
                                  <div className="text-xs text-gray-500">Saison {row.season}</div>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-50 text-center font-semibold text-gray-900">
                                  {isAdmin ? (
                                    <input
                                      value={edit?.matchesPlayed ?? ""}
                                      onChange={(e) =>
                                        setStatsEdit((prev) => ({
                                          ...prev,
                                          [row.competitionId]: {
                                            matchesPlayed: e.target.value,
                                            goals: prev[row.competitionId]?.goals ?? "0",
                                            assists: prev[row.competitionId]?.assists ?? "0",
                                          },
                                        }))
                                      }
                                      className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm text-center outline-none focus:ring-2 focus:ring-brand-500/20"
                                    />
                                  ) : (
                                    row.matchesPlayed
                                  )}
                                </td>
                                <td className="px-4 py-3 border-b border-gray-50 text-center font-semibold text-blue-700">
                                  {isAdmin ? (
                                    <input
                                      value={edit?.goals ?? ""}
                                      onChange={(e) =>
                                        setStatsEdit((prev) => ({
                                          ...prev,
                                          [row.competitionId]: {
                                            matchesPlayed: prev[row.competitionId]?.matchesPlayed ?? "0",
                                            goals: e.target.value,
                                            assists: prev[row.competitionId]?.assists ?? "0",
                                          },
                                        }))
                                      }
                                      className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm text-center outline-none focus:ring-2 focus:ring-brand-500/20"
                                    />
                                  ) : (
                                    row.goals
                                  )}
                                </td>
                                <td className="px-4 py-3 border-b border-gray-50 text-center font-semibold text-green-700">
                                  {isAdmin ? (
                                    <input
                                      value={edit?.assists ?? ""}
                                      onChange={(e) =>
                                        setStatsEdit((prev) => ({
                                          ...prev,
                                          [row.competitionId]: {
                                            matchesPlayed: prev[row.competitionId]?.matchesPlayed ?? "0",
                                            goals: prev[row.competitionId]?.goals ?? "0",
                                            assists: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm text-center outline-none focus:ring-2 focus:ring-brand-500/20"
                                    />
                                  ) : (
                                    row.assists
                                  )}
                                </td>
                                <td className="px-4 py-3 border-b border-gray-50 text-center font-semibold text-purple-700">
                                  {isAdmin
                                    ? Number(edit?.goals || 0) + Number(edit?.assists || 0)
                                    : row.points}
                                </td>
                                <td className="px-4 py-3 border-b border-gray-50 text-center text-sm text-gray-600">
                                  {row.source === "manual" ? "Manuel" : row.source === "auto" ? "Auto" : "—"}
                                </td>
                                <td className="px-4 py-3 border-b border-gray-50 text-center text-sm text-gray-600">
                                  {row.lastUpdated ? formatDate(row.lastUpdated) : "—"}
                                </td>
                                {isAdmin ? (
                                  <td className="px-4 py-3 border-b border-gray-50 text-right">
                                    <button
                                      onClick={() => saveManualStats(row.competitionId)}
                                      className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                                      disabled={statsLoading}
                                    >
                                      Enregistrer
                                    </button>
                                  </td>
                                ) : null}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "sports" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoGroup label="Détails Sportifs">
                    <InfoItem icon="🏒" label="Discipline" value={getDisciplineName(data.discipline)} />
                    <InfoItem icon="📊" label="Catégorie" value={getCategoryName(data.ageCategory)} />
                    <InfoItem icon="🔢" label="Numéro de maillot" value={data.jerseyNumber} />
                </InfoGroup>

                <InfoGroup label="Positions">
                    <div className="flex flex-wrap gap-2 mt-2">
                        {data.positions && data.positions.length > 0 ? (
                            data.positions.map((p: string) => (
                                <span key={p} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold border border-brand-100">
                                    {getPositionName(p)}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400 italic">Aucune position définie</span>
                        )}
                    </div>
                </InfoGroup>

                <InfoGroup label="Affectation Club" className="md:col-span-2">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoItem icon="🏟️" label="Club actuel" value={getClubName(data.assignedClubId)} />
                            <InfoItem icon="📅" label="Début d'affectation" value={formatDate(data.assignmentStartDate)} />
                            <InfoItem icon="🏁" label="Fin d'affectation" value={formatDate(data.assignmentEndDate)} />
                        </div>
                    </div>
                </InfoGroup>
              </div>
            )}

            {activeSection === "admin" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isAdherent ? (
                  <>
                    <InfoGroup label="Abonnement en cours">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            latestSubscription?.status === "active"
                              ? "bg-green-100 text-green-700"
                              : latestSubscription?.status === "canceled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {latestSubscription?.status || "Aucun"}
                          </span>
                          {latestSubscription?.endDate && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
                              Expire le {formatDate(latestSubscription.endDate)}
                            </span>
                          )}
                        </div>
                        <InfoItem
                          icon="💎"
                          label="Type d'abonnement"
                          value={
                            latestSubscription?.subscription?.name
                              ? latestSubscription.subscription.name
                              : getSubscriptionTypeName(data.subscriptionType)
                          }
                        />
                        <InfoItem icon="🗓️" label="Saison" value={getSeasonName(latestSubscription?.seasonId || data.seasonId)} />
                        <InfoItem
                          icon="💰"
                          label="Montant"
                          value={
                            latestSubscription?.amountCents
                              ? formatMoney(latestSubscription.amountCents, latestSubscription.currency)
                              : data.subscriptionAmount
                              ? `${data.subscriptionAmount} MAD`
                              : "—"
                          }
                        />
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {latestSubscription ? (
                            <>
                              {onRenewSubscription && (
                                <button
                                  onClick={() => handleRenewSubscription(latestSubscription.id)}
                                  disabled={actionId === latestSubscription.id}
                                  className="px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 disabled:opacity-50"
                                >
                                  {actionId === latestSubscription.id ? "..." : "Renouveler"}
                                </button>
                              )}
                              {onCancelSubscription && (
                                <button
                                  onClick={() => handleCancelSubscription(latestSubscription.id)}
                                  disabled={actionId === latestSubscription.id}
                                  className="px-3 py-2 rounded-lg bg-white text-brand-700 text-xs font-semibold ring-1 ring-brand-200 hover:bg-brand-50 disabled:opacity-50"
                                >
                                  Annuler
                                </button>
                              )}
                              {onDeleteSubscription && (
                                <button
                                  onClick={() => handleDeleteSubscription(latestSubscription.id)}
                                  disabled={actionId === latestSubscription.id}
                                  className="px-3 py-2 rounded-lg bg-white text-red-600 text-xs font-semibold ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-50"
                                >
                                  Supprimer
                                </button>
                              )}
                              {onAddPayment && (
                                <button
                                  onClick={() => handleAddPayment(latestSubscription.id)}
                                  disabled={actionId === `pay-${latestSubscription.id}`}
                                  className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-50"
                                >
                                  {actionId === `pay-${latestSubscription.id}` ? "..." : "Ajouter paiement"}
                                </button>
                              )}
                            </>
                          ) : (
                            onCreateSubscription && (
                              <button
                                onClick={openSubscriptionModal}
                                disabled={actionId === "create"}
                                className="px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 disabled:opacity-50"
                              >
                                {actionId === "create" ? "..." : "Créer un abonnement"}
                              </button>
                            )
                          )}
                        </div>
                    </InfoGroup>

                    <InfoGroup label="Dernier paiement">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                            latestPayment?.status === 'paid' || data.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                        }`}>
                            {latestPayment?.status === 'paid' || data.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                        </div>
                        <InfoItem icon="💳" label="Mode" value={getPaymentMethodName(latestPayment?.method || data.paymentMethod)} />
                        <InfoItem icon="📅" label="Date" value={formatDate(latestPayment?.paidAt || latestPayment?.createdAt || data.paymentDate)} />
                        <InfoItem icon="🔢" label="Référence" value={latestPayment?.reference || data.paymentReference} />
                        {(latestPayment?.status === "paid" || data.paymentStatus === "paid") && (
                          <button
                            onClick={() => setReceipt({ payment: latestPayment || {
                              amountCents: Math.round((data.subscriptionAmount || 0) * 100),
                              currency: "MAD",
                              method: data.paymentMethod,
                              paidAt: data.paymentDate,
                              reference: data.paymentReference,
                            }, subscription: latestSubscription })}
                            className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800"
                          >
                            Voir reçu
                          </button>
                        )}
                    </InfoGroup>

                    <InfoGroup label="Historique abonnements" className="md:col-span-2">
                      {sortedSubscriptions.length === 0 ? (
                        <div className="text-sm text-gray-500">Aucun abonnement enregistré.</div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {sortedSubscriptions.map((sub) => (
                            <div key={sub.id} className="rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-gray-800">
                                  {sub.subscription?.name || getSubscriptionTypeName(sub.subscriptionId)}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                  sub.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : sub.status === "canceled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {sub.status}
                                </span>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
                                <div>Début: <span className="font-semibold text-gray-800">{formatDate(sub.startDate)}</span></div>
                                <div>Fin: <span className="font-semibold text-gray-800">{formatDate(sub.endDate)}</span></div>
                                <div>Saison: <span className="font-semibold text-gray-800">{getSeasonName(sub.seasonId)}</span></div>
                                <div>Montant: <span className="font-semibold text-gray-800">{formatMoney(sub.amountCents, sub.currency)}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </InfoGroup>

                    <InfoGroup label="Historique paiements" className="md:col-span-2">
                      {paymentHistory.length === 0 ? (
                        <div className="text-sm text-gray-500">Aucun paiement enregistré.</div>
                      ) : (
                        <div className="space-y-3">
                          {paymentHistory.map((p) => (
                            <div key={p.id} className="rounded-2xl border border-gray-100 p-4 bg-white flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-gray-800">
                                  {p.subscription?.subscription?.name || getSubscriptionTypeName(p.subscription?.subscriptionId)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(p.paidAt || p.createdAt)} • {getPaymentMethodName(p.method)} • {p.reference || "—"}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                  p.status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                }`}>
                                  {p.status}
                                </span>
                                <div className="text-sm font-bold text-gray-900">{formatMoney(p.amountCents, p.currency)}</div>
                                {p.status === "paid" && (
                                  <button
                                    onClick={() => setReceipt({ payment: p, subscription: p.subscription })}
                                    className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800"
                                  >
                                    Reçu
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </InfoGroup>
                  </>
                ) : (
                  <InfoGroup label="Paiement">
                      <InfoItem icon="ℹ️" label="Statut" value="Non concerné" />
                  </InfoGroup>
                )}

                <InfoGroup label="Inscription Système" className="md:col-span-2">
                    <InfoItem icon="🕒" label="Date d'enregistrement" value={formatDate(data.registrationDate)} />
                </InfoGroup>
              </div>
            )}

            {activeSection === "medical" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoGroup label="État Médical">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                        data.medicalStatus === 'fit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {data.medicalStatus === 'fit' ? 'Apte' : 'Inapte / En attente'}
                    </div>
                    <InfoItem icon="📅" label="Dernière visite" value={formatDate(data.lastMedicalVisitDate)} />
                    <InfoItem icon="👨‍⚕️" label="Médecin Fédéral" value={data.federationDoctor} />
                    <InfoItem icon="📜" label="Aptitude" value={data.medicalFitness} />
                    <InfoItem icon="⌛" label="Expiration" value={formatDate(data.fitnessExpirationDate)} />
                </InfoGroup>
              </div>
            )}

            {activeSection === "license" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoGroup label="Licence Fédérale">
                    <LicenseCard
                        ref={licenseCardRef}
                        member={data as any}
                        licenseStatus={licenseStatus || 'DRAFT'}
                        photoUrl={getPhotoUrl()}
                        qrCodeUrl={getLicenseQrCodeUrl()}
                        clubLogoUrl={assignedClubLogoUrl}
                        isAdherent={isAdherent}
                        seasonName={isAdherent ? getLatestPaidSeasonName() : getSeasonName(getActiveSeasonId())}
                        seasonPeriod=""
                        disciplineName={getDisciplineName(data.discipline)}
                    />
                    {canDownloadLicense && licenseStatus === "active" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleLicenseExport("download")}
                          disabled={licenseAction !== null}
                          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 disabled:opacity-50"
                        >
                          {licenseAction === "download" ? "Téléchargement..." : "Télécharger (300 dpi)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLicenseExport("print")}
                          disabled={licenseAction !== null}
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50"
                        >
                          {licenseAction === "print" ? "Préparation..." : "Imprimer (300 dpi)"}
                        </button>
                      </div>
                    )}
                </InfoGroup>
              </div>
            )}
            {activeSection === "documents" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Simplified document list since actual document fetching might be separate */}
                        <p className="text-sm text-gray-500 italic col-span-full">
                            Les documents justificatifs (CIN, Certificat médical, etc.) sont archivés de manière sécurisée.
                        </p>
                        
                        {getPhotoId() && (
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                                    🖼️
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-800 truncate">Photo de profil</p>
                                    <p className="text-[10px] text-gray-500">Image enregistrée</p>
                                </div>
                                <a 
                                    href={`/api/documents/view?id=${getPhotoId()}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
      </div>
      {isSubscriptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Abonnement</div>
                <div className="text-lg font-bold text-gray-900">Ajouter un abonnement</div>
              </div>
              <button
                onClick={() => setIsSubscriptionModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span>💳</span> Abonnement
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type d'abonnement</label>
                      <div className="space-y-2">
                        {subscriptionTypes.length > 0 ? (
                          subscriptionTypes.filter((s: any) => s.is_active).map((sub: any) => (
                            <label
                              key={sub.id}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                subscriptionForm.subscriptionType === sub.id
                                  ? "border-brand-500 bg-brand-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="subscriptionType"
                                  value={sub.id}
                                  checked={subscriptionForm.subscriptionType === sub.id}
                                  onChange={(e) => {
                                    setSubscriptionForm((prev) => ({
                                      ...prev,
                                      subscriptionType: e.target.value,
                                      subscriptionAmount: String(sub.amount_cents / 100),
                                    }));
                                  }}
                                  className="hidden"
                                />
                                <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                              </div>
                              <span className="text-sm font-bold text-brand-600">{sub.amount_cents / 100} MAD</span>
                            </label>
                          ))
                        ) : (
                          [
                            { id: "annual", name: "Abonnement annuel", price: 1500 },
                            { id: "semester", name: "Abonnement semestriel", price: 900 },
                            { id: "monthly", name: "Abonnement mensuel", price: 200 },
                            { id: "free_session", name: "Séance libre", price: 100 },
                          ].map((sub) => (
                            <label
                              key={sub.id}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                subscriptionForm.subscriptionType === sub.id
                                  ? "border-brand-500 bg-brand-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="subscriptionType"
                                  value={sub.id}
                                  checked={subscriptionForm.subscriptionType === sub.id}
                                  onChange={(e) => {
                                    setSubscriptionForm((prev) => ({
                                      ...prev,
                                      subscriptionType: e.target.value,
                                      subscriptionAmount: String(sub.price),
                                    }));
                                  }}
                                  className="hidden"
                                />
                                <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                              </div>
                              <span className="text-sm font-bold text-brand-600">{sub.price} MAD</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Saison sportive</label>
                      <select
                        value={subscriptionForm.seasonId}
                        onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, seasonId: e.target.value }))}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">Sélectionner une saison</option>
                        {seasons.map((season: any) => (
                          <option key={season.id} value={season.id}>
                            {season.name} {season.isActive && "(Active)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Montant (MAD)</label>
                      <input
                        type="number"
                        value={subscriptionForm.subscriptionAmount}
                        onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, subscriptionAmount: e.target.value }))}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span>💰</span> Paiement
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                      <select
                        value={subscriptionForm.paymentMethod}
                        onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">Sélectionner</option>
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>{method.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Statut du paiement</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "pending", label: "En attente", color: "yellow" },
                          { id: "paid", label: "Payé", color: "green" },
                          { id: "overdue", label: "En retard", color: "red" },
                        ].map((status) => (
                          <label
                            key={status.id}
                            className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                              subscriptionForm.paymentStatus === status.id
                                ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentStatus"
                              value={status.id}
                              checked={subscriptionForm.paymentStatus === status.id}
                              onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                              className="hidden"
                            />
                            {status.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date du paiement</label>
                      <input
                        type="date"
                        value={subscriptionForm.paymentDate}
                        onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Référence du paiement</label>
                      <input
                        type="text"
                        value={subscriptionForm.paymentReference}
                        onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, paymentReference: e.target.value }))}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="Ex: VIR-2025-00001"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateSubscription}
                  className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {receipt && receipt.payment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-brand-50 via-white to-indigo-50 px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gray-400">Reçu officiel</div>
                  <div className="text-lg font-black text-gray-900">Paiement adhérent</div>
                </div>
                <button
                  onClick={() => setReceipt(null)}
                  className="w-9 h-9 rounded-full bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 p-2 shadow-lg">
                  <img src="/logo_frmhg.png" alt="FRMHG" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Fédération Royale Marocaine</div>
                  <div className="text-xs font-semibold text-gray-500">de Hockey sur Glace</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-[0.2em]">
                    Payé
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white text-gray-700 text-[10px] font-semibold uppercase tracking-[0.2em] border border-gray-200">
                    Réf. {receipt.payment.reference || data.paymentReference || "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Membre</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {data.lastName?.toUpperCase()} {data.firstName}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Abonnement</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {receipt.subscription?.subscription?.name ||
                      getSubscriptionTypeName(receipt.subscription?.subscriptionId || data.subscriptionType)}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Saison</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {getSeasonName(receipt.subscription?.seasonId || data.seasonId)}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Date paiement</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {formatDate(receipt.payment.paidAt || receipt.payment.createdAt || data.paymentDate)}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Mode</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {getPaymentMethodName(receipt.payment.method || data.paymentMethod)}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Montant</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {formatMoney(
                      receipt.payment.amountCents ?? Math.round((data.subscriptionAmount || 0) * 100),
                      receipt.payment.currency || "MAD",
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-900 px-5 py-4 text-white">
                <span className="text-xs font-semibold uppercase tracking-[0.3em]">Total</span>
                <span className="text-xl font-black">
                  {formatMoney(
                    receipt.payment.amountCents ?? Math.round((data.subscriptionAmount || 0) * 100),
                    receipt.payment.currency || "MAD",
                  )}
                </span>
              </div>
              {getSubscriptionQrUrl(receipt.subscription?.id || latestSubscription?.id) && (
                <div className="mt-5 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                  <img
                    src={getSubscriptionQrUrl(receipt.subscription?.id || latestSubscription?.id)!}
                    alt="QR Code"
                    className="w-24 h-24"
                  />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Vérification</div>
                    <div className="text-sm font-semibold text-gray-900">Scannez pour vérifier l'abonnement</div>
                    <div className="text-xs text-gray-500">
                      Validité et date d'expiration affichées après scan.
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => setReceipt(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                >
                  Fermer
                </button>
                <button
                  onClick={() => printReceipt(receipt.payment, receipt.subscription)}
                  className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
                >
                  Imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoGroup({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value?: any }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm border border-gray-100 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 font-medium uppercase">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

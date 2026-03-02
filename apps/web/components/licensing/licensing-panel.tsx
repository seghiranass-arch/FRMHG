"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type MemberLicense = {
  id: string;
  first_name: string;
  last_name: string;
  license_number: string;
  license_type: string;
  license_status: string;
  license_issue_date: string;
  license_expiration_date: string | null;
  license_season: string | null;
  season_name: string | null;
  season_code: string | null;
  org_id: string | null;
  org_name: string | null;
  age_category: string | null;
  profile_photo_id: string | null;
  profile_photo_updated_at: string | null;
};

export function LicensingPanel({
  players,
  adherents,
  canApprove = false,
  showAdherents = true,
  allowRenewRequest = false
}: {
  players: MemberLicense[];
  adherents: MemberLicense[];
  canApprove?: boolean;
  showAdherents?: boolean;
  allowRenewRequest?: boolean;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'players' | 'adherents'>('players');
  const [statusFilter, setStatusFilter] = React.useState<'pending' | 'active' | 'invalid' | 'all'>('pending');
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  const [localPlayers, setLocalPlayers] = React.useState(players);
  const [localAdherents, setLocalAdherents] = React.useState(adherents);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-orange-100 text-orange-700">En attente</span>;
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700">Active</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-700">Rejetée</span>;
      case 'expired':
      case 'archived':
        return <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600">Expirée</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600">Brouillon</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const isExpiringSoon = (member: MemberLicense) => {
    if (!member.license_expiration_date) return false;
    const expiry = new Date(member.license_expiration_date);
    if (isNaN(expiry.getTime())) return false;
    const diffDays = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 60;
  };

  const handleApprove = async (memberId: string) => {
    setIsLoading(memberId);
    try {
      const res = await fetch(`/api/members/${memberId}/license/approve`, { method: 'POST' });
      if (res.ok) {
        // Update local state
        const updateList = (list: MemberLicense[]) =>
          list.map(m => m.id === memberId ? { ...m, license_status: 'active' } : m);
        setLocalPlayers(updateList);
        setLocalAdherents(updateList);
      }
    } catch (error) {
      console.error('Error approving license:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleReject = async (memberId: string) => {
    setIsLoading(memberId);
    try {
      const res = await fetch(`/api/members/${memberId}/license/reject`, { method: 'POST' });
      if (res.ok) {
        const updateList = (list: MemberLicense[]) =>
          list.map(m => m.id === memberId ? { ...m, license_status: 'rejected' } : m);
        setLocalPlayers(updateList);
        setLocalAdherents(updateList);
      }
    } catch (error) {
      console.error('Error rejecting license:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleRenew = async (memberId: string) => {
    setIsLoading(memberId);
    try {
      const res = await fetch(`/api/members/${memberId}/license/renew`, { method: 'POST' });
      if (res.ok) {
        const updateList = (list: MemberLicense[]) =>
          list.map(m => m.id === memberId ? { ...m, license_status: 'pending' } : m);
        setLocalPlayers(updateList);
        setLocalAdherents(updateList);
      }
    } catch (error) {
      console.error('Error renewing license:', error);
    } finally {
      setIsLoading(null);
    }
  };

  React.useEffect(() => {
    if (!showAdherents && activeTab === 'adherents') {
      setActiveTab('players');
    }
  }, [showAdherents, activeTab]);

  const currentList = activeTab === 'players' ? localPlayers : localAdherents;
  const pendingList = currentList.filter(m => ['pending_approval', 'pending'].includes(m.license_status));
  const activeList = currentList.filter(m => m.license_status === 'active');
  const invalidList = currentList.filter(m => ['rejected', 'expired', 'archived', 'draft'].includes(m.license_status));
  const filteredList =
    statusFilter === 'all'
      ? currentList
      : statusFilter === 'pending'
      ? pendingList
      : statusFilter === 'active'
      ? activeList
      : invalidList;

  const getMemberType = (member: MemberLicense) => {
    if (member.license_type === 'player') return 'Joueur de club';
    if (member.license_type === 'adherent') return 'Adhérent école';
    return member.license_type || '—';
  };

  const renderMemberRow = (member: MemberLicense) => (
    <tr key={member.id} className="text-sm text-gray-700 hover:bg-gray-50">
      <td className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {member.profile_photo_id ? (
              <img
                src={`/api/documents/view?id=${member.profile_photo_id}&v=${encodeURIComponent(member.profile_photo_updated_at || member.profile_photo_id)}`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg text-gray-400">👤</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{member.last_name?.toUpperCase()} {member.first_name}</p>
            <p className="text-xs text-gray-500">{member.license_number}</p>
          </div>
        </div>
      </td>
      <td className="border-b border-gray-100 px-4 py-3">
        <span className="text-xs font-semibold text-gray-600">{getMemberType(member)}</span>
      </td>
      <td className="border-b border-gray-100 px-4 py-3">
        {member.org_name || <span className="text-gray-400 italic">Adhérent école de hockey</span>}
      </td>
      <td className="border-b border-gray-100 px-4 py-3">
        {member.season_name || member.season_code || '—'}
      </td>
      <td className="border-b border-gray-100 px-4 py-3">
        {member.age_category || '—'}
      </td>
      <td className="border-b border-gray-100 px-4 py-3">
        {formatDate(member.license_expiration_date)}
      </td>
      <td className="border-b border-gray-100 px-4 py-3">
        {formatDate(member.license_issue_date)}
      </td>
      <td className="border-b border-gray-100 px-4 py-3">
        {getStatusBadge(member.license_status)}
      </td>
      <td className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-1">
          {['pending_approval', 'pending'].includes(member.license_status) && canApprove && (
            <>
              <button
                onClick={() => handleApprove(member.id)}
                disabled={isLoading === member.id}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading === member.id ? '...' : 'Approuver'}
              </button>
              <button
                onClick={() => handleReject(member.id)}
                disabled={isLoading === member.id}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Refuser
              </button>
            </>
          )}
          {member.license_status === 'active' && canApprove && (
            <button
              onClick={() => handleRenew(member.id)}
              disabled={isLoading === member.id}
              className="px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50"
            >
              Renouveler
            </button>
          )}
          {member.license_status === 'active' && !canApprove && allowRenewRequest && isExpiringSoon(member) && (
            <button
              onClick={() => handleRenew(member.id)}
              disabled={isLoading === member.id}
              className="px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50"
            >
              Demander renouvellement
            </button>
          )}
          <button
            onClick={() => router.push(`/modules/membres/${member.id}`)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voir le profil"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setActiveTab('players')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'players'
              ? 'bg-brand-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>🏒</span>
            <span>Joueurs de Club</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-black/10">
              {localPlayers.length}
            </span>
            {localPlayers.filter(m => m.license_status === 'pending_approval').length > 0 && (
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            )}
          </div>
        </button>
        {showAdherents && (
          <button
            onClick={() => setActiveTab('adherents')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'adherents'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span>Adhérents Libres</span>
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-black/10">
                {localAdherents.length}
              </span>
              {localAdherents.filter(m => m.license_status === 'pending_approval').length > 0 && (
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </div>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'
              }`}
            >
              En attente ({pendingList.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                statusFilter === 'active'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-green-600 border-green-200 hover:bg-green-50'
              }`}
            >
              Actives ({activeList.length})
            </button>
            <button
              onClick={() => setStatusFilter('invalid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                statusFilter === 'invalid'
                  ? 'bg-gray-700 text-white border-gray-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Rejetées / Expirées ({invalidList.length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                statusFilter === 'all'
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-brand-600 border-brand-200 hover:bg-brand-50'
              }`}
            >
              Toutes ({currentList.length})
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Club</th>
                <th className="px-4 py-3">Saison</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Expiration</th>
                <th className="px-4 py-3">Création</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(renderMemberRow)}
            </tbody>
          </table>
        </div>
        {currentList.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">{activeTab === 'players' ? '🏒' : '👤'}</span>
            <p className="mt-3 text-sm text-gray-500">
              Aucun {activeTab === 'players' ? 'joueur' : 'adhérent'} trouvé.
            </p>
          </div>
        )}
        {currentList.length > 0 && filteredList.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">Aucune licence pour ce filtre.</p>
          </div>
        )}
      </div>
    </div>
  );
}









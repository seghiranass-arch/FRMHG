"use client";

import { format, parseISO } from "date-fns";
import Image from "next/image";
import { fr } from "date-fns/locale";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { deleteEvent } from "./actions";
import { useState } from "react";
import { Trash2, Calendar, MapPin, Users, User, X } from "lucide-react";

type EventDetailsModalProps = {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  currentUserId?: string;
};

export function EventDetailsModal({ event, isOpen, onClose, isAdmin, currentUserId }: EventDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !event) return null;

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteEvent(event.id);
      if (result.error) {
        alert(result.error);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Failed to delete event", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = event.createdById === currentUserId;
  const canDelete = isAdmin || isOwner;

  // Determine variant based on type
  const isMatch = event.type === 'match';
  const badgeVariant = isMatch ? 'outline' : 'default';
  const badgeClass = isMatch 
    ? 'text-orange-600 border-orange-200 bg-orange-50' 
    : 'bg-blue-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{event.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <Badge variant={badgeVariant} className={badgeClass}>
                {isMatch ? 'Match' : 
                 event.type === 'meeting' ? 'Réunion' : 
                 event.type === 'stage' ? 'Stage' : 'Événement'}
              </Badge>
              {event.competitionName && (
                <span className="font-medium">{event.competitionName}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {isMatch && (
            <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white bg-white shadow-sm">
                    {event.homeLogo ? (
                      <Image src={`/api/documents/view?id=${event.homeLogo}`} alt={event.matchData?.homeTeamName || event.title} fill className="object-contain" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-orange-600">
                        {event.matchData?.homeTeamName?.substring(0, 1) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{event.matchData?.homeTeamName}</div>
                    <div className="text-xs text-gray-500">Domicile</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <div className="text-xs uppercase tracking-wide">vs</div>
                  <div className="text-[10px] font-semibold">{format(parseISO(event.startDate), "HH:mm")}</div>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0 text-right">
                    <div className="text-sm font-semibold text-gray-900 truncate">{event.matchData?.awayTeamName}</div>
                    <div className="text-xs text-gray-500">Extérieur</div>
                  </div>
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white bg-white shadow-sm">
                    {event.awayLogo ? (
                      <Image src={`/api/documents/view?id=${event.awayLogo}`} alt={event.matchData?.awayTeamName || event.title} fill className="object-contain" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-orange-600">
                        {event.matchData?.awayTeamName?.substring(0, 1) || "?"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium">
                  {format(parseISO(event.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                </div>
                <div className="text-sm text-gray-500">
                  {format(parseISO(event.startDate), "HH:mm")} - {format(parseISO(event.endDate), "HH:mm")}
                </div>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span>{event.location}</span>
              </div>
            )}

            {event.description && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {!isMatch && event.participants && event.participants.length > 0 && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>Participants ({event.participants.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.participants.map((p: any) => (
                    <span key={p.user.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {p.user.displayName || p.user.email}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Créé par {event.createdBy?.displayName || 'Système'}</span>
              </div>
            </div>
          </div>
        </div>

        {canDelete && !isMatch && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

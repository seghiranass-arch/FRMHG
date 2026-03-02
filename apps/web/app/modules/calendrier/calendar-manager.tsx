"use client";

import { useState } from "react";
import Image from "next/image";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CreateEventModal } from "./create-event-modal";
import { EventDetailsModal } from "./event-details-modal";
import { Event } from "./actions";

type CalendarManagerProps = {
  initialEvents: Event[];
  initialMatches: any[];
  users: any[];
  currentUser: any;
  isAdmin: boolean;
};

export function CalendarManager({ initialEvents, initialMatches, users, currentUser, isAdmin }: CalendarManagerProps) {
  const [view, setView] = useState<"month" | "list">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Normalize matches to event format for display
  const normalizedMatches = initialMatches.map(match => ({
    id: match.id,
    title: `${match.homeTeamName} vs ${match.awayTeamName}`,
    description: `Match de ${match.competitionName}`,
    startDate: match.date,
    endDate: match.date, // Matches are point-in-time usually, or duration based
    location: match.venue,
    type: "match",
    competitionName: match.competitionName,
    targetRoles: [],
    createdById: "system",
    createdBy: { displayName: "Système" },
    participants: [],
    isMatch: true,
    homeLogo: match.homeLogo,
    awayLogo: match.awayLogo,
    matchData: match
  }));

  const allEvents = [...initialEvents, ...normalizedMatches];

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return allEvents.filter(event => isSameDay(parseISO(event.startDate), day));
  };

  // Filter events for list view (sorted by date)
  const sortedEvents = [...allEvents].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[150px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Aujourd'hui
          </Button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${
                view === "month" ? "bg-white shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Mois</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${
                view === "list" ? "bg-white shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </button>
          </div>

          {isAdmin && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Créer</span>
            </Button>
          )}
        </div>
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700">
              {day}
            </div>
          ))}
          
          {/* Add empty cells for days before start of month if needed */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
            <div key={`empty-start-${i}`} className="bg-white min-h-[120px] p-2" />
          ))}

          {daysInMonth.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            const isTodayDate = isToday(day);

            return (
              <div 
                key={day.toString()} 
                className={`bg-white min-h-[120px] p-2 border-t hover:bg-gray-50 transition-colors ${
                  isTodayDate ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className={`text-right text-sm mb-1 ${
                  isTodayDate 
                    ? 'font-bold text-blue-600 bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center ml-auto' 
                    : 'text-gray-500'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.map((event: any) => (
                    <div 
                      key={event.id} 
                      onClick={() => setSelectedEvent(event)}
                      className={`text-xs p-1.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${
                        event.type === 'match' 
                          ? 'bg-orange-50 text-orange-700 border-orange-100' 
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.type === 'match' && (
                        <div className="mt-1 flex items-center justify-between gap-1 text-[10px] opacity-80">
                          <div className="flex items-center gap-1">
                            <div className="relative h-4 w-4 overflow-hidden rounded-full border border-orange-100 bg-white">
                              {event.homeLogo ? (
                                <Image src={`/api/documents/view?id=${event.homeLogo}`} alt={event.title} fill className="object-contain" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-orange-600">
                                  {event.matchData?.homeTeamName?.substring(0, 1) || "?"}
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] text-orange-400">vs</span>
                            <div className="relative h-4 w-4 overflow-hidden rounded-full border border-orange-100 bg-white">
                              {event.awayLogo ? (
                                <Image src={`/api/documents/view?id=${event.awayLogo}`} alt={event.title} fill className="object-contain" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-orange-600">
                                  {event.matchData?.awayTeamName?.substring(0, 1) || "?"}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>{format(parseISO(event.startDate), 'HH:mm')}</div>
                        </div>
                      )}
                      {event.type === 'match' && event.competitionName && (
                        <div className="mt-1 text-[10px] text-orange-500/80 truncate">
                          {event.competitionName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

           {/* Add empty cells for days after end of month if needed */}
           {Array.from({ length: (7 - (monthEnd.getDay() || 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="bg-white min-h-[120px] p-2" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              Aucun événement trouvé.
            </div>
          ) : (
            sortedEvents.map((event: any) => (
              <Card 
                key={event.id} 
                onClick={() => setSelectedEvent(event)}
                className="p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex-shrink-0 w-full sm:w-24 text-center sm:text-left">
                  <div className="text-sm font-semibold text-gray-500">
                    {format(parseISO(event.startDate), 'MMM', { locale: fr }).toUpperCase()}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {format(parseISO(event.startDate), 'dd')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {format(parseISO(event.startDate), 'HH:mm')}
                  </div>
                </div>
                
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={event.type === 'match' ? 'outline' : 'default'} className={
                      event.type === 'match' 
                        ? 'text-orange-600 border-orange-200 bg-orange-50' 
                        : 'bg-blue-600'
                    }>
                      {event.type === 'match' ? 'Match' : 
                       event.type === 'meeting' ? 'Réunion' : 
                       event.type === 'stage' ? 'Stage' : 'Événement'}
                    </Badge>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  </div>

                  {event.type === 'match' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                        <div className="relative h-6 w-6 overflow-hidden rounded-full border border-gray-200 bg-white">
                          {event.homeLogo ? (
                            <Image src={`/api/documents/view?id=${event.homeLogo}`} alt={event.matchData?.homeTeamName || event.title} fill className="object-contain" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-gray-500">
                              {event.matchData?.homeTeamName?.substring(0, 1) || "?"}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{event.matchData?.homeTeamName}</span>
                        </div>
                        <span className="text-gray-300">vs</span>
                        <div className="flex items-center gap-2">
                          <div className="relative h-6 w-6 overflow-hidden rounded-full border border-gray-200 bg-white">
                            {event.awayLogo ? (
                              <Image src={`/api/documents/view?id=${event.awayLogo}`} alt={event.matchData?.awayTeamName || event.title} fill className="object-contain" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-gray-500">
                                {event.matchData?.awayTeamName?.substring(0, 1) || "?"}
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{event.matchData?.awayTeamName}</span>
                        </div>
                      </div>
                      {event.competitionName && (
                        <div className="text-xs text-gray-500">{event.competitionName}</div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">{event.description}</p>
                  
                  {event.location && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                      <span className="font-medium">Lieu:</span> {event.location}
                    </div>
                  )}

                  {!event.isMatch && event.participants && event.participants.length > 0 && (
                     <div className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Participants:</span> {event.participants.length} personne(s)
                     </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {isAdmin && (
        <CreateEventModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          users={users}
        />
      )}

      <EventDetailsModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        isAdmin={isAdmin}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}

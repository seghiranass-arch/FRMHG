"use client";

import { useRouter } from "next/navigation";

export default function DashboardIndex() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="font-semibold text-amber-800">Backend non connecté</div>
        <div className="text-sm text-amber-700 mt-1">
          Sélectionnez un dashboard pour visualiser l'interface.
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button 
          onClick={() => router.push("/dashboard/federation")}
          className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg hover:border-red-300 transition-all"
        >
          <div className="text-lg font-bold text-gray-900">Fédération</div>
          <div className="text-sm text-gray-500 mt-2">
            Administration centrale, gestion des clubs, licences et finances.
          </div>
          <div className="mt-4 text-xs font-semibold text-red-600">federation_admin</div>
        </button>
        
        <button 
          onClick={() => router.push("/dashboard/club")}
          className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg hover:border-blue-300 transition-all"
        >
          <div className="text-lg font-bold text-gray-900">Club</div>
          <div className="text-sm text-gray-500 mt-2">
            Gestion des membres, licences et activités du club.
          </div>
          <div className="mt-4 text-xs font-semibold text-blue-600">club_admin</div>
        </button>
        
        <button 
          onClick={() => router.push("/dashboard/national")}
          className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg hover:border-purple-300 transition-all"
        >
          <div className="text-lg font-bold text-gray-900">Équipe Nationale</div>
          <div className="text-sm text-gray-500 mt-2">
            Direction technique nationale, sélections et compétitions.
          </div>
          <div className="mt-4 text-xs font-semibold text-purple-600">dtn</div>
        </button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <button 
          onClick={() => router.push("/modules/membres")}
          className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-lg transition-all"
        >
          <div className="font-bold text-gray-900">Membres</div>
          <div className="text-sm text-gray-500 mt-1">Liste des membres et licences</div>
        </button>
        
        <button 
          onClick={() => router.push("/modules/sport")}
          className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-lg transition-all"
        >
          <div className="font-bold text-gray-900">Sport</div>
          <div className="text-sm text-gray-500 mt-1">Compétitions et matchs</div>
        </button>
        
        <button 
          onClick={() => router.push("/modules/finance")}
          className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-lg transition-all"
        >
          <div className="font-bold text-gray-900">Finance</div>
          <div className="text-sm text-gray-500 mt-1">Gestion financière</div>
        </button>
        
        <button 
          onClick={() => router.push("/modules/materiel")}
          className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-lg transition-all"
        >
          <div className="font-bold text-gray-900">Matériel</div>
          <div className="text-sm text-gray-500 mt-1">Inventaire et équipements</div>
        </button>
      </div>
    </div>
  );
}

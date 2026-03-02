"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Club = {
  id: string;
  name: string;
};

type Season = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export default function NouveauMembrePage() {
  const router = useRouter();
  
  // Redirect to adherent form by default (maintaining backward compatibility)
  React.useEffect(() => {
    router.replace("/modules/membres/nouveau/adherent");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Redirection...</p>
      </div>
    </div>
  );
}

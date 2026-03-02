"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./actions";
import { useRouter } from "next/navigation";

export function ProfileForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile(user.id, formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error as string });
      } else {
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-theme-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Informations du compte</h2>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            disabled
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-gray-500">L'adresse email ne peut pas être modifiée.</p>
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom d'affichage
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            defaultValue={user.displayName}
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            placeholder="Votre nom complet"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}

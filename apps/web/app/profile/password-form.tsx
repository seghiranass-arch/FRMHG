"use client";

import { useState, useTransition, useRef } from "react";
import { changePassword } from "./actions";

export function PasswordForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await changePassword(user.id, formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error as string });
      } else {
        setMessage({ type: "success", text: "Mot de passe modifié avec succès" });
        formRef.current?.reset();
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-theme-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Changer le mot de passe</h2>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            placeholder="Minimum 6 caractères"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            placeholder="Répétez le mot de passe"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </div>
      </form>
    </div>
  );
}

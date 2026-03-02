"use client";

import * as React from "react";

interface EditSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: {
    name: string;
    label: string;
    type: "text" | "number" | "textarea" | "select";
    defaultValue?: any;
    required?: boolean;
    step?: string;
    options?: { value: string; label: string }[];
  }[];
  onSubmit: (formData: FormData) => Promise<void>;
}

export function EditSettingsModal({ isOpen, onClose, title, fields, onSubmit }: EditSettingsModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  defaultValue={field.defaultValue}
                  required={field.required}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  defaultValue={field.defaultValue}
                  required={field.required}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Sélectionner</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  type={field.type}
                  defaultValue={field.defaultValue}
                  required={field.required}
                  step={field.step}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModulePage } from "../../../../components/layout/page-wrapper";

type Organization = {
  id: string;
  name: string;
  acronym: string;
};

export default function NouvelArticlePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const ownerOrgLabel = "Fédération Royale Marocaine de Hockey sur Glace";

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const organizationsRes = await fetch('/api/orgs');
        if (organizationsRes.ok) {
          const orgs = await organizationsRes.json();
          setOrganizations(orgs);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchOrganizations();
  }, []);

  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    quantity: 1,
    min_quantity: 0,
    condition: 'new',
    location: 'federation',
    owner_org_id: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'min_quantity' 
        ? value === '' ? '' : Number(value)
        : value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoError(null);
    if (!file) {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError("Le fichier doit être une image.");
      e.target.value = '';
      return;
    }
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (!organizations.length) return;
    const targetOrg = organizations.find(org =>
      org.name.trim().toLowerCase() === ownerOrgLabel.trim().toLowerCase()
    );
    if (targetOrg) {
      setFormData(prev => ({ ...prev, owner_org_id: targetOrg.id }));
    }
  }, [organizations, ownerOrgLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('frmhg_token='))
        ?.split('=')[1];

      let photoDocumentId: string | undefined;
      if (photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('file', photoFile);
        photoFormData.append('type', 'photo');
        photoFormData.append('description', formData.name || 'Photo article matériel');

        const uploadRes = await fetch('/api/documents/upload', {
          method: 'POST',
          body: photoFormData,
          credentials: 'include',
        });

        if (!uploadRes.ok) {
          const uploadErrorText = await uploadRes.text();
          throw new Error(uploadErrorText || "Erreur lors de l'upload de la photo");
        }

        const uploadData = await uploadRes.json();
        photoDocumentId = uploadData.id;
      }

      const payload: any = {
        ...formData
      };
      if (!payload.owner_org_id) {
        delete payload.owner_org_id;
      }
      if (photoDocumentId) {
        payload.photo_document_id = photoDocumentId;
      }

      const response = await fetch('/api/equipment/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'article');
      }

      const result = await response.json();
      router.push('/modules/materiel?created=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nouvel Article</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ajouter un nouvel article à l'inventaire
          </p>
        </div>
        <Link
          href="/modules/materiel"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations générales */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations Générales</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'article <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Ex: Maillot de hockey"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence ou numéro de série
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Ex: MHK-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité initiale <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Description détaillée de l'article..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo de l'article
            </label>
            <div className="flex flex-col gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
                />
                <span className="text-xs text-gray-500">
                  Formats acceptés: JPG, PNG, WEBP, AVIF
                </span>
              </div>
              {photoError && (
                <div className="text-sm text-red-600">{photoError}</div>
              )}
              {photoPreview && (
                <div className="flex items-center gap-4">
                  <img
                    src={photoPreview}
                    alt="Aperçu"
                    className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (photoPreview) {
                        URL.revokeObjectURL(photoPreview);
                      }
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    Retirer la photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="md:col-span-2 pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité minimale (seuil d'alerte)
            </label>
            <input
              type="number"
              name="min_quantity"
              value={formData.min_quantity}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              État <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="new">Neuf</option>
              <option value="good">Bon</option>
              <option value="used">Usé</option>
              <option value="damaged">Endommagé</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation <span className="text-red-500">*</span>
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="federation">Fédération</option>
              <option value="warehouse">Entrepôt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisation propriétaire
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {ownerOrgLabel}
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2 pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes complémentaires
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Informations supplémentaires..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/modules/materiel"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer l'article
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

// Constantes pour les données
const MOROCCAN_REGIONS = [
  "Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakech-Safi", "Fès-Meknès",
  "Tanger-Tétouan-Al Hoceïma", "Oriental", "Béni Mellal-Khénifra",
  "Drâa-Tafilalet", "Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab"
];
const MOROCCAN_CITIES: Record<string, string[]> = {
  "Casablanca-Settat": [
    "Casablanca", "Mohammedia", "Settat", "El Jadida", "Benslimane", "Berrechid",
    "Sidi Bennour", "Nouaceur", "Médiouna", "Azemmour", "Oualidia"
  ],
  "Rabat-Salé-Kénitra": [
    "Rabat", "Salé", "Kénitra", "Témara", "Skhirate", "Sidi Kacem",
    "Sidi Slimane", "Khémisset", "Mehdia"
  ],
  "Marrakech-Safi": [
    "Marrakech", "Safi", "Essaouira", "Chichaoua", "El Kelaâ des Sraghna",
    "Rehamna", "Youssoufia", "Al Haouz"
  ],
  "Fès-Meknès": [
    "Fès", "Meknès", "Sefrou", "Ifrane", "El Hajeb", "Taza",
    "Taounate", "Boulemane", "Moulay Yacoub"
  ],
  "Tanger-Tétouan-Al Hoceïma": [
    "Tanger", "Tétouan", "Al Hoceïma", "Chefchaouen", "Larache",
    "Ksar El Kébir", "Assilah", "M'diq", "Fnideq"
  ],
  "Oriental": [
    "Oujda", "Nador", "Berkane", "Taourirt", "Jerada",
    "Guercif", "Driouch", "Figuig", "Saidia"
  ],
  "Béni Mellal-Khénifra": [
    "Béni Mellal", "Khénifra", "Fquih Ben Salah", "Azilal",
    "Khouribga", "Beni Amir", "Oued Zem"
  ],
  "Drâa-Tafilalet": [
    "Errachidia", "Ouarzazate", "Tinghir", "Zagora",
    "Midelt", "Rissani", "Merzouga"
  ],
  "Souss-Massa": [
    "Agadir", "Inezgane", "Aït Melloul", "Taroudant",
    "Tiznit", "Chtouka Aït Baha", "Tata"
  ],
  "Guelmim-Oued Noun": [
    "Guelmim", "Tan-Tan", "Sidi Ifni", "Assa-Zag"
  ],
  "Laâyoune-Sakia El Hamra": [
    "Laâyoune", "Es-Semara", "Boujdour", "Tarfaya"
  ],
  "Dakhla-Oued Ed-Dahab": [
    "Dakhla", "Aousserd", "Bir Anzarane"
  ]
};
const SPORT_CATEGORIES = ["U7", "U9", "U11", "U13", "U15", "U17", "U20", "Seniors"];
const DISCIPLINES = ["Hockey sur glace", "Roller hockey", "Hockey en ligne"];
const DOCUMENT_TYPES = [
  { key: "statutes", label: "Statuts du club" },
  { key: "legal_receipt", label: "Récépissé légal" },
  { key: "bank_certificate", label: "Attestation bancaire (RIB)" },
  { key: "insurance", label: "Assurance du club" },
  { key: "ag_pv", label: "PV d'Assemblée Générale" },
  { key: "other", label: "Autre document" },
];

export interface ClubFormData {
  // Informations générales
  name: string;
  acronym: string;
  type: "club" | "national_team";
  establishmentDate: string;
  federalRegistrationNumber: string;
  referenceSeason: string;

  // Informations administratives
  region: string;
  city: string;
  fullAddress: string;
  primaryPhone: string;
  officialEmail: string;
  website: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };

  // Responsables & contacts
  presidentName: string;
  secretaryGeneralName: string;
  treasurerName: string;
  primaryContactName: string;
  primaryContactPhone: string;

  // Paramètres sportifs
  activeCategories: string[];
  practicedDisciplines: string[];
  clubColors: {
    primary: string;
    secondary: string;
  };
  logoDocumentId?: string;

  // Paramètres financiers
  ribIban: string;

  // Validation & statut (lecture seule)
  status?: "pending" | "active" | "suspended" | "archived";
  validationDate?: string;
  validatedBy?: string;
  rejectionReason?: string;
  suspensionReason?: string;

  // Champs système (lecture seule)
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  archived?: boolean;
}

export interface ClubDocument {
  id: string;
  documentType: string;
  documentId: string;
  filename?: string;
  description?: string;
  documentDate?: string;
  createdAt?: string;
}

interface ClubFormProps {
  initialData?: Partial<ClubFormData>;
  documents?: ClubDocument[];
  disciplines?: { id: string; name: string; is_active: boolean }[];
  onSubmit: (data: ClubFormData) => Promise<void>;
  onUploadDocument?: (file: File, documentType: string, description?: string, documentDate?: string) => Promise<void>;
  onDeleteDocument?: (documentId: string) => Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
  clubId?: string;
}

export default function ClubForm({ 
  initialData, 
  documents = [], 
  disciplines = [],
  onSubmit, 
  onUploadDocument,
  onDeleteDocument,
  isLoading = false, 
  isEditing = false,
  clubId 
}: ClubFormProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState<ClubFormData>({
    name: initialData?.name || "",
    acronym: initialData?.acronym || "",
    type: initialData?.type || "club",
    establishmentDate: initialData?.establishmentDate || "",
    federalRegistrationNumber: initialData?.federalRegistrationNumber || "",
    referenceSeason: initialData?.referenceSeason || "",
    region: initialData?.region || "",
    city: initialData?.city || "",
    fullAddress: initialData?.fullAddress || "",
    primaryPhone: initialData?.primaryPhone || "",
    officialEmail: initialData?.officialEmail || "",
    website: initialData?.website || "",
    socialMedia: initialData?.socialMedia || {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
    },
    presidentName: initialData?.presidentName || "",
    secretaryGeneralName: initialData?.secretaryGeneralName || "",
    treasurerName: initialData?.treasurerName || "",
    primaryContactName: initialData?.primaryContactName || "",
    primaryContactPhone: initialData?.primaryContactPhone || "",
    activeCategories: initialData?.activeCategories || [],
    practicedDisciplines: initialData?.practicedDisciplines || [],
    clubColors: initialData?.clubColors || {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
    logoDocumentId: initialData?.logoDocumentId,
    ribIban: initialData?.ribIban || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [cities, setCities] = React.useState<string[]>([]);
  const [logoPreview, setLogoPreview] = React.useState<string>("");
  
  // State for document upload details
  const [uploadingDoc, setUploadingDoc] = React.useState<{
    file: File;
    type: string;
    label: string;
    description: string;
    date: string;
  } | null>(null);

  const isValidUrl = (string: string): boolean => {
    try {
      // If the URL doesn't start with http/https, try adding https://
      let urlToTest = string;
      if (!string.startsWith('http://') && !string.startsWith('https://')) {
        urlToTest = 'https://' + string;
      }
      
      const url = new URL(urlToTest);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // Charger le logo existant si disponible
  React.useEffect(() => {
    if (initialData?.logoDocumentId && !logoPreview) {
      setLogoPreview(`/api/documents/view?id=${initialData.logoDocumentId}`);
    }
  }, [initialData?.logoDocumentId, logoPreview]);

  // Villes selon la région
  React.useEffect(() => {
    if (formData.region) {
      setCities(MOROCCAN_CITIES[formData.region] || []);
    } else {
      setCities([]);
    }
  }, [formData.region]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof ClubFormData] as any, [field]: value }
    }));
  };

  const toggleArrayField = (field: 'activeCategories' | 'practicedDisciplines', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData("logoFile", file);
      setErrors(prev => ({ ...prev, logo: "" }));

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Le nom du club est requis";
    if (!formData.region) newErrors.region = "La région est requise";
    if (!formData.city) newErrors.city = "La ville est requise";
    if (formData.region && formData.city && !MOROCCAN_CITIES[formData.region]?.includes(formData.city)) {
      newErrors.city = "La ville sélectionnée ne correspond pas à la région";
    }

    // Validation email (now optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.officialEmail && !emailRegex.test(formData.officialEmail)) {
      newErrors.officialEmail = "Format d'email invalide";
    }

    // Validation téléphone marocain
    const phoneRegex = /^(\+212|0)[5-7]\d{8}$/;
    if (formData.primaryPhone && !phoneRegex.test(formData.primaryPhone)) {
      newErrors.primaryPhone = "Format de téléphone invalide (ex: +2126XXXXXXXX ou 06XXXXXXXX)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let logoDocumentId: string | undefined;

      // Upload du logo si présent
      if ((formData as any).logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', (formData as any).logoFile);
        if (isEditing && clubId) {
          logoFormData.append('orgId', clubId);
        }

        const uploadRes = await fetch('/api/documents/upload', {
          method: 'POST',
          body: logoFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          logoDocumentId = uploadData.id;
        } else {
          console.error('Logo upload failed:', uploadRes.status, await uploadRes.text());
        }
      }

      console.log("Données brutes du formulaire:", formData);
      console.log("logoDocumentId:", logoDocumentId);

      // Nettoyer les données avant envoi
      const cleanData: any = { ...formData };

      // Remove frontend-only fields that don't exist in the database
      delete (cleanData as any).logoFile;

      console.log("Données après copie:", cleanData);

      // Include logoDocumentId in the creation request if available
      console.log("logoDocumentId sera inclus dans la requête de création:", logoDocumentId);

      // Nettoyer les champs vides des réseaux sociaux
      if (cleanData.socialMedia) {
        console.log("socialMedia avant nettoyage:", cleanData.socialMedia);
        const cleanedSocialMedia: {
          facebook?: string;
          instagram?: string;
          twitter?: string;
          youtube?: string;
        } = {};
        
        // Only add social media fields if they are non-empty and valid URLs
        if (cleanData.socialMedia.facebook?.trim()) {
          let fbUrl = cleanData.socialMedia.facebook.trim();
          if (!fbUrl.startsWith('http://') && !fbUrl.startsWith('https://')) {
            fbUrl = 'https://' + fbUrl;
          }
          if (isValidUrl(fbUrl)) {
            cleanedSocialMedia.facebook = fbUrl;
          }
        }
        
        if (cleanData.socialMedia.instagram?.trim()) {
          let igUrl = cleanData.socialMedia.instagram.trim();
          if (!igUrl.startsWith('http://') && !igUrl.startsWith('https://')) {
            igUrl = 'https://' + igUrl;
          }
          if (isValidUrl(igUrl)) {
            cleanedSocialMedia.instagram = igUrl;
          }
        }
        
        if (cleanData.socialMedia.twitter?.trim()) {
          let twUrl = cleanData.socialMedia.twitter.trim();
          if (!twUrl.startsWith('http://') && !twUrl.startsWith('https://')) {
            twUrl = 'https://' + twUrl;
          }
          if (isValidUrl(twUrl)) {
            cleanedSocialMedia.twitter = twUrl;
          }
        }
        
        if (cleanData.socialMedia.youtube?.trim()) {
          let ytUrl = cleanData.socialMedia.youtube.trim();
          if (!ytUrl.startsWith('http://') && !ytUrl.startsWith('https://')) {
            ytUrl = 'https://' + ytUrl;
          }
          if (isValidUrl(ytUrl)) {
            cleanedSocialMedia.youtube = ytUrl;
          }
        }
        
        // Only include socialMedia if at least one valid URL exists
        if (Object.keys(cleanedSocialMedia).length > 0) {
          cleanData.socialMedia = cleanedSocialMedia;
        } else {
          delete cleanData.socialMedia;
        }
      }

      // Nettoyer les autres champs vides
      Object.keys(cleanData).forEach(key => {
        const value = cleanData[key];
        if (value === "" || value === null || value === undefined) {
          console.log(`Suppression de ${key} car vide/null/undefined:`, value);
          delete cleanData[key];
        }
      });

      // Include logoDocumentId if available
      if (logoDocumentId) {
        console.log("Adding logoDocumentId to cleanData:", logoDocumentId);
        cleanData.logoDocumentId = logoDocumentId;
      } else {
        console.log("No logoDocumentId to add");
      }

      console.log("Données nettoyées envoyées à l'API:", cleanData);
      console.log("logoDocumentId in cleanData:", cleanData.logoDocumentId);

      // Submit the club data with logo included
      await onSubmit(cleanData);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-screen-2xl mx-auto p-6">
      {/* Layout responsive : 2 colonnes sur desktop, 1 colonne sur mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne gauche */}
        <div className="space-y-6">
          {/* Logo du club - Premier élément */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Logo du club</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Téléverser le logo
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-500 transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain rounded"
                    />
                  ) : formData.logoDocumentId ? (
                    <img
                      src={`/api/documents/view?id=${formData.logoDocumentId}`}
                      alt="Logo existant"
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        // If there's an error loading the logo, show the default icon
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const svgElement = parent.querySelector('svg');
                          if (svgElement && svgElement.parentElement && svgElement.parentElement.parentElement) {
                            svgElement.parentElement.parentElement.style.display = 'flex';
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 group-hover:text-brand-500 mx-auto mb-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-xs text-gray-500 group-hover:text-brand-600 font-medium transition-colors">Logo</span>
                    </div>
                  )}
                </label>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">Spécifications</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• JPG, PNG, GIF (max 5MB)</li>
                      <li>• Résolution recommandée: 512x512px</li>
                    </ul>
                  </div>
                  {(formData as any).logoFile && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-xs text-green-800 font-medium">
                        ✅ {(formData as any).logoFile.name}
                      </p>
                    </div>
                  )}
                  {errors.logo && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-800">❌ {errors.logo}</p>
                    </div>
                  )}
                  {formData.logoDocumentId && !logoPreview && !((formData as any).logoFile) && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs text-blue-800 font-medium">
                        ✅ Logo existant enregistré
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations générales - Colonne gauche */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Informations générales</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du club *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.name ? "border-error-500" : "border-gray-200"
                  }`}
                  placeholder="Club Sportif Example"
                />
                {errors.name && <p className="mt-1 text-sm text-error-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acronyme / Sigle
                </label>
                <input
                  type="text"
                  value={formData.acronym}
                  onChange={(e) => updateFormData("acronym", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="CSE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de création
                </label>
                <input
                  type="date"
                  value={formData.establishmentDate ? formData.establishmentDate.split('T')[0] : ''}
                  onChange={(e) => updateFormData("establishmentDate", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro d'agrément fédéral
                </label>
                <input
                  type="text"
                  value={formData.federalRegistrationNumber}
                  onChange={(e) => updateFormData("federalRegistrationNumber", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="FRM-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saison de référence
                </label>
                <input
                  type="text"
                  value={formData.referenceSeason}
                  onChange={(e) => updateFormData("referenceSeason", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="2024-2025"
                />
              </div>
            </div>
          </div>

          {/* Informations administratives - Colonne gauche */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Informations administratives</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => updateFormData("region", e.target.value)}
                  className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.region ? "border-error-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Sélectionner une région</option>
                  {MOROCCAN_REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                {errors.region && <p className="mt-1 text-sm text-error-500">{errors.region}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  disabled={!formData.region}
                  className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.city ? "border-error-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Sélectionner une ville</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-sm text-error-500">{errors.city}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète
                </label>
                <textarea
                  value={formData.fullAddress}
                  onChange={(e) => updateFormData("fullAddress", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Adresse complète du club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone principal
                </label>
                <input
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => updateFormData("primaryPhone", e.target.value)}
                  className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.primaryPhone ? "border-error-500" : "border-gray-200"
                  }`}
                  placeholder="+2126XXXXXXXX"
                />
                {errors.primaryPhone && <p className="mt-1 text-sm text-error-500">{errors.primaryPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email officiel
                </label>
                <input
                  type="email"
                  value={formData.officialEmail}
                  onChange={(e) => updateFormData("officialEmail", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="contact@club.ma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData("website", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="https://www.club.ma"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Colonne droite */}
        <div className="space-y-6">

          {/* Responsables & contacts - Colonne droite */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Responsables & contacts</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Président du club
                </label>
                <input
                  type="text"
                  value={formData.presidentName}
                  onChange={(e) => updateFormData("presidentName", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Prénom NOM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secrétaire général
                </label>
                <input
                  type="text"
                  value={formData.secretaryGeneralName}
                  onChange={(e) => updateFormData("secretaryGeneralName", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Prénom NOM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trésorier
                </label>
                <input
                  type="text"
                  value={formData.treasurerName}
                  onChange={(e) => updateFormData("treasurerName", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Prénom NOM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact administratif principal
                </label>
                <input
                  type="text"
                  value={formData.primaryContactName}
                  onChange={(e) => updateFormData("primaryContactName", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Prénom NOM"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone du contact
                </label>
                <input
                  type="tel"
                  value={formData.primaryContactPhone}
                  onChange={(e) => updateFormData("primaryContactPhone", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="+2126XXXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Paramètres sportifs - Colonne droite */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Paramètres sportifs</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Disciplines pratiquées
              </label>
              {disciplines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {disciplines.filter(d => d.is_active).map(d => (
                    <label key={d.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.practicedDisciplines.includes(d.name)}
                        onChange={() => toggleArrayField("practicedDisciplines", d.name)}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{d.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Aucune discipline disponible</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Couleurs du club
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Primaire:</label>
                  <input
                    type="color"
                    value={formData.clubColors.primary}
                    onChange={(e) => updateNestedField("clubColors", "primary", e.target.value)}
                    className="h-10 w-16 border border-gray-200 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Secondaire:</label>
                  <input
                    type="color"
                    value={formData.clubColors.secondary}
                    onChange={(e) => updateNestedField("clubColors", "secondary", e.target.value)}
                    className="h-10 w-16 border border-gray-200 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Réseaux sociaux - Colonne droite */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Réseaux sociaux</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => updateNestedField("socialMedia", "facebook", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="https://facebook.com/club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => updateNestedField("socialMedia", "instagram", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="https://instagram.com/club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => updateNestedField("socialMedia", "twitter", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="https://twitter.com/club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.youtube}
                  onChange={(e) => updateNestedField("socialMedia", "youtube", e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="https://youtube.com/club"
                />
              </div>
            </div>
          </div>

          {/* Paramètres financiers - Colonne droite */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Paramètres financiers</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RIB / IBAN
              </label>
              <input
                type="text"
                value={formData.ribIban}
                onChange={(e) => updateFormData("ribIban", e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="MA6400390000000000000000000"
              />
            </div>
          </div>

          {/* Documents administratifs - Colonne droite */}
          {isEditing && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents administratifs
              </h3>
              
              {/* Liste des types de documents avec historique */}
              <div className="space-y-4">
                {DOCUMENT_TYPES.map((docType) => {
                  // Récupérer TOUS les documents de ce type (historique)
                  const docsOfType = documents.filter(d => d.documentType === docType.key);
                  
                  return (
                    <div key={docType.key} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* En-tête du type de document */}
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${docsOfType.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm font-medium text-gray-800">{docType.label}</span>
                          {docsOfType.length > 0 && (
                            <span className="text-xs text-gray-500">({docsOfType.length} document{docsOfType.length > 1 ? 's' : ''})</span>
                          )}
                        </div>
                        
                        {/* Bouton pour ajouter un nouveau document */}
                        <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingDoc({
                                  file,
                                  type: docType.key,
                                  label: docType.label,
                                  description: file.name.split('.')[0],
                                  date: new Date().toISOString().split('T')[0]
                                });
                                e.target.value = '';
                              }
                            }}
                          />
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Ajouter
                        </label>
                      </div>
                      
                      {/* Liste des documents de ce type */}
                      {docsOfType.length > 0 && (
                        <div className="divide-y divide-gray-100">
                          {docsOfType.map((doc, index) => (
                            <div key={doc.id} className="px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {doc.description || doc.filename || `Document ${index + 1}`}
                                  </p>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    {doc.documentDate && (
                                      <span>Date: {new Date(doc.documentDate).toLocaleDateString('fr-FR')}</span>
                                    )}
                                    {doc.createdAt && (
                                      <span>• Ajouté le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <a
                                  href={`/api/documents/${doc.documentId}/download`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                  title="Télécharger"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                                {onDeleteDocument && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteDocument(doc.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message si aucun document */}
                      {docsOfType.length === 0 && (
                        <div className="px-4 py-3 text-center text-sm text-gray-500">
                          Aucun document de ce type
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 10 MB). Vous pouvez ajouter plusieurs documents du même type pour garder un historique.
              </p>
            </div>
          )}

          {/* Validation & Statut - Colonne droite (lecture seule) */}
          {isEditing && initialData?.status && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Validation & Statut
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Statut du club</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    initialData.status === 'active' ? 'bg-green-100 text-green-800' :
                    initialData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    initialData.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {initialData.status === 'active' ? 'Actif' :
                     initialData.status === 'pending' ? 'En attente' :
                     initialData.status === 'suspended' ? 'Suspendu' : 'Archivé'}
                  </span>
                </div>

                {initialData.validationDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date de validation</label>
                    <p className="text-sm text-gray-800">{new Date(initialData.validationDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}

                {initialData.validatedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Validé par</label>
                    <p className="text-sm text-gray-800">{initialData.validatedBy}</p>
                  </div>
                )}

                {initialData.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Motif de refus</label>
                    <p className="text-sm text-red-600">{initialData.rejectionReason}</p>
                  </div>
                )}

                {initialData.suspensionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Motif de suspension</label>
                    <p className="text-sm text-red-600">{initialData.suspensionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Champs système - Colonne droite (lecture seule) */}
          {isEditing && initialData?.createdAt && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-lg font-semibold text-gray-600 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Champs système
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date de création</label>
                  <p className="text-gray-700">{new Date(initialData.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                {initialData.updatedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dernière mise à jour</label>
                    <p className="text-gray-700">{new Date(initialData.updatedAt).toLocaleString('fr-FR')}</p>
                  </div>
                )}
                {initialData.createdBy && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Créé par</label>
                    <p className="text-gray-700">{initialData.createdBy}</p>
                  </div>
                )}
                {initialData.updatedBy && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Modifié par</label>
                    <p className="text-gray-700">{initialData.updatedBy}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Archivé</label>
                  <p className="text-gray-700">{initialData.archived ? 'Oui' : 'Non'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-6 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500/20 transition-all duration-200"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 text-base font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50 focus:ring-2 focus:ring-brand-500/20 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Création en cours...</span>
            </span>
          ) : isEditing ? "Modifier le club" : "Créer le club"}
        </button>
      </div>

      {/* Modal d'upload de document */}
      {uploadingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Détails du document</h3>
              <button 
                onClick={() => setUploadingDoc(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Fichier sélectionné</p>
                <p className="text-sm text-gray-800 font-medium truncate bg-gray-50 px-3 py-2 rounded-lg">
                  {uploadingDoc.file.name}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de document
                </label>
                <p className="text-sm text-gray-800 font-medium px-3 py-2 bg-brand-50 text-brand-700 rounded-lg">
                  {uploadingDoc.label}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre / Description
                </label>
                <input
                  type="text"
                  value={uploadingDoc.description}
                  onChange={(e) => setUploadingDoc({ ...uploadingDoc, description: e.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Ex: Statuts signés 2025"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du document
                </label>
                <input
                  type="date"
                  value={uploadingDoc.date}
                  onChange={(e) => setUploadingDoc({ ...uploadingDoc, date: e.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setUploadingDoc(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (onUploadDocument && uploadingDoc) {
                    const { file, type, description, date } = uploadingDoc;
                    setUploadingDoc(null);
                    await onUploadDocument(file, type, description, date);
                  }
                }}
                className="px-6 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-md transition-all"
              >
                Confirmer l'envoi
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

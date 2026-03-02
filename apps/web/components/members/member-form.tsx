"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, hasAnyRole } from "../../lib/client-auth";

// ============================================
// CONSTANTS
// ============================================

const MOROCCAN_REGIONS = [
  "Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakech-Safi", "Fès-Meknès",
  "Tanger-Tétouan-Al Hoceïma", "Oriental", "Béni Mellal-Khénifra",
  "Drâa-Tafilalet", "Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab"
];

const NATIONALITIES = [
  "Marocaine", "Française", "Espagnole", "Américaine", "Canadienne", 
  "Belge", "Suisse", "Algérienne", "Tunisienne", "Autre"
];

const HOCKEY_POSITIONS = [
  { id: "goalkeeper", name: "Gardien de but", icon: "🥅" },
  { id: "left_defense", name: "Défenseur gauche", icon: "🛡️" },
  { id: "right_defense", name: "Défenseur droit", icon: "🛡️" },
  { id: "center", name: "Centre", icon: "🏒" },
  { id: "left_wing", name: "Ailier gauche", icon: "⬅️" },
  { id: "right_wing", name: "Ailier droit", icon: "➡️" },
];

const SUBSCRIPTION_TYPES = [
  { id: "annual", name: "Abonnement annuel", price: 1500 },
  { id: "semester", name: "Abonnement semestriel", price: 900 },
  { id: "monthly", name: "Abonnement mensuel", price: 200 },
  { id: "free_session", name: "Séance libre", price: 100 },
];

const PAYMENT_METHODS = [
  { id: "bank_transfer", name: "Virement bancaire" },
  { id: "cash", name: "Espèces" },
  { id: "check", name: "Chèque" },
  { id: "card", name: "Carte bancaire" },
];

const MEMBER_DOCUMENT_TYPES = [
  { key: "id_card", label: "Pièce d'identité (CIN/Passeport)" },
  { key: "id_photo", label: "Photo d'identité" },
  { key: "parental_auth", label: "Autorisation parentale" },
  { key: "medical_cert", label: "Certificat médical" },
  { key: "other", label: "Autre document" },
];

const MEDICAL_STATUS = [
  { id: "pending", name: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { id: "fit", name: "Apte", color: "bg-green-100 text-green-800" },
  { id: "unfit", name: "Inapte", color: "bg-red-100 text-red-800" },
  { id: "conditional", name: "Apte sous conditions", color: "bg-orange-100 text-orange-800" },
];

const TABS = [
  { id: "profile", label: "Profil", icon: "📷" },
  { id: "sports", label: "Sportif", icon: "🏒" },
  { id: "club", label: "Club", icon: "🏟️" },
  { id: "subscription", label: "Abonnement", icon: "💳" },
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "medical", label: "Médical", icon: "🩺" },
  { id: "license", label: "Licence", icon: "🎫" },
  { id: "status", label: "Suivi", icon: "🔔" },
];

// ============================================
// TYPES
// ============================================

export interface MemberFormData {
  // Tab 1 - Profile & Personal Info
  profilePhotoId?: string;
  memberNumber?: string; // Auto-generated
  firstName: string;
  lastName: string;
  sex: "M" | "F" | "";
  dateOfBirth: string;
  nationality: string;
  idNumber: string; // CIN or Passport
  idType: "cin" | "passport";
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Tab 2 - Sports Info
  discipline: string;
  ageCategory: string;
  positions: string[];
  jerseyNumber?: string;

  // Tab 3 - Club Assignment
  memberStatus: "adherent" | "club_player";
  assignedClubId?: string;
  assignmentStartDate?: string;
  assignmentEndDate?: string;

  // Tab 4 - Subscription (if adherent)
  subscriptionType?: string;
  seasonId?: string;
  subscriptionAmount?: number;
  paymentMethod?: string;
  paymentStatus?: "pending" | "paid" | "overdue";
  paymentDate?: string;
  paymentReference?: string;

  // Tab 6 - Medical
  medicalStatus?: string;
  lastMedicalVisitDate?: string;
  federationDoctor?: string;
  medicalFitness?: string;
  fitnessExpirationDate?: string;
  medicalCertificateId?: string;

  // Tab 7 - License
  licenseNumber?: string;
  licenseSeason?: string;
  licenseType?: string;
  licenseStatus?: "draft" | "pending_payment" | "pending_approval" | "active" | "archived";
  licenseIssueDate?: string;
  licenseExpirationDate?: string;

  // Tab 8 - Status & Follow-up
  status?: "active" | "inactive" | "suspended" | "archived";
  registrationDate?: string;
  lastUpdated?: string;
  createdBy?: string;

  // System fields
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClubAssignment {
  id: string;
  clubId: string;
  clubName: string;
  startDate: string;
  endDate?: string;
  status: "active" | "ended";
}

export interface MedicalVisit {
  id: string;
  date: string;
  doctor: string;
  type: string;
  result: string;
  notes?: string;
  reportDocumentId?: string;
}

export interface MemberDocument {
  id: string;
  documentType: string;
  documentId: string;
  filename?: string;
  uploadedAt?: string;
}

export interface AuditAction {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

interface Club {
  id: string;
  name: string;
  logoDocumentId?: string;
  logo_document_id?: string;
}

interface Season {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface Discipline {
  id: string;
  name: string;
  is_active: boolean;
  isActive?: boolean;
}

interface ManagedSubscriptionType {
  id: string;
  name: string;
  amount_cents: number;
  duration_months: number | null;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  min_age: number;
  max_age: number | null;
  gender?: string | null;
  is_active: boolean;
}

interface MemberFormProps {
  initialData?: Partial<MemberFormData>;
  documents?: MemberDocument[];
  assignments?: ClubAssignment[];
  medicalVisits?: MedicalVisit[];
  auditHistory?: AuditAction[];
  clubs?: Club[];
  seasons?: Season[];
  disciplines?: Discipline[];
  subscriptionTypes?: ManagedSubscriptionType[];
  categories?: Category[];
  onSubmit: (data: MemberFormData) => Promise<any>;
  onUploadDocument?: (file: File, documentType: string) => Promise<void>;
  onDeleteDocument?: (documentId: string) => Promise<void>;
  onGenerateLicense?: () => Promise<void>;
  onGenerateReceipt?: () => Promise<void>;
  onProfilePhotoUpdated?: (documentId: string) => void;
  isLoading?: boolean;
  isEditing?: boolean;
  memberId?: string;
  canAccessMedical?: boolean;
  hideMemberStatusSelection?: boolean; // Hide member status radio buttons
  hiddenTabs?: string[]; // Tabs to hide (e.g., ['sports', 'club', 'documents', 'license'])
  hiddenSportsFields?: string[]; // Sports fields to hide (e.g., ['ageCategory', 'jerseyNumber'])
}

// ============================================
// HELPERS
// ============================================

const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return "—";
  }
};

const formatDateForInput = (dateStr?: string | Date) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  } catch (e) {
    return "";
  }
};

// ============================================
// COMPONENT
// ============================================

export default function MemberForm({
  initialData,
  documents = [],
  assignments = [],
  medicalVisits = [],
  auditHistory = [],
  clubs = [],
  seasons = [],
  disciplines = [],
  subscriptionTypes = [],
  categories = [],
  onSubmit,
  onUploadDocument,
  onDeleteDocument,
  onGenerateLicense,
  onGenerateReceipt,
  onProfilePhotoUpdated,
  isLoading = false,
  isEditing = false,
  memberId,
  canAccessMedical = false,
  hideMemberStatusSelection = false,
  hiddenTabs = [],
  hiddenSportsFields = [],
}: MemberFormProps) {
  // Try to get user from AuthProvider, fallback to mock user if not available
  // TODO: Once AuthProvider is properly implemented at app root, remove this fallback
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    // AuthProvider not available, use mock user for development
    // This gives federation_admin access by default for development purposes
    user = {
      id: "dev-user",
      email: "admin@frmhg.ma",
      displayName: "Admin (Dev)",
      roles: ["federation_admin"]
    };
  }
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [cities, setCities] = React.useState<string[]>([]);
  const [profilePhotoPreview, setProfilePhotoPreview] = React.useState<string>("");
  const forceSubmitRef = React.useRef(false);

  const [formData, setFormData] = React.useState<MemberFormData>({
    // Profile
    profilePhotoId: initialData?.profilePhotoId || "",
    memberNumber: initialData?.memberNumber || "",
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    sex: initialData?.sex || "",
    dateOfBirth: formatDateForInput(initialData?.dateOfBirth) || "",
    nationality: initialData?.nationality || "Marocaine",
    idNumber: initialData?.idNumber || "",
    idType: initialData?.idType || "cin",
    address: initialData?.address || "",
    city: initialData?.city || "",
    region: initialData?.region || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    emergencyContactName: initialData?.emergencyContactName || "",
    emergencyContactPhone: initialData?.emergencyContactPhone || "",

    // Sports
    discipline: initialData?.discipline || "Hockey sur glace",
    ageCategory: initialData?.ageCategory || "",
    positions: initialData?.positions || [],
    jerseyNumber: initialData?.jerseyNumber || "",

    // Club
    memberStatus: initialData?.memberStatus || "adherent",
    assignedClubId: initialData?.assignedClubId || "",
    assignmentStartDate: formatDateForInput(initialData?.assignmentStartDate) || "",
    assignmentEndDate: formatDateForInput(initialData?.assignmentEndDate) || "",

    // Subscription
    subscriptionType: initialData?.subscriptionType || "",
    seasonId: initialData?.seasonId || "",
    subscriptionAmount: initialData?.subscriptionAmount || 0,
    paymentMethod: initialData?.paymentMethod || "",
    paymentStatus: initialData?.paymentStatus || "pending",
    paymentDate: formatDateForInput(initialData?.paymentDate) || "",
    paymentReference: initialData?.paymentReference || "",

    // Medical
    medicalStatus: initialData?.medicalStatus || "pending",
    lastMedicalVisitDate: formatDateForInput(initialData?.lastMedicalVisitDate) || "",
    federationDoctor: initialData?.federationDoctor || "",
    medicalFitness: initialData?.medicalFitness || "",
    fitnessExpirationDate: formatDateForInput(initialData?.fitnessExpirationDate) || "",
    medicalCertificateId: initialData?.medicalCertificateId || "",

    // License
    licenseNumber: initialData?.licenseNumber || "",
    licenseSeason: initialData?.licenseSeason || "",
    licenseType: initialData?.licenseType || "player",
    licenseStatus: initialData?.licenseStatus || "pending_approval",
    licenseIssueDate: formatDateForInput(initialData?.licenseIssueDate) || "",
    licenseExpirationDate: formatDateForInput(initialData?.licenseExpirationDate) || "",

    // Status
    status: initialData?.status || "active",
    registrationDate: formatDateForInput(initialData?.registrationDate) || new Date().toISOString().split('T')[0],
    lastUpdated: initialData?.lastUpdated || "",
    createdBy: initialData?.createdBy || "",
  });

  // Load cities based on region
  React.useEffect(() => {
    if (formData.region) {
      const mockCities: Record<string, string[]> = {
        "Casablanca-Settat": ["Casablanca", "Settat", "Mohammedia", "Benslimane", "El Jadida"],
        "Rabat-Salé-Kénitra": ["Rabat", "Salé", "Kénitra", "Témara", "Skhirate"],
        "Marrakech-Safi": ["Marrakech", "Safi", "Essaouira", "Chichaoua"],
        "Fès-Meknès": ["Fès", "Meknès", "Sefrou", "El Hajeb", "Ifrane"],
        "Tanger-Tétouan-Al Hoceïma": ["Tanger", "Tétouan", "Al Hoceïma", "Chefchaouen"],
        "Oriental": ["Oujda", "Nador", "Berkane", "Taourirt"],
        "Béni Mellal-Khénifra": ["Béni Mellal", "Khénifra", "Fquih Ben Salah"],
        "Drâa-Tafilalet": ["Errachidia", "Ouarzazate", "Tinghir"],
        "Souss-Massa": ["Agadir", "Inezgane", "Taroudant", "Tiznit"],
        "Guelmim-Oued Noun": ["Guelmim", "Tan-Tan", "Sidi Ifni"],
        "Laâyoune-Sakia El Hamra": ["Laâyoune", "Es-Semara", "Boujdour"],
        "Dakhla-Oued Ed-Dahab": ["Dakhla", "Aousserd"],
      };
      setCities(mockCities[formData.region] || []);
    } else {
      setCities([]);
    }
  }, [formData.region]);

  React.useEffect(() => {
    if (!seasons || seasons.length === 0) return;
    const activeSeason = seasons.find((season) => season.isActive);
    if (!activeSeason) return;
    setFormData((prev) => {
      const nextSeasonId = prev.seasonId || activeSeason.id;
      const nextLicenseSeason = prev.licenseSeason || nextSeasonId || activeSeason.id;
      if (nextSeasonId === prev.seasonId && nextLicenseSeason === prev.licenseSeason) {
        return prev;
      }
      return {
        ...prev,
        seasonId: nextSeasonId,
        licenseSeason: nextLicenseSeason,
      };
    });
  }, [seasons]);

  // Load existing profile photo
  React.useEffect(() => {
    if (initialData?.profilePhotoId && !profilePhotoPreview) {
      setProfilePhotoPreview(`/api/documents/view?id=${initialData.profilePhotoId}`);
    }
  }, [initialData?.profilePhotoId, profilePhotoPreview]);

  // Auto-calculate fitness expiration date (1 year after last medical visit)
  React.useEffect(() => {
    if (formData.lastMedicalVisitDate) {
      const visitDate = new Date(formData.lastMedicalVisitDate);
      const expirationDate = new Date(visitDate);
      expirationDate.setFullYear(visitDate.getFullYear() + 1);
      
      // Format as YYYY-MM-DD for the date input
      const formattedDate = expirationDate.toISOString().split('T')[0];
      
      if (formData.fitnessExpirationDate !== formattedDate) {
        updateFormData("fitnessExpirationDate", formattedDate);
      }
    }
  }, [formData.lastMedicalVisitDate]);

  const getPhotoUrl = () => {
    if (profilePhotoPreview) return profilePhotoPreview;
    if (!formData.profilePhotoId) return null;
    return `/api/documents/view?id=${formData.profilePhotoId}`;
  };

  const getQrCodeUrl = () => {
    const code = formData.memberNumber || formData.licenseNumber;
    if (!code) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`;
  };

  const getSeasonName = (id?: string) => {
    return seasons.find((s) => s.id === id)?.name || id || "—";
  };

  const getDisciplineName = (idOrName?: string) => {
    return disciplines.find(d => d.id === idOrName || d.name === idOrName)?.name || idOrName || "—";
  };

  const assignedClub = React.useMemo(
    () => clubs.find((club) => club.id === formData.assignedClubId),
    [clubs, formData.assignedClubId],
  );
  const assignedClubLogoId = assignedClub?.logoDocumentId || assignedClub?.logo_document_id;
  const assignedClubLogoUrl = assignedClubLogoId ? `/api/documents/view?id=${assignedClubLogoId}` : null;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const togglePosition = (positionId: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(positionId)
        ? prev.positions.filter(p => p !== positionId)
        : [...prev.positions, positionId]
    }));
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      updateFormData("profilePhotoFile", file);
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const isTabVisible = (tabId: string) => !hiddenTabs.includes(tabId);

    if (isTabVisible("profile")) {
      if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis";
      if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "La date de naissance est requise";
      if (!formData.sex) newErrors.sex = "Le sexe est requis";
      if (!formData.email.trim()) newErrors.email = "L'email est requis";
      if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis";
      if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
      if (!formData.city.trim()) newErrors.city = "La ville est requise";
      if (!formData.region.trim()) newErrors.region = "La région est requise";
      if (!formData.idNumber.trim()) newErrors.idNumber = "Le numéro d'identité est requis";
      if (!formData.idType) newErrors.idType = "Le type de pièce d'identité est requis";
      if (!formData.nationality.trim()) newErrors.nationality = "La nationalité est requise";
    }
    
    // Sports information (required for joueur_club)
    if (isTabVisible("sports") && formData.memberStatus === "club_player") {
      if (!formData.discipline.trim()) newErrors.discipline = "La discipline est requise";

      // Validate jersey number format if provided
      if (formData.jerseyNumber && !/^[1-9]\d*$/.test(formData.jerseyNumber)) {
        newErrors.jerseyNumber = "Le numéro de maillot doit être un nombre positif";
      }
    }
    
    // Club assignment
    if (isTabVisible("club") && (formData.memberStatus === "adherent" || formData.memberStatus === "club_player")) {
      if (!formData.assignedClubId) newErrors.assignedClubId = "Le club d'affectation est requis";
      if (!formData.assignmentStartDate) newErrors.assignmentStartDate = "La date de début d'affectation est requise";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isTabVisible("profile") && formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    // Age validation
    if (isTabVisible("profile") && formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      // Basic age validation (must be reasonable)
      if (age < 3 || age > 100) {
        newErrors.dateOfBirth = "Âge non valide";
      }
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const forceSubmit = forceSubmitRef.current;
    forceSubmitRef.current = false;
    if (!isLastTab && !forceSubmit) {
      goToNextTab();
      return;
    }
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const fieldTabMap: Record<string, string> = {
        firstName: "profile",
        lastName: "profile",
        dateOfBirth: "profile",
        sex: "profile",
        email: "profile",
        phone: "profile",
        address: "profile",
        city: "profile",
        region: "profile",
        idNumber: "profile",
        idType: "profile",
        nationality: "profile",
        emergencyContactName: "profile",
        emergencyContactPhone: "profile",
        discipline: "sports",
        jerseyNumber: "sports",
        assignedClubId: "club",
        assignmentStartDate: "club",
      };

      const firstErrorTab = visibleTabs.find(tab =>
        Object.keys(validationErrors).some(field => fieldTabMap[field] === tab.id)
      );
      if (firstErrorTab) {
        setActiveTab(firstErrorTab.id);
      }
      return;
    }

    try {
      const profilePhotoFile = (formData as any).profilePhotoFile as File | undefined;
      const cleanData = { 
        ...formData
      };
      
      delete (cleanData as any).profilePhotoFile;
      delete (cleanData as any).profilePhotoId;
      delete (cleanData as any).memberNumber;

      // Clean empty fields
      Object.keys(cleanData).forEach(key => {
        const value = (cleanData as any)[key];
        if (value === "" || value === null || value === undefined) {
          delete (cleanData as any)[key];
        }
      });

      const submitResult = await onSubmit(cleanData);
      const resolvedMemberId = memberId || submitResult?.id;

      if (profilePhotoFile && resolvedMemberId) {
        const photoFormData = new FormData();
        photoFormData.append('file', profilePhotoFile);
        photoFormData.append('memberId', resolvedMemberId);
        photoFormData.append('type', 'photo');

        const uploadRes = await fetch('/api/documents/upload', {
          method: 'POST',
          body: photoFormData,
          credentials: 'include',
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          updateFormData("profilePhotoId", uploadData.id);
          setProfilePhotoPreview(`/api/documents/view?id=${uploadData.id}`);
          onProfilePhotoUpdated?.(uploadData.id);
        } else {
          console.error("Profile photo upload failed:", uploadRes.status, await uploadRes.text());
        }
      }

      if (!isEditing && !memberId && resolvedMemberId) {
        router.push("/modules/membres");
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  const generateMemberNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `FRMHG-${year}-${random}`;
  };

  // Calculate if member is minor
  const isMinor = React.useMemo(() => {
    if (!formData.dateOfBirth) return false;
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  }, [formData.dateOfBirth]);

  // Count visible tabs based on hiddenTabs
  const visibleTabs = TABS.filter(tab => !hiddenTabs.includes(tab.id));
  const currentTabIndexRaw = visibleTabs.findIndex(tab => tab.id === activeTab);
  const currentTabIndex = currentTabIndexRaw === -1 ? 0 : currentTabIndexRaw;
  const totalVisibleTabs = visibleTabs.length;
  const isFirstTab = currentTabIndex <= 0;
  const isLastTab = currentTabIndex === totalVisibleTabs - 1;
  const previousTabId = !isFirstTab ? visibleTabs[currentTabIndex - 1]?.id : undefined;
  const nextTabId = !isLastTab ? visibleTabs[currentTabIndex + 1]?.id : undefined;

  React.useEffect(() => {
    if (currentTabIndexRaw === -1 && visibleTabs[0]) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [currentTabIndexRaw, visibleTabs]);

  const goToPreviousTab = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (previousTabId) {
      setActiveTab(previousTabId);
    }
  };

  const goToNextTab = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (nextTabId) {
      setActiveTab(nextTabId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-screen-2xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-sm mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600 bg-brand-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 ml-4 pl-4 border-l border-gray-200">
            <span className="font-medium text-gray-700">
              Onglet {currentTabIndex + 1}
            </span>
            <span>/</span>
            <span className="font-bold text-brand-600">{totalVisibleTabs}</span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* ==================== TAB 1: PROFILE & PERSONAL INFO ==================== */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Photo Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>📷</span> Photo de profil
              </h3>
              <div className="flex flex-col items-center">
                <label className="relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="hidden"
                  />
                  <div className="w-40 h-40 rounded-full border-4 border-dashed border-gray-300 group-hover:border-brand-500 flex items-center justify-center overflow-hidden transition-colors bg-gray-50">
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs text-gray-500">Cliquer pour ajouter</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-brand-500 text-white p-2 rounded-full shadow-lg group-hover:bg-brand-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  JPG, PNG, WEBP, AVIF (max 5MB)<br />Format carré recommandé
                </p>

                {/* Member Number */}
                <div className="mt-6 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de membre
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.memberNumber || "Auto-généré"}
                      readOnly
                      className="flex-1 h-11 rounded-lg border border-gray-200 px-3 text-sm bg-gray-50 text-gray-600"
                    />
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => updateFormData("memberNumber", generateMemberNumber())}
                        className="px-3 h-11 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600"
                      >
                        Générer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>👤</span> Informations personnelles
              </h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.lastName ? "border-error-500" : "border-gray-200"
                    }`}
                    placeholder="NOM"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-error-500">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.firstName ? "border-error-500" : "border-gray-200"
                    }`}
                    placeholder="Prénom"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-error-500">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => updateFormData("sex", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.sex ? "border-error-500" : "border-gray-200"
                    }`}
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                  {errors.sex && <p className="mt-1 text-sm text-error-500">{errors.sex}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.dateOfBirth ? "border-error-500" : "border-gray-200"
                    }`}
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-error-500">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => updateFormData("nationality", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.nationality ? "border-error-500" : "border-gray-200"
                    }`}
                  >
                    {NATIONALITIES.map(nat => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                  {errors.nationality && <p className="mt-1 text-sm text-error-500">{errors.nationality}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de document</label>
                  <select
                    value={formData.idType}
                    onChange={(e) => updateFormData("idType", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.idType ? "border-error-500" : "border-gray-200"
                    }`}
                  >
                    <option value="cin">CIN</option>
                    <option value="passport">Passeport</option>
                  </select>
                  {errors.idType && <p className="mt-1 text-sm text-error-500">{errors.idType}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro {formData.idType === "cin" ? "CIN" : "Passeport"}
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => updateFormData("idNumber", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.idNumber ? "border-error-500" : "border-gray-200"
                    }`}
                    placeholder="Saisir le numéro"
                  />
                  {errors.idNumber && <p className="mt-1 text-sm text-error-500">{errors.idNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <select
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    disabled={!formData.region}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-gray-100 ${
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    rows={2}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.address ? "border-error-500" : "border-gray-200"
                    }`}
                    placeholder="Adresse complète"
                  />
                  {errors.address && <p className="mt-1 text-sm text-error-500">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.phone ? "border-error-500" : "border-gray-200"
                    }`}
                    placeholder="Saisir le téléphone"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-error-500">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.email ? "border-error-500" : "border-gray-200"
                    }`}
                    placeholder="email@exemple.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-error-500">{errors.email}</p>}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-red-500">🚨</span> Contact d'urgence
                </h4>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du contact</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => updateFormData("emergencyContactName", e.target.value)}
                      className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                        errors.emergencyContactName ? "border-error-500" : "border-gray-200"
                      }`}
                      placeholder="Nom complet"
                    />
                    {errors.emergencyContactName && (
                      <p className="mt-1 text-sm text-error-500">{errors.emergencyContactName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone d'urgence</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => updateFormData("emergencyContactPhone", e.target.value)}
                      className={`w-full h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
                        errors.emergencyContactPhone ? "border-error-500" : "border-gray-200"
                      }`}
                      placeholder="+212 6XX XXX XXX"
                    />
                    {errors.emergencyContactPhone && (
                      <p className="mt-1 text-sm text-error-500">{errors.emergencyContactPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: SPORTS INFO ==================== */}
        {activeTab === "sports" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>🏒</span> Informations sportives
              </h3>

              <div className="space-y-6">
                {/* Discipline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discipline</label>
                  {disciplines.length > 0 ? (
                    <select
                      value={formData.discipline}
                      onChange={(e) => updateFormData("discipline", e.target.value)}
                      className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="">Sélectionner une discipline</option>
                      {disciplines.filter(d => (d.is_active ?? d.isActive ?? true)).map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏒</span>
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Hockey sur glace</span>
                          <p className="text-xs text-gray-600">Discipline principale FRMHG</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Jersey Number - Conditionally hidden */}
                {!hiddenSportsFields.includes('jerseyNumber') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de maillot <span className="text-gray-400">(optionnel)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={formData.jerseyNumber}
                      onChange={(e) => updateFormData("jerseyNumber", e.target.value)}
                      className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="Ex: 17"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Positions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>🎯</span> Poste(s) / Position(s)
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Sélectionnez un ou plusieurs postes
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HOCKEY_POSITIONS.map(position => (
                  <label
                    key={position.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.positions.includes(position.id)
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.positions.includes(position.id)}
                      onChange={() => togglePosition(position.id)}
                      className="hidden"
                    />
                    <span className="text-2xl">{position.icon}</span>
                    <div>
                      <span className="text-sm font-medium text-gray-800">{position.name}</span>
                    </div>
                    {formData.positions.includes(position.id) && (
                      <svg className="w-5 h-5 text-brand-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>

              {formData.positions.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">{formData.positions.length}</span> poste(s) sélectionné(s)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: CLUB ASSIGNMENT ==================== */}
        {activeTab === "club" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>🏟️</span> Affectation club
              </h3>

              <div className="space-y-6">
                {/* Member Status - Hidden when pre-selected */}
                {!hideMemberStatusSelection && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Statut du membre</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.memberStatus === "adherent"
                            ? "border-brand-500 bg-brand-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="memberStatus"
                          value="adherent"
                          checked={formData.memberStatus === "adherent"}
                          onChange={(e) => updateFormData("memberStatus", e.target.value)}
                          className="hidden"
                        />
                        <span className="text-xl">👤</span>
                        <span className="text-sm font-medium">Adhérent</span>
                      </label>
                      <label
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.memberStatus === "club_player"
                            ? "border-brand-500 bg-brand-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="memberStatus"
                          value="club_player"
                          checked={formData.memberStatus === "club_player"}
                          onChange={(e) => updateFormData("memberStatus", e.target.value)}
                          className="hidden"
                        />
                        <span className="text-xl">🏒</span>
                        <span className="text-sm font-medium">Joueur Club</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Club Selection (only if club_player) */}
                {formData.memberStatus === "club_player" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Club affecté</label>
                      <select
                        value={formData.assignedClubId}
                        onChange={(e) => updateFormData("assignedClubId", e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">Sélectionner un club</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                        <input
                          type="date"
                          value={formData.assignmentStartDate}
                          onChange={(e) => updateFormData("assignmentStartDate", e.target.value)}
                          className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin <span className="text-gray-400">(optionnel)</span>
                        </label>
                        <input
                          type="date"
                          value={formData.assignmentEndDate}
                          onChange={(e) => updateFormData("assignmentEndDate", e.target.value)}
                          className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.memberStatus === "adherent" && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Adhérent</span> = membre non affilié à un club. 
                      Peut participer aux activités fédérales et doit souscrire un abonnement individuel.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment History */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>📜</span> Historique des affectations
              </h3>

              {assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm">Aucun historique d'affectation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment, idx) => (
                    <div
                      key={assignment.id}
                      className={`p-4 rounded-lg border ${
                        assignment.status === "active"
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{assignment.clubName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(assignment.startDate).toLocaleDateString('fr-FR')}
                            {assignment.endDate && ` → ${new Date(assignment.endDate).toLocaleDateString('fr-FR')}`}
                            {!assignment.endDate && " → En cours"}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          assignment.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {assignment.status === "active" ? "Actif" : "Terminé"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: SUBSCRIPTION & PAYMENT ==================== */}
        {activeTab === "subscription" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {formData.memberStatus === "club_player" ? (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🏟️</span>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Membre affilié à un club</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Ce membre est affecté à un club. Les cotisations et paiements sont gérés par le club d'appartenance.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span>💳</span> Abonnement
                  </h3>

                  <div className="space-y-4">
                    {/* Subscription Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type d'abonnement</label>
                      <div className="space-y-2">
                        {subscriptionTypes.length > 0 ? (
                          subscriptionTypes.filter(s => s.is_active).map(sub => (
                            <label
                              key={sub.id}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.subscriptionType === sub.id
                                  ? "border-brand-500 bg-brand-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="subscriptionType"
                                  value={sub.id}
                                  checked={formData.subscriptionType === sub.id}
                                  onChange={(e) => {
                                    updateFormData("subscriptionType", e.target.value);
                                    updateFormData("subscriptionAmount", sub.amount_cents / 100);
                                  }}
                                  className="hidden"
                                />
                                <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                              </div>
                              <span className="text-sm font-bold text-brand-600">{sub.amount_cents / 100} MAD</span>
                            </label>
                          ))
                        ) : (
                          SUBSCRIPTION_TYPES.map(sub => (
                            <label
                              key={sub.id}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.subscriptionType === sub.id
                                  ? "border-brand-500 bg-brand-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="subscriptionType"
                                  value={sub.id}
                                  checked={formData.subscriptionType === sub.id}
                                  onChange={(e) => {
                                    updateFormData("subscriptionType", e.target.value);
                                    updateFormData("subscriptionAmount", sub.price);
                                  }}
                                  className="hidden"
                                />
                                <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                              </div>
                              <span className="text-sm font-bold text-brand-600">{sub.price} MAD</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Season */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Saison sportive</label>
                      <select
                        value={formData.seasonId}
                        onChange={(e) => updateFormData("seasonId", e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">Sélectionner une saison</option>
                        {seasons.map(season => (
                          <option key={season.id} value={season.id}>
                            {season.name} {season.isActive && "(Active)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Montant (MAD)</label>
                      <input
                        type="number"
                        value={formData.subscriptionAmount}
                        onChange={(e) => updateFormData("subscriptionAmount", parseInt(e.target.value))}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span>💰</span> Paiement
                  </h3>

                  <div className="space-y-4">
                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => updateFormData("paymentMethod", e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">Sélectionner</option>
                        {PAYMENT_METHODS.map(method => (
                          <option key={method.id} value={method.id}>{method.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Statut du paiement</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "pending", label: "En attente", color: "yellow" },
                          { id: "paid", label: "Payé", color: "green" },
                          { id: "overdue", label: "En retard", color: "red" },
                        ].map(status => (
                          <label
                            key={status.id}
                            className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                              formData.paymentStatus === status.id
                                ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentStatus"
                              value={status.id}
                              checked={formData.paymentStatus === status.id}
                              onChange={(e) => updateFormData("paymentStatus", e.target.value)}
                              className="hidden"
                            />
                            {status.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date du paiement</label>
                      <input
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => updateFormData("paymentDate", e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    {/* Payment Reference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Référence du paiement</label>
                      <input
                        type="text"
                        value={formData.paymentReference}
                        onChange={(e) => updateFormData("paymentReference", e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="Ex: VIR-2025-00001"
                      />
                    </div>

                    {/* Generate Receipt Button */}
                    {formData.paymentStatus === "paid" && onGenerateReceipt && (
                      <button
                        type="button"
                        onClick={onGenerateReceipt}
                        className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Générer le reçu de paiement
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== TAB 5: DOCUMENTS ==================== */}
        {activeTab === "documents" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span>📄</span> Documents du membre
            </h3>

            <div className="space-y-4">
              {MEMBER_DOCUMENT_TYPES.map((docType) => {
                const docsOfType = documents.filter(d => d.documentType === docType.key);
                const isRequired = false;

                return (
                  <div key={docType.key} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${docsOfType.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium text-gray-800">{docType.label}</span>
                        {docsOfType.length > 0 && (
                          <span className="text-xs text-gray-500">({docsOfType.length})</span>
                        )}
                      </div>

                      <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onUploadDocument) {
                              onUploadDocument(file, docType.key);
                            }
                            e.target.value = '';
                          }}
                        />
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter
                      </label>
                    </div>

                    {docsOfType.length > 0 && (
                      <div className="divide-y divide-gray-100">
                        {docsOfType.map((doc) => (
                          <div key={doc.id} className="px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{doc.filename || 'Document'}</p>
                                {doc.uploadedAt && (
                                  <p className="text-xs text-gray-500">Ajouté le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
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
              Formats acceptés: PDF, JPG, PNG (max 10 MB)
            </p>
          </div>
        )}

        {/* ==================== TAB 6: MEDICAL INFO ==================== */}
        {activeTab === "medical" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Check if user has federation_admin or medecin role */}
            {!hasAnyRole(user, ['federation_admin', 'medecin']) ? (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Accès restreint</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Les informations médicales sont accessibles uniquement aux administrateurs de la fédération et au personnel médical.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span>🩺</span> Informations médicales
                  </h3>

                  <div className="space-y-4">
                    {/* Medical Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Statut médical</label>
                      <div className="grid grid-cols-2 gap-2">
                        {MEDICAL_STATUS.map(status => (
                          <label
                            key={status.id}
                            className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                              formData.medicalStatus === status.id
                                ? `border-current ${status.color}`
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="medicalStatus"
                              value={status.id}
                              checked={formData.medicalStatus === status.id}
                              onChange={(e) => updateFormData("medicalStatus", e.target.value)}
                              className="hidden"
                            />
                            {status.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Last Medical Visit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dernière visite médicale</label>
                      <input
                        type="date"
                        value={formData.lastMedicalVisitDate}
                        onChange={(e) => updateFormData("lastMedicalVisitDate", e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    {/* Federation Doctor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Médecin de la fédération</label>
                      <input
                        type="text"
                        value={formData.federationDoctor}
                        onChange={(e) => updateFormData("federationDoctor", e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="Dr. NOM Prénom"
                      />
                    </div>

                    {/* Fitness Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aptitude médicale</label>
                      <select
                        value={formData.medicalFitness}
                        onChange={(e) => updateFormData("medicalFitness", e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">Sélectionner</option>
                        <option value="fit">Apte à la pratique sportive</option>
                        <option value="fit_conditions">Apte avec conditions</option>
                        <option value="unfit_temporary">Inapte temporairement</option>
                        <option value="unfit_permanent">Inapte définitivement</option>
                      </select>
                    </div>

                    {/* Fitness Expiration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'expiration de l'aptitude
                        <span className="text-xs text-gray-500 ml-2">(Calculée automatiquement: 1 an après la visite)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.fitnessExpirationDate}
                          onChange={(e) => updateFormData("fitnessExpirationDate", e.target.value)}
                          className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 bg-gray-50 pr-10"
                          readOnly
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Cette date est calculée automatiquement à partir de la dernière visite médicale.
                        Pour modifier manuellement, veuillez contacter un administrateur médical.
                      </p>
                    </div>

                    {/* Medical Certificate Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Certificat médical</label>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Current certificate display */}
                        {formData.medicalCertificateId ? (
                          <div className="px-4 py-3 flex items-center justify-between bg-white">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">Certificat médical actuel</p>
                                <p className="text-xs text-gray-500">Cliquez pour télécharger</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <a
                                href={`/api/documents/${formData.medicalCertificateId}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                title="Télécharger le certificat"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                              <button
                                type="button"
                                onClick={() => updateFormData("medicalCertificateId", "")}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer le certificat"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-6 text-center">
                            <div className="mb-3">
                              <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Aucun certificat médical téléchargé</p>
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors">
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file && onUploadDocument) {
                                    try {
                                      // Upload the file
                                      const formDataUpload = new FormData();
                                      formDataUpload.append('file', file);
                                      
                                      if (memberId) {
                                        formDataUpload.append('memberId', memberId);
                                      }
                                      formDataUpload.append('type', 'medical_certificate');

                                      const response = await fetch('/api/documents/upload', {
                                        method: 'POST',
                                        body: formDataUpload,
                                        credentials: 'include',
                                      });
                                      
                                      if (response.ok) {
                                        const result = await response.json();
                                        // Update form data with the document ID
                                        updateFormData("medicalCertificateId", result.id);
                                      }
                                    } catch (error) {
                                      console.error('Error uploading medical certificate:', error);
                                    }
                                  }
                                  e.target.value = '';
                                }}
                              />
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Télécharger un certificat
                            </label>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Formats acceptés: PDF, JPG, PNG (max 10 MB)</p>
                    </div>
                  </div>
                </div>

                {/* Medical Visits History */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span>📋</span> Historique des visites médicales
                  </h3>

                  {medicalVisits.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">Aucune visite médicale enregistrée</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {medicalVisits.map((visit) => (
                        <div key={visit.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800">{visit.type}</span>
                            <span className="text-xs text-gray-500">{new Date(visit.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <p className="text-sm text-gray-600">Dr. {visit.doctor}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              visit.result === 'fit' ? 'bg-green-100 text-green-800' :
                              visit.result === 'unfit' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {visit.result === 'fit' ? 'Apte' : visit.result === 'unfit' ? 'Inapte' : 'En attente'}
                            </span>
                            {visit.reportDocumentId && (
                              <a
                                href={`/api/documents/${visit.reportDocumentId}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Rapport PDF
                              </a>
                            )}
                          </div>
                          {visit.notes && (
                            <p className="mt-2 text-xs text-gray-500">{visit.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== TAB 7: LICENSE ==================== */}
        {activeTab === "license" && (
          <div className="max-w-2xl mx-auto">
            {/* License Card Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>🪪</span> Carte de licence
              </h3>

              <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between">
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                      <span className="text-9xl font-bold">FRMHG</span>
                  </div>
                  
                  {/* Top Section: Logo & Header */}
                  <div className="relative z-10 flex justify-between items-start">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-lg p-1.5 shadow-inner">
                              <img src="/logo_frmhg.png" alt="FRMHG" className="w-full h-full object-contain" />
                          </div>
                          <div>
                              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-300">Fédération Royale Marocaine</p>
                              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-300">de Hockey sur Glace</p>
                          </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-tighter ${
                              formData.licenseStatus === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                              {formData.licenseStatus?.toUpperCase() || 'DRAFT'}
                          </span>
                      </div>
                  </div>

                  {/* Middle Section: Member Info & QR */}
                  <div className="relative z-10 flex items-center gap-4 mt-4">
                      <div className="w-20 h-24 bg-white/10 rounded-lg border border-white/20 overflow-hidden flex-shrink-0">
                          {getPhotoUrl() ? (
                              <img src={getPhotoUrl()!} alt="" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/30">
                                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                              </div>
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-brand-200 uppercase tracking-widest leading-none">
                              {formData.assignedClubId ? "Joueur" : "Adhérent"}
                          </p>
                          <p className="text-lg font-black truncate mt-1 leading-tight">{formData.lastName?.toUpperCase()}</p>
                          <p className="text-sm font-bold truncate text-white/90 leading-tight">{formData.firstName}</p>
                          {assignedClubLogoUrl && (
                              <div className="mt-1 w-6 h-6 bg-white rounded-md p-0.5 shadow-inner">
                                  <img src={assignedClubLogoUrl} alt="" className="w-full h-full object-contain" />
                              </div>
                          )}
                          <p className="text-[9px] font-mono text-brand-300 mt-2 bg-black/20 inline-block px-1.5 py-0.5 rounded">
                              ID: {formData.memberNumber || formData.licenseNumber || 'N/A'}
                          </p>
                      </div>
                      <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex-shrink-0 shadow-lg">
                          {getQrCodeUrl() && (
                              <img src={getQrCodeUrl()!} alt="QR Code" className="w-full h-full" />
                          )}
                      </div>
                  </div>
                  
                  {/* Bottom Section: Details */}
                  <div className="relative z-10 grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                      <div>
                          <p className="text-[7px] uppercase text-brand-400 font-bold tracking-widest">Saison</p>
                          <p className="text-[10px] font-black">{getSeasonName(formData.licenseSeason)}</p>
                      </div>
                      <div>
                          <p className="text-[7px] uppercase text-brand-400 font-bold tracking-widest">Discipline</p>
                          <p className="text-[10px] font-black truncate">{getDisciplineName(formData.discipline)}</p>
                      </div>
                  </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                {formData.licenseStatus === "active" && onGenerateLicense && (
                  <button
                    type="button"
                    onClick={onGenerateLicense}
                    className="w-full py-3 px-4 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger la licence (PDF)
                  </button>
                )}
                {formData.licenseStatus !== "active" && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">⚠️ Licence non active</span><br />
                      La licence doit être active pour pouvoir la télécharger.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 8: STATUS & FOLLOW-UP ==================== */}
        {activeTab === "status" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>🔔</span> Suivi & statut
              </h3>

              <div className="space-y-4">
                {/* Member Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut du membre</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "active", label: "Actif", color: "green", icon: "✅" },
                      { id: "inactive", label: "Inactif", color: "gray", icon: "⏸️" },
                      { id: "suspended", label: "Suspendu", color: "red", icon: "🚫" },
                      { id: "archived", label: "Archivé", color: "gray", icon: "📦" },
                    ].map(status => (
                      <label
                        key={status.id}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                          formData.status === status.id
                            ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status.id}
                          checked={formData.status === status.id}
                          onChange={(e) => updateFormData("status", e.target.value)}
                          className="hidden"
                        />
                        <span>{status.icon}</span>
                        {status.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Registration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date d'inscription</label>
                  <input
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => updateFormData("registrationDate", e.target.value)}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* System Info (read-only) */}
                {isEditing && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-600 mb-4">Informations système</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {initialData?.createdAt && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Créé le</label>
                          <p className="text-gray-700">{new Date(initialData.createdAt).toLocaleString('fr-FR')}</p>
                        </div>
                      )}
                      {initialData?.updatedAt && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Mis à jour le</label>
                          <p className="text-gray-700">{new Date(initialData.updatedAt).toLocaleString('fr-FR')}</p>
                        </div>
                      )}
                      {initialData?.createdBy && (
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Créé par</label>
                          <p className="text-gray-700">{initialData.createdBy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Audit History */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>📜</span> Historique des actions
              </h3>

              {auditHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">Aucune action enregistrée</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditHistory.map((action) => (
                    <div key={action.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{action.action}</span>
                        <span className="text-xs text-gray-500">{new Date(action.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                      <p className="text-xs text-gray-600">Par: {action.actor}</p>
                      {action.details && (
                        <p className="text-xs text-gray-500 mt-1">{action.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex justify-between items-center bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          Annuler
        </button>

        <div className="flex items-center gap-4">
          {/* Tab navigation hints */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <span>Onglet {currentTabIndex + 1} / {totalVisibleTabs}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isFirstTab}
              onClick={goToPreviousTab}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Précédent
            </button>

            {isLastTab ? (
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 text-sm font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{isEditing ? "Mettre à jour" : "Créer le membre"}</span>
                  </>
                )}
              </button>
            ) : (
              <>
                {isEditing && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    onClick={() => {
                      forceSubmitRef.current = true;
                    }}
                    className="px-8 py-3 text-sm font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    Mettre à jour
                  </button>
                )}
                <button
                  type="button"
                  onClick={goToNextTab}
                  className="px-8 py-3 text-sm font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Suivant
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

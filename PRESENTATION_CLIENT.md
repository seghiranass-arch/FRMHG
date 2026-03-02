PLATEFORME DE GESTION FRMHG
FEDERATION ROYALE MAROCAINE DE HOCKEY SUR GLACE
Document de Presentation Detaillee pour le Client


TABLE DES MATIERES

1. Vue d'ensemble de la plateforme
2. Architecture technique complete
3. Modules fonctionnels et caracteristiques
4. Structure des donnees et tables de base de donnees
5. Formulaires et champs detailles
6. Flux de travail et processus metier
7. Stack technologique complet
8. Hebergement et infrastructure
9. Securite et conformite


=================================================================================
1. VUE D'ENSEMBLE DE LA PLATEFORME
=================================================================================

OBJECTIF PRINCIPAL
Centraliser la gestion complete de la federation, des clubs et des equipes nationales
avec une plateforme professionnelle securisee supportant jusqu'a 50 clubs et 5000 utilisateurs.

TROIS APPLICATIONS PRINCIPALES

Application 1: Site Public (www.frmhg.ma)
- Presentation de la federation
- Actualites et communiques
- Calendrier et resultats des competitions
- Formulaire de contact
- Acces sans authentification

Application 2: Plateforme de Gestion (app.frmhg.ma)
- Interface backoffice pour tous les utilisateurs
- Tableaux de bord personnalises par role
- Gestion complete des operations
- Workflows de validation
- Acces securise avec authentification

Application 3: API Backend (api.frmhg.ma)
- API REST documentee avec Swagger
- Gestion de toutes les donnees
- Logique metier centralisee
- Integration avec services externes
- Securite et controle d'acces


UTILISATEURS ET ROLES

1. Administrateur Federation
   - Acces complet a toute la plateforme
   - Gestion des clubs et utilisateurs
   - Validation des paiements et licences
   - Acces aux rapports et statistiques

2. Administrateur Club
   - Gestion de son club specifique
   - Gestion des membres et effectifs
   - Creation et suivi des licences
   - Gestion des paiements du club

3. Direction Technique Nationale (DTN)
   - Gestion des selections nationales
   - Convocations et stages
   - Acces aux donnees medicales des selectionnes
   - Suivi des competitions internationales

4. Responsable Financier
   - Validation des paiements
   - Approbation des recus
   - Rapports financiers
   - Reconciliation comptable

5. Medecin
   - Creation et gestion des dossiers medicaux
   - Visites et consultations
   - Rapports de sante
   - Suivi des blessures

6. Arbitre
   - Remplissage des feuilles de match
   - Enregistrement des evenements
   - Consultation des calendriers

7. Gestionnaire Materiel
   - Gestion de l'inventaire du materiel
   - Suivi des entrees et sorties
   - Affectation aux clubs et equipes
   - Gestion des retours et transferts
   - Rapports d'inventaire


=================================================================================
2. ARCHITECTURE TECHNIQUE COMPLETE
=================================================================================

TOPOLOGIE DE L'INFRASTRUCTURE

Internet
   |
   v
Traefik (Reverse Proxy avec TLS)
   |
   +-- www.frmhg.ma -----> Site Public (Next.js)
   |
   +-- app.frmhg.ma -----> Plateforme Web (Next.js)
   |
   +-- api.frmhg.ma -----> API Backend (NestJS)
                              |
                              +-- Worker Asynchrone (BullMQ)
                              |
                              v
                    Couche de Stockage
                    |
                    +-- PostgreSQL 14+ (Base de donnees)
                    +-- Redis 7+ (Cache et Files d'attente)
                    +-- MinIO (Stockage de documents S3)


COMPOSANTS TECHNIQUES DETAILLES

Traefik (Reverse-Proxy)
- Gestion automatique des certificats SSL/TLS
- Routage par sous-domaines
- Rate limiting pour protection DDoS
- Headers de securite HTTP
- Logs d'acces centralises

Site Public (public-web)
- Framework: Next.js 15 avec React 19
- Mode: Server-Side Rendering (SSR) et Static Generation
- Contenu: Pages vitrine, actualites, calendrier
- API: Lecture seule vers le backend
- Pas d'authentification requise

Plateforme Web (web)
- Framework: Next.js 15 avec React 19
- Mode: Application dynamique avec authentification
- Contenu: Backoffice complet, dashboards, formulaires
- UI: Tailwind CSS avec composants personnalises
- Authentification: Sessions securisees avec cookies HTTPOnly

API Backend (api)
- Framework: NestJS (Node.js avec TypeScript)
- Architecture: Monolithe modulaire
- Documentation: OpenAPI/Swagger automatique
- Validation: Class Validator sur tous les endpoints
- Securite: Guards RBAC, rate limiting, audit trail

Worker Asynchrone (worker)
- Framework: NestJS avec BullMQ
- Queue: Redis pour la gestion des jobs
- Fonctions: Envoi emails, generation PDF, calculs lourds
- Garanties: Jobs idempotents avec retry automatique

PostgreSQL (Base de donnees)
- Version: 14 ou superieure
- Role: Source de verite pour toutes les donnees
- Fonctionnalites: ACID, contraintes FK, indexes optimises
- Sauvegarde: WAL avec Point-In-Time Recovery (PITR)

Redis (Cache et Queue)
- Version: 7 ou superieure
- Fonctions: Cache applicatif, sessions, files BullMQ
- Configuration: Persistance AOF activee
- Eviction: Politique LRU pour le cache

MinIO (Stockage Objets)
- Protocole: S3 compatible
- Contenu: Documents, recus, rapports PDF, logos
- Fonctionnalites: Versioning active, checksums
- Backup: Replication externe quotidienne


SECURITE DE L'INFRASTRUCTURE

Isolation Reseau
- Reseau edge: Traefik vers applications web
- Reseau internal: Applications vers bases de donnees
- Pas d'acces direct externe aux donnees

Protection TLS
- HTTPS obligatoire partout
- Certificats Let's Encrypt auto-renouveles
- TLS 1.3 avec ciphers securises
- HSTS headers actives

Firewall
- Port 80: Redirection vers 443
- Port 443: Traefik uniquement
- Port 22: SSH avec cles privees (admin seulement)
- Autres ports: Bloques par defaut


=================================================================================
3. MODULES FONCTIONNELS ET CARACTERISTIQUES
=================================================================================

MODULE 1: IAM ET ACCES (Identity and Access Management)

Caracteristiques:
- Gestion centralisee des comptes utilisateurs
- Systeme de roles et permissions granulaires
- Scopes d'acces par organisation, saison, competition
- Sessions securisees avec rotation automatique
- Protection contre le brute force
- Authentification multi-facteurs (MFA) en roadmap

Tables de donnees:
- users: Comptes utilisateurs
- roles: Definitions des roles
- user_roles: Assignation des roles aux utilisateurs
- sessions: Sessions actives (Redis)

Fonctionnalites cles:
- Login/logout securises
- Recuperation de mot de passe par email
- Changement de mot de passe
- Historique des connexions
- Verrouillage de compte apres echecs
- Gestion des permissions fines


MODULE 2: ORGANISATIONS

Caracteristiques:
- Enregistrement des clubs et equipes nationales
- Workflow de validation par la federation
- Gestion du staff et des responsables
- Documents administratifs obligatoires
- Statuts: pending, active, suspended, archived

Tables de donnees:
- orgs: Organisations (clubs et equipes nationales)
- org_staff: Personnel affecte aux organisations
- org_documents: Documents administratifs

Champs principaux des organisations:
- Nom du club
- Acronyme
- Type d'organisation
- Date de creation
- Numero d'agrement federal
- Region et ville
- Adresse complete
- Telephone et email officiels
- Site web et reseaux sociaux
- Informations des responsables (president, secretaire, tresorier)
- Categories actives
- Disciplines pratiquees
- Couleurs du club
- Logo
- RIB/IBAN
- Statut de validation

Workflow de validation:
1. Club cree son dossier -> Statut: pending
2. Upload des documents obligatoires
3. Federation examine le dossier
4. Federation approuve -> Statut: active
   OU Federation rejette -> Statut: pending avec motif
5. Club peut modifier et resoumettre


MODULE 3: MEMBRES ET ADHESION

Caracteristiques:
- Base de donnees complete des membres
- Distinction adherent vs joueur de club
- Historique des affectations
- Import en masse via CSV
- Photos de profil
- Consentements RGPD

Tables de donnees:
- members: Informations des membres
- member_org_history: Historique d'affectation aux clubs

Champs des membres:
- Prenom et nom
- Date de naissance
- Sexe
- Nationalite
- Adresse complete
- Ville et region
- Telephone
- Email
- Numero de licence federale
- Numero de passeport
- Numero d'assurance
- Type de piece d'identite (CIN/Passeport)
- Numero de piece d'identite
- Contact d'urgence (nom et telephone)
- Photo de profil
- Discipline pratiquee
- Categorie d'age
- Positions jouees
- Numero de maillot
- Statut du membre (actif, inactif, suspendu, archive)
- Date d'inscription
- Type d'adhesion
- Statut medical
- Date de derniere visite medicale
- Aptitude medicale
- Numero de licence
- Saison de licence
- Type de licence
- Statut de licence
- Consentement RGPD
- Consentement medical
- Consentement photo/video

Regles metier:
- Adherent = membre sans affectation club active
- Joueur club = membre avec affectation club active
- Un membre ne peut etre affecte qu'a un seul club a la fois
- Historique complet des mouvements entre clubs


MODULE 4: LICENCES

Caracteristiques:
- Gestion des saisons sportives
- Categories d'age et de sexe
- Creation et renouvellement de licences
- Activation conditionnee au paiement
- Evenements traces (creation, activation, archivage)

Tables de donnees:
- seasons: Saisons sportives
- categories: Categories d'age et de sexe
- licenses: Licences des membres
- license_events: Historique des evenements

Statuts des licences:
- draft: Brouillon en creation
- pending_payment: En attente de paiement
- active: Activee et valide
- archived: Archivee en fin de saison

Categories standard:
- U7: Moins de 7 ans
- U9: Moins de 9 ans
- U11: Moins de 11 ans
- U13: Moins de 13 ans
- U15: Moins de 15 ans
- U17: Moins de 17 ans
- U20: Moins de 20 ans
- Seniors: 18 ans et plus

Workflow licence:
1. Club cree licence pour un membre
2. Licence en statut draft
3. Club initie paiement
4. Licence passe en pending_payment
5. Club upload recu de paiement
6. Finance valide le paiement
7. Licence passe en active
8. Attestation PDF generee automatiquement
9. Email de confirmation envoye
10. Fin de saison: licence archivee


MODULE 5: PAIEMENTS

Caracteristiques:
- Machine a etats stricte
- Upload de recus de virement
- Validation par responsable financier
- Motifs structures pour approbation/rejet
- Traçabilite complete
- Generation automatique d'attestations

Tables de donnees:
- payments: Paiements effectues
- documents: Metadonnees des recus

Statuts des paiements:
- pending_receipt: Paiement cree, recu non fourni
- pending_review: Recu uploade, attente validation
- approved: Valide par finance
- rejected: Rejete avec motif

Champs des paiements:
- Montant en centimes
- Devise (MAD ou EUR)
- Statut
- Organisation (club)
- Membre concerne
- Saison
- Reference interne
- Description
- Document du recu
- Date de creation
- Validateur (responsable finance)
- Date de validation/rejet
- Motif de validation/rejet
- Note complementaire

Motifs de rejet structures:
- Montant incorrect
- Recu non lisible
- Recu ancien ou deja utilise
- Virement non trouve dans les comptes
- Autre (avec commentaire obligatoire)

Workflow paiement:
1. Club cree paiement -> pending_receipt
2. Club upload recu PDF/JPG -> pending_review
3. Finance examine le recu
4. Si OK: approved -> Active licence + Attestation + Email
5. Si KO: rejected -> Notification club + Re-upload possible
6. Club peut re-uploader nouveau recu


MODULE 6: MEDICAL

Caracteristiques:
- Acces tres restreint (medecins seulement)
- Audit renforce de toutes les consultations
- Dossiers medicaux complets
- Suivi des blessures
- Rapports PDF generes
- Retention legale des donnees

Tables de donnees:
- medical_visits: Consultations medicales
- injuries: Blessures et pathologies

Champs des visites medicales:
- Membre concerne
- Organisation
- Date de visite
- Type de visite (controle, diagnostic, test, autre)
- Notes et observations
- Tests effectues
- Resultats des tests
- Traitement recommande
- Statut (draft ou final)
- Medecin createur
- Date de creation

Champs des blessures:
- Membre concerne
- Organisation
- Date de survenue
- Partie du corps touchee
- Severite (faible, moyenne, elevee)
- Statut (ouvert, ferme)
- Notes
- Duree estimee de retablissement
- Traitement suivi
- Medecin createur

Regles d'acces medical:
- Medecins: Acces complet a tous les dossiers
- DTN: Consultation des dossiers des joueurs selectionnes uniquement
- Autres roles: Aucun acces
- Admin federation: Acces pour audit seulement
- Chaque consultation est tracee dans l'audit log


MODULE 7: SPORTS

Caracteristiques:
- Gestion des competitions
- Calendrier des matchs
- Feuilles de match electroniques
- Evenements de match (buts, penalties, cartons)
- Classements automatiques
- Scores et statistiques

Tables de donnees:
- competitions: Competitions et tournois
- teams: Equipes inscrites
- matches: Matchs programmes
- match_events: Evenements pendant les matchs

Champs des competitions:
- Nom de la competition
- Saison
- Niveau (club, national, international)
- Statut (draft, published, archived)
- Date de debut
- Date de fin
- Createur

Champs des matchs:
- Competition
- Saison
- Equipe domicile
- Equipe exterieure
- Date et heure
- Lieu (venue)
- Statut (scheduled, in_progress, finished, cancelled)
- Score domicile
- Score exterieur

Types d'evenements de match:
- But marque
- Penalty
- Carton jaune
- Carton rouge
- Remplacement
- Autres evenements

Workflow sportif:
1. Federation cree competition
2. Clubs inscrivent leurs equipes
3. Federation programme les matchs
4. Arbitre remplit feuille de match
5. Arbitre enregistre les evenements
6. Arbitre valide la feuille
7. Scores mis a jour automatiquement
8. Classements recalcules


MODULE 8: COMMUNICATION

Caracteristiques:
- Actualites federales
- Messages internes entre organisations
- Notifications in-app
- Emails transactionnels automatiques
- Formulaire de contact public

Tables de donnees:
- news_posts: Actualites
- messages: Messages internes
- notifications: Notifications utilisateurs
- contact_messages: Messages de contact public

Types de notifications automatiques:
- Licence activee
- Paiement approuve
- Paiement rejete
- Nouveau message recu
- Convocation a un match
- Validation de club
- Changement de statut
- Rappels et alertes

Champs des actualites:
- Titre
- Contenu
- Statut (draft, published, archived)
- Date de publication
- Auteur

Fonctionnalites email:
- Confirmation de creation de compte
- Reset de mot de passe
- Notification de paiement approuve avec attestation
- Notification de paiement rejete
- Notification de licence activee
- Convocations aux matchs
- Alertes administratives


MODULE 9: AUDIT

Caracteristiques:
- Journal immuable (append-only)
- Tracabilite complete des operations sensibles
- Recherche et filtrage avances
- Exports pour conformite
- Retention longue duree (7 ans minimum)

Table de donnees:
- audit_log: Journal d'audit

Champs de l'audit log:
- Acteur (utilisateur qui effectue l'action)
- Action effectuee
- Type d'entite concernee
- ID de l'entite
- Organisation concernee
- Metadonnees (JSON): anciennes valeurs, nouvelles valeurs, contexte
- Adresse IP
- User-agent
- Date et heure (precision milliseconde)

Operations auditees:
- Creation de paiement
- Upload de recu
- Approbation de paiement
- Rejet de paiement
- Creation de licence
- Activation de licence
- Archivage de licence
- Consultation de dossier medical
- Creation/modification dossier medical
- Generation de rapport medical
- Changement de role utilisateur
- Changement de scope utilisateur
- Validation de club
- Suspension de club
- Upload de document
- Suppression de document
- Tentatives de connexion (succes et echec)


MODULE 10: GESTION DU MATERIEL

Caracteristiques:
- Inventaire complet du materiel de la federation et des clubs
- Suivi des mouvements (entrees et sorties)
- Affectation du materiel aux clubs ou equipes
- Historique des affectations
- Gestion des categories de materiel
- Suivi de l'etat et de la quantite
- Alertes sur stock faible
- Rapports d'inventaire

Tables de donnees:
- equipment_categories: Categories de materiel
- equipment_items: Articles de materiel
- equipment_movements: Historique des mouvements
- equipment_assignments: Affectations aux clubs/equipes

Champs des categories de materiel:
- Nom de la categorie (ex: Equipement sportif, Materiel medical, Bureautique)
- Description
- Code de categorie
- Statut (actif/inactif)

Champs des articles de materiel:
- Nom de l'article
- Categorie
- Reference ou numero de serie
- Description detaillee
- Quantite en stock
- Quantite minimale (seuil d'alerte)
- Etat (neuf, bon, usage, endommage, hors service)
- Valeur unitaire
- Date d'acquisition
- Fournisseur
- Localisation (federation, club specifique, entrepot)
- Organisation proprietaire
- Photo (facultatif)
- Notes

Types de mouvements:
- Entree (achat, don, retour)
- Sortie (affectation, pret, vente, perte)
- Transfert (entre clubs ou lieux)
- Retour (restitution)
- Mise au rebut

Champs des mouvements:
- Article concerne
- Type de mouvement
- Quantite
- Date du mouvement
- Organisation source
- Organisation destination
- Utilisateur responsable
- Motif du mouvement
- Notes complementaires
- Document associe (bon de sortie, facture)

Champs des affectations:
- Article
- Organisation affectataire (club ou equipe)
- Quantite affectee
- Date de debut
- Date de fin (null si affectation active)
- Etat lors de l'affectation
- Etat lors du retour
- Responsable de l'affectation
- Notes

Fonctionnalites:
- Creation et edition d'articles
- Enregistrement des entrees (achats, dons)
- Enregistrement des sorties (affectations, prets)
- Transferts entre clubs
- Suivi des retours
- Alertes automatiques si stock inferieur au minimum
- Rapports d'inventaire par categorie
- Rapports d'inventaire par organisation
- Historique complet des mouvements
- Valeur totale du stock
- Export des inventaires (Excel, PDF)

Acces par role:
- Federation admin: Acces complet, gestion globale
- Gestionnaire stock: Creation, modification, mouvements
- Club admin: Consultation materiel affecte a son club
- Autres roles: Pas d'acces


MODULE 11: DOCUMENTS

Caracteristiques:
- Stockage dans MinIO (S3 compatible)
- Metadonnees en base de donnees
- Versioning active
- Checksums pour integrite
- URL signees temporaires pour telechargement
- Types de fichiers controles

Table de donnees:
- documents: Metadonnees des fichiers

Champs des documents:
- ID unique
- Bucket de stockage
- Cle d'objet (object key)
- Type MIME
- Taille en octets
- Checksum SHA256
- Nom de fichier original
- Createur
- Date de creation

Types de documents:
- Recus de paiement (PDF, JPG, PNG)
- Documents administratifs clubs (PDF, DOC, DOCX)
- Logos (JPG, PNG)
- Rapports medicaux (PDF)
- Photos de profil (JPG, PNG)
- Attestations generees (PDF)
- Bons de sortie materiel (PDF)
- Factures d'achat materiel (PDF)

Validations:
- Types MIME whitelist uniquement
- Taille maximale: 10 MB pour documents, 5 MB pour logos
- Verification magic bytes (pas seulement extension)
- Scan antivirus asynchrone (roadmap)


=================================================================================
4. STRUCTURE DES DONNEES ET TABLES DE BASE DE DONNEES
=================================================================================

BASE DE DONNEES: PostgreSQL 14+

TABLE: users
Description: Comptes utilisateurs
Champs:
- id (UUID, cle primaire): Identifiant unique
- email (text, unique): Adresse email
- display_name (text): Nom d'affichage
- password_dev (text): Mot de passe (dev uniquement, sera remplace par hash bcrypt)
- org_id (UUID, nullable): Organisation associee
- is_active (boolean): Compte actif ou non
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de derniere modification

TABLE: roles
Description: Definitions des roles systeme
Champs:
- id (UUID, cle primaire): Identifiant unique
- name (text, unique): Nom du role
- created_at (timestamptz): Date de creation
Roles predefinisvalues:
- federation_admin
- club_admin
- national_staff
- finance
- medecin
- arbitre
- stock

TABLE: user_roles
Description: Association utilisateurs et roles
Champs:
- user_id (UUID, FK users): Utilisateur
- role_id (UUID, FK roles): Role
- Cle primaire: (user_id, role_id)

TABLE: orgs
Description: Organisations (clubs et equipes nationales)
Champs:
- id (UUID, cle primaire): Identifiant unique
- name (text): Nom de l'organisation
- acronym (text): Sigle
- type (text): Type (club ou national_team)
- status (text): Statut (pending, active, suspended, archived)
- organization_type (text): Type d'organisation detaille
- establishment_date (date): Date de creation
- federal_registration_number (text): Numero d'agrement
- reference_season (text): Saison de reference
- region (text): Region
- city (text): Ville
- full_address (text): Adresse complete
- primary_phone (text): Telephone principal
- official_email (text): Email officiel
- website (text): Site web
- social_media (jsonb): Reseaux sociaux (JSON)
- president_name (text): Nom du president
- secretary_general_name (text): Nom du secretaire general
- treasurer_name (text): Nom du tresorier
- primary_contact_name (text): Contact principal
- primary_contact_phone (text): Telephone contact
- active_categories (text array): Categories actives
- practiced_disciplines (text array): Disciplines pratiquees
- club_colors (jsonb): Couleurs du club (JSON)
- logo_document_id (UUID, FK documents): Logo
- rib_iban (text): RIB/IBAN
- financial_status (text): Statut financier
- validation_date (timestamptz): Date de validation
- validated_by (UUID, FK users): Validateur
- rejection_reason (text): Motif de rejet
- suspension_reason (text): Motif de suspension
- archived (boolean): Archive ou non
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de modification
- created_by (UUID, FK users): Createur
- updated_by (UUID, FK users): Modificateur

TABLE: org_staff
Description: Personnel affecte aux organisations
Champs:
- org_id (UUID, FK orgs): Organisation
- user_id (UUID, FK users): Utilisateur
- title (text): Titre/fonction
- created_at (timestamptz): Date d'affectation
- Cle primaire: (org_id, user_id)

TABLE: org_documents
Description: Documents administratifs des organisations
Champs:
- id (UUID, cle primaire): Identifiant unique
- org_id (UUID, FK orgs): Organisation
- document_type (text): Type (statutes, legal_receipt, bank_certificate, insurance, ag_pv, other)
- document_id (UUID, FK documents): Document
- description (text): Description
- document_date (date): Date du document
- created_at (timestamptz): Date d'upload
- created_by (UUID, FK users): Createur

TABLE: members
Description: Membres et joueurs
Champs:
- id (UUID, cle primaire): Identifiant unique
- first_name (text): Prenom
- last_name (text): Nom
- date_of_birth (date): Date de naissance
- sex (text): Sexe (M ou F)
- profile_photo_id (UUID, FK documents): Photo de profil
- member_number (text, unique): Numero de membre
- nationality (text): Nationalite
- id_number (text): Numero de piece d'identite
- id_type (text): Type de piece (cin ou passport)
- address (text): Adresse
- city (text): Ville
- region (text): Region
- phone (text): Telephone
- email (text): Email
- emergency_contact_name (text): Contact d'urgence nom
- emergency_contact_phone (text): Contact d'urgence telephone
- discipline (text): Discipline
- age_category (text): Categorie d'age
- positions (text array): Positions jouees
- jersey_number (text): Numero de maillot
- status (text): Statut (active, inactive, suspended, archived)
- registration_date (date): Date d'inscription
- member_status (text): Statut membre (adherent ou club_player)
- subscription_type (text): Type d'adhesion
- season_id (UUID): Saison
- subscription_amount (numeric): Montant adhesion
- payment_method (text): Methode de paiement
- payment_status (text): Statut paiement (pending, paid, overdue)
- payment_date (date): Date de paiement
- payment_reference (text): Reference de paiement
- medical_status (text): Statut medical
- last_medical_visit_date (date): Date derniere visite medicale
- federation_doctor (text): Medecin federal
- medical_fitness (text): Aptitude medicale
- fitness_expiration_date (date): Date expiration aptitude
- license_number (text): Numero de licence
- license_season (text): Saison de licence
- license_type (text): Type de licence
- license_status (text): Statut licence
- license_issue_date (date): Date emission licence
- license_expiration_date (date): Date expiration licence
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de modification

TABLE: member_org_history
Description: Historique d'affectation des membres aux organisations
Champs:
- id (UUID, cle primaire): Identifiant unique
- member_id (UUID, FK members): Membre
- org_id (UUID, FK orgs): Organisation
- start_date (date): Date de debut
- end_date (date, nullable): Date de fin (null = affectation active)
- created_at (timestamptz): Date de creation
Contrainte: Un membre ne peut avoir qu'une seule affectation active (end_date null)

TABLE: seasons
Description: Saisons sportives
Champs:
- id (UUID, cle primaire): Identifiant unique
- code (text, unique): Code (ex: 2024-2025)
- name (text): Nom
- starts_on (date): Date de debut
- ends_on (date): Date de fin
- is_active (boolean): Saison active
- created_at (timestamptz): Date de creation

TABLE: categories
Description: Categories d'age et de sexe
Champs:
- id (UUID, cle primaire): Identifiant unique
- name (text): Nom (U7, U9, U11, U13, U15, U17, U20, Senior)
- sex (text, nullable): Sexe (M, F, ou null pour mixte)
- min_age (integer, nullable): Age minimum
- max_age (integer, nullable): Age maximum
- created_at (timestamptz): Date de creation

TABLE: licenses
Description: Licences des membres
Champs:
- id (UUID, cle primaire): Identifiant unique
- member_id (UUID, FK members): Membre
- season_id (UUID, FK seasons): Saison
- category_id (UUID, FK categories): Categorie
- status (text): Statut (draft, pending_payment, active, archived)
- amount_cents (integer): Montant en centimes
- currency (text): Devise
- notes (text): Notes
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de modification
Contrainte: Unicite (member_id, season_id)

TABLE: license_events
Description: Historique des evenements de licence
Champs:
- id (UUID, cle primaire): Identifiant unique
- license_id (UUID, FK licenses): Licence
- event_type (text): Type d'evenement
- note (text): Note
- actor_user_id (UUID, FK users): Acteur
- created_at (timestamptz): Date de creation

TABLE: documents
Description: Metadonnees des fichiers stockes
Champs:
- id (UUID, cle primaire): Identifiant unique
- bucket (text): Bucket MinIO
- object_key (text): Cle d'objet
- mime_type (text): Type MIME
- size_bytes (bigint): Taille en octets
- sha256 (text): Checksum SHA256
- filename (text): Nom de fichier
- file_data (text): Donnees (base64 ou reference)
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation
Contrainte: Unicite (bucket, object_key)

TABLE: payments
Description: Paiements effectues
Champs:
- id (UUID, cle primaire): Identifiant unique
- org_id (UUID, FK orgs): Organisation
- member_id (UUID, FK members, nullable): Membre concerne
- season_id (UUID, FK seasons, nullable): Saison
- amount_cents (integer): Montant en centimes
- currency (text): Devise (MAD par defaut)
- status (text): Statut (pending_receipt, pending_review, approved, rejected)
- receipt_document_id (UUID, FK documents, nullable): Recu
- created_by (UUID, FK users): Createur
- reviewed_by (UUID, FK users, nullable): Validateur
- review_note (text): Note de validation
- review_reason (text): Motif de validation/rejet
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de modification

TABLE: medical_visits
Description: Consultations medicales
Champs:
- id (UUID, cle primaire): Identifiant unique
- member_id (UUID, FK members): Membre
- org_id (UUID, FK orgs, nullable): Organisation
- visit_date (date): Date de visite
- kind (text): Type (checkup, injury, test, other)
- notes (text): Notes
- status (text): Statut (draft, final)
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de modification

TABLE: injuries
Description: Blessures
Champs:
- id (UUID, cle primaire): Identifiant unique
- member_id (UUID, FK members): Membre
- org_id (UUID, FK orgs, nullable): Organisation
- occurred_on (date): Date de survenue
- body_part (text): Partie du corps
- severity (text): Severite (low, medium, high, unknown)
- status (text): Statut (open, closed)
- notes (text): Notes
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation

TABLE: competitions
Description: Competitions sportives
Champs:
- id (UUID, cle primaire): Identifiant unique
- season_id (UUID, FK seasons, nullable): Saison
- name (text): Nom
- level (text): Niveau (club, national, international)
- status (text): Statut (draft, published, archived)
- starts_on (date): Date de debut
- ends_on (date): Date de fin
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation

TABLE: teams
Description: Equipes
Champs:
- id (UUID, cle primaire): Identifiant unique
- org_id (UUID, FK orgs): Organisation
- name (text): Nom
- category (text): Categorie
- status (text): Statut (active, inactive)
- created_at (timestamptz): Date de creation

TABLE: matches
Description: Matchs programmes
Champs:
- id (UUID, cle primaire): Identifiant unique
- competition_id (UUID, FK competitions, nullable): Competition
- season_id (UUID, FK seasons, nullable): Saison
- home_team_id (UUID, FK teams): Equipe domicile
- away_team_id (UUID, FK teams): Equipe exterieure
- starts_at (timestamptz): Date et heure
- venue (text): Lieu
- status (text): Statut (scheduled, in_progress, finished, cancelled)
- home_score (integer): Score domicile
- away_score (integer): Score exterieur
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation

TABLE: match_events
Description: Evenements de match
Champs:
- id (UUID, cle primaire): Identifiant unique
- match_id (UUID, FK matches): Match
- team_id (UUID, FK teams, nullable): Equipe
- member_id (UUID, FK members, nullable): Membre
- minute (integer): Minute
- type (text): Type d'evenement
- payload (jsonb): Donnees complementaires (JSON)
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation

TABLE: equipment_categories
Description: Categories de materiel
Champs:
- id (UUID, cle primaire): Identifiant unique
- name (text, unique): Nom de la categorie
- code (text): Code de categorie
- description (text): Description
- status (text): Statut (active, inactive)
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de modification

TABLE: equipment_items
Description: Articles de materiel en inventaire
Champs:
- id (UUID, cle primaire): Identifiant unique
- name (text): Nom de l'article
- category_id (UUID, FK equipment_categories): Categorie
- reference (text): Reference ou numero de serie
- description (text): Description detaillee
- quantity (integer): Quantite en stock
- min_quantity (integer): Quantite minimale (alerte)
- condition (text): Etat (new, good, used, damaged, out_of_service)
- unit_value (numeric): Valeur unitaire
- acquisition_date (date): Date d'acquisition
- supplier (text): Fournisseur
- location (text): Localisation
- owner_org_id (UUID, FK orgs, nullable): Organisation proprietaire
- photo_document_id (UUID, FK documents, nullable): Photo
- notes (text): Notes
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de modification

TABLE: equipment_movements
Description: Historique des mouvements de materiel
Champs:
- id (UUID, cle primaire): Identifiant unique
- item_id (UUID, FK equipment_items): Article concerne
- movement_type (text): Type (in, out, transfer, return, disposal)
- quantity (integer): Quantite
- movement_date (date): Date du mouvement
- source_org_id (UUID, FK orgs, nullable): Organisation source
- destination_org_id (UUID, FK orgs, nullable): Organisation destination
- reason (text): Motif du mouvement
- notes (text): Notes complementaires
- document_id (UUID, FK documents, nullable): Document justificatif
- created_by (UUID, FK users): Responsable
- created_at (timestamptz): Date de creation

TABLE: equipment_assignments
Description: Affectations de materiel aux organisations
Champs:
- id (UUID, cle primaire): Identifiant unique
- item_id (UUID, FK equipment_items): Article
- org_id (UUID, FK orgs): Organisation affectataire
- quantity (integer): Quantite affectee
- start_date (date): Date de debut
- end_date (date, nullable): Date de fin (null si active)
- condition_at_assignment (text): Etat lors affectation
- condition_at_return (text, nullable): Etat lors du retour
- responsible_person (text): Responsable
- notes (text): Notes
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation
- updated_at (timestamptz): Date de modification

TABLE: news_posts
Description: Actualites
Champs:
- id (UUID, cle primaire): Identifiant unique
- title (text): Titre
- body (text): Contenu
- status (text): Statut (draft, published, archived)
- published_at (timestamptz): Date de publication
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation

TABLE: messages
Description: Messages internes
Champs:
- id (UUID, cle primaire): Identifiant unique
- from_org_id (UUID, FK orgs, nullable): Organisation expeditrice
- to_org_id (UUID, FK orgs, nullable): Organisation destinataire
- subject (text): Sujet
- body (text): Contenu
- created_by (UUID, FK users): Createur
- created_at (timestamptz): Date de creation

TABLE: notifications
Description: Notifications utilisateurs
Champs:
- id (UUID, cle primaire): Identifiant unique
- user_id (UUID, FK users): Utilisateur
- type (text): Type
- title (text): Titre
- body (text): Contenu
- read_at (timestamptz, nullable): Date de lecture
- created_at (timestamptz): Date de creation

TABLE: contact_messages
Description: Messages du formulaire de contact public
Champs:
- id (UUID, cle primaire): Identifiant unique
- name (text): Nom
- email (text): Email
- subject (text): Sujet
- message (text): Message
- ip (text): Adresse IP
- user_agent (text): User agent
- created_at (timestamptz): Date de creation

TABLE: audit_log
Description: Journal d'audit
Champs:
- id (UUID, cle primaire): Identifiant unique
- actor_user_id (UUID, FK users, nullable): Acteur
- action (text): Action
- entity_type (text): Type d'entite
- entity_id (UUID, nullable): ID de l'entite
- org_id (UUID, FK orgs, nullable): Organisation
- metadata (jsonb): Metadonnees (JSON)
- created_at (timestamptz): Date de creation


INDEX ET PERFORMANCES

Index principaux crees:
- users: email (unique)
- orgs: status, type, region, city, federal_registration_number
- members: nom et prenom (lowercase), member_number
- member_org_history: member_id avec condition end_date null (affectation active unique)
- licenses: status, season_id, (member_id, season_id) unique
- payments: status, org_id, season_id
- documents: (bucket, object_key) unique, created_by, created_at
- medical_visits: member_id, org_id, visit_date
- injuries: member_id, status
- competitions: season_id, status
- teams: org_id
- matches: competition_id, starts_at
- match_events: match_id
- news_posts: status, published_at
- messages: created_at, from_org_id, to_org_id
- notifications: user_id avec created_at, user_id avec condition read_at null
- contact_messages: created_at, (ip, created_at)
- audit_log: created_at, (entity_type, entity_id), org_id


=================================================================================
5. FORMULAIRES ET CHAMPS DETAILLES
=================================================================================

FORMULAIRE 1: CREATION/EDITION DE CLUB

Onglet 1: Informations Generales
Champs:
- Nom du club (text, obligatoire, min 3 caracteres)
- Acronyme (text, facultatif)
- Type d'organisation (dropdown, obligatoire: Association, Club, Club omnisports, Federation)
- Date de creation (date, facultatif, passee)
- Numero d'agrement federal (text, facultatif, pattern FRM-)
- Saison de reference (text, facultatif, ex: 2024-2025)

Onglet 2: Informations Administratives
Champs:
- Region (dropdown, obligatoire, 12 regions du Maroc)
- Ville (dropdown, obligatoire, dependent de la region)
- Adresse complete (textarea, facultatif)
- Telephone (tel, facultatif, format Maroc +212 ou 06)
- Email officiel (email, obligatoire, RFC 5322)
- Site web (url, facultatif, https://)
- Facebook (url, facultatif, https://facebook.com/...)
- Instagram (url, facultatif, https://instagram.com/...)
- Twitter (url, facultatif, https://twitter.com/...)
- YouTube (url, facultatif, https://youtube.com/...)

Onglet 3: Responsables et Contacts
Champs:
- Nom du president (text, facultatif)
- Nom du secretaire general (text, facultatif)
- Nom du tresorier (text, facultatif)
- Contact administratif principal (text, facultatif)
- Telephone du contact (tel, facultatif, format Maroc)

Onglet 4: Parametres Sportifs
Champs:
- Categories actives (checkbox multiple, facultatif: U7, U9, U11, U13, U15, U17, U20, Seniors)
- Disciplines (checkbox multiple, facultatif: Hockey glace, Roller, En ligne)
- Couleur primaire (color picker, facultatif, format hex)
- Couleur secondaire (color picker, facultatif, format hex)
- Logo (file upload, facultatif, JPG/PNG, max 5MB, 512x512px recommande)

Onglet 5: Parametres Financiers
Champs:
- RIB/IBAN (text, facultatif, pattern IBAN Maroc MA64...)

Onglet 6: Documents Administratifs (edition uniquement)
Documents uploadables:
- Statuts du club (PDF/DOC, versioning)
- Recepisse legal (PDF/JPG, versioning)
- Attestation bancaire (PDF, versioning)
- Assurance (PDF, versioning)
- PV Assemblee Generale (PDF/DOC, versioning)
- Autre document (tous types, versioning)
Actions: Ajouter, Telecharger, Supprimer (soft-delete)


FORMULAIRE 2: CREATION/EDITION DE MEMBRE

Champs principaux:
- Prenom (text, obligatoire, min 2 caracteres)
- Nom (text, obligatoire, min 2 caracteres)
- Date de naissance (date, obligatoire, min 5 ans)
- Sexe (dropdown, obligatoire: M ou F)
- Nationalite (dropdown, obligatoire)
- Type de piece d'identite (dropdown, facultatif: CIN ou Passeport)
- Numero de piece d'identite (text, facultatif)
- Adresse (textarea, facultatif)
- Ville (text, facultatif)
- Region (dropdown, facultatif)
- Telephone (tel, facultatif, format Maroc)
- Email (email, facultatif, RFC 5322)
- Contact d'urgence nom (text, facultatif)
- Contact d'urgence telephone (tel, facultatif, format Maroc)
- Photo de profil (file upload, facultatif, JPG/PNG, max 2MB)
- Discipline (dropdown, facultatif)
- Categorie d'age (dropdown, facultatif)
- Positions (checkbox multiple, facultatif)
- Numero de maillot (text, facultatif)
- Numero de licence federale (text, facultatif, genere automatiquement)
- Numero de passeport (text, facultatif, pattern international)
- Numero d'assurance (text, facultatif)
- Consentement RGPD (checkbox, obligatoire)
- Consentement medical (checkbox, facultatif)
- Consentement photo/video (checkbox, facultatif)
- Club d'affectation (dropdown, facultatif, clubs actifs)


FORMULAIRE 3: CREATION DE LICENCE

Champs:
- Saison (dropdown, obligatoire, saisons actives)
- Categorie (dropdown, obligatoire, categories de la saison: U9, U11, etc.)
- Membre (dropdown avec recherche, obligatoire, auto-complete)
- Montant licence (currency, facultatif, MAD/EUR, auto-rempli selon categorie)
- Notes (textarea, facultatif)

Actions:
- Creer: Statut draft
- Associer paiement: Statut pending_payment


FORMULAIRE 4: CREATION DE PAIEMENT

Section Creation:
Champs:
- Club (dropdown, obligatoire, auto si club_admin)
- Montant (currency, obligatoire, superieur a 0, en centimes)
- Devise (dropdown, obligatoire: MAD ou EUR, defaut MAD)
- Reference interne (text, facultatif, numero de facture)
- Description (textarea, facultatif, details du paiement)
- Licences associees (multi-select, facultatif, licences du club)

Section Upload de Recu:
Champs:
- Fichier (file, obligatoire, PDF/JPG/PNG, max 10MB)
- Description (text, facultatif, ex: Virement RIB client)
- Date du document (date, obligatoire, anterieure ou egale a aujourd'hui)

Section Validation (finance uniquement):
Champs:
- Motif d'approbation (text, facultatif)
- Motif de rejet (dropdown, obligatoire si rejet):
  - Montant incorrect
  - Recu non lisible
  - Recu ancien
  - Virement non trouve
  - Autre (commentaire obligatoire)
- Commentaire (textarea, facultatif pour approbation, obligatoire si rejet avec motif Autre)


FORMULAIRE 5: VISITE MEDICALE

Champs:
- Joueur (dropdown avec recherche, obligatoire, membres de la base)
- Date de visite (datetime, obligatoire, anterieure ou egale a maintenant)
- Type de visite (dropdown, obligatoire: Controle, Diagnostic, Suivi, Autre)
- Diagnostic (textarea, obligatoire)
- Tests effectues (multi-select, facultatif: Test A, Test B, etc.)
- Resultats (textarea, facultatif)
- Traitement recommande (textarea, facultatif)
- Observations (textarea, facultatif)


FORMULAIRE 6: BLESSURE

Champs:
- Joueur (dropdown avec recherche, obligatoire, membres de la base)
- Date de blessure (date, obligatoire, anterieure ou egale a aujourd'hui)
- Type de blessure (dropdown, obligatoire: Fracture, Entorse, Dechirure, Contusion, etc.)
- Localisation (text, obligatoire, ex: Genou droit)
- Gravite (slider, obligatoire, 1 a 5: 1 legere, 5 grave)
- Duree estimee en jours (number, facultatif, superieur a 0)
- Traitement (textarea, facultatif)
- Suivi medical (checkbox, obligatoire, visite de suivi planifiee?)


FORMULAIRE 7: COMPETITION

Champs:
- Nom de la competition (text, obligatoire, min 3 caracteres)
- Saison (dropdown, facultatif, saisons disponibles)
- Niveau (dropdown, obligatoire: Club, National, International)
- Date de debut (date, facultatif)
- Date de fin (date, facultatif)
- Statut (dropdown: Draft, Published, Archived)


FORMULAIRE 8: MATCH

Champs:
- Competition (dropdown, facultatif, competitions publiees)
- Saison (dropdown, facultatif)
- Equipe domicile (dropdown, obligatoire, equipes actives)
- Equipe exterieure (dropdown, obligatoire, equipes actives)
- Date et heure (datetime, obligatoire)
- Lieu (text, facultatif, nom du venue)
- Statut (dropdown: Scheduled, In progress, Finished, Cancelled)


FORMULAIRE 9: FEUILLE DE MATCH (arbitre)

Champs:
- Match (selection automatique)
- Arbitre principal (text)
- Arbitres assistants (text)
- Equipes (pre-remplies)
- Evenements:
  - Minute (number)
  - Equipe (dropdown)
  - Joueur (dropdown)
  - Type (dropdown: But, Penalty, Carton jaune, Carton rouge, Remplacement)
  - Details (text)
- Score final domicile (number)
- Score final exterieur (number)
- Signature arbitre (checkbox de validation)


FORMULAIRE 10: ACTUALITE

Champs:
- Titre (text, obligatoire, min 5 caracteres)
- Contenu (rich text editor, obligatoire)
- Statut (dropdown: Draft, Published, Archived)
- Date de publication (datetime, facultatif, auto si published)


FORMULAIRE 11: ARTICLE DE MATERIEL

Section Informations Generales:
Champs:
- Nom de l'article (text, obligatoire, min 3 caracteres)
- Categorie (dropdown, obligatoire, categories actives)
- Reference ou numero de serie (text, facultatif)
- Description (textarea, facultatif)
- Photo (file upload, facultatif, JPG/PNG, max 2MB)

Section Stock:
Champs:
- Quantite initiale (number, obligatoire, min 0)
- Quantite minimale (number, facultatif, seuil d'alerte)
- Etat (dropdown, obligatoire: Neuf, Bon, Usage, Endommage, Hors service)
- Localisation (dropdown: Federation, Club specifique, Entrepot)
- Organisation proprietaire (dropdown, facultatif, clubs actifs)

Section Informations Financieres:
Champs:
- Valeur unitaire (currency, facultatif, MAD)
- Date d'acquisition (date, facultatif)
- Fournisseur (text, facultatif)
- Facture (file upload, facultatif, PDF, max 5MB)

Section Notes:
Champs:
- Notes complementaires (textarea, facultatif)


FORMULAIRE 12: MOUVEMENT DE MATERIEL

Champs:
- Article (dropdown avec recherche, obligatoire)
- Type de mouvement (dropdown, obligatoire: Entree, Sortie, Transfert, Retour, Mise au rebut)
- Quantite (number, obligatoire, superieur a 0)
- Date du mouvement (date, obligatoire, defaut aujourd'hui)
- Organisation source (dropdown, selon type de mouvement)
- Organisation destination (dropdown, selon type de mouvement)
- Motif (dropdown structure selon type):
  - Si Entree: Achat, Don, Retour
  - Si Sortie: Affectation, Pret, Vente, Perte
  - Si Transfert: Besoin club, Reparation
  - Si Retour: Fin de pret, Fin de saison
  - Si Mise au rebut: Endommage irreparable, Obsolete
- Notes (textarea, facultatif)
- Document justificatif (file upload, facultatif, PDF, max 5MB)


FORMULAIRE 13: AFFECTATION DE MATERIEL

Champs:
- Article (dropdown avec recherche, obligatoire)
- Quantite (number, obligatoire, max = quantite disponible)
- Organisation affectataire (dropdown, obligatoire, clubs actifs)
- Date de debut (date, obligatoire, defaut aujourd'hui)
- Date de fin prevue (date, facultatif)
- Etat lors de l'affectation (dropdown: Neuf, Bon, Usage)
- Responsable (text, facultatif, nom du responsable dans le club)
- Notes (textarea, facultatif, conditions d'utilisation)


FORMULAIRE 14: CONTACT PUBLIC

Champs:
- Nom (text, obligatoire, min 2 caracteres)
- Email (email, obligatoire, RFC 5322)
- Sujet (text, obligatoire, min 3 caracteres)
- Message (textarea, obligatoire, min 10 caracteres)
- CAPTCHA (pour anti-spam)


=================================================================================
6. FLUX DE TRAVAIL ET PROCESSUS METIER
=================================================================================

WORKFLOW 1: CREATION ET VALIDATION DE CLUB

Etape 1: Creation du dossier club
- Club admin ou federation initie la creation
- Remplissage du formulaire multi-onglets (6 sections)
- Upload du logo (facultatif)
- Soumission du dossier
- Statut automatique: pending

Etape 2: Notification
- Email a la federation: Nouveau club en attente de validation
- Email au club: Dossier recu, en attente de validation

Etape 3: Upload des documents obligatoires
- Club se connecte
- Va dans Documents administratifs
- Upload: Statuts, Recepisse, RIB, Assurance, PV AG
- Chaque document est versionne

Etape 4: Examen par la federation
- Federation admin consulte le dossier complet
- Verifie toutes les informations
- Verifie tous les documents
- Decision: Approuver ou Rejeter

Etape 5a: Approbation
- Federation clique Approuver
- Statut club passe a: active
- Email au club: Validation approuvee, acces plateforme active
- Audit log: action org.approved avec acteur et timestamp
- Club peut maintenant utiliser toutes les fonctionnalites

Etape 5b: Rejet
- Federation clique Rejeter
- Federation saisit le motif du rejet
- Statut reste: pending
- Email au club: Dossier demande modifications avec le motif
- Club peut modifier et resoumettre
- Audit log: action org.rejected avec acteur, motif et timestamp


WORKFLOW 2: CREATION DE LICENCE ET PAIEMENT

Etape 1: Creation de la licence
- Club admin selectionne un membre
- Selectionne la saison courante
- Choisit la categorie appropriee (U9, U11, etc.)
- Montant auto-calcule selon la categorie
- Clic Creer
- Statut licence: draft
- Audit log: license.created

Etape 2: Initiation du paiement
- Club admin va dans Paiements
- Clic Creer nouveau paiement
- Selectionne la ou les licences a payer
- Montant = somme des licences
- Devise: MAD (par defaut)
- Ajoute reference et description
- Clic Creer
- Statut paiement: pending_receipt
- Statut licences associees: pending_payment
- Email au club: Paiement initie, upload recu attendu
- Audit log: payment.created

Etape 3: Upload du recu
- Club effectue le virement bancaire
- Club se connecte a la plateforme
- Va dans Paiements
- Selectionne le paiement en pending_receipt
- Clic Upload recu
- Selectionne fichier PDF ou JPG (max 10MB)
- Saisit date du document
- Clic Uploader
- Fichier stocke dans MinIO
- Statut paiement: pending_review
- Email a finance: Nouveau paiement en attente de validation
- Notification dashboard federation
- Audit log: payment.receipt_uploaded

Etape 4: Validation par finance
- Responsable finance se connecte
- Va dans File de validation
- Liste des paiements en pending_review
- Selectionne un paiement
- Consulte: club, montant, recu (telechargeable)
- Examine le recu de virement
- Decision: Approuver ou Rejeter

Etape 5a: Approbation
- Finance clique Approuver
- Saisit motif (facultatif)
- Statut paiement: approved
- Statut licences: active
- Job asynchrone declenche:
  - Generation attestation PDF
  - Envoi email au club avec attestation
  - Envoi email au joueur: Licence activee
- Audit log: payment.approved et license.activated

Etape 5b: Rejet
- Finance clique Rejeter
- Selectionne motif structure:
  - Montant incorrect
  - Recu non lisible
  - Recu ancien
  - Virement non trouve
  - Autre (commentaire obligatoire)
- Saisit commentaire complementaire
- Statut paiement: rejected
- Statut licences: reste pending_payment
- Email au club: Paiement rejete avec motif, re-upload demande
- Audit log: payment.rejected avec motif

Etape 6: Re-upload apres rejet (si necessaire)
- Club corrige le probleme
- Obtient nouveau recu ou recu correct
- Upload nouveau recu
- Retour a Etape 3 (statut pending_review)
- Cycle de validation recommence


WORKFLOW 3: CONSULTATION DOSSIER MEDICAL

Etape 1: Demande d'acces
- Medecin ou DTN souhaite consulter un dossier
- Se connecte a la plateforme
- Va dans Module Medical
- Recherche le joueur

Etape 2: Verification des permissions
- Systeme verifie le role:
  - Medecin: Acces autorise a tous les dossiers
  - DTN: Acces autorise uniquement aux joueurs de la selection active
  - Autres roles: Acces refuse
- Si autorise: Continue
- Si refuse: Message d'erreur et audit log

Etape 3: Acces au dossier
- Affichage du dossier medical complet:
  - Informations du joueur
  - Historique des visites
  - Blessures en cours et passees
  - Rapports generes
- Audit log: medical.consulted avec acteur, joueur, timestamp, IP

Etape 4: Actions possibles
- Consulter les informations (lecture)
- Creer nouvelle visite medicale
- Enregistrer nouvelle blessure
- Modifier visite ou blessure existante (si createur)
- Generer rapport PDF

Etape 5: Generation de rapport (facultatif)
- Medecin clic Generer rapport
- Systeme compile:
  - Informations joueur
  - Visites recentes
  - Blessures en cours
  - Recommandations
- PDF genere et stocke dans MinIO
- Signature numerique du medecin (facultatif)
- Versioning du rapport
- Audit log: medical.report_generated

Etape 6: Traçabilite complete
- Toutes les consultations sont tracees
- Rapport d'audit disponible:
  - Qui a consulte quel dossier
  - Quand
  - Depuis quelle adresse IP
  - Quelles actions effectuees


WORKFLOW 4: PROGRAMMATION ET FEUILLE DE MATCH

Etape 1: Creation de competition
- Federation admin cree nouvelle competition
- Saisit nom, saison, niveau, dates
- Statut: draft
- Sauvegarde

Etape 2: Publication
- Federation publie la competition
- Statut: published
- Visible par tous les clubs

Etape 3: Inscription des equipes
- Clubs inscrivent leurs equipes
- Selection categorie appropriee
- Validation federation

Etape 4: Programmation des matchs
- Federation cree les matchs
- Selectionne equipe domicile et exterieure
- Definit date, heure et lieu
- Statut match: scheduled
- Calendrier mis a jour automatiquement
- Visible sur site public

Etape 5: Avant le match
- Arbitre se connecte
- Consulte match assigne
- Prepare feuille de match
- Statut match: in_progress

Etape 6: Pendant le match
- Arbitre enregistre les evenements:
  - Buts (equipe, joueur, minute)
  - Penalties
  - Cartons
  - Remplacements
- Evenements sauvegardes en temps reel

Etape 7: Fin du match
- Arbitre saisit scores finaux
- Verifie tous les evenements
- Signe electroniquement la feuille
- Statut match: finished
- Scores publies automatiquement

Etape 8: Apres le match
- Worker recalcule les classements
- Statistiques mises a jour
- Resultats visibles sur site public
- Notifications aux equipes


WORKFLOW 5: GESTION DU MATERIEL

Etape 1: Creation d'un article de materiel
- Gestionnaire stock se connecte
- Va dans Module Materiel
- Clic Nouvel article
- Rempli le formulaire:
  - Nom, categorie, reference
  - Quantite initiale et minimale
  - Etat, localisation
  - Valeur, date acquisition, fournisseur
  - Upload photo (facultatif)
- Sauvegarde
- Article cree avec quantite initiale
- Audit log: equipment.created

Etape 2: Entree de materiel (achat/don)
- Gestionnaire stock clic Nouveau mouvement
- Selectionne l'article
- Type: Entree
- Motif: Achat ou Don
- Quantite ajoutee
- Date du mouvement
- Upload facture (si achat)
- Notes complementaires
- Sauvegarde
- Quantite en stock augmentee automatiquement
- Audit log: equipment.movement_in

Etape 3: Affectation a un club
- Gestionnaire stock ou federation admin
- Clic Nouvelle affectation
- Selectionne article et club
- Quantite a affecter (verifie disponibilite)
- Date de debut
- Date fin prevue (facultatif)
- Etat lors de l'affectation
- Nom du responsable dans le club
- Notes (conditions utilisation)
- Sauvegarde
- Mouvement automatique cree (sortie vers club)
- Quantite disponible reduite
- Email notification au club
- Audit log: equipment.assigned

Etape 4: Suivi par le club
- Club admin se connecte
- Va dans Materiel affecte
- Consulte liste du materiel recu
- Voit etat, quantite, dates
- Peut signaler probleme ou demander retour

Etape 5: Retour de materiel
- Club decide de retourner materiel
- Club admin ou gestionnaire stock cree mouvement
- Type: Retour
- Selectionne affectation concernee
- Quantite retournee
- Etat lors du retour (bon, endommage, etc.)
- Date du retour
- Notes (raison du retour)
- Sauvegarde
- Affectation marquee terminee (end_date remplie)
- Quantite disponible augmentee
- Si etat different: Mise a jour article
- Audit log: equipment.returned

Etape 6: Transfert entre clubs
- Gestionnaire stock cree mouvement
- Type: Transfert
- Selectionne article
- Organisation source et destination
- Quantite transferee
- Motif (ex: Besoin temporaire, Reparation)
- Affectation source reduite ou terminee
- Nouvelle affectation destination creee
- Notifications aux deux clubs
- Audit log: equipment.transferred

Etape 7: Mise au rebut
- Si materiel endommage irreparable ou obsolete
- Gestionnaire stock cree mouvement
- Type: Mise au rebut
- Motif structure (Endommage, Obsolete)
- Quantite mise au rebut
- Document justificatif (rapport destruction)
- Quantite en stock reduite
- Article peut etre archive si quantite = 0
- Audit log: equipment.disposed

Etape 8: Alertes stock faible
- Systeme verifie quotidiennement
- Si quantite inferieure a minimum:
  - Notification gestionnaire stock
  - Alerte dashboard federation
  - Email d'alerte avec details article
- Gestionnaire peut alors:
  - Commander nouveau stock (entree)
  - Ajuster seuil minimum
  - Retirer articles affectes

Etape 9: Rapports et inventaire
- Federation admin ou gestionnaire stock
- Va dans Rapports Materiel
- Options disponibles:
  - Inventaire complet (tous articles)
  - Inventaire par categorie
  - Inventaire par organisation
  - Valeur totale du stock
  - Historique mouvements (periode)
  - Articles en alerte
  - Affectations actives
- Selection filtres et periode
- Generation rapport PDF ou Excel
- Export pour comptabilite


WORKFLOW 6: PUBLICATION D'ACTUALITE

Etape 1: Creation
- Federation admin va dans Communication
- Clic Nouvelle actualite
- Saisit titre et contenu (rich text)
- Statut: draft
- Sauvegarde brouillon

Etape 2: Revision
- Possibilite de modifier
- Previsualisation
- Correction si necessaire

Etape 3: Publication
- Clic Publier
- Statut: published
- Date de publication enregistree
- Actualite visible:
  - Dashboard utilisateurs connectes
  - Site public www.frmhg.ma
- Notifications envoyees aux abonnes

Etape 4: Archivage
- Apres un certain temps
- Clic Archiver
- Statut: archived
- Reste consultable mais pas en page d'accueil


=================================================================================
7. STACK TECHNOLOGIQUE COMPLET
=================================================================================

FRONTEND

Framework principal: Next.js
- Version: 15.1.4
- Mode: React Server Components et Client Components
- Routing: App Router (Next.js 13+)
- Deux applications distinctes:
  - public-web: Site vitrine (port 3001)
  - web: Plateforme de gestion (port 3000)

Library React
- Version: 19.0.0
- Hooks: useState, useEffect, useContext, useReducer
- Context API pour gestion d'etat globale

Styling et UI
- Tailwind CSS 3.4.17: Framework CSS utility-first
- PostCSS 8.4.49: Transformation CSS
- Autoprefixer 10.4.20: Prefixes CSS automatiques
- shadcn/ui (recommande): Composants UI pre-construits

TypeScript
- Version: 5.7.3
- Mode strict active
- Types pour tous les composants et fonctions
- Validation de types a la compilation

Formulaires
- React Hook Form: Gestion de formulaires
- Zod ou Yup: Validation schemas
- Class Validator: Validation cote serveur

HTTP Client
- Fetch API native
- ou Axios pour requetes API

Icons
- Heroicons ou Feather Icons


BACKEND

Runtime: Node.js
- Version: 20 ou superieure
- Mode: TypeScript compile en JavaScript

Framework: NestJS
- Version: 10.4.15
- Architecture: Modules, Controllers, Services, Guards
- Decorateurs pour routing et validation
- Dependency Injection native

API REST
- OpenAPI/Swagger 7.4.2: Documentation automatique
- Endpoints RESTful standards
- Versioning API possible

Validation
- Class Validator 0.14.1: Decorateurs de validation
- Class Transformer 0.5.1: Transformation DTO
- Validation automatique sur tous les endpoints

Authentification et Securite
- JSON Web Tokens (jsonwebtoken 9.0.2)
- Cookies HTTPOnly securises
- Guards NestJS pour RBAC
- Rate limiting
- CORS configure

Base de donnees
- Driver: pg 8.13.1 (PostgreSQL native)
- Pool de connexions
- Transactions supportees
- Migrations SQL versionnees

Stockage de fichiers
- MinIO Client 8.0.1
- API S3 compatible
- Gestion buckets et objets

Worker asynchrone
- BullMQ: Gestion de queues
- Redis comme broker
- Jobs idempotents
- Retry automatique sur echec
- Concurrence configurable


INFRASTRUCTURE ET SERVICES

Base de donnees: PostgreSQL
- Version: 14 ou superieure
- Extensions:
  - pgcrypto: Fonctions cryptographiques
  - uuid-ossp: Generation UUID
- Fonctionnalites:
  - ACID complet
  - Foreign Keys strictes
  - Check constraints
  - Indexes optimises
  - WAL pour PITR

Cache et Queue: Redis
- Version: 7 ou superieure
- Modes:
  - Cache applicatif (TTL configurable)
  - Session store
  - Queue BullMQ
- Persistance: AOF (Append-Only File)
- Eviction: LRU

Stockage objet: MinIO
- Compatible S3
- Buckets:
  - documents: Documents generaux
  - receipts: Recus de paiement
  - medical: Rapports medicaux
  - logos: Logos des clubs
  - avatars: Photos de profil
- Fonctionnalites:
  - Versioning active
  - Checksums MD5 et SHA256
  - Policies d'acces
  - Expiration URL signees

Reverse-Proxy: Traefik
- Version: 2.x ou superieure
- Fonctionnalites:
  - Routage par domaine/sous-domaine
  - TLS automatique (Let's Encrypt)
  - Rate limiting
  - Headers de securite
  - Logs d'acces
  - Middleware personnalisables

Conteneurisation: Docker
- Docker Engine 20+
- Docker Compose pour orchestration
- Images:
  - node:20-alpine pour applications
  - postgres:14-alpine pour base de donnees
  - redis:7-alpine pour cache
  - minio/minio pour stockage
  - traefik:v2 pour reverse-proxy
- Volumes persistants pour donnees
- Reseaux Docker isoles


OUTILS DE DEVELOPPEMENT

Controle de version
- Git
- GitHub ou GitLab
- Branches: main, develop, feature/*
- Pull Requests avec review

Linting et Formatting
- ESLint: Analyse statique JavaScript/TypeScript
- Prettier: Formatage automatique
- Husky: Git hooks pre-commit

Tests (recommande)
- Jest: Framework de test
- React Testing Library: Tests composants
- Supertest: Tests API endpoints
- Coverage reports

Build et Bundling
- Next.js: Build optimise automatique
- NestJS: Compilation TypeScript
- Source maps pour debugging
- Minification et tree-shaking


MONITORING ET LOGS (recommande production)

Application Monitoring
- Prometheus: Collecte de metriques
- Grafana: Visualisation dashboards
- Alerting sur seuils

Logs
- Morgan: Logs HTTP (Express)
- Winston: Logs applicatifs structures
- Loki: Agregation logs (optionnel)

Health Checks
- Endpoints /health
- Verifications:
  - API responsive
  - Database connectee
  - Redis accessible
  - MinIO fonctionnel

Error Tracking
- Sentry (optionnel): Tracking erreurs temps reel
- Notifications sur erreurs critiques


=================================================================================
8. HEBERGEMENT ET INFRASTRUCTURE
=================================================================================

LOCALISATION ET CONFORMITE

Hebergement: VPS en France
- Localisation physique: France (conformite RGPD)
- Fournisseurs recommandes:
  - OVH (Roubaix, Strasbourg)
  - Scaleway (Paris)
  - Hetzner (Allemagne, proximite)
  - Exoscale (Suisse)

Donnees et Conformite
- Toutes les donnees stockees en Union Europeenne
- Conformite RGPD complete
- Souverainete des donnees garantie
- Pas de transfert hors UE


SPECIFICATIONS SERVEUR RECOMMANDEES

Configuration minimale (MVP):
- CPU: 4 coeurs (scaling possible)
- RAM: 16 GB
- Stockage: 250 GB SSD
- Bande passante: 100 Mbps
- Uptime SLA: 99.5%

Configuration optimale (50 clubs):
- CPU: 8 coeurs
- RAM: 32 GB
- Stockage: 500 GB SSD
- Bande passante: 1 Gbps
- Uptime SLA: 99.9%


ARCHITECTURE DOCKER COMPOSE

Conteneurs deployes:
1. traefik: Reverse-proxy et TLS
2. public-web: Site vitrine Next.js
3. web: Plateforme backoffice Next.js
4. api: Backend NestJS
5. worker: Worker asynchrone NestJS
6. postgres: Base de donnees PostgreSQL
7. redis: Cache et queue
8. minio: Stockage objet S3

Reseaux Docker:
- edge: Traefik vers applications web (expose)
- internal: Applications vers bases de donnees (isole)

Volumes persistants:
- postgres_data: Donnees PostgreSQL
- redis_data: Donnees Redis
- minio_data: Fichiers MinIO
- backups: Sauvegardes


DOMAINES ET SOUS-DOMAINES

Configuration DNS:
- www.frmhg.ma: Site public vitrine
- app.frmhg.ma: Plateforme de gestion
- api.frmhg.ma: API backend avec Swagger

Certificats SSL:
- Let's Encrypt automatique via Traefik
- Renouvellement automatique tous les 90 jours
- TLS 1.3 avec ciphers securises
- HSTS active (max-age 1 an)


SAUVEGARDES ET REPRISE

PostgreSQL:
- Dumps quotidiens automatiques (00:00 UTC)
- Format: pg_dump custom compresse
- WAL archiving pour Point-In-Time Recovery
- Retention: 30 jours sur serveur
- Copie externe: Disque securise ou cloud chiffre
- Tests de restauration: Mensuels obligatoires

MinIO:
- Versioning active sur tous les buckets
- Retention versions: 30 jours minimum
- Synchronisation externe quotidienne
- Checksums MD5 pour verification
- Recovery: Restauration version anterieure possible

Redis:
- Persistance AOF activee
- Snapshot RDB quotidien
- Pas de donnees critiques (cache/queue)
- Recovery: Reconstruction depuis PostgreSQL

Procedures:
- Runbooks documentes pour chaque scenario
- Tests de disaster recovery trimestriels
- RTO (Recovery Time Objective): 4 heures
- RPO (Recovery Point Objective): 24 heures


ACCES ET ADMINISTRATION

SSH:
- Port: 22 (whitelist IP administrateurs)
- Authentification: Cles privees uniquement (pas password)
- Type cle: ED25519 ou RSA 4096 bits
- Passphrases obligatoires
- Logs detailles de connexions

Firewall:
- Port 80: Redirection HTTPS
- Port 443: Traefik uniquement
- Port 22: Admin whitelist
- Tous autres ports: Fermes

Monitoring:
- Health checks toutes les 30 secondes
- Alertes Slack ou Email:
  - Service down
  - CPU superieur 80%
  - RAM superieure 85%
  - Disque superieur 80%
  - Erreurs 5xx
  - Echecs de jobs


=================================================================================
9. SECURITE ET CONFORMITE
=================================================================================

AUTHENTIFICATION ET CONTROLE D'ACCES

Authentification:
- Login par email et mot de passe
- Mots de passe forts obligatoires:
  - Minimum 12 caracteres
  - 1 majuscule
  - 1 chiffre
  - 1 caractere special
- Hashing: bcrypt avec salt rounds 12
- Jamais de stockage en clair

Sessions:
- JWT tokens:
  - Payload: user_id, email, roles, scopes, org_id
  - Expiration: 15 minutes
  - Signature HMAC
- Refresh tokens:
  - Duree: 7 jours
  - Stockage: Cookie HTTPOnly
  - Rotation a chaque utilisation
- Cookies securises:
  - HTTPOnly: Pas accessible JavaScript
  - SameSite: Strict
  - Secure: HTTPS uniquement
  - Domain: Sous-domaine specifique

MFA (Multi-Factor Authentication):
- Phase MVP: Recommande pour admin/finance/medical
- Phase 2: Obligatoire pour ces roles
- Methodes:
  - TOTP (Google Authenticator, Authy)
  - SMS (si disponible au Maroc)
  - Backup codes (10 codes chiffres)

Protection Brute Force:
- Rate limiting API: 5 tentatives par 15 minutes par IP
- Verrouillage progressif:
  - 3 echecs: Delai 5 minutes
  - 5 echecs: Delai 30 minutes
  - 10 echecs: Verrouillage 24h avec alerte email
- CAPTCHA: Apres 3 echecs (reCAPTCHA v3)
- Logs: Toutes les tentatives tracees


RBAC (Role-Based Access Control)

7 Roles definis:
1. federation_admin: Acces complet plateforme
2. club_admin: Gestion club specifique
3. dtn: Direction technique nationale
4. finance: Validation paiements
5. medecin: Dossiers medicaux
6. arbitre: Feuilles de match
7. stock: Inventaire (optionnel)

Scopes (portee fine):
- org_id: Limitation organisation specifique
- season_id: Limitation saison specifique
- competition_id: Limitation competition specifique

Politique Least Privilege:
- Default: Acces refuse (deny-all)
- Chaque role: Permissions minimales necessaires
- Escalade: Via federation_admin uniquement
- Audit: Tous les changements traces


PROTECTION DES DONNEES

Chiffrement en transit:
- HTTPS/TLS 1.3 obligatoire partout
- Certificats Let's Encrypt
- HSTS headers (max-age 1 an)
- Ciphers forts uniquement
- Pas de mixed content

Chiffrement au repos:
- Mots de passe: bcrypt
- Tokens sensibles: AES-256
- Chiffrement disque serveur (LUKS recommande)
- MinIO: Server-side encryption
- Donnees medicales: Chiffrement renforce

Gestion des secrets:
- Dev: Fichiers .env.local (git-ignore)
- Prod: Variables d'environnement VPS
- Jamais de hardcode dans le code
- Rotation tous les 90 jours
- Acces admin uniquement

Protection des uploads:
- Validation MIME type stricte
- Whitelist: PDF, JPG, PNG, DOC, DOCX
- Blacklist: exe, zip, bat, sh, js
- Verification magic bytes
- Limites taille:
  - Documents: 10 MB max
  - Logos: 5 MB max
  - Photos: 2 MB max
- Scan antivirus asynchrone (roadmap)
- Stockage isole MinIO
- URL signees expirant 30 minutes


AUDIT ET TRACABILITE

Entites auditees:
- Paiements: Creation, upload recu, validation, rejet
- Licences: Creation, activation, archivage
- IAM: Changements roles/scopes, reset password
- Medical: Creation/modification, consultations, rapports
- Documents: Upload, suppression, telechargements
- Organisations: Creation, validation, suspension
- Logins: Succes et echecs avec IP

Champs audit log:
- Timestamp (UTC, precision milliseconde)
- Acteur (user_id qui effectue l'action)
- Action (enum: create, update, delete, approve, reject, etc.)
- Type entite (payment, license, user, org, etc.)
- ID entite (primary key)
- Anciennes valeurs (snapshot avant)
- Nouvelles valeurs (snapshot apres)
- Contexte: ip_address, user_agent, org_id, season_id
- Motif (pour validations/rejets)
- Commentaire libre

Immutabilite:
- Logs jamais modifies (pas de UPDATE)
- Append-only strictement
- Soft-delete si erreur legale
- Retention: 7 ans minimum
- Export regulier vers stockage hors-ligne

Consultation:
- Recherche par date, acteur, entite, action
- Filtres multiples
- Export CSV/JSON avec signatures
- Acces: federation_admin et compliance officers
- Alertes sur anomalies


AUDIT MEDICAL RENFORCE

Consultations tracees:
- Qui a accede au dossier
- Quand (date et heure precise)
- Depuis ou (adresse IP)
- Duree de consultation
- Quels documents telecharges

Controle d'acces:
- Medecins: Acces tous patients
- DTN: Acces joueurs selection active uniquement
- Autres: Aucun acces (sauf admin pour audit)
- Consultation systematiquement auditee

Rapports generes:
- Signature numerique medecin
- Date et heure de generation
- Version du rapport
- Stockage versionne MinIO


CONFORMITE RGPD

Principes appliques:
- Collecte: Consentement explicite requis
- Minimisation: Donnees strictement necessaires
- Retention: Suppression apres besoin
- Transparence: Politique de confidentialite claire
- Securite: Mesures techniques et organisationnelles

Droits des personnes:
- Droit d'acces: Export donnees personnelles JSON
- Droit de rectification: Modification informations
- Droit a l'oubli: Anonymisation ou suppression
- Droit a la portabilite: Export format standard
- Droit d'opposition: Refus traitement

Consentements:
- RGPD: Requis avant creation compte
- Medical: Consentement separe dossiers medicaux
- Photo/Video: Consentement separe droits image
- Marketing: Consentement separe newsletters
- Tous traces avec version et date

Donnees medicales (sensibles):
- Categorie speciale RGPD
- Chiffrement at-rest AES-256
- Acces ultra-restreint
- Retention: 10 ans puis suppression
- Audit renforce obligatoire
- Portabilite: PDF downloadable

Notification breaches:
- CNIL: Dans les 72 heures si breach
- Utilisateurs: Si risque eleve pour leurs droits
- Documentation: Registre des incidents


SECURITE RESEAU

Firewall:
- Inbound:
  - Port 80: Redirect vers 443
  - Port 443: Traefik avec rate-limit 100 req/s/IP
  - Port 22: SSH admin whitelist uniquement
  - Autres: DENY ALL
- Outbound:
  - SMTP: Port 587 (envoi emails)
  - DNS: Resolution noms
  - Autres: DENY (isolation)

SSH Hardening:
- PermitRootLogin: no
- PasswordAuthentication: no
- PubkeyAuthentication: yes
- MaxAuthTries: 3
- ClientAliveInterval: 300
- LogLevel: VERBOSE

DDoS Protection:
- Traefik rate limiting:
  - Per-IP: 100 req/sec
  - Global: 10000 req/sec
  - Burst: 200 req/sec pendant 10 secondes
- CloudFlare (optionnel devant Traefik):
  - DDoS protection
  - Bot detection
  - WAF rules (SQL injection, XSS)
  - Cache CDN pour site public

IP Blacklist:
- Auto-block si superieur 1000 req/min
- Blocage manuel par admin
- Duree: 24 heures (auto-remove)


SECURITE CODE

Input Validation:
- Frontend: Validation client avec Zod/Yup (UX)
- Backend: Validation serveur OBLIGATOIRE
- Class Validator: DTOs strictes
- Type checking: TypeScript strict mode
- Sanitization: Escape HTML, validation types

Prevention SQL Injection:
- ORM: Prepared statements automatiques
- Jamais de concatenation strings SQL
- Parameterized queries partout
- Ban: eval(), exec(), system()

Prevention XSS:
- Output encoding: HTML entities
- CSP Headers strictes:
  default-src 'self'
  script-src 'self'
  style-src 'self' 'unsafe-inline'
  img-src 'self' data: https:
- Sanitization: DOMPurify pour user content
- HTTPOnly cookies

Prevention CSRF:
- CSRF tokens per-session
- SameSite cookies: Strict
- Verification Origin header
- Double-submit cookie pattern

Dependencies Security:
- npm audit fix regulier
- GitHub Security Alerts active
- Dependabot auto-updates
- Retire packages obsoletes


MONITORING ET ALERTES

Health Checks:
- Endpoints: /health, /health/db, /health/redis, /health/minio
- Metriques:
  - Response time
  - Error rate
  - CPU/Memory usage
  - DB connections
  - Redis memory
  - Disk space
- Frequence: Toutes les 30 secondes
- Alertes: Slack/Email si status non OK

Security Monitoring:
- Failed logins: Alerte si superieur 10/min
- Privilege escalation: Log changement roles
- Unusual activity: Acces hors heures bureau
- Data exfiltration: Exports/downloads massifs
- Config changes: Modifications schema DB
- Certificate expiry: Alerte 30 jours avant

Logs Centralisation:
- App logs: /var/log/frmhg/app.log (rotation)
- Access logs: /var/log/frmhg/access.log (Traefik)
- Audit logs: Table PostgreSQL (searchable)
- System logs: /var/log/syslog
- Aggregation: Rotation quotidienne et archive


INCIDENT RESPONSE

Classification incidents:
- P1 (Critical): System down, data breach, perte financiere
  - Response time: Moins de 30 minutes
  - Escalation: President federation et IT lead
- P2 (High): Fonctionnalite majeure cassee, vulnerabilite
  - Response time: Moins de 2 heures
  - Escalation: Directeur federation
- P3 (Medium): Problemes mineurs, bugs faible impact
  - Response time: Moins de 8 heures
  - Escalation: Equipe support
- P4 (Low): Documentation, corrections cosmetiques
  - Response time: Moins de 48 heures

Plan de reponse breach:
1. Detection: Alerte monitoring puis escalade security lead
2. Containment: Isolation systemes affectes
3. Investigation: Comprendre etendue et utilisateurs impactes
4. Notification: Utilisateurs et CNIL si requis (72h)
5. Remediation: Patch vulnerabilite, redemarrage
6. Post-Mortem: Analyse cause racine, lecons
7. Documentation: Ajout incident log, mise a jour procedures

Runbooks:
- DB restore
- App restart
- IP ban
- Password reset global
- Rollback version
- Failover
- Stock dans Wiki/Confluence
- Mise a jour apres chaque incident
- Tests trimestriels


=================================================================================
RESUME EXECUTIF POUR LE CLIENT
=================================================================================

BENEFICES CLES DE LA PLATEFORME

1. CENTRALISATION COMPLETE
- Tous les processus federeaux sur une seule plateforme
- Plus de fichiers Excel disperses
- Plus de documents papier perdus
- Acces 24/7 depuis n'importe ou

2. EFFICACITE OPERATIONNELLE
- Workflows automatises (licences, paiements, validations)
- Notifications automatiques par email
- Attestations PDF generees instantanement
- Rapports et exports en un clic

3. TRANSPARENCE ET TRACABILITE
- Audit trail complet de toutes les operations
- Historique detaille de chaque action
- Qui a fait quoi, quand et pourquoi
- Conformite totale RGPD

4. SECURITE PROFESSIONNELLE
- Chiffrement de bout en bout
- Controle d'acces granulaire par role
- Sauvegardes automatiques testees
- Hebergement securise en France

5. EXPERIENCE UTILISATEUR
- Interface moderne et intuitive
- Dashboards personnalises par role
- Formulaires intelligents avec validation
- Site public attractif pour communication

6. EVOLUTIVITE
- Architecture modulaire extensible
- Support jusqu'a 50 clubs et 5000 utilisateurs
- Nouvelles fonctionnalites ajoutables facilement
- Performance optimisee pour les pics de charge


INVESTISSEMENT TECHNIQUE

Composants livres:
- 3 applications web completes (public, backoffice, API)
- Base de donnees PostgreSQL avec 30+ tables
- Systeme d'authentification et permissions complet
- 9 modules fonctionnels integres
- Stockage documents avec versioning
- Worker asynchrone pour taches lourdes
- Infrastructure Docker complete
- Documentation technique exhaustive

Garanties:
- Code source propre et maintenable
- Tests automatises (recommande)
- Documentation API Swagger
- Sauvegardes et procedures de reprise
- Support et formation inclus
- Mises a jour de securite


PLANNING DE DEPLOIEMENT

Phase 1 (Semaines 1-4): Core
- IAM et Authentification
- Gestion organisations (clubs)
- Gestion membres et licences
- Paiements avec machine a etats
- Dashboards federation et clubs

Phase 2 (Semaines 5-6): Enrichissement
- Module sportif (competitions, matchs)
- DTN et selections
- Communication et notifications
- Audit trail complet

Phase 3 (Semaines 7-8): Specialise
- Module medical avec acces restreint
- Site public vitrine
- Optimisations et tests
- Documentation et livraison

Phase 4 (Post-lancement): Ameliorations
- MFA obligatoire
- Scan antivirus uploads
- Observabilite complete
- Fonctionnalites additionnelles selon besoins


COUT TOTAL DE POSSESSION (TCO)

Hebergement VPS (annuel):
- Serveur 8 coeurs, 32GB RAM, 500GB SSD
- Environ 100-150 EUR/mois
- Total: 1200-1800 EUR/an

Services externes:
- Domaine frmhg.ma: 10-20 EUR/an
- Certificats SSL: 0 EUR (Let's Encrypt gratuit)
- Email transactionnel (Sendgrid/Brevo): 0-50 EUR/mois
- Monitoring (optionnel): 0-100 EUR/mois
- Backups cloud (optionnel): 0-50 EUR/mois

Maintenance:
- Support technique: Selon contrat
- Mises a jour securite: Incluses
- Nouvelles fonctionnalites: Selon scope

Total estime annuel: 1500-3000 EUR
(hors developpement initial et support)


=================================================================================
CONTACT ET INFORMATIONS
=================================================================================

FEDERATION ROYALE MAROCAINE DE HOCKEY SUR GLACE

Email: secretariat.frmhg@gmail.com
Site actuel: www.frmhg.ma
Telephone: +212 6 25 82 84 64

CHARTE GRAPHIQUE

Couleurs officielles:
- Vert principal: Code couleur 1b5448
- Vert secondaire: Code couleur 6d9432
- Rouge institutionnel: Code couleur b91414

Typographies:
- Titres et signalétique: Barlow Condensed
- Texte courant: Inter

Style photographique:
- Intensite du sport
- Mouvement et vitesse
- Discipline et concentration


=================================================================================
APPROBATION
=================================================================================

Ce document presente l'architecture complete et detaillee de la plateforme
de gestion FRMHG.

Il inclut:
- Toutes les fonctionnalites
- Tous les types de donnees
- Toutes les tables de base de donnees
- Tous les champs de formulaires
- Tous les workflows metier
- Le stack technologique complet
- L'infrastructure d'hebergement
- Les mesures de securite et conformite

Date de presentation: _____________________

Valide par: _____________________

Fonction: _____________________

Signature: _____________________

Remarques et demandes de modifications:

___________________________________________________________________________

___________________________________________________________________________

___________________________________________________________________________

___________________________________________________________________________


=================================================================================
FIN DU DOCUMENT
=================================================================================

Document prepare pour la Federation Royale Marocaine de Hockey sur Glace (FRMHG)
Version 1.0 - Fevrier 2026
A conserver comme reference pour toute modification ulterieure
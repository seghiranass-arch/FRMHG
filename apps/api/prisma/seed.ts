import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Test users matching frontend quick-login buttons
const TEST_USERS = [
  {
    email: 'admin@frmhg.ma',
    password: 'Admin123!',
    displayName: 'Administrateur Fédération',
    roles: ['federation_admin'],
  },
  {
    email: 'club@frmhg.ma',
    password: 'Club123!',
    displayName: 'Administrateur Club',
    roles: ['club_admin'],
  },
  {
    email: 'national@frmhg.ma',
    password: 'National123!',
    displayName: 'Direction Technique Nationale',
    roles: ['dtn'],
  },
  {
    email: 'finance@frmhg.ma',
    password: 'Finance123!',
    displayName: 'Responsable Financier',
    roles: ['finance'],
  },
  {
    email: 'stock@frmhg.ma',
    password: 'Stock123!',
    displayName: 'Gestionnaire Matériel',
    roles: ['stock'],
  },
  {
    email: 'medecin@frmhg.ma',
    password: 'Medecin123!',
    displayName: 'Médecin',
    roles: ['medecin'],
  },
  {
    email: 'arbitre@frmhg.ma',
    password: 'Arbitre123!',
    displayName: 'Arbitre',
    roles: ['arbitre'],
  },
];

const DEMO_CLUBS = [
  {
    id: 'demo-chc',
    name: 'Club Hockey Casablanca',
    acronym: 'CHC',
    region: 'Casablanca-Settat',
    city: 'Casablanca',
  },
  {
    id: 'demo-ahr',
    name: 'Association Hockey Rabat',
    acronym: 'AHR',
    region: 'Rabat-Salé-Kénitra',
    city: 'Rabat',
  },
  {
    id: 'demo-hct',
    name: 'Hockey Club Tanger',
    acronym: 'HCT',
    region: 'Tanger-Tétouan-Al Hoceïma',
    city: 'Tanger',
  },
  {
    id: 'demo-hco',
    name: 'Hockey Club Oujda',
    acronym: 'HCO',
    region: 'Oriental',
    city: 'Oujda',
  },
  {
    id: 'demo-hcf',
    name: 'Hockey Club Fès',
    acronym: 'HCF',
    region: 'Fès-Meknès',
    city: 'Fès',
  },
  {
    id: 'demo-hcm',
    name: 'Hockey Club Marrakech',
    acronym: 'HCM',
    region: 'Marrakech-Safi',
    city: 'Marrakech',
  },
  {
    id: 'demo-hca',
    name: 'Hockey Club Agadir',
    acronym: 'HCA',
    region: 'Souss-Massa',
    city: 'Agadir',
  },
  {
    id: 'demo-hbm',
    name: 'Hockey Béni Mellal',
    acronym: 'HBM',
    region: 'Béni Mellal-Khénifra',
    city: 'Béni Mellal',
  },
  {
    id: 'demo-her',
    name: 'Hockey Errachidia',
    acronym: 'HER',
    region: 'Drâa-Tafilalet',
    city: 'Errachidia',
  },
  {
    id: 'demo-hla',
    name: 'Hockey Laâyoune',
    acronym: 'HLA',
    region: 'Laâyoune-Sakia El Hamra',
    city: 'Laâyoune',
  },
];

const FIRST_NAMES = [
  'Yassine',
  'Mohamed',
  'Ayoub',
  'Ilyas',
  'Hamza',
  'Sofiane',
  'Anas',
  'Rayan',
  'Adam',
  'Karim',
  'Omar',
  'Amine',
  'Sara',
  'Imane',
  'Nour',
  'Meriem',
];

const LAST_NAMES = [
  'El Amrani',
  'Benali',
  'Alaoui',
  'Idrissi',
  'El Fassi',
  'Tazi',
  'Bennani',
  'Chaoui',
  'Haddad',
  'Berrada',
  'Belkadi',
  'Zahra',
  'El Mansouri',
  'Kabbaj',
  'Rachidi',
  'Salah',
];

const TEAM_CATEGORIES = ['U7', 'U9', 'U11', 'U13', 'U15', 'U17', 'U20', 'Seniors'];
const TEAM_GENDERS = [
  { value: 'male', label: 'Masculine' },
  { value: 'female', label: 'Féminine' },
];
const PLAYERS_PER_TEAM = 12;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function pick<T>(arr: T[], index: number) {
  return arr[index % arr.length];
}

function randomCin(seed: number) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const l1 = letters[seed % letters.length];
  const l2 = letters[(seed * 3) % letters.length];
  const num = (100000 + (seed * 7919) % 900000).toString();
  return `${l1}${l2}${num}`;
}

function phoneFor(seed: number) {
  const num = (600000000 + (seed * 15485863) % 99999999).toString().slice(0, 9);
  return `+212${num}`;
}

function emailFor(clubAcronym: string, teamCategory: string, teamGender: string, i: number) {
  const tag = `${teamCategory}-${teamGender}`.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return `${clubAcronym.toLowerCase()}.${tag}.${pad2(i)}@demo.frmhg.ma`;
}

function birthDateFor(seed: number) {
  const year = 1992 + (seed % 12);
  const month = (seed % 12) + 1;
  const day = (seed % 26) + 1;
  return new Date(year, month - 1, day);
}

function assignmentStartDateFor(seasonCode: string) {
  const yearMatch = /(\d{4})/.exec(seasonCode);
  const startYear = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
  return new Date(startYear, 8, 1);
}

function teamIdFor(orgId: string, category: string, gender: string) {
  const suffix = `${category}-${gender}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  return `${orgId}-${suffix}`;
}

function buildAutoTeams(orgId: string) {
  return TEAM_CATEGORIES.flatMap((category) =>
    TEAM_GENDERS.map((gender) => ({
      id: teamIdFor(orgId, category, gender.value),
      name: `${category} ${gender.label}`,
      category,
      gender: gender.value,
      description: null,
      orgId,
    })),
  );
}

function makeClubPayload(input: { name: string; acronym: string; region: string; city: string }) {
  const slug = input.acronym.toLowerCase();
  return {
    name: input.name,
    acronym: input.acronym,
    type: 'club' as const,
    status: 'active' as const,
    region: input.region,
    city: input.city,
    address: `${input.city}, ${input.region}`,
    fullAddress: `Complexe sportif - ${input.city}, ${input.region}`,
    primaryPhone: phoneFor(slug.length * 7),
    secondaryPhone: null,
    website: `https://${slug}.demo.frmhg.ma`,
    presidentName: `Président ${input.acronym}`,
    presidentEmail: `president@${slug}.demo`,
    presidentPhone: phoneFor(slug.length * 11),
    secretaryGeneralName: `Secrétaire ${input.acronym}`,
    treasurerName: `Trésorier ${input.acronym}`,
    primaryContactName: `Contact ${input.acronym}`,
    primaryContactPhone: phoneFor(slug.length * 13),
    officialEmail: `contact@${slug}.demo.frmhg.ma`,
    activeCategories: ['U17', 'U20', 'Seniors'],
    practicedDisciplines: ['Hockey sur glace'],
    clubColors: { primary: '#0B2A6F', secondary: '#FFFFFF' },
    establishmentDate: new Date(2005, 0, 1),
    federalRegistrationNumber: `FRMHG-${input.acronym}-REG`,
    referenceSeason: '2025-2026',
    ribIban: `MA64 1234 5678 9012 3456 7890 123`,
    socialMedia: {
      facebook: `https://facebook.com/${slug}`,
      instagram: `https://instagram.com/${slug}`,
      twitter: `https://x.com/${slug}`,
      youtube: `https://youtube.com/@${slug}`,
    },
  };
}

function makePlayerPayload(params: {
  id: string;
  clubId: string;
  clubRegion: string;
  clubCity: string;
  clubAcronym: string;
  teamId: string;
  teamCategory: string;
  teamGender: string;
  i: number;
  seasonCode: string;
}) {
  const seed =
    params.i +
    params.clubAcronym.length * 100 +
    params.teamCategory.length * 7 +
    (params.teamGender === 'female' ? 31 : 13);
  const sex = params.teamGender === 'female' ? 'F' : 'M';
  const positions = params.i <= 2 ? ['Gardien'] : params.i <= 6 ? ['Défenseur'] : ['Attaquant'];
  return {
    id: params.id,
    firstName: pick(FIRST_NAMES, seed),
    lastName: pick(LAST_NAMES, seed + 3),
    sex,
    dateOfBirth: birthDateFor(seed),
    nationality: 'Marocaine',
    idType: seed % 10 === 0 ? 'passport' : 'cin',
    idNumber: randomCin(seed),
    address: `Rue ${params.i} - ${params.clubCity}`,
    city: params.clubCity,
    region: params.clubRegion,
    phone: phoneFor(seed),
    email: emailFor(params.clubAcronym, params.teamCategory, params.teamGender, params.i),
    emergencyContactName: `Contact Urgence ${params.clubAcronym}`,
    emergencyContactPhone: phoneFor(seed + 999),
    discipline: 'Hockey sur glace',
    ageCategory: params.teamCategory,
    positions,
    jerseyNumber: params.i,
    memberStatus: 'club_player',
    assignedClubId: params.clubId,
    assignmentStartDate: assignmentStartDateFor(params.seasonCode),
    assignmentEndDate: null,
    subscriptionType: 'club_player',
    subscriptionAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    paymentDate: new Date(),
    medicalStatus: 'ok',
    lastMedicalVisitDate: new Date(2025, 9, 1),
    federationDoctor: 'Médecin FRMHG',
    medicalFitness: 'fit',
    fitnessExpirationDate: new Date(2026, 11, 31),
    licenseNumber: `FRMHG-${params.clubAcronym}-${pad2(params.i)}`,
    licenseSeason: params.seasonCode,
    licenseType: 'player',
    licenseStatus: 'active' as const,
    licenseIssueDate: new Date(2025, 8, 1),
    licenseExpirationDate: new Date(2026, 11, 31),
    status: 'active',
    registrationDate: new Date(),
    orgId: params.clubId,
    teamId: params.teamId,
    goals: 0,
    assists: 0,
    gamesPlayed: 0,
  };
}

async function main() {
  console.log('Seeding database...');

  // Create clubs
  for (const clubInfo of DEMO_CLUBS) {
    const clubData = makeClubPayload(clubInfo);
    await prisma.org.upsert({
      where: { id: clubInfo.id },
      update: clubData as any,
      create: { id: clubInfo.id, ...clubData } as any,
    });
    console.log(`  Club: ${clubInfo.name}`);
  }

  const clubAdminOrgId = DEMO_CLUBS[0].id;

  // Create users
  for (const userData of TEST_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const orgId = userData.roles.includes('club_admin') ? clubAdminOrgId : null;

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: hashedPassword,
        displayName: userData.displayName,
        roles: userData.roles,
        orgId,
      },
      create: {
        email: userData.email,
        password: hashedPassword,
        displayName: userData.displayName,
        roles: userData.roles,
        orgId,
      },
    });
    console.log(`  User: ${userData.email}`);
  }

  const seasonCode = '2025-2026';
  const clubs = await prisma.org.findMany({
    where: { type: 'club' },
    select: { id: true, name: true, acronym: true, region: true, city: true },
  });
  for (const club of clubs) {
    let teams = await prisma.team.findMany({ where: { orgId: club.id } });
    if (teams.length === 0) {
      const autoTeams = buildAutoTeams(club.id);
      for (const team of autoTeams) {
        await prisma.team.upsert({
          where: { id: team.id },
          update: team as any,
          create: team as any,
        });
      }
      teams = await prisma.team.findMany({ where: { orgId: club.id } });
    }
    for (const team of teams) {
      const teamCategory = team.category || 'Seniors';
      const teamGender = team.gender || 'male';
      for (let i = 1; i <= PLAYERS_PER_TEAM; i++) {
        const memberId = `${team.id}-p${pad2(i)}`;
        const payload = makePlayerPayload({
          id: memberId,
          clubId: club.id,
          clubRegion: club.region || '',
          clubCity: club.city || '',
          clubAcronym: club.acronym || club.name.slice(0, 3).toUpperCase(),
          teamId: team.id,
          teamCategory,
          teamGender,
          i,
          seasonCode,
        });
        await prisma.member.upsert({
          where: { id: memberId },
          update: payload as any,
          create: payload as any,
        });
      }
      console.log(`  Players: ${PLAYERS_PER_TEAM} -> ${club.name} - ${team.name}`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

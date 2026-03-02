const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeData() {
  console.log('=== FRMHG DATA ANALYSIS ===\n');
  
  // Count organizations (clubs)
  const orgCount = await prisma.org.count();
  console.log(`Total Organizations: ${orgCount}`);
  
  const orgs = await prisma.org.findMany({
    include: {
      _count: {
        select: { members: true }
      }
    }
  });
  
  console.log('\n=== CLUBS BY STATUS ===');
  const statusCounts = {};
  orgs.forEach(org => {
    statusCounts[org.status] = (statusCounts[org.status] || 0) + 1;
  });
  
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`${status}: ${count} clubs`);
  });
  
  console.log('\n=== CLUB DETAILS ===');
  orgs.forEach(org => {
    console.log(`- ${org.name} (${org.acronym})`);
    console.log(`  Status: ${org.status}`);
    console.log(`  Region: ${org.region || 'N/A'}`);
    console.log(`  City: ${org.city || 'N/A'}`);
    console.log(`  Members: ${org._count.members}`);
    console.log(`  Created: ${org.createdAt}`);
    console.log('');
  });
  
  // Count members
  const memberCount = await prisma.member.count();
  console.log(`\nTotal Members: ${memberCount}`);
  
  // Count documents
  const docCount = await prisma.document.count();
  console.log(`Total Documents: ${docCount}`);
  
  // Check for duplicates
  console.log('\n=== DUPLICATION ANALYSIS ===');
  
  // Check for duplicate club names
  const nameGroups = orgs.reduce((acc, org) => {
    acc[org.name] = (acc[org.name] || 0) + 1;
    return acc;
  }, {});
  
  const duplicateNames = Object.entries(nameGroups).filter(([name, count]) => count > 1);
  if (duplicateNames.length > 0) {
    console.log('Duplicate club names found:');
    duplicateNames.forEach(([name, count]) => {
      console.log(`- ${name}: ${count} instances`);
    });
  } else {
    console.log('✓ No duplicate club names found');
  }
  
  // Check for clubs with same acronym
  const acronymGroups = orgs.reduce((acc, org) => {
    if (org.acronym) {
      acc[org.acronym] = (acc[org.acronym] || 0) + 1;
    }
    return acc;
  }, {});
  
  const duplicateAcronyms = Object.entries(acronymGroups).filter(([acronym, count]) => count > 1);
  if (duplicateAcronyms.length > 0) {
    console.log('\nDuplicate acronyms found:');
    duplicateAcronyms.forEach(([acronym, count]) => {
      console.log(`- ${acronym}: ${count} clubs`);
    });
  } else {
    console.log('\n✓ No duplicate acronyms found');
  }
  
  // Identify mock/test data patterns
  console.log('\n=== MOCK DATA DETECTION ===');
  const mockPatterns = [
    'Club Hockey Casablanca',
    'Association Hockey Rabat', 
    'Club Sportif Marrakech',
    'Hockey Club Tanger',
    'Club Athlétique Fès'
  ];
  
  const mockClubs = orgs.filter(org => mockPatterns.includes(org.name));
  if (mockClubs.length > 0) {
    console.log('Potential mock/test clubs detected:');
    mockClubs.forEach(org => {
      console.log(`- ${org.name} (${org.status})`);
    });
  } else {
    console.log('✓ No obvious mock data patterns detected');
  }
  
  console.log('\n=== ANALYSIS COMPLETE ===');
}

analyzeData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
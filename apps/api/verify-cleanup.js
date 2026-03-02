const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCleanup() {
  console.log('=== VERIFICATION: CLEAN DATABASE STATE ===\n');
  
  // Check current database state
  const orgCount = await prisma.org.count();
  console.log(`Organizations (Clubs) in database: ${orgCount}`);
  
  if (orgCount === 0) {
    console.log('✓ Database is clean - no organizations remaining');
  } else {
    console.log('⚠️  Database still contains organizations:');
    const orgs = await prisma.org.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    });
    
    orgs.forEach(org => {
      console.log(`- ${org.name} (${org.status}) - ${org._count.members} members`);
    });
  }
  
  // Check for members
  const memberCount = await prisma.member.count();
  console.log(`\nMembers in database: ${memberCount}`);
  
  if (memberCount === 0) {
    console.log('✓ No orphaned members remaining');
  } else {
    console.log('⚠️  Members still in database:');
    const members = await prisma.member.findMany({
      include: {
        org: {
          select: { name: true }
        }
      }
    });
    
    members.forEach(member => {
      const orgName = member.org ? member.org.name : 'No Organization';
      console.log(`- ${member.firstName} ${member.lastName} (${orgName})`);
    });
  }
  
  // Check for documents
  const docCount = await prisma.document.count();
  console.log(`\nDocuments in database: ${docCount}`);
  
  if (docCount === 0) {
    console.log('✓ No orphaned documents remaining');
  }
  
  // Verify no mock data patterns remain
  console.log('\n=== MOCK DATA PATTERNS CHECK ===');
  
  const MOCK_PATTERNS = [
    'Club Hockey Casablanca',
    'Association Hockey Rabat', 
    'Club Sportif Marrakech',
    'Hockey Club Tanger',
    'Club Athlétique Fès'
  ];
  
  const remainingMockOrgs = await prisma.org.findMany({
    where: {
      name: {
        in: MOCK_PATTERNS
      }
    }
  });
  
  if (remainingMockOrgs.length === 0) {
    console.log('✓ No mock organization patterns found');
  } else {
    console.log('❌ Found mock organizations:');
    remainingMockOrgs.forEach(org => {
      console.log(`- ${org.name}`);
    });
  }
  
  // Summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`Database Status: ${orgCount === 0 ? 'CLEAN' : 'CONTAINS DATA'}`);
  console.log(`Members Status: ${memberCount === 0 ? 'CLEAN' : 'REMAINING'}`);
  console.log(`Documents Status: ${docCount === 0 ? 'CLEAN' : 'REMAINING'}`);
  console.log(`Mock Data: ${remainingMockOrgs.length === 0 ? 'NONE FOUND' : `${remainingMockOrgs.length} ITEMS`}`);
  
  if (orgCount === 0 && memberCount === 0 && docCount === 0 && remainingMockOrgs.length === 0) {
    console.log('\n🎉 SUCCESS: Database is completely clean and ready for real data!');
  } else {
    console.log('\n⚠️  Database still contains some data that may need manual cleanup');
  }
}

verifyCleanup()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
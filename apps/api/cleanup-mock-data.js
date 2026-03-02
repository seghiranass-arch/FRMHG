const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupMockData() {
  console.log('=== CLEANING MOCK DATA ===\n');
  
  // Define mock data patterns to identify and remove
  const MOCK_CLUB_NAMES = [
    'Club Hockey Casablanca',
    'Association Hockey Rabat',
    'Club Sportif Marrakech', 
    'Hockey Club Tanger',
    'Club Athlétique Fès'
  ];
  
  console.log('Searching for mock clubs...');
  
  // Find mock clubs
  const mockClubs = await prisma.org.findMany({
    where: {
      name: {
        in: MOCK_CLUB_NAMES
      }
    },
    include: {
      members: true,
      documents: true
    }
  });
  
  if (mockClubs.length === 0) {
    console.log('✓ No mock clubs found in database');
    return;
  }
  
  console.log(`Found ${mockClubs.length} mock clubs:`);
  mockClubs.forEach(club => {
    console.log(`- ${club.name} (${club.members.length} members, ${club.documents.length} documents)`);
  });
  
  // Confirm before deletion
  console.log('\n⚠️  About to delete mock data. This cannot be undone.');
  console.log('Continue? (y/N)');
  
  // In automated script, we'll proceed with deletion
  console.log('Proceeding with cleanup...\n');
  
  try {
    // Delete mock clubs and their associated data
    for (const club of mockClubs) {
      console.log(`Deleting club: ${club.name}`);
      
      // Delete associated members first (due to foreign key constraints)
      if (club.members.length > 0) {
        console.log(`  Deleting ${club.members.length} members...`);
        await prisma.member.deleteMany({
          where: { orgId: club.id }
        });
      }
      
      // Delete associated documents
      if (club.documents.length > 0) {
        console.log(`  Deleting ${club.documents.length} documents...`);
        await prisma.document.deleteMany({
          where: { orgId: club.id }
        });
      }
      
      // Delete the club itself
      await prisma.org.delete({
        where: { id: club.id }
      });
      
      console.log(`  ✓ Deleted ${club.name}`);
    }
    
    console.log('\n✓ Mock data cleanup completed successfully!');
    
    // Verify cleanup
    const remainingClubs = await prisma.org.findMany();
    console.log(`\nRemaining clubs in database: ${remainingClubs.length}`);
    
    if (remainingClubs.length > 0) {
      console.log('Current clubs:');
      remainingClubs.forEach(club => {
        console.log(`- ${club.name} (${club.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupMockData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
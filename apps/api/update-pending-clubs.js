const { PrismaClient } = require('@prisma/client');

async function updatePendingClubs() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Looking for clubs with pending status...');
    
    // Find all clubs with pending status
    const pendingClubs = await prisma.org.findMany({
      where: {
        status: 'pending'
      }
    });
    
    console.log(`Found ${pendingClubs.length} clubs with pending status:`);
    pendingClubs.forEach(club => {
      console.log(`- ${club.name} (${club.id})`);
    });
    
    if (pendingClubs.length > 0) {
      console.log('\nUpdating clubs to active status...');
      
      // Update all pending clubs to active
      const result = await prisma.org.updateMany({
        where: {
          status: 'pending'
        },
        data: {
          status: 'active'
        }
      });
      
      console.log(`Successfully updated ${result.count} clubs to active status`);
    } else {
      console.log('No clubs found with pending status');
    }
    
    // Verify the update
    const activeClubs = await prisma.org.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        status: true
      }
    });
    
    console.log(`\nCurrent active clubs (${activeClubs.length}):`);
    activeClubs.forEach(club => {
      console.log(`- ${club.name} (${club.id}) - ${club.status}`);
    });
    
  } catch (error) {
    console.error('Error updating clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePendingClubs();
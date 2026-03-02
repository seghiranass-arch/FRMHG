const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphans() {
  console.log('=== CLEANING ORPHANED DATA ===\n');
  
  // Clean up orphaned members (members without organizations)
  console.log('Checking for orphaned members...');
  const orphanedMembers = await prisma.member.findMany({
    where: {
      orgId: null
    }
  });
  
  if (orphanedMembers.length > 0) {
    console.log(`Found ${orphanedMembers.length} orphaned members:`);
    orphanedMembers.forEach(member => {
      console.log(`- ${member.firstName} ${member.lastName}`);
    });
    
    console.log('\nDeleting orphaned members...');
    await prisma.member.deleteMany({
      where: {
        orgId: null
      }
    });
    console.log('✓ Orphaned members deleted');
  } else {
    console.log('✓ No orphaned members found');
  }
  
  // Clean up orphaned documents (documents without organizations or members)
  console.log('\nChecking for orphaned documents...');
  const orphanedDocs = await prisma.document.findMany({
    where: {
      AND: [
        { orgId: null },
        { memberId: null }
      ]
    }
  });
  
  if (orphanedDocs.length > 0) {
    console.log(`Found ${orphanedDocs.length} orphaned documents:`);
    orphanedDocs.forEach(doc => {
      console.log(`- ${doc.filename} (${doc.type})`);
    });
    
    console.log('\nDeleting orphaned documents...');
    await prisma.document.deleteMany({
      where: {
        AND: [
          { orgId: null },
          { memberId: null }
        ]
      }
    });
    console.log('✓ Orphaned documents deleted');
  } else {
    console.log('✓ No orphaned documents found');
  }
  
  // Final verification
  console.log('\n=== FINAL VERIFICATION ===');
  const finalOrgCount = await prisma.org.count();
  const finalMemberCount = await prisma.member.count();
  const finalDocCount = await prisma.document.count();
  
  console.log(`Organizations: ${finalOrgCount}`);
  console.log(`Members: ${finalMemberCount}`);
  console.log(`Documents: ${finalDocCount}`);
  
  if (finalOrgCount === 0 && finalMemberCount === 0 && finalDocCount === 0) {
    console.log('\n🎉 DATABASE IS NOW COMPLETELY CLEAN!');
  } else {
    console.log('\n⚠️  Some data remains - manual cleanup may be needed');
  }
}

cleanupOrphans()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
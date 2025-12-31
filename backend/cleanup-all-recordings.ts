/**
 * Cleanup script to remove ALL recordings from database and delete audio files
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient();

async function cleanupAllRecordings() {
  try {
    console.log('Finding all recordings...');

    // Find all recordings
    const allRecordings = await prisma.recording.findMany({
      select: {
        id: true,
        title: true,
        storagePath: true,
      },
    });

    console.log(`Found ${allRecordings.length} recordings`);

    if (allRecordings.length === 0) {
      console.log('No recordings to clean up');
      return;
    }

    // Delete related data and files
    for (const recording of allRecordings) {
      console.log(`Deleting recording: ${recording.id} - ${recording.title}`);

      // Delete action items
      const actionItemsDeleted = await prisma.actionItem.deleteMany({
        where: { recordingId: recording.id },
      });
      console.log(`  ✓ Deleted ${actionItemsDeleted.count} action items`);

      // Delete summaries
      const summariesDeleted = await prisma.summary.deleteMany({
        where: { recordingId: recording.id },
      });
      console.log(`  ✓ Deleted ${summariesDeleted.count} summaries`);

      // Delete transcripts
      const transcriptsDeleted = await prisma.transcript.deleteMany({
        where: { recordingId: recording.id },
      });
      console.log(`  ✓ Deleted ${transcriptsDeleted.count} transcripts`);

      // Delete audio file from disk
      if (recording.storagePath) {
        const uploadsDir = path.resolve(__dirname, 'uploads');
        const filePath = path.join(uploadsDir, recording.storagePath);

        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`  ✓ Deleted audio file: ${recording.storagePath}`);
          }
        } catch (err) {
          console.log(`  ⚠ Could not delete file: ${recording.storagePath}`);
        }
      }

      // Delete the recording itself
      await prisma.recording.delete({
        where: { id: recording.id },
      });

      console.log(`  ✓ Deleted recording from database\n`);
    }

    console.log(`\n✅ Successfully cleaned up ${allRecordings.length} recordings`);

    // Show remaining files in uploads directory
    const uploadsDir = path.resolve(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const remainingFiles = fs.readdirSync(uploadsDir);
      if (remainingFiles.length > 0) {
        console.log(`\n⚠ Warning: ${remainingFiles.length} files still in uploads directory:`);
        remainingFiles.forEach(file => {
          console.log(`  - ${file}`);
        });
      } else {
        console.log('\n✅ Uploads directory is clean');
      }
    }
  } catch (error) {
    console.error('Error cleaning up recordings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupAllRecordings()
  .then(() => {
    console.log('\n🎉 Cleanup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  });

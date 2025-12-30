/**
 * Cleanup script to remove failed recordings from database
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient();

async function cleanupFailedRecordings() {
  try {
    console.log('Finding failed recordings...');

    // Find all failed recordings
    const failedRecordings = await prisma.recording.findMany({
      where: {
        status: 'failed',
      },
    });

    console.log(`Found ${failedRecordings.length} failed recordings`);

    if (failedRecordings.length === 0) {
      console.log('No failed recordings to clean up');
      return;
    }

    // Delete related data first (due to foreign key constraints)
    for (const recording of failedRecordings) {
      console.log(`Deleting recording: ${recording.id} - ${recording.title}`);

      // Delete action items
      await prisma.actionItem.deleteMany({
        where: { recordingId: recording.id },
      });

      // Delete summaries
      await prisma.summary.deleteMany({
        where: { recordingId: recording.id },
      });

      // Delete transcripts
      await prisma.transcript.deleteMany({
        where: { recordingId: recording.id },
      });

      // Delete the recording itself
      await prisma.recording.delete({
        where: { id: recording.id },
      });

      console.log(`✓ Deleted recording: ${recording.id}`);
    }

    console.log(`\n✓ Successfully cleaned up ${failedRecordings.length} failed recordings`);
  } catch (error) {
    console.error('Error cleaning up failed recordings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupFailedRecordings()
  .then(() => {
    console.log('Cleanup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });

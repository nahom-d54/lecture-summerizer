import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma connection...');
  try {
    const recordings = await prisma.recording.findMany();
    console.log('Connection successful!');
    console.log('Recordings count:', recordings.length);
  } catch (error) {
    console.error('Prisma connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

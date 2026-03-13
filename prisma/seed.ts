import prisma from '../lib/prisma';

async function main() {
  const user = await prisma.user.upsert({
    where: { username: 'defaultuser' },
    update: {},
    create: {
      email: 'admin@calclone.com',
      username: 'defaultuser',
      timezone: 'Asia/Kolkata',
    },
  });

  console.log('Database seeded successfully with user:', user.username);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
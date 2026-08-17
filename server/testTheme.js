import { prisma } from './src/config/db.js';

async function main() {
  const settings = await prisma.themeSettings.findMany();
  console.log('Current ThemeSettings:', settings);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

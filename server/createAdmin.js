import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@aureliajewels.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`Admin ${email} already exists! Setting role to ADMIN just in case.`);
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', passwordHash: hashedPassword },
    });
    console.log('Password reset to admin123 and role ensured as ADMIN.');
  } else {
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email,
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`Successfully created Admin: ${email} with password: admin123`);
  }
}

createAdmin()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

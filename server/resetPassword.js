import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function fixPassword() {
  const hashedPassword = await bcrypt.hash('Password123', 10);
  await prisma.user.update({
    where: { email: 'lalitpatharia11643@gmail.com' },
    data: { passwordHash: hashedPassword }
  });
  console.log('Password reset to Password123');
}

fixPassword().catch(console.error).finally(() => prisma.$disconnect());

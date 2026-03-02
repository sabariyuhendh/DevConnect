import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n=== Create Admin User ===\n');

    const email = await question('Enter user email: ');
    
    if (!email) {
      console.error('Email is required');
      process.exit(1);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      console.error(`\nUser with email "${email}" not found.`);
      console.log('Please create an account first through the signup process.\n');
      process.exit(1);
    }

    console.log('\nUser found:');
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Current Role: ${user.role}\n`);

    console.log('Available roles:');
    console.log('  1. USER');
    console.log('  2. COMPANY_HR');
    console.log('  3. EVENT_HOST');
    console.log('  4. ADMIN');
    console.log('  5. SUPER_ADMIN\n');

    const roleChoice = await question('Select role (1-5): ');
    
    const roleMap: { [key: string]: string } = {
      '1': 'USER',
      '2': 'COMPANY_HR',
      '3': 'EVENT_HOST',
      '4': 'ADMIN',
      '5': 'SUPER_ADMIN',
    };

    const newRole = roleMap[roleChoice];

    if (!newRole) {
      console.error('Invalid role selection');
      process.exit(1);
    }

    const confirm = await question(`\nUpdate ${user.username} to ${newRole}? (yes/no): `);

    if (confirm.toLowerCase() !== 'yes') {
      console.log('Operation cancelled');
      process.exit(0);
    }

    // Update user role
    await prisma.user.update({
      where: { id: user.id },
      data: { role: newRole as any },
    });

    console.log(`\n✅ Successfully updated ${user.username} to ${newRole}\n`);
    
    if (newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') {
      console.log('The user can now access the admin dashboard at /admin\n');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();

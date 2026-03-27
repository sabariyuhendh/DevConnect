"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const readline = __importStar(require("readline"));
const prisma = new client_1.PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function question(query) {
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
        const roleMap = {
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
            data: { role: newRole },
        });
        console.log(`\n✅ Successfully updated ${user.username} to ${newRole}\n`);
        if (newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') {
            console.log('The user can now access the admin dashboard at /admin\n');
        }
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
    finally {
        rl.close();
        await prisma.$disconnect();
    }
}
createAdmin();

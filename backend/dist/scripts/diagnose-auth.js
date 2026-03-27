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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
async function diagnoseAuth() {
    try {
        console.log('\n=== Authentication Diagnostic Tool ===\n');
        // Step 1: Check database connection
        console.log('1. Testing database connection...');
        try {
            await prisma.$connect();
            console.log('   ✅ Database connected\n');
        }
        catch (error) {
            console.error('   ❌ Database connection failed:', error);
            process.exit(1);
        }
        // Step 2: Check JWT_SECRET
        console.log('2. Checking JWT configuration...');
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('   ❌ JWT_SECRET not found in environment variables');
            process.exit(1);
        }
        console.log('   ✅ JWT_SECRET is set');
        console.log('   Length:', jwtSecret.length, 'characters\n');
        // Step 3: List all admin users
        console.log('3. Checking admin users in database...');
        const admins = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'SUPER_ADMIN'],
                },
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (admins.length === 0) {
            console.log('   ⚠️  No admin users found in database');
            console.log('   Run: npm run create-admin\n');
            process.exit(0);
        }
        console.log(`   ✅ Found ${admins.length} admin user(s):\n`);
        admins.forEach((admin, index) => {
            console.log(`   ${index + 1}. ${admin.username} (${admin.email})`);
            console.log(`      Role: ${admin.role}`);
            console.log(`      Active: ${admin.isActive}`);
            console.log(`      ID: ${admin.id}\n`);
        });
        // Step 4: Test token generation
        console.log('4. Testing token generation...');
        const testUser = admins[0];
        const testToken = jsonwebtoken_1.default.sign({ id: testUser.id }, jwtSecret, { expiresIn: '7d' });
        console.log('   ✅ Token generated successfully');
        console.log('   Token preview:', testToken.substring(0, 50) + '...');
        console.log('   Token length:', testToken.length, 'characters\n');
        // Step 5: Test token verification
        console.log('5. Testing token verification...');
        try {
            const decoded = jsonwebtoken_1.default.verify(testToken, jwtSecret);
            console.log('   ✅ Token verified successfully');
            console.log('   Decoded user ID:', decoded.id);
            console.log('   Matches test user:', decoded.id === testUser.id ? 'YES' : 'NO\n');
        }
        catch (error) {
            console.error('   ❌ Token verification failed:', error);
            process.exit(1);
        }
        // Step 6: Interactive token test
        console.log('\n6. Interactive token test');
        console.log('   You can test a token from your browser localStorage\n');
        const testToken2 = await question('   Paste a token to test (or press Enter to skip): ');
        if (testToken2.trim()) {
            console.log('\n   Testing provided token...');
            try {
                const decoded = jsonwebtoken_1.default.verify(testToken2.trim(), jwtSecret);
                console.log('   ✅ Token is VALID');
                console.log('   User ID from token:', decoded.id);
                // Look up user
                const user = await prisma.user.findUnique({
                    where: { id: decoded.id },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                });
                if (user) {
                    console.log('   ✅ User found in database');
                    console.log('   Username:', user.username);
                    console.log('   Email:', user.email);
                    console.log('   Role:', user.role);
                    console.log('   Active:', user.isActive);
                    if (user.role === 'SUPER_ADMIN') {
                        console.log('   ✅ User has SUPER_ADMIN role');
                    }
                    else {
                        console.log('   ⚠️  User does NOT have SUPER_ADMIN role');
                        console.log('   Current role:', user.role);
                    }
                }
                else {
                    console.log('   ❌ User not found in database');
                    console.log('   The token is valid but the user was deleted');
                }
            }
            catch (error) {
                console.log('   ❌ Token is INVALID');
                console.log('   Error:', error.message);
                if (error.message.includes('jwt malformed')) {
                    console.log('\n   💡 This is the same error you\'re seeing!');
                    console.log('   The token format is incorrect.');
                    console.log('   Common causes:');
                    console.log('   - Token was corrupted when stored in localStorage');
                    console.log('   - Token includes extra characters (quotes, spaces)');
                    console.log('   - Token is not a valid JWT format');
                }
            }
        }
        console.log('\n=== Diagnostic Complete ===\n');
        console.log('Summary:');
        console.log('- Database: ✅ Connected');
        console.log('- JWT Secret: ✅ Configured');
        console.log('- Admin Users:', admins.length);
        console.log('- Token Generation: ✅ Working');
        console.log('- Token Verification: ✅ Working\n');
        if (admins.some((a) => a.role === 'SUPER_ADMIN')) {
            console.log('✅ Everything looks good!');
            console.log('\nIf you\'re still getting 401 errors:');
            console.log('1. Clear browser localStorage: localStorage.clear()');
            console.log('2. Login again to get a fresh token');
            console.log('3. Check browser console for token details\n');
        }
        else {
            console.log('⚠️  No SUPER_ADMIN users found');
            console.log('Run: npm run create-admin\n');
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
diagnoseAuth();

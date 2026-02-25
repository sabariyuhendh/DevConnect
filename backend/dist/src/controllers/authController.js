"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.googleCallback = exports.googleOAuth = exports.githubCallback = exports.githubOAuth = exports.checkUsername = exports.me = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
// Local signup
const signup = async (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;
    try {
        const existing = await database_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] },
            select: { id: true },
        });
        if (existing) {
            return res.status(409).json({ message: 'Email or username already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await database_1.default.user.create({
            data: {
                email,
                username,
                firstName,
                lastName,
                password: hashedPassword,
                provider: 'local'
            }
        });
        const token = (0, jwt_1.signToken)({ id: user.id });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
                provider: user.provider
            }
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Unable to create account',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.signup = signup;
// Local login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await database_1.default.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const ok = await bcryptjs_1.default.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Update last seen
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date(), isOnline: true }
        });
        const token = (0, jwt_1.signToken)({ id: user.id });
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
                provider: user.provider
            },
        });
    }
    catch (error) {
        return res.status(400).json({
            message: 'Unable to login',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.login = login;
// Get current user
const me = async (req, res) => {
    const user = req.user;
    return res.json({ user });
};
exports.me = me;
// Check username availability
const checkUsername = async (req, res) => {
    const { username } = req.query;
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: 'Username is required' });
    }
    try {
        const existing = await database_1.default.user.findUnique({
            where: { username },
            select: { id: true }
        });
        return res.json({ available: !existing });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error checking username' });
    }
};
exports.checkUsername = checkUsername;
// GitHub OAuth - Initiate
const githubOAuth = async (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/auth/github/callback';
    if (!clientId) {
        return res.status(500).json({ message: 'GitHub OAuth not configured' });
    }
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    res.redirect(githubAuthUrl);
};
exports.githubOAuth = githubOAuth;
// GitHub OAuth - Callback
const githubCallback = async (req, res) => {
    var _a, _b, _c;
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ message: 'Authorization code missing' });
    }
    try {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/auth/github/callback';
        if (!clientId || !clientSecret) {
            return res.status(500).json({ message: 'GitHub OAuth not configured' });
        }
        // Exchange code for access token
        const tokenResponse = await axios_1.default.post('https://github.com/login/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri
        }, {
            headers: { Accept: 'application/json' }
        });
        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            return res.status(400).json({ message: 'Failed to get access token' });
        }
        // Get user info from GitHub
        const userResponse = await axios_1.default.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const githubUser = userResponse.data;
        // Get user emails
        const emailResponse = await axios_1.default.get('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const primaryEmail = ((_a = emailResponse.data.find((e) => e.primary)) === null || _a === void 0 ? void 0 : _a.email) || githubUser.email;
        if (!primaryEmail) {
            return res.status(400).json({ message: 'No email found in GitHub account' });
        }
        // Find or create user
        let user = await database_1.default.user.findFirst({
            where: {
                OR: [
                    { email: primaryEmail },
                    { provider: 'github', providerId: String(githubUser.id) }
                ]
            }
        });
        if (!user) {
            // Create new user
            const baseUsername = githubUser.login || primaryEmail.split('@')[0];
            let username = baseUsername;
            let counter = 1;
            // Ensure unique username
            while (await database_1.default.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }
            user = await database_1.default.user.create({
                data: {
                    email: primaryEmail,
                    username,
                    firstName: ((_b = githubUser.name) === null || _b === void 0 ? void 0 : _b.split(' ')[0]) || githubUser.login,
                    lastName: ((_c = githubUser.name) === null || _c === void 0 ? void 0 : _c.split(' ').slice(1).join(' ')) || '',
                    provider: 'github',
                    providerId: String(githubUser.id),
                    profilePicture: githubUser.avatar_url,
                    bio: githubUser.bio,
                    location: githubUser.location,
                    website: githubUser.blog,
                    github: githubUser.login,
                    emailVerified: true,
                    isVerified: true
                }
            });
        }
        else if (user.provider !== 'github') {
            // Link GitHub to existing account
            await database_1.default.user.update({
                where: { id: user.id },
                data: {
                    provider: 'github',
                    providerId: String(githubUser.id),
                    github: githubUser.login,
                    profilePicture: user.profilePicture || githubUser.avatar_url
                }
            });
        }
        // Update last seen
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date(), isOnline: true }
        });
        const token = (0, jwt_1.signToken)({ id: user.id });
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
    catch (error) {
        console.error('GitHub OAuth error:', error);
        res.status(500).json({
            message: 'GitHub authentication failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.githubCallback = githubCallback;
// Google OAuth - Initiate
const googleOAuth = async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';
    if (!clientId) {
        return res.status(500).json({ message: 'Google OAuth not configured' });
    }
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    res.redirect(googleAuthUrl);
};
exports.googleOAuth = googleOAuth;
// Google OAuth - Callback
const googleCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ message: 'Authorization code missing' });
    }
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';
        if (!clientId || !clientSecret) {
            return res.status(500).json({ message: 'Google OAuth not configured' });
        }
        // Exchange code for access token
        const tokenResponse = await axios_1.default.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        });
        const accessToken = tokenResponse.data.access_token;
        // Get user info
        const userResponse = await axios_1.default.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const googleUser = userResponse.data;
        // Find or create user
        let user = await database_1.default.user.findFirst({
            where: {
                OR: [
                    { email: googleUser.email },
                    { provider: 'google', providerId: googleUser.id }
                ]
            }
        });
        if (!user) {
            const baseUsername = googleUser.email.split('@')[0];
            let username = baseUsername;
            let counter = 1;
            while (await database_1.default.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }
            user = await database_1.default.user.create({
                data: {
                    email: googleUser.email,
                    username,
                    firstName: googleUser.given_name,
                    lastName: googleUser.family_name,
                    provider: 'google',
                    providerId: googleUser.id,
                    profilePicture: googleUser.picture,
                    emailVerified: googleUser.verified_email,
                    isVerified: googleUser.verified_email
                }
            });
        }
        else if (user.provider !== 'google') {
            await database_1.default.user.update({
                where: { id: user.id },
                data: {
                    provider: 'google',
                    providerId: googleUser.id,
                    profilePicture: user.profilePicture || googleUser.picture
                }
            });
        }
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date(), isOnline: true }
        });
        const token = (0, jwt_1.signToken)({ id: user.id });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
    catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({
            message: 'Google authentication failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.googleCallback = googleCallback;
// Logout
const logout = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (userId) {
        await database_1.default.user.update({
            where: { id: userId },
            data: { isOnline: false, lastSeen: new Date() }
        });
    }
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;

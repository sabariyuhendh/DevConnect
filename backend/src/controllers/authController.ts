import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import prisma from '../config/database';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

// Local signup
export const signup = async (req: Request, res: Response) => {
  const { email, password, username, firstName, lastName } = req.body;

  console.log('[Backend] Signup request received');
  console.log('[Backend] Request body:', { email, username, firstName, lastName, password: '***' });

  try {
    // Normalize username
    const normalizedUsername = username?.trim().toLowerCase();
    
    console.log('[Backend] Normalized username:', normalizedUsername);
    
    if (!normalizedUsername) {
      console.log('[Backend] Username is missing');
      return res.status(400).json({ message: 'Username is required' });
    }

    console.log('[Backend] Checking for existing user...');
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: normalizedUsername }] },
      select: { id: true, email: true, username: true },
    });
    
    if (existing) {
      console.log('[Backend] User already exists:', { email: existing.email, username: existing.username });
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    console.log('[Backend] No existing user found, creating new user...');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        username: normalizedUsername,
        firstName,
        lastName,
        password: hashedPassword,
        provider: 'local'
      }
    });

    console.log('[Backend] User created successfully:', { id: user.id, username: user.username, email: user.email });

    const token = signToken({ id: user.id });
    console.log('[Backend] JWT token generated');

    const response = {
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
    };
    
    console.log('[Backend] Sending success response');
    res.status(201).json(response);
  } catch (error) {
    console.error('[Backend] Signup error:', error);
    res.status(400).json({
      message: 'Unable to create account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Local login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date(), isOnline: true }
    });

    const token = signToken({ id: user.id });
    
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
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get current user
export const me = async (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.json({ user });
};

// Check username availability
export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.query;
  
  console.log('=== USERNAME CHECK START ===');
  console.log('[Backend] Raw query params:', JSON.stringify(req.query));
  console.log('[Backend] Username from query:', username);
  console.log('[Backend] Username type:', typeof username);
  
  if (!username || typeof username !== 'string') {
    console.log('[Backend] Invalid username parameter');
    console.log('=== USERNAME CHECK END (INVALID) ===');
    return res.status(400).json({ message: 'Username is required', available: false });
  }

  try {
    const normalizedUsername = username.toLowerCase().trim();
    console.log('[Backend] Original username:', `"${username}"`);
    console.log('[Backend] Normalized username:', `"${normalizedUsername}"`);
    console.log('[Backend] Username length:', normalizedUsername.length);
    
    // First, let's check all usernames in the database for debugging
    const allUsers = await prisma.user.findMany({
      select: { username: true },
      take: 10
    });
    console.log('[Backend] Sample usernames in DB:', allUsers.map(u => u.username));
    
    // Now check for exact match
    const existing = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true, username: true }
    });
    
    const isAvailable = !existing;
    console.log('[Backend] Query result:', existing ? `Found user: ${existing.username}` : 'No user found');
    console.log('[Backend] User exists in DB:', !!existing);
    console.log('[Backend] Username available:', isAvailable);
    console.log('[Backend] Sending response:', JSON.stringify({ available: isAvailable }));
    console.log('=== USERNAME CHECK END ===');
    
    return res.json({ available: isAvailable });
  } catch (error) {
    console.error('[Backend] Username check error:', error);
    console.log('=== USERNAME CHECK END (ERROR) ===');
    return res.status(500).json({ message: 'Error checking username', available: false });
  }
};

// GitHub OAuth - Initiate
export const githubOAuth = async (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/auth/github/callback';
  
  if (!clientId) {
    return res.status(500).json({ message: 'GitHub OAuth not configured' });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  
  res.redirect(githubAuthUrl);
};

// GitHub OAuth - Callback
export const githubCallback = async (req: Request, res: Response) => {
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
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ message: 'Failed to get access token' });
    }

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userResponse.data;

    // Get user emails
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const primaryEmail = emailResponse.data.find((e: any) => e.primary)?.email || githubUser.email;

    if (!primaryEmail) {
      return res.status(400).json({ message: 'No email found in GitHub account' });
    }

    // Find or create user
    let user = await prisma.user.findFirst({
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
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          username,
          firstName: githubUser.name?.split(' ')[0] || githubUser.login,
          lastName: githubUser.name?.split(' ').slice(1).join(' ') || '',
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
    } else if (user.provider !== 'github') {
      // Link GitHub to existing account
      await prisma.user.update({
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
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date(), isOnline: true }
    });

    const token = signToken({ id: user.id });

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({
      message: 'GitHub authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Google OAuth - Initiate
export const googleOAuth = async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';
  
  if (!clientId) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
  
  res.redirect(googleAuthUrl);
};

// Google OAuth - Callback
export const googleCallback = async (req: Request, res: Response) => {
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
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const accessToken = tokenResponse.data.access_token;

    // Get user info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const googleUser = userResponse.data;

    // Find or create user
    let user = await prisma.user.findFirst({
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

      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
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
    } else if (user.provider !== 'google') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerId: googleUser.id,
          profilePicture: user.profilePicture || googleUser.picture
        }
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date(), isOnline: true }
    });

    const token = signToken({ id: user.id });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      message: 'Google authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: false, lastSeen: new Date() }
    });
  }
  
  res.json({ message: 'Logged out successfully' });
};

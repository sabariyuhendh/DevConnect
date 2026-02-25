"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = exports.updatePreferences = exports.updateCoverPicture = exports.updateProfilePicture = exports.updateProfile = exports.getMyProfile = exports.getProfile = void 0;
const database_1 = __importDefault(require("../config/database"));
// Get user profile by username
const getProfile = async (req, res) => {
    var _a;
    const { username } = req.params;
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    // Ensure username is a string
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: 'Invalid username' });
    }
    try {
        const user = await database_1.default.user.findUnique({
            where: { username: username },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                bio: true,
                title: true,
                company: true,
                location: true,
                website: true,
                github: true,
                linkedin: true,
                twitter: true,
                profilePicture: true,
                coverPicture: true,
                skills: true,
                yearsOfExp: true,
                availability: true,
                isOnline: true,
                lastSeen: true,
                profileViews: true,
                createdAt: true,
                provider: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Increment profile views if not viewing own profile
        if (currentUserId && currentUserId !== user.id) {
            await database_1.default.user.update({
                where: { id: user.id },
                data: { profileViews: { increment: 1 } }
            });
        }
        // Check if current user follows this profile
        let isFollowing = false;
        if (currentUserId) {
            const follow = await database_1.default.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: user.id
                    }
                }
            });
            isFollowing = !!follow;
        }
        res.json({
            user: {
                ...user,
                isFollowing,
                followersCount: user._count.followers,
                followingCount: user._count.following,
                postsCount: user._count.posts
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getProfile = getProfile;
// Get current user's full profile
const getMyProfile = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                bio: true,
                title: true,
                company: true,
                location: true,
                website: true,
                github: true,
                linkedin: true,
                twitter: true,
                phone: true,
                profilePicture: true,
                coverPicture: true,
                skills: true,
                yearsOfExp: true,
                availability: true,
                timezone: true,
                locale: true,
                isOnline: true,
                lastSeen: true,
                profileViews: true,
                preferences: true,
                emailVerified: true,
                isVerified: true,
                createdAt: true,
                provider: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            user: {
                ...user,
                followersCount: user._count.followers,
                followingCount: user._count.following,
                postsCount: user._count.posts
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getMyProfile = getMyProfile;
// Update user profile
const updateProfile = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { firstName, lastName, bio, title, company, location, website, github, linkedin, twitter, phone, skills, yearsOfExp, availability, timezone, locale } = req.body;
    try {
        const updateData = {};
        if (firstName !== undefined)
            updateData.firstName = firstName;
        if (lastName !== undefined)
            updateData.lastName = lastName;
        if (bio !== undefined)
            updateData.bio = bio;
        if (title !== undefined)
            updateData.title = title;
        if (company !== undefined)
            updateData.company = company;
        if (location !== undefined)
            updateData.location = location;
        if (website !== undefined)
            updateData.website = website;
        if (github !== undefined)
            updateData.github = github;
        if (linkedin !== undefined)
            updateData.linkedin = linkedin;
        if (twitter !== undefined)
            updateData.twitter = twitter;
        if (phone !== undefined)
            updateData.phone = phone;
        if (skills !== undefined)
            updateData.skills = skills;
        if (yearsOfExp !== undefined)
            updateData.yearsOfExp = yearsOfExp;
        if (availability !== undefined)
            updateData.availability = availability;
        if (timezone !== undefined)
            updateData.timezone = timezone;
        if (locale !== undefined)
            updateData.locale = locale;
        const user = await database_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                bio: true,
                title: true,
                company: true,
                location: true,
                website: true,
                github: true,
                linkedin: true,
                twitter: true,
                phone: true,
                profilePicture: true,
                coverPicture: true,
                skills: true,
                yearsOfExp: true,
                availability: true,
                timezone: true,
                locale: true,
                createdAt: true
            }
        });
        res.json({ user, message: 'Profile updated successfully' });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error updating profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateProfile = updateProfile;
// Update profile picture
const updateProfilePicture = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { profilePicture } = req.body;
    if (!profilePicture) {
        return res.status(400).json({ message: 'Profile picture URL is required' });
    }
    try {
        const user = await database_1.default.user.update({
            where: { id: userId },
            data: { profilePicture },
            select: { id: true, profilePicture: true }
        });
        res.json({ user, message: 'Profile picture updated successfully' });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error updating profile picture',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateProfilePicture = updateProfilePicture;
// Update cover picture
const updateCoverPicture = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { coverPicture } = req.body;
    if (!coverPicture) {
        return res.status(400).json({ message: 'Cover picture URL is required' });
    }
    try {
        const user = await database_1.default.user.update({
            where: { id: userId },
            data: { coverPicture },
            select: { id: true, coverPicture: true }
        });
        res.json({ user, message: 'Cover picture updated successfully' });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error updating cover picture',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateCoverPicture = updateCoverPicture;
// Update user preferences
const updatePreferences = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { preferences } = req.body;
    try {
        const user = await database_1.default.user.update({
            where: { id: userId },
            data: { preferences },
            select: { id: true, preferences: true }
        });
        res.json({ preferences: user.preferences, message: 'Preferences updated successfully' });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error updating preferences',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updatePreferences = updatePreferences;
// Follow user
const followUser = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { username } = req.params;
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: 'Invalid username' });
    }
    try {
        const userToFollow = await database_1.default.user.findUnique({
            where: { username: username },
            select: { id: true }
        });
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (userToFollow.id === userId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        // Check if already following
        const existing = await database_1.default.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: userToFollow.id
                }
            }
        });
        if (existing) {
            return res.status(400).json({ message: 'Already following this user' });
        }
        await database_1.default.follow.create({
            data: {
                followerId: userId,
                followingId: userToFollow.id
            }
        });
        res.json({ message: 'User followed successfully' });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error following user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.followUser = followUser;
// Unfollow user
const unfollowUser = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { username } = req.params;
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: 'Invalid username' });
    }
    try {
        const userToUnfollow = await database_1.default.user.findUnique({
            where: { username: username },
            select: { id: true }
        });
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }
        await database_1.default.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: userToUnfollow.id
                }
            }
        });
        res.json({ message: 'User unfollowed successfully' });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error unfollowing user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.unfollowUser = unfollowUser;
// Get user's followers
const getFollowers = async (req, res) => {
    const { username } = req.params;
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: 'Invalid username' });
    }
    try {
        const user = await database_1.default.user.findUnique({
            where: { username: username },
            select: { id: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const followers = await database_1.default.follow.findMany({
            where: { followingId: user.id },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        title: true,
                        isOnline: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ followers: followers.map(f => f.follower) });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching followers',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getFollowers = getFollowers;
// Get user's following
const getFollowing = async (req, res) => {
    const { username } = req.params;
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: 'Invalid username' });
    }
    try {
        const user = await database_1.default.user.findUnique({
            where: { username: username },
            select: { id: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const following = await database_1.default.follow.findMany({
            where: { followerId: user.id },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        title: true,
                        isOnline: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ following: following.map(f => f.following) });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching following',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getFollowing = getFollowing;
// Search users
const searchUsers = async (req, res) => {
    const { q, limit = 20 } = req.query;
    if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Search query is required' });
    }
    try {
        const users = await database_1.default.user.findMany({
            where: {
                OR: [
                    { username: { contains: q, mode: 'insensitive' } },
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { title: { contains: q, mode: 'insensitive' } },
                    { company: { contains: q, mode: 'insensitive' } }
                ],
                isActive: true
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                title: true,
                company: true,
                location: true,
                isOnline: true
            },
            take: Number(limit),
            orderBy: { profileViews: 'desc' }
        });
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error searching users',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.searchUsers = searchUsers;

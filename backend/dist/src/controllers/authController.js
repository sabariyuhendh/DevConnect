"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
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
        // Return user data matching frontend expectations
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
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
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await database_1.default.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const ok = await bcryptjs_1.default.compare(password, user.password);
        if (!ok)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = (0, jwt_1.signToken)({ id: user.id });
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
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
const me = async (req, res) => {
    const user = req.user;
    return res.json({ user });
};
exports.me = me;

"use strict";
// Helper functions for type conversions and common operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUserId = exports.getStringParam = void 0;
/**
 * Converts Express route parameter to string
 * Route params can be string | string[], this ensures we get a string
 */
const getStringParam = (param) => {
    return Array.isArray(param) ? param[0] : param;
};
exports.getStringParam = getStringParam;
/**
 * Ensures user ID is defined, throws error if not
 */
const requireUserId = (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    return userId;
};
exports.requireUserId = requireUserId;

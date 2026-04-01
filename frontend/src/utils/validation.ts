/**
 * Frontend validation utilities
 * These match the backend validation rules
 */

// Username validation rules (matches backend exactly)
const usernameRegex = /^[a-z][a-z0-9._-]*$/;
const consecutiveSpecialChars = /[._-]{2,}/;
const reservedUsernames = [
  'admin', 'root', 'support', 'system', 'moderator', 'mod', 
  'administrator', 'devconnect', 'api', 'www', 'help', 'info',
  'contact', 'about', 'terms', 'privacy', 'settings', 'profile'
];

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate username format (client-side)
 * This provides instant feedback before checking availability
 */
export function validateUsernameFormat(username: string): ValidationResult {
  // Normalize
  const normalized = username.toLowerCase().trim();
  
  // Check length
  if (normalized.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }
  if (normalized.length > 30) {
    return { valid: false, message: 'Username must be at most 30 characters' };
  }
  
  // Check format - must start with letter
  if (!usernameRegex.test(normalized)) {
    return { valid: false, message: 'Username must start with a letter and contain only lowercase letters, numbers, dots, underscores, and hyphens' };
  }
  
  // Check for consecutive special characters
  if (consecutiveSpecialChars.test(normalized)) {
    return { valid: false, message: 'Username cannot have consecutive special characters (e.g., .., --, __)' };
  }
  
  // Check for reserved usernames
  if (reservedUsernames.includes(normalized)) {
    return { valid: false, message: 'This username is reserved' };
  }
  
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email address' };
  }
  
  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

/**
 * Get password strength indicator
 */
export function getPasswordStrength(password: string): { strength: 'weak' | 'medium' | 'strong'; score: number } {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'medium', score };
  return { strength: 'strong', score };
}

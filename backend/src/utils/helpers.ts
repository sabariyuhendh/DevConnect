// Helper functions for type conversions and common operations

/**
 * Converts Express route parameter to string
 * Route params can be string | string[], this ensures we get a string
 */
export const getStringParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

/**
 * Ensures user ID is defined, throws error if not
 */
export const requireUserId = (userId: string | undefined): string => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  return userId;
};
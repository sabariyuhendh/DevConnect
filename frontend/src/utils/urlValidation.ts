/**
 * Validates and normalizes URLs for social links and websites
 * Supports GitHub, LinkedIn, and general websites
 */

export interface URLValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
}

/**
 * Validates a GitHub URL
 * Accepts: https://github.com/username, github.com/username, username
 */
export function validateGitHubUrl(url: string): URLValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true, normalizedUrl: '' };
  }

  const trimmed = url.trim();
  
  // Extract username from various formats
  let username = trimmed;
  
  if (trimmed.includes('github.com')) {
    const match = trimmed.match(/github\.com\/([a-zA-Z0-9-]+)/);
    if (!match) {
      return { isValid: false, error: 'Invalid GitHub URL format' };
    }
    username = match[1];
  }

  // Validate username format (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    return { isValid: false, error: 'GitHub username contains invalid characters' };
  }

  if (username.length < 1 || username.length > 39) {
    return { isValid: false, error: 'GitHub username must be between 1 and 39 characters' };
  }

  return { isValid: true, normalizedUrl: `https://github.com/${username}` };
}

/**
 * Validates a LinkedIn URL
 * Accepts: https://linkedin.com/in/username, linkedin.com/in/username, username
 */
export function validateLinkedInUrl(url: string): URLValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true, normalizedUrl: '' };
  }

  const trimmed = url.trim();
  
  // Extract username from various formats
  let username = trimmed;
  
  if (trimmed.includes('linkedin.com')) {
    const match = trimmed.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
    if (!match) {
      return { isValid: false, error: 'Invalid LinkedIn URL format' };
    }
    username = match[1];
  }

  // Validate username format (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    return { isValid: false, error: 'LinkedIn username contains invalid characters' };
  }

  if (username.length < 1 || username.length > 100) {
    return { isValid: false, error: 'LinkedIn username must be between 1 and 100 characters' };
  }

  return { isValid: true, normalizedUrl: `https://linkedin.com/in/${username}` };
}

/**
 * Validates a website URL
 * Accepts: https://example.com, http://example.com, example.com
 */
export function validateWebsiteUrl(url: string): URLValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true, normalizedUrl: '' };
  }

  const trimmed = url.trim();

  // Add https:// if no protocol specified
  let urlToValidate = trimmed;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    urlToValidate = `https://${trimmed}`;
  }

  try {
    const urlObj = new URL(urlToValidate);
    
    // Validate hostname
    if (!urlObj.hostname) {
      return { isValid: false, error: 'Invalid website URL' };
    }

    // Check for valid TLD
    if (!urlObj.hostname.includes('.')) {
      return { isValid: false, error: 'Website URL must include a domain' };
    }

    return { isValid: true, normalizedUrl: urlObj.toString() };
  } catch (error) {
    return { isValid: false, error: 'Invalid website URL format' };
  }
}

/**
 * Validates all social links
 */
export function validateSocialLinks(links: {
  github?: string;
  linkedin?: string;
  website?: string;
}): {
  github: URLValidationResult;
  linkedin: URLValidationResult;
  website: URLValidationResult;
} {
  return {
    github: validateGitHubUrl(links.github || ''),
    linkedin: validateLinkedInUrl(links.linkedin || ''),
    website: validateWebsiteUrl(links.website || '')
  };
}

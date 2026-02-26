/**
 * API Configuration
 * Automatically detects the correct API URL based on how the app is accessed
 */

// Get the current hostname and protocol
const hostname = window.location.hostname;
const protocol = window.location.protocol;

// Determine API base URL
let API_BASE_URL: string;

// Check if environment variable is set
if (import.meta.env.VITE_API_URL) {
  API_BASE_URL = import.meta.env.VITE_API_URL;
  console.log('🔧 API Configuration: Using environment variable');
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // Accessing via localhost - use localhost backend
  API_BASE_URL = 'http://localhost:3001';
  console.log('🔧 API Configuration: Detected localhost access');
} else {
  // Accessing via network IP - use same IP for backend
  API_BASE_URL = `${protocol}//${hostname}:3001`;
  console.log('🔧 API Configuration: Detected network access');
}

console.log('🔧 API Configuration:', {
  currentURL: window.location.href,
  hostname,
  protocol,
  apiBaseUrl: API_BASE_URL,
  envOverride: import.meta.env.VITE_API_URL || 'none'
});

export const API_BASE = API_BASE_URL;

/**
 * Make an authenticated API request
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE}${endpoint}`;
  
  // Get token from localStorage
  const token = localStorage.getItem('auth_token');
  
  // Setup headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    console.log(`📡 API Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText || 'Request failed'
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

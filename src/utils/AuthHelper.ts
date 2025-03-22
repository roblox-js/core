import * as path from 'path';
import * as process from 'process';
import * as fs from 'fs/promises';
import axios, { AxiosResponse } from 'axios';

// Define the expected shape of the authenticated user response
interface AuthenticatedUserResponse {
  id: number;
  name: string;
  displayName: string;
}

let cachedCsrfToken: string | null = null;
let cookieString: string | null = null;
let cachedUserId: string | null = null;

/**
 * Loads cookies from auth.json and returns them as a formatted string.
 * @returns {Promise<string>} - The cookie string for HTTP headers.
 */
async function loadCookieString(): Promise<string> {
  const projectDir = process.cwd();
  const COOKIE_PATH = path.join(projectDir, 'auth.json');

  const cookiesString = await fs.readFile(COOKIE_PATH, 'utf-8');
  const cookiesData = JSON.parse(cookiesString);
  const cookies = cookiesData.cookies;

  if (!cookies || cookies.length === 0) {
    throw new Error('Authentication cookies are required.');
  }

  return cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join('; ');
}

/**
 * Fetches a fresh CSRF token from Roblox using the provided cookie string.
 * @param {string} cookies - The cookies formatted as a string for the HTTP header.
 * @returns {Promise<string>} - The fetched CSRF token.
 */
async function fetchCsrfToken(cookies: string): Promise<string> {
  try {
    await axios.post(
      'https://friends.roblox.com/v1/users/1/request-friendship', // Dummy user ID
      {},
      {
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    return ''; // If this succeeds, no token is needed (unlikely)
  } catch (error: any) {
    const csrfToken = error.response?.headers['x-csrf-token'];
    if (!csrfToken) {
      throw new Error('Failed to retrieve CSRF token');
    }
    return csrfToken;
  }
}

/**
 * Gets the authenticated user's ID from Roblox.
 * @returns {Promise<string>} - The user ID of the authenticated user.
 */
export async function getAuthenticatedUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId; // Return cached ID if available
  }

  if (!cookieString) {
    cookieString = await loadCookieString();
  }

  try {
    const response: AxiosResponse<AuthenticatedUserResponse> = await axios.get(
      'https://users.roblox.com/v1/users/authenticated',
      {
        headers: {
          Cookie: cookieString,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    if (!response.data || typeof response.data.id !== 'number') {
      throw new Error('Invalid response format: missing or invalid user ID');
    }

    cachedUserId = response.data.id.toString(); // Cache the user ID
    return cachedUserId;
  } catch (error: any) {
    throw new Error(`Failed to get authenticated user ID: ${error.message}`);
  }
}

/**
 * Gets or refreshes the CSRF token, caching it for reuse.
 * @returns {Promise<{ csrfToken: string, cookieString: string }>} - The CSRF token and cookie string.
 */
export async function getCsrfToken(): Promise<{ csrfToken: string; cookieString: string }> {
  if (!cookieString) {
    cookieString = await loadCookieString();
  }

  if (!cachedCsrfToken) {
    cachedCsrfToken = await fetchCsrfToken(cookieString);
  }

  return { csrfToken: cachedCsrfToken, cookieString };
}

/**
 * Refreshes the cached CSRF token.
 * @returns {Promise<string>} - The new CSRF token.
 */
export async function refreshCsrfToken(): Promise<string> {
  if (!cookieString) {
    cookieString = await loadCookieString();
  }
  cachedCsrfToken = await fetchCsrfToken(cookieString);
  return cachedCsrfToken;
}
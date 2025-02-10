/**
 * GitHub API Service
 * Provides functions for interacting with the GitHub REST API
 * using native fetch API with proper error handling and response parsing
 */

import { getToken, setToken, removeToken } from '../utils/tokenStorage';
import { ApiError, AuthenticationError, RateLimitError, NetworkError, createApiError } from '../utils/errors';
import RequestQueue from '../utils/RequestQueue';
import rateLimitMonitor from '../utils/RateLimitMonitor';
import { getCacheItem, setCacheItem, CACHE_EXPIRATION } from './cache';

// Initialize request queue with GitHub's default rate limits
const requestQueue = new RequestQueue(60, 3600); // 60 requests per hour for unauthenticated users

// Base configuration for GitHub API
const API_BASE_URL = 'https://api.github.com';

// PUBLIC_INTERFACE
/**
 * Set the GitHub authentication token securely
 * @param {string} token - GitHub personal access token
 * @returns {boolean} - Success status of token storage
 */
export function setAuthToken(token) {
  return setToken(token);
}

// PUBLIC_INTERFACE
/**
 * Clear the GitHub authentication token
 * @returns {boolean} - Success status of token removal
 */
export function clearAuthToken() {
  return removeToken();
}

/**
 * Get headers for GitHub API requests
 * @returns {Object} Headers object with authentication if available
 */
function getRequestHeaders(customHeaders = {}, etag = null) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...customHeaders
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (etag) {
    headers['If-None-Match'] = etag;
  }

  return headers;
}


/**
 * Helper function to handle API responses and errors
 * @param {Response} response - Fetch API response object
 * @returns {Promise<any>} Parsed response data
 * @throws {AuthenticationError} When authentication fails
 * @throws {RateLimitError} When rate limit is exceeded
 * @throws {NetworkError} When network or parsing errors occur
 * @throws {ApiError} For other API errors
 */
async function handleResponse(response, cacheKey = null) {
  try {
    // Update rate limit information from response headers
    rateLimitMonitor.updateFromHeaders(response.headers);
    
    // Handle 304 Not Modified - return cached data
    if (response.status === 304 && cacheKey) {
      const cachedData = getCacheItem(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        clearAuthToken(); // Clear invalid token
      }
      
      throw createApiError(response, data, rateLimitMonitor.getCurrentStatus());
    }
    
    // Check if we're approaching the rate limit
    if (rateLimitMonitor.isApproachingLimit()) {
      console.warn('Approaching GitHub API rate limit:', rateLimitMonitor.getAnalytics());
    }
    
    // Store ETag if provided
    const etag = response.headers.get('etag');
    if (etag && cacheKey) {
      setCacheItem(cacheKey, { ...data, etag }, 'DEFAULT');
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new NetworkError('Failed to process API response', error);
  }
}

// PUBLIC_INTERFACE
/**
 * Get current rate limit status with analytics
 * @returns {Object} Rate limit information and analytics
 */
export function getRateLimit() {
  return rateLimitMonitor.getAnalytics();
}

// PUBLIC_INTERFACE
/**
 * Search GitHub repositories based on query parameters
 * @param {string} query - Search query string
 * @param {Object} options - Search options (sort, order, per_page, page)
 * @returns {Promise<Object>} Search results containing repositories and metadata
 */
export async function searchRepositories(query, options = {}) {
  const searchParams = new URLSearchParams({
    q: query,
    sort: options.sort || 'stars',
    order: options.order || 'desc',
    per_page: options.per_page || 30,
    page: options.page || 1
  });

  const cacheKey = `search_repos_${searchParams.toString()}`;
  const cachedData = getCacheItem(cacheKey, true);
  const etag = cachedData?.etag;

  const response = await requestQueue.enqueue(() => 
    fetch(
      `${API_BASE_URL}/search/repositories?${searchParams}`,
      {
        headers: getRequestHeaders({}, etag)
      }
    )
  );

  const data = await handleResponse(response, cacheKey);
  if (response.headers.get('etag')) {
    setCacheItem(cacheKey, { ...data, etag: response.headers.get('etag') }, 'SEARCH');
  }
  return data;
}

// PUBLIC_INTERFACE
/**
 * Get user information by username
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} User profile data
 */
export async function getUserInfo(username) {
  const cacheKey = `user_${username}`;
  const cachedData = getCacheItem(cacheKey, true);
  const etag = cachedData?.etag;

  const response = await requestQueue.enqueue(() => 
    fetch(`${API_BASE_URL}/users/${username}`, {
      headers: getRequestHeaders({}, etag)
    })
  );

  const data = await handleResponse(response, cacheKey);
  if (response.headers.get('etag')) {
    setCacheItem(cacheKey, { ...data, etag: response.headers.get('etag') }, 'USER_PROFILE');
  }
  return data;
}

// PUBLIC_INTERFACE
/**
 * Get repository details by owner and repo name
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository details
 */
export async function getRepositoryDetails(owner, repo) {
  const cacheKey = `repo_${owner}_${repo}`;
  const cachedData = getCacheItem(cacheKey, true);
  const etag = cachedData?.etag;

  const response = await requestQueue.enqueue(() => 
    fetch(`${API_BASE_URL}/repos/${owner}/${repo}`, {
      headers: getRequestHeaders({}, etag)
    })
  );

  const data = await handleResponse(response, cacheKey);
  if (response.headers.get('etag')) {
    setCacheItem(cacheKey, { ...data, etag: response.headers.get('etag') }, 'REPOSITORY');
  }
  return data;
}

// PUBLIC_INTERFACE
/**
 * Search GitHub users based on query parameters
 * @param {Object} options - Search options (sort, order, per_page, page)
 * @param {string} [options.query] - Optional search query string
 * @returns {Promise<Object>} Search results containing users and metadata
 */
export async function searchUsers(options = {}) {
  const searchParams = new URLSearchParams({
    q: options.query || 'type:user',
    sort: options.sort || 'followers',
    order: options.order || 'desc',
    per_page: options.per_page || 30,
    page: options.page || 1
  });

  const cacheKey = `search_users_${searchParams.toString()}`;
  const cachedData = getCacheItem(cacheKey, true);
  const etag = cachedData?.etag;

  const response = await requestQueue.enqueue(() => 
    fetch(
      `${API_BASE_URL}/search/users?${searchParams}`,
      {
        headers: getRequestHeaders({}, etag)
      }
    )
  );

  const data = await handleResponse(response, cacheKey);
  if (response.headers.get('etag')) {
    setCacheItem(cacheKey, { ...data, etag: response.headers.get('etag') }, 'SEARCH');
  }
  return data;
}

// PUBLIC_INTERFACE
/**
 * Get user contribution data for the last year
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} User contribution data
 */
export async function getUserContributions(username) {
  const response = await requestQueue.enqueue(() => 
    fetch(`${API_BASE_URL}/users/${username}/contributions`, {
      headers: getRequestHeaders()
    })
  );

  return handleResponse(response);
}

// PUBLIC_INTERFACE
/**
 * Get organizations a user belongs to
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} List of user's organizations
 */
export async function getUserOrganizations(username) {
  const cacheKey = `orgs_${username}`;
  const cachedData = getCacheItem(cacheKey, true);
  const etag = cachedData?.etag;

  const response = await requestQueue.enqueue(() => 
    fetch(`${API_BASE_URL}/users/${username}/orgs`, {
      headers: getRequestHeaders({}, etag)
    })
  );

  const data = await handleResponse(response, cacheKey);
  if (response.headers.get('etag')) {
    setCacheItem(cacheKey, { ...data, etag: response.headers.get('etag') }, 'ORGANIZATIONS');
  }
  return data;
}

// PUBLIC_INTERFACE
/**
 * Get repository README content
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @returns {Promise<string>} README content in markdown format
 */
export async function getRepositoryReadme(owner, repo) {
  const cacheKey = `readme_${owner}_${repo}`;
  const cachedData = getCacheItem(cacheKey, true);
  const etag = cachedData?.etag;

  const response = await requestQueue.enqueue(() => 
    fetch(`${API_BASE_URL}/repos/${owner}/${repo}/readme`, {
      headers: getRequestHeaders({ 'Accept': 'application/vnd.github.v3.raw' }, etag)
    })
  );

  if (response.status === 404) {
    return ''; // Return empty string if README doesn't exist
  }

  if (response.status === 304 && cachedData) {
    return cachedData.data;
  }

  const content = await response.text();
  if (response.headers.get('etag')) {
    setCacheItem(cacheKey, { data: content, etag: response.headers.get('etag') }, 'README');
  }
  return content;
}

// PUBLIC_INTERFACE
/**
 * Get commit history for a repository
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @param {Object} options - Pagination options
 * @param {number} [options.per_page=30] - Number of commits per page
 * @param {number} [options.page=1] - Page number
 * @returns {Promise<Object>} Commit history data
 */
export async function getCommitHistory(owner, repo, options = {}) {
  const searchParams = new URLSearchParams({
    per_page: options.per_page || 30,
    page: options.page || 1
  });

  const cacheKey = `commits_${owner}_${repo}_${searchParams.toString()}`;
  const cachedData = getCacheItem(cacheKey, true);
  const etag = cachedData?.etag;

  const response = await requestQueue.enqueue(() => 
    fetch(
      `${API_BASE_URL}/repos/${owner}/${repo}/commits?${searchParams}`,
      {
        headers: getRequestHeaders({}, etag)
      }
    )
  );

  const data = await handleResponse(response, cacheKey);
  if (response.headers.get('etag')) {
    setCacheItem(cacheKey, { ...data, etag: response.headers.get('etag') }, 'COMMITS');
  }
  return data;
}

// PUBLIC_INTERFACE
/**
 * Get repository contributors with their stats
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @param {Object} options - Pagination and sorting options
 * @param {number} [options.per_page=30] - Number of contributors per page
 * @param {number} [options.page=1] - Page number
 * @param {string} [options.sort='commits'] - Sort by: 'commits' or 'contributions'
 * @returns {Promise<Array>} List of contributors with their stats
 */
export async function getRepositoryContributors(owner, repo, options = {}) {
  const searchParams = new URLSearchParams({
    per_page: options.per_page || 30,
    page: options.page || 1,
    sort: options.sort || 'commits'
  });

  const cacheKey = `contributors_${owner}_${repo}_${searchParams.toString()}`;
  const cachedData = getCacheItem(cacheKey, true);
  const etag = cachedData?.etag;

  const response = await requestQueue.enqueue(() => 
    fetch(
      `${API_BASE_URL}/repos/${owner}/${repo}/contributors?${searchParams}`,
      {
        headers: getRequestHeaders({}, etag)
      }
    )
  );

  const data = await handleResponse(response, cacheKey);
  if (response.headers.get('etag')) {
    setCacheItem(cacheKey, { ...data, etag: response.headers.get('etag') }, 'CONTRIBUTORS');
  }
  return data;
}

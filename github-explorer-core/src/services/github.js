/**
 * GitHub API Service
 * Provides functions for interacting with the GitHub REST API
 * using native fetch API with proper error handling and response parsing
 */

// Base configuration for GitHub API
const API_BASE_URL = 'https://api.github.com';

/**
 * Custom error class for GitHub API errors
 */
class GitHubApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Helper function to handle API responses and errors
 * @param {Response} response - Fetch API response object
 * @returns {Promise<any>} Parsed response data
 * @throws {GitHubApiError} Custom error with API response details
 */
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new GitHubApiError(
      data.message || 'GitHub API request failed',
      response.status,
      data
    );
  }
  
  return data;
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

  const response = await fetch(
    `${API_BASE_URL}/search/repositories?${searchParams}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  return handleResponse(response);
}

// PUBLIC_INTERFACE
/**
 * Get user information by username
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} User profile data
 */
export async function getUserInfo(username) {
  const response = await fetch(`${API_BASE_URL}/users/${username}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  return handleResponse(response);
}

// PUBLIC_INTERFACE
/**
 * Get repository details by owner and repo name
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository details
 */
export async function getRepositoryDetails(owner, repo) {
  const response = await fetch(`${API_BASE_URL}/repos/${owner}/${repo}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  return handleResponse(response);
}
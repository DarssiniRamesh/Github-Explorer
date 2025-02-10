/**
 * Custom error classes for GitHub Explorer application
 * Provides specialized error types for different scenarios
 */

// PUBLIC_INTERFACE
/**
 * Base class for API related errors
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// PUBLIC_INTERFACE
/**
 * Error class for authentication failures
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed. Please check your GitHub token.', status = 401, data = null) {
    super(message, status, data);
    this.name = 'AuthenticationError';
  }
}

// PUBLIC_INTERFACE
/**
 * Error class for rate limit exceeded errors
 */
export class RateLimitError extends ApiError {
  constructor(message, resetTime, status = 403, data = null) {
    super(message, status, data);
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
  }
}

// PUBLIC_INTERFACE
/**
 * Error class for network-related failures
 */
export class NetworkError extends Error {
  constructor(message = 'Network error occurred. Please check your connection.', originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

// PUBLIC_INTERFACE
/**
 * Helper function to create appropriate error instance based on response
 * @param {Response} response - Fetch API response object
 * @param {Object} data - Response data
 * @param {Object} rateLimit - Rate limit information
 * @returns {ApiError} Appropriate error instance
 */
export function createApiError(response, data, rateLimit = null) {
  // Handle authentication errors
  if (response.status === 401) {
    return new AuthenticationError(
      'Authentication failed. Please check your GitHub token.',
      response.status,
      data
    );
  }

  // Handle rate limit errors
  if (response.status === 403 && data.message?.includes('rate limit')) {
    const resetDate = rateLimit?.reset ? new Date(rateLimit.reset * 1000) : null;
    return new RateLimitError(
      `Rate limit exceeded. Resets at ${resetDate?.toLocaleString() || 'unknown time'}`,
      resetDate,
      response.status,
      data
    );
  }

  // Handle other API errors
  return new ApiError(
    data.message || 'GitHub API request failed',
    response.status,
    data
  );
}
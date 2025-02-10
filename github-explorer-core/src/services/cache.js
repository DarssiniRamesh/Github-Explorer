// Cache service for GitHub API responses
const CACHE_PREFIX = 'gh_explorer_';
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ETAG_PREFIX = 'gh_etag_';

// Resource type-based expiration times (in milliseconds)
export const CACHE_EXPIRATION = {
  DEFAULT: 5 * 60 * 1000,      // 5 minutes
  SEARCH: 2 * 60 * 1000,       // 2 minutes for search results
  USER_PROFILE: 15 * 60 * 1000, // 15 minutes for user profiles
  REPOSITORY: 10 * 60 * 1000,   // 10 minutes for repository data
  README: 30 * 60 * 1000,       // 30 minutes for README content
  COMMITS: 5 * 60 * 1000,       // 5 minutes for commit history
  CONTRIBUTORS: 15 * 60 * 1000, // 15 minutes for contributors list
  ORGANIZATIONS: 20 * 60 * 1000 // 20 minutes for organization data
};

// PUBLIC_INTERFACE
/**
 * Stores data in localStorage with expiration
 * @param {string} key - Cache key
 * @param {any} data - Data to store
 * @param {number} [expiration] - Expiration time in milliseconds
 * @returns {boolean} - Success status
 */
export const setCacheItem = (key, data, resourceType = 'DEFAULT') => {
  const expiration = CACHE_EXPIRATION[resourceType] || CACHE_EXPIRATION.DEFAULT;
  try {
    const cacheKey = CACHE_PREFIX + key;
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiration,
      etag: data.etag // Store ETag if provided
    };

    // Check available space
    const serializedData = JSON.stringify(cacheData);
    if (serializedData.length > MAX_CACHE_SIZE) {
      console.warn('Cache item exceeds size limit:', key);
      return false;
    }

    // Clear space if needed
    ensureCacheSpace(serializedData.length);

    localStorage.setItem(cacheKey, serializedData);
    return true;
  } catch (error) {
    console.error('Error setting cache item:', error);
    return false;
  }
};

// PUBLIC_INTERFACE
/**
 * Retrieves data from localStorage if not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCacheItem = (key, includeMetadata = false) => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const cachedValue = localStorage.getItem(cacheKey);
    
    if (!cachedValue) return null;

    const cacheData = JSON.parse(cachedValue);
    const { data, timestamp, expiration, etag } = cacheData;
    
    if (Date.now() - timestamp > expiration) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return includeMetadata ? { data, etag } : data;
  } catch (error) {
    console.error('Error getting cache item:', error);
    return null;
  }
};

// PUBLIC_INTERFACE
/**
 * Removes a specific item from cache
 * @param {string} key - Cache key
 */
export const removeCacheItem = (key) => {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.error('Error removing cache item:', error);
  }
};

// PUBLIC_INTERFACE
/**
 * Clears all cached data for the application
 */
export const clearCache = () => {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Ensures there's enough space in localStorage by removing old items
 * @param {number} requiredSpace - Space needed in bytes
 */
const ensureCacheSpace = (requiredSpace) => {
  try {
    let currentSize = 0;
    const cacheItems = [];

    // Calculate current cache size and collect items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        currentSize += value.length;
        cacheItems.push({
          key,
          size: value.length,
          timestamp: JSON.parse(value).timestamp
        });
      }
    });

    // Remove oldest items until we have enough space
    if (currentSize + requiredSpace > MAX_CACHE_SIZE) {
      cacheItems
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach(item => {
          localStorage.removeItem(item.key);
          currentSize -= item.size;
          if (currentSize + requiredSpace <= MAX_CACHE_SIZE) {
            return;
          }
        });
    }
  } catch (error) {
    console.error('Error ensuring cache space:', error);
  }
};

// Utility for secure GitHub token storage with encryption
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'github_token';
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || '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'; // Should be set in environment

// PUBLIC_INTERFACE
/**
 * Securely stores the GitHub token with encryption
 * @param {string} token - GitHub personal access token
 * @returns {boolean} - Success status of storage operation
 */
export const setToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Encrypt the token before storage
    const encryptedToken = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
    localStorage.setItem(STORAGE_KEY, encryptedToken);
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

// PUBLIC_INTERFACE
/**
 * Retrieves and decrypts the stored GitHub token
 * @returns {string|null} - Decrypted token or null if not found/invalid
 */
export const getToken = () => {
  try {
    const encryptedToken = localStorage.getItem(STORAGE_KEY);
    if (!encryptedToken) {
      return null;
    }

    // Decrypt the token
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    const token = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    return token || null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// PUBLIC_INTERFACE
/**
 * Validates if the stored token exists and is properly formatted
 * @returns {boolean} - True if token is valid, false otherwise
 */
export const validateToken = () => {
  try {
    const token = getToken();
    // Check if token exists and matches GitHub token format (40+ characters, alphanumeric)
    return Boolean(token && /^[a-zA-Z0-9_]{40,}$/.test(token));
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// PUBLIC_INTERFACE
/**
 * Removes the stored token
 * @returns {boolean} - Success status of removal operation
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};
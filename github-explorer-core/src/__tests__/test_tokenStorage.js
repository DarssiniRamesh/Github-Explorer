import * as tokenStorage from '../utils/tokenStorage';
import CryptoJS from 'crypto-js';

// Mock CryptoJS
const mockEncrypt = jest.fn();
const mockDecrypt = jest.fn();
const mockToString = jest.fn();

jest.mock('crypto-js', () => ({
  AES: {
    encrypt: mockEncrypt,
    decrypt: mockDecrypt
  },
  enc: {
    Utf8: 'utf8'
  }
}));

beforeEach(() => {
  // Reset mocks and setup default implementations
  jest.clearAllMocks();
  mockToString.mockImplementation(() => 'decrypted_token');
  mockEncrypt.mockImplementation(() => ({
    toString: () => 'encrypted_token'
  }));
  mockDecrypt.mockImplementation(() => ({
    toString: mockToString
  }));
});

const { setToken, getToken, validateToken, removeToken } = tokenStorage;

// Mock process.env
process.env.REACT_APP_ENCRYPTION_KEY = 'test_key_123';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn(key => localStorageMock.store[key]),
  setItem: jest.fn((key, value) => localStorageMock.store[key] = value),
  removeItem: jest.fn(key => delete localStorageMock.store[key]),
  clear: jest.fn(() => localStorageMock.store = {})
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Token Storage Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('setToken', () => {
    it('should successfully store valid token', () => {
      const token = 'ghp_123456789abcdefghijklmnopqrstuvwxyz1234';
      const result = setToken(token);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(mockEncrypt).toHaveBeenCalledWith(token, expect.any(String));
    });

    it('should reject invalid token formats', () => {
      expect(setToken('')).toBe(false);
      expect(setToken(null)).toBe(false);
      expect(setToken(undefined)).toBe(false);
      expect(setToken(123)).toBe(false);
      expect(setToken('ghp_short')).toBe(false);
      expect(setToken('invalid!@#$%^')).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle storage errors', () => {
      console.error = jest.fn(); // Mock console.error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      const result = setToken('valid_token');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error storing token:', expect.any(Error));
    });

    it('should handle encryption errors', () => {
      console.error = jest.fn();
      mockEncrypt.mockImplementationOnce(() => {
        throw new Error('Encryption failed');
      });
      const result = setToken('valid_token');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error storing token:', expect.any(Error));
    });

    it('should store token with correct encryption key', () => {
      const token = 'ghp_123456789abcdefghijklmnopqrstuvwxyz1234';
      setToken(token);
      expect(mockEncrypt).toHaveBeenCalledWith(token, process.env.REACT_APP_ENCRYPTION_KEY);
    });
  });

  describe('getToken', () => {
    it('should retrieve stored token', () => {
      const token = 'ghp_123456789abcdefghijklmnopqrstuvwxyz1234';
      mockToString.mockReturnValue(token);
      
      // Store the token
      const result = setToken(token);
      expect(result).toBe(true);
      
      // Get the encrypted value that was stored
      const encryptedValue = localStorageMock.store['github_token'];
      expect(encryptedValue).toBe('encrypted_token');
      
      // Retrieve and verify the token
      const retrievedToken = getToken();
      expect(retrievedToken).toBe(token);
      expect(mockDecrypt).toHaveBeenCalledWith('encrypted_token', process.env.REACT_APP_ENCRYPTION_KEY);
    });

    it('should return null when no token is stored', () => {
      const result = getToken();
      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('github_token');
    });

    it('should handle decryption errors', () => {
      console.error = jest.fn();
      localStorageMock.getItem.mockReturnValueOnce('invalid-encrypted-data');
      mockDecrypt.mockImplementationOnce(() => {
        throw new Error('Decryption failed');
      });
      const result = getToken();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error retrieving token:', expect.any(Error));
    });

    it('should handle corrupted token data', () => {
      console.error = jest.fn();
      mockToString.mockReturnValueOnce('');
      localStorageMock.getItem.mockReturnValueOnce('corrupted-token');
      const result = getToken();
      expect(result).toBeNull();
    });

    it('should handle localStorage access errors', () => {
      console.error = jest.fn();
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });
      const result = getToken();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error retrieving token:', expect.any(Error));
    });
  });

  describe('validateToken', () => {
    it('should validate correct GitHub token format', () => {
      const validToken = 'ghp_123456789abcdefghijklmnopqrstuvwxyz1234';
      mockToString.mockReturnValue(validToken);
      
      // Store a valid token and verify storage
      const result = setToken(validToken);
      expect(result).toBe(true);
      
      // Validate the token
      const isValid = validateToken();
      expect(isValid).toBe(true);
      expect(mockDecrypt).toHaveBeenCalled();
    });

    it('should reject invalid token formats', () => {
      setToken('short_token');
      expect(validateToken()).toBe(false);
      
      setToken('invalid-chars-!@#');
      expect(validateToken()).toBe(false);
    });

    it('should return false when no token exists', () => {
      expect(validateToken()).toBe(false);
    });
  });

  describe('removeToken', () => {
    it('should successfully remove stored token', () => {
      setToken('test_token');
      const result = removeToken();
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalled();
      expect(getToken()).toBeNull();
    });

    it('should handle removal errors', () => {
      console.error = jest.fn(); // Mock console.error
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Removal error');
      });
      const result = removeToken();
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error removing token:', expect.any(Error));
    });
  });
});

import {
  setAuthToken,
  clearAuthToken,
  getRateLimit,
  searchRepositories,
  getUserInfo,
  getRepositoryDetails
} from '../services/github';
import * as tokenStorage from '../utils/tokenStorage';

// Mock the tokenStorage module
jest.mock('../utils/tokenStorage', () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn()
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('GitHub Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Authentication', () => {
    it('should set authentication token', () => {
      const token = 'test_token';
      tokenStorage.setToken.mockReturnValue(true);
      
      const result = setAuthToken(token);
      
      expect(result).toBe(true);
      expect(tokenStorage.setToken).toHaveBeenCalledWith(token);
    });

    it('should handle failed token storage', () => {
      const token = 'test_token';
      tokenStorage.setToken.mockReturnValue(false);
      
      const result = setAuthToken(token);
      
      expect(result).toBe(false);
      expect(tokenStorage.setToken).toHaveBeenCalledWith(token);
    });

    it('should clear authentication token', () => {
      tokenStorage.removeToken.mockReturnValue(true);
      
      const result = clearAuthToken();
      
      expect(result).toBe(true);
      expect(tokenStorage.removeToken).toHaveBeenCalled();
    });

    it('should handle failed token removal', () => {
      tokenStorage.removeToken.mockReturnValue(false);
      
      const result = clearAuthToken();
      
      expect(result).toBe(false);
      expect(tokenStorage.removeToken).toHaveBeenCalled();
    });

    it('should include auth token in request headers when available', async () => {
      const token = 'test_token';
      tokenStorage.getToken.mockReturnValue(token);
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
        headers: new Headers()
      });

      await searchRepositories('test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          })
        })
      );
    });

    it('should not include auth token when not available', async () => {
      tokenStorage.getToken.mockReturnValue(null);
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
        headers: new Headers()
      });

      await searchRepositories('test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });

    it('should handle token expiration', async () => {
      const token = 'expired_token';
      tokenStorage.getToken.mockReturnValue(token);
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          message: 'Token expired'
        }),
        headers: new Headers()
      });

      await expect(searchRepositories('test')).rejects.toThrow('Authentication failed');
      expect(tokenStorage.removeToken).toHaveBeenCalled();
    });

    it('should handle invalid token format', async () => {
      const token = 'invalid_format_token';
      tokenStorage.getToken.mockReturnValue(token);
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          message: 'Bad credentials'
        }),
        headers: new Headers()
      });

      await expect(searchRepositories('test')).rejects.toThrow('Authentication failed');
      expect(tokenStorage.removeToken).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    it('should track rate limit information from headers', async () => {
      const headers = new Headers({
        'x-ratelimit-limit': '60',
        'x-ratelimit-remaining': '59',
        'x-ratelimit-reset': '1623456789'
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
        headers
      });

      await searchRepositories('test');
      const rateLimit = getRateLimit();

      expect(rateLimit).toEqual({
        limit: 60,
        remaining: 59,
        reset: 1623456789
      });
    });

    it('should handle rate limit exceeded error', async () => {
      const headers = new Headers({
        'x-ratelimit-limit': '60',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': '1623456789'
      });

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          message: 'API rate limit exceeded'
        }),
        headers
      });

      await expect(searchRepositories('test')).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          message: 'Bad credentials'
        }),
        headers: new Headers()
      });

      await expect(getUserInfo('testuser')).rejects.toThrow('Authentication failed');
      expect(tokenStorage.removeToken).toHaveBeenCalled();
    });

    it('should handle general API errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          message: 'Not Found'
        }),
        headers: new Headers()
      });

      await expect(getRepositoryDetails('owner', 'repo')).rejects.toThrow('Not Found');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(searchRepositories('test')).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
        headers: new Headers()
      });

      await expect(searchRepositories('test')).rejects.toThrow();
    });

    it('should handle rate limit errors with reset time', async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          message: 'API rate limit exceeded'
        }),
        headers: new Headers({
          'x-ratelimit-reset': resetTime.toString()
        })
      });

      await expect(searchRepositories('test')).rejects.toThrow(/Rate limit exceeded/);
      expect(getRateLimit().reset).toBe(resetTime);
    });

    it('should handle server errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          message: 'Internal server error'
        }),
        headers: new Headers()
      });

      await expect(searchRepositories('test')).rejects.toThrow('Internal server error');
    });

    it('should handle empty response bodies', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(null),
        headers: new Headers()
      });

      await expect(searchRepositories('test')).rejects.toThrow('GitHub API request failed');
    });
  });

  describe('API Endpoints', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
        headers: new Headers()
      });
    });

    it('should make correct repository search request', async () => {
      await searchRepositories('test', { sort: 'stars', page: 1 });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/repositories?q=test'),
        expect.any(Object)
      );
    });

    it('should make correct user info request', async () => {
      await getUserInfo('testuser');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/testuser'),
        expect.any(Object)
      );
    });

    it('should make correct repository details request', async () => {
      await getRepositoryDetails('owner', 'repo');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/repos/owner/repo'),
        expect.any(Object)
      );
    });
  });
});

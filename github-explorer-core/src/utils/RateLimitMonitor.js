/**
 * RateLimitMonitor class
 * Tracks and analyzes GitHub API rate limit usage with prediction and warning capabilities
 */

// PUBLIC_INTERFACE
/**
 * RateLimitMonitor class for tracking and analyzing API rate limits
 */
export class RateLimitMonitor {
  constructor(warningThreshold = 0.2) {
    this.rateLimit = {
      limit: null,
      remaining: null,
      reset: null,
      lastUpdated: null
    };
    this.warningThreshold = warningThreshold;
    this.usageHistory = [];
    this.maxHistoryLength = 100;
  }

  /**
   * Update rate limit information from API response
   * @param {Object} headers - Response headers from GitHub API
   */
  updateFromHeaders(headers) {
    const limit = parseInt(headers.get('x-ratelimit-limit'), 10);
    const remaining = parseInt(headers.get('x-ratelimit-remaining'), 10);
    const reset = parseInt(headers.get('x-ratelimit-reset'), 10);

    if (limit && remaining && reset) {
      this.rateLimit = {
        limit,
        remaining,
        reset,
        lastUpdated: Date.now()
      };

      this.trackUsage();
    }
  }

  /**
   * Track API usage for analytics
   */
  trackUsage() {
    const usage = {
      timestamp: Date.now(),
      remaining: this.rateLimit.remaining,
      limit: this.rateLimit.limit
    };

    this.usageHistory.unshift(usage);
    if (this.usageHistory.length > this.maxHistoryLength) {
      this.usageHistory.pop();
    }
  }

  /**
   * Get current rate limit status
   * @returns {Object} Current rate limit information
   */
  getCurrentStatus() {
    return { ...this.rateLimit };
  }

  /**
   * Calculate time until rate limit reset
   * @returns {number} Seconds until reset, or 0 if unknown
   */
  getTimeUntilReset() {
    if (!this.rateLimit.reset) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, this.rateLimit.reset - now);
  }

  /**
   * Check if rate limit is approaching warning threshold
   * @returns {boolean} True if approaching limit
   */
  isApproachingLimit() {
    if (!this.rateLimit.limit || !this.rateLimit.remaining) return false;
    const usagePercent = 1 - (this.rateLimit.remaining / this.rateLimit.limit);
    return usagePercent >= (1 - this.warningThreshold);
  }

  /**
   * Calculate average rate of API calls
   * @param {number} timeWindowMs - Time window in milliseconds
   * @returns {number} Average calls per hour
   */
  getUsageRate(timeWindowMs = 3600000) { // Default 1 hour window
    if (this.usageHistory.length < 2) return 0;

    const now = Date.now();
    const relevantUsage = this.usageHistory.filter(
      usage => (now - usage.timestamp) <= timeWindowMs
    );

    if (relevantUsage.length < 2) return 0;

    const oldestRelevant = relevantUsage[relevantUsage.length - 1];
    const newest = relevantUsage[0];
    const usageDiff = oldestRelevant.remaining - newest.remaining;
    const timeDiff = (newest.timestamp - oldestRelevant.timestamp) / 3600000; // Convert to hours

    return timeDiff > 0 ? usageDiff / timeDiff : 0;
  }

  /**
   * Predict when rate limit will be exhausted based on current usage
   * @returns {number} Estimated minutes until exhaustion, or -1 if cannot predict
   */
  predictTimeToExhaustion() {
    if (!this.rateLimit.remaining || this.rateLimit.remaining === this.rateLimit.limit) {
      return -1;
    }

    const usageRate = this.getUsageRate();
    if (usageRate <= 0) return -1;

    return Math.floor((this.rateLimit.remaining / usageRate) * 60); // Convert hours to minutes
  }

  /**
   * Get usage analytics
   * @returns {Object} Usage analytics data
   */
  getAnalytics() {
    return {
      currentUsage: {
        limit: this.rateLimit.limit,
        remaining: this.rateLimit.remaining,
        usagePercent: this.rateLimit.limit ? 
          ((this.rateLimit.limit - this.rateLimit.remaining) / this.rateLimit.limit) * 100 : 0
      },
      resetTime: {
        timestamp: this.rateLimit.reset,
        timeUntilReset: this.getTimeUntilReset()
      },
      predictions: {
        timeToExhaustion: this.predictTimeToExhaustion(),
        isApproachingLimit: this.isApproachingLimit(),
        averageUsageRate: this.getUsageRate()
      }
    };
  }
}

// Create singleton instance
const rateLimitMonitor = new RateLimitMonitor();
export default rateLimitMonitor;
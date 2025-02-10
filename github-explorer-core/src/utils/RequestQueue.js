/**
 * RequestQueue class implementing token bucket algorithm for rate limiting
 */
class RequestQueue {
  constructor(tokensPerInterval = 60, intervalInSeconds = 3600) {
    this.tokens = tokensPerInterval;
    this.tokensPerInterval = tokensPerInterval;
    this.intervalInSeconds = intervalInSeconds;
    this.lastRefill = Date.now();
    this.queue = [];
  }

  // PUBLIC_INTERFACE
  /**
   * Add a request to the queue
   * @param {Function} requestFn - Function that returns a promise for the request
   * @returns {Promise} Promise that resolves with the request result
   */
  async enqueue(requestFn) {
    await this.waitForToken();
    return requestFn();
  }

  /**
   * Wait for a token to become available
   * @private
   */
  async waitForToken() {
    this.refillTokens();
    
    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  /**
   * Refill tokens based on elapsed time
   * @private
   */
  refillTokens() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    
    if (elapsedSeconds >= 1) {
      const newTokens = Math.floor(elapsedSeconds * (this.tokensPerInterval / this.intervalInSeconds));
      
      if (newTokens > 0) {
        this.tokens = Math.min(this.tokensPerInterval, this.tokens + newTokens);
        this.lastRefill = now;

        // Release queued requests if we have tokens
        while (this.queue.length > 0 && this.tokens > 0) {
          this.tokens--;
          const resolve = this.queue.shift();
          resolve();
        }
      }
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get current number of available tokens
   * @returns {number} Number of available tokens
   */
  getAvailableTokens() {
    this.refillTokens();
    return this.tokens;
  }

  // PUBLIC_INTERFACE
  /**
   * Get current queue length
   * @returns {number} Number of requests in queue
   */
  getQueueLength() {
    return this.queue.length;
  }
}

export default RequestQueue;
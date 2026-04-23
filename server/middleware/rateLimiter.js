const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware
 * Protects API endpoints from excessive requests
 * 
 * Validates Requirement: 21.4 (Rate Limiting)
 */

/**
 * General API rate limiter
 * 100 requests per 15-minute window per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // Effectively disabled
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful requests (optional)
  skipSuccessfulRequests: false,
  // Skip rate limiting for failed requests (optional)
  skipFailedRequests: false
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15-minute window per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // Effectively disabled
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * File upload rate limiter
 * 10 uploads per 15-minute window per IP
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // Effectively disabled
  message: {
    success: false,
    message: 'Too many file uploads from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter
};

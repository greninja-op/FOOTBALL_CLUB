const sanitizeHtml = require('sanitize-html');

/**
 * Sanitization Utility
 * Strips HTML tags and escapes special characters to prevent XSS attacks
 * 
 * Validates Requirement: 21.5 (Input Sanitization)
 */

/**
 * Sanitize text input by stripping all HTML tags
 * @param {string} input - Text to sanitize
 * @returns {string} Sanitized text with HTML stripped
 */
const sanitizeText = (input) => {
  if (!input || typeof input !== 'string') {
    return input;
  }

  // Strip all HTML tags and return plain text
  return sanitizeHtml(input, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
    disallowedTagsMode: 'discard' // Remove disallowed tags entirely
  }).trim();
};

/**
 * Sanitize an object's string fields recursively
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} fieldsToSanitize - Array of field names to sanitize
 * @returns {Object} Object with sanitized fields
 */
const sanitizeObject = (obj, fieldsToSanitize) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };

  fieldsToSanitize.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeText(sanitized[field]);
    }
  });

  return sanitized;
};

/**
 * Middleware to sanitize request body fields
 * @param {Array<string>} fields - Array of field names to sanitize
 * @returns {Function} Express middleware function
 */
const sanitizeMiddleware = (fields) => {
  return (req, res, next) => {
    if (req.body) {
      req.body = sanitizeObject(req.body, fields);
    }
    next();
  };
};

module.exports = {
  sanitizeText,
  sanitizeObject,
  sanitizeMiddleware
};

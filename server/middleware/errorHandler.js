/**
 * Global Error Handler Middleware
 * Handles all errors with consistent response format and proper HTTP status codes
 * 
 * Validates Requirements: 23.1, 23.2, 23.4
 */

/**
 * Global error handler middleware
 * Must be registered AFTER all routes
 */
const errorHandler = (err, req, res, next) => {
  // Log error with context
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user ? req.user.id : 'unauthenticated',
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = null;

  // Handle Mongoose validation errors (400)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose cast errors (400)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle Mongoose duplicate key errors (400)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Handle JWT errors (401)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Handle Multer file upload errors (400)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds maximum allowed limit';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Handle authorization errors (403)
  if (err.message && err.message.includes('not authorized')) {
    statusCode = 403;
    message = 'Access denied: insufficient permissions';
  }

  // Handle not found errors (404)
  if (err.message && err.message.includes('not found')) {
    statusCode = 404;
  }

  // Send error response with consistent format
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 * Handles requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler
};

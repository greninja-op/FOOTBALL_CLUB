const SystemLog = require('../models/SystemLog');

/**
 * Logger Middleware
 * Logs all database write operations (POST, PUT, PATCH, DELETE) to SystemLog collection
 * 
 * Validates Requirements: 3.3, 3.4, 5.1, 5.4
 * 
 * This middleware intercepts write operations and creates audit trail entries.
 * It should be applied AFTER authMiddleware and roleGuard to ensure req.user exists.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * router.post('/users', authMiddleware, requireRole(['admin']), loggerMiddleware, userController.create);
 */
const loggerMiddleware = (req, res, next) => {
  // Only log write operations
  const writeOperations = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (!writeOperations.includes(req.method)) {
    return next();
  }

  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);

  // Override res.json to capture response data
  res.json = function(data) {
    // Only log if operation was successful (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Perform logging asynchronously without blocking response
      setImmediate(async () => {
        try {
          // Determine action based on HTTP method
          let action;
          switch (req.method) {
            case 'POST':
              action = 'CREATE';
              break;
            case 'PUT':
            case 'PATCH':
              action = 'UPDATE';
              break;
            case 'DELETE':
              action = 'DELETE';
              break;
            default:
              action = 'UPDATE';
          }

          // Extract target collection from the full URL path
          // Expected format: /api/collection/:id or /api/collection
          const urlPath = req.originalUrl.split('?')[0]; // strip query string
          const pathParts = urlPath.split('/').filter(part => part);
          let targetCollection = 'Unknown';

          // pathParts[0]='api', pathParts[1]='collection'
          if (pathParts.length >= 2) {
            // Convert route name to collection name
            const routeName = pathParts[1];
            targetCollection = routeName.charAt(0).toUpperCase() + routeName.slice(1, -1);
            
            // Handle special cases
            if (routeName === 'training') targetCollection = 'TrainingSession';
            if (routeName === 'disciplinary') targetCollection = 'DisciplinaryAction';
            if (routeName === 'leave') targetCollection = 'LeaveRequest';
            if (routeName === 'injuries') targetCollection = 'Injury';
            if (routeName === 'inventory') targetCollection = 'Inventory';
            if (routeName === 'settings') targetCollection = 'Settings';
            if (routeName === 'profiles') targetCollection = 'Profile';
            if (routeName === 'fixtures') targetCollection = 'Fixture';
            if (routeName === 'documents') targetCollection = 'Document';
          }

          // Extract target ID from response data or route params
          let targetId = null;
          
          // Try to get ID from route params first
          if (req.params && req.params.id) {
            targetId = req.params.id;
          }
          // Try to get ID from response data
          else if (data) {
            // Handle different response structures
            if (data._id) {
              targetId = data._id;
            } else if (data.id) {
              targetId = data.id;
            } else if (data.user && data.user._id) {
              targetId = data.user._id;
            } else if (data.profile && data.profile._id) {
              targetId = data.profile._id;
            } else if (data.fixture && data.fixture._id) {
              targetId = data.fixture._id;
            } else if (data.session && data.session._id) {
              targetId = data.session._id;
            } else if (data.injury && data.injury._id) {
              targetId = data.injury._id;
            } else if (data.action && data.action._id) {
              targetId = data.action._id;
            } else if (data.request && data.request._id) {
              targetId = data.request._id;
            } else if (data.item && data.item._id) {
              targetId = data.item._id;
            } else if (data.settings && data.settings._id) {
              targetId = data.settings._id;
            }
          }

          // Only create log if we have required information
          if (req.user && req.user.id && targetId) {
            await SystemLog.create({
              action,
              performedBy: req.user.id,
              targetCollection,
              targetId,
              changes: {
                method: req.method,
                path: req.originalUrl,
                timestamp: new Date()
              }
            });
          }
        } catch (error) {
          // Log error but don't block the response
          console.error('Logger middleware error:', error.message);
        }
      });
    }

    // Call original res.json with the data
    return originalJson(data);
  };

  // Continue to next middleware
  next();
};

module.exports = loggerMiddleware;

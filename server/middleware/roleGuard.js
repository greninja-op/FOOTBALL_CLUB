/**
 * Role Guard Middleware Factory
 * Creates middleware that restricts route access based on user roles
 * 
 * Validates Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
 * 
 * @param {Array<string>} allowedRoles - Array of roles that can access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Only admin can access
 * router.get('/users', authMiddleware, requireRole(['admin']), userController.getAll);
 * 
 * @example
 * // Manager and admin can access
 * router.post('/fixtures', authMiddleware, requireRole(['manager', 'admin']), fixtureController.create);
 */
const requireRole = (allowedRoles) => {
  // Validate input
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('requireRole: allowedRoles must be a non-empty array');
  }

  // Return middleware function
  return (req, res, next) => {
    try {
      // Check if user exists on request (should be set by authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User information not found. Ensure authMiddleware is applied before roleGuard.'
        });
      }

      // Check if user has a role
      if (!req.user.role) {
        return res.status(403).json({
          error: 'Authorization failed',
          message: 'User role not found'
        });
      }

      // Check if user's role is in the allowed roles array
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied',
          message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
          userRole: req.user.role
        });
      }

      // User is authorized, proceed to next middleware
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Authorization check failed',
        message: error.message
      });
    }
  };
};

module.exports = requireRole;

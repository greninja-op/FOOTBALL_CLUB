const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

/**
 * Profile Routes
 * Handles player profile management with role-based access control
 * 
 * Validates Requirements: 6.6, 13.2, 13.3, 16.4, 17.4
 */

/**
 * GET /api/profiles
 * Get all profiles
 *
 * @access Admin, Manager, Coach
 */
router.get('/', authMiddleware, requireRole(['admin', 'manager', 'coach']), profileController.getAllProfiles);

/**
 * GET /api/profiles/me
 * Get the authenticated user's own profile.
 */
router.get('/me', authMiddleware, profileController.getProfile);

/**
 * GET /api/profiles/:userId
 * Get profile by user ID
 * 
 * @access Admin (all profiles), Manager (all profiles), Coach (all profiles), Player (own profile only)
 * @middleware authMiddleware - Validates JWT token
 * @middleware Custom authorization logic - Players can only access their own profile
 * 
 * Response:
 * {
 *   success: boolean,
 *   profile: ProfileObject
 * }
 * 
 * Status codes:
 * - 200: Success
 * - 403: Access denied (player trying to access another player's profile)
 * - 404: Profile not found
 * 
 * Validates Requirements: 6.6, 17.4
 */
router.get('/:userId', authMiddleware, (req, res, next) => {
  // Special authorization logic for GET route
  // Admin, Manager, and Coach can see all profiles
  // Players can only see their own profile
  
  const { userId } = req.params;
  const { role, id } = req.user;
  
  // If user is a player, they can only access their own profile
  if (role === 'player' && id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Players can only view their own profile.'
    });
  }
  
  // Admin, Manager, and Coach can access any profile
  next();
}, profileController.getProfile);

/**
 * PUT /api/profiles/:userId
 * Update profile fields
 * 
 * @access Admin, Manager
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['admin', 'manager']) - Restricts access to admin and manager
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Request body:
 * {
 *   fullName?: string,
 *   photo?: string,
 *   position?: string (enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Staff']),
 *   weight?: number,
 *   height?: number,
 *   contractType?: string (enum: ['Full-Time', 'Part-Time', 'Loan', 'Trial']),
 *   contractStart?: Date,
 *   contractEnd?: Date
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   profile: ProfileObject
 * }
 * 
 * Status codes:
 * - 200: Profile updated successfully
 * - 400: Validation error
 * - 403: Access denied (not admin or manager)
 * - 404: Profile not found
 * 
 * Validates Requirements: 6.6
 */
router.put('/:userId', authMiddleware, requireRole(['admin', 'manager']), loggerMiddleware, profileController.updateProfile);

/**
 * POST /api/profiles/:userId/notes
 * Add a private performance note
 *
 * @access Coach, Admin
 */
router.post('/:userId/notes', authMiddleware, requireRole(['coach', 'admin']), loggerMiddleware, profileController.addPerformanceNote);

/**
 * PUT /api/profiles/:userId/fitness
 * Update player fitness status
 * 
 * @access Coach, Admin
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['coach', 'admin']) - Restricts access to coach and admin
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Request body:
 * {
 *   status: string (required, enum: ['Green', 'Yellow', 'Red']),
 *   notes?: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   profile: {
 *     id: ObjectId,
 *     userId: ObjectId,
 *     fullName: string,
 *     fitnessStatus: string
 *   }
 * }
 * 
 * Status codes:
 * - 200: Fitness status updated successfully
 * - 400: Validation error (missing status, invalid status value)
 * - 403: Access denied (not coach or admin)
 * - 404: Profile not found
 * 
 * Validates Requirements: 13.2, 13.3
 */
router.put('/:userId/fitness', authMiddleware, requireRole(['coach', 'admin']), loggerMiddleware, profileController.updateFitnessStatus);

/**
 * PUT /api/profiles/:userId/stats
 * Update player performance statistics
 * 
 * @access Coach, Admin
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['coach', 'admin']) - Restricts access to coach and admin
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Request body:
 * {
 *   goals?: number,
 *   assists?: number,
 *   appearances?: number,
 *   rating?: number (0-10 range)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   profile: {
 *     id: ObjectId,
 *     userId: ObjectId,
 *     fullName: string,
 *     stats: {
 *       goals: number,
 *       assists: number,
 *       appearances: number,
 *       rating: number
 *     }
 *   }
 * }
 * 
 * Status codes:
 * - 200: Statistics updated successfully
 * - 400: Validation error (rating out of range)
 * - 403: Access denied (not coach or admin)
 * - 404: Profile not found
 * 
 * Side effects:
 * - Emits 'stats:updated' Socket.io event to all connected clients
 * 
 * Validates Requirements: 16.4, 17.4
 */
router.put('/:userId/stats', authMiddleware, requireRole(['coach', 'admin']), loggerMiddleware, profileController.updateStats);

module.exports = router;

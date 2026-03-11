const express = require('express');
const router = express.Router();
const fixtureController = require('../controllers/fixtureController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

/**
 * Fixture Routes
 * Handles fixture management with role-based access control
 * 
 * Validates Requirements: 2.7, 6.1, 6.5, 6.6
 */

/**
 * POST /api/fixtures
 * Create a new fixture
 * 
 * @access Manager, Admin
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['manager', 'admin']) - Restricts access to manager and admin
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Request body:
 * {
 *   opponent: string (required),
 *   date: Date (required),
 *   location: string (required),
 *   matchType: string (optional, default: 'League'),
 *   lineup: ObjectId[] (optional, max 18)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   fixture: FixtureObject
 * }
 * 
 * Status codes:
 * - 201: Fixture created successfully
 * - 400: Validation error (missing fields, past date, lineup > 18)
 * - 403: Access denied (not manager or admin)
 * 
 * Validates Requirements: 6.1, 2.7
 */
router.post('/', authMiddleware, requireRole(['manager', 'admin']), loggerMiddleware, fixtureController.createFixture);

/**
 * GET /api/fixtures
 * Get all fixtures with pagination and filtering
 * 
 * @access All authenticated users
 * @middleware authMiddleware - Validates JWT token
 * 
 * Query parameters:
 * - page: number (optional, default: 1)
 * - limit: number (optional, default: 50)
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * 
 * Response:
 * {
 *   success: boolean,
 *   fixtures: FixtureObject[],
 *   pagination: {
 *     total: number,
 *     page: number,
 *     limit: number,
 *     pages: number
 *   }
 * }
 * 
 * Status codes:
 * - 200: Success
 * - 401: Authentication required
 * 
 * Validates Requirements: 6.1
 */
router.get('/', authMiddleware, fixtureController.getAllFixtures);

/**
 * PUT /api/fixtures/:id
 * Update fixture details
 * 
 * @access Manager, Coach, Admin
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['manager', 'coach', 'admin']) - Restricts access
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Note: Only coach can update lineup field (validated in controller)
 * 
 * Request body:
 * {
 *   opponent: string (optional),
 *   date: Date (optional),
 *   location: string (optional),
 *   matchType: string (optional),
 *   lineup: ObjectId[] (optional, max 18, coach only)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   fixture: FixtureObject
 * }
 * 
 * Status codes:
 * - 200: Fixture updated successfully
 * - 400: Validation error (past date, lineup > 18)
 * - 403: Access denied (not manager, coach, or admin)
 * - 404: Fixture not found
 * 
 * Validates Requirements: 6.5, 6.6, 2.7
 */
router.put('/:id', authMiddleware, requireRole(['manager', 'coach', 'admin']), loggerMiddleware, fixtureController.updateFixture);

/**
 * DELETE /api/fixtures/:id
 * Delete a fixture
 * 
 * @access Manager, Admin
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['manager', 'admin']) - Restricts access to manager and admin
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 * 
 * Status codes:
 * - 200: Fixture deleted successfully
 * - 403: Access denied (not manager or admin)
 * - 404: Fixture not found
 * 
 * Validates Requirements: 6.5, 2.7
 */
router.delete('/:id', authMiddleware, requireRole(['manager', 'admin']), loggerMiddleware, fixtureController.deleteFixture);

module.exports = router;

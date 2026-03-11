const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

/**
 * Inventory Routes
 * Handles inventory management with role-based access control
 * 
 * Validates Requirements: 9.1, 9.2, 9.4
 */

/**
 * POST /api/inventory
 * Create a new inventory item
 * 
 * @access Manager, Admin
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['manager', 'admin']) - Restricts access to manager and admin
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Request body:
 * {
 *   itemName: string (required),
 *   itemType: string (required, enum: ['Jersey', 'Boots', 'Training Equipment', 'Medical', 'Other'])
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   item: InventoryObject
 * }
 * 
 * Status codes:
 * - 201: Inventory item created successfully
 * - 400: Validation error (missing fields, invalid itemType)
 * - 403: Access denied (not manager or admin)
 * 
 * Validates Requirements: 9.1
 */
router.post('/', authMiddleware, requireRole(['manager', 'admin']), loggerMiddleware, inventoryController.createItem);

/**
 * GET /api/inventory
 * Get all inventory items with pagination and filtering
 * 
 * @access All authenticated users
 * @middleware authMiddleware - Validates JWT token
 * 
 * Query parameters:
 * - page: number (optional, default: 1)
 * - limit: number (optional, default: 50)
 * - assigned: boolean (optional, filters by assignment status)
 * 
 * Response:
 * {
 *   success: boolean,
 *   items: InventoryObject[],
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
 * Validates Requirements: 9.1, 9.5
 */
router.get('/', authMiddleware, inventoryController.getAllItems);

/**
 * PUT /api/inventory/:id/assign
 * Assign inventory item to a player
 * 
 * @access Manager, Admin
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['manager', 'admin']) - Restricts access to manager and admin
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Request body:
 * {
 *   playerId: ObjectId (required)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   item: InventoryObject
 * }
 * 
 * Status codes:
 * - 200: Item assigned successfully
 * - 400: Validation error (missing playerId, item already assigned)
 * - 403: Access denied (not manager or admin)
 * - 404: Inventory item not found
 * 
 * Validates Requirements: 9.2, 9.4
 */
router.put('/:id/assign', authMiddleware, requireRole(['manager', 'admin']), loggerMiddleware, inventoryController.assignItem);

/**
 * PUT /api/inventory/:id/return
 * Record return of inventory item
 * 
 * @access Manager, Admin
 * @middleware authMiddleware - Validates JWT token
 * @middleware requireRole(['manager', 'admin']) - Restricts access to manager and admin
 * @middleware loggerMiddleware - Logs the operation to SystemLog
 * 
 * Request body:
 * {
 *   returnDate: Date (optional, defaults to current date)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   item: InventoryObject
 * }
 * 
 * Status codes:
 * - 200: Item return recorded successfully
 * - 400: Validation error (item not currently assigned)
 * - 403: Access denied (not manager or admin)
 * - 404: Inventory item not found
 * 
 * Validates Requirements: 9.4
 */
router.put('/:id/return', authMiddleware, requireRole(['manager', 'admin']), loggerMiddleware, inventoryController.unassignItem);

module.exports = router;

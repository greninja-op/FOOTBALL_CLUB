# Task 17.2 Completion: Create Inventory Routes

## Overview
Successfully created inventory routes with role-based access control and integrated them into the Express server.

## Files Created

### 1. server/routes/inventoryRoutes.js
Complete route definitions for inventory management with:
- POST /api/inventory - Create new inventory item
- GET /api/inventory - Get all inventory items with pagination
- PUT /api/inventory/:id/assign - Assign item to player
- PUT /api/inventory/:id/return - Record item return

## Files Modified

### 1. server/server.js
Added inventory routes integration:
```javascript
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);
```

## Route Specifications

### POST /api/inventory
**Purpose:** Create a new inventory item  
**Access:** Manager, Admin  
**Middleware Chain:**
1. authMiddleware - Validates JWT token
2. requireRole(['manager', 'admin']) - Restricts access
3. loggerMiddleware - Logs operation to SystemLog

**Request Body:**
```json
{
  "itemName": "string (required)",
  "itemType": "string (required, enum: ['Jersey', 'Boots', 'Training Equipment', 'Medical', 'Other'])"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inventory item created successfully",
  "item": {
    "id": "ObjectId",
    "itemName": "string",
    "itemType": "string",
    "assignedTo": null,
    "assignedAt": null,
    "returnedAt": null,
    "isAssigned": false,
    "createdAt": "Date"
  }
}
```

**Status Codes:**
- 201: Item created successfully
- 400: Validation error (missing fields, invalid itemType)
- 403: Access denied (not manager or admin)

**Validates Requirements:** 9.1

---

### GET /api/inventory
**Purpose:** Get all inventory items with pagination and filtering  
**Access:** All authenticated users  
**Middleware Chain:**
1. authMiddleware - Validates JWT token

**Query Parameters:**
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 50)
- `assigned`: boolean (optional, filters by assignment status)

**Response (200):**
```json
{
  "success": true,
  "items": [
    {
      "id": "ObjectId",
      "itemName": "string",
      "itemType": "string",
      "assignedTo": {
        "_id": "ObjectId",
        "fullName": "string",
        "position": "string"
      },
      "assignedAt": "Date",
      "returnedAt": "Date",
      "isAssigned": true,
      "createdAt": "Date"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

**Status Codes:**
- 200: Success
- 401: Authentication required

**Validates Requirements:** 9.1, 9.5

---

### PUT /api/inventory/:id/assign
**Purpose:** Assign inventory item to a player  
**Access:** Manager, Admin  
**Middleware Chain:**
1. authMiddleware - Validates JWT token
2. requireRole(['manager', 'admin']) - Restricts access
3. loggerMiddleware - Logs operation to SystemLog

**Request Body:**
```json
{
  "playerId": "ObjectId (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item assigned successfully",
  "item": {
    "id": "ObjectId",
    "itemName": "string",
    "itemType": "string",
    "assignedTo": {
      "_id": "ObjectId",
      "fullName": "string",
      "position": "string"
    },
    "assignedAt": "Date",
    "returnedAt": null,
    "isAssigned": true,
    "createdAt": "Date"
  }
}
```

**Side Effects:**
- Emits Socket.io event: `inventory:assigned`
- Creates SystemLog entry

**Status Codes:**
- 200: Item assigned successfully
- 400: Validation error (missing playerId, item already assigned)
- 403: Access denied (not manager or admin)
- 404: Inventory item not found

**Validates Requirements:** 9.2, 9.4

---

### PUT /api/inventory/:id/return
**Purpose:** Record return of inventory item  
**Access:** Manager, Admin  
**Middleware Chain:**
1. authMiddleware - Validates JWT token
2. requireRole(['manager', 'admin']) - Restricts access
3. loggerMiddleware - Logs operation to SystemLog

**Request Body:**
```json
{
  "returnDate": "Date (optional, defaults to current date)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item return recorded successfully",
  "item": {
    "id": "ObjectId",
    "itemName": "string",
    "itemType": "string",
    "assignedTo": "ObjectId",
    "assignedAt": "Date",
    "returnedAt": "Date",
    "isAssigned": false,
    "createdAt": "Date"
  }
}
```

**Side Effects:**
- Creates SystemLog entry

**Status Codes:**
- 200: Item return recorded successfully
- 400: Validation error (item not currently assigned)
- 403: Access denied (not manager or admin)
- 404: Inventory item not found

**Validates Requirements:** 9.4

---

## Middleware Chain Details

### Authentication Flow
1. **authMiddleware**: Extracts and validates JWT token from Authorization header
   - Attaches `req.user = {id, role}` to request
   - Returns 401 if token is invalid or expired

2. **requireRole(['manager', 'admin'])**: Checks if user role is authorized
   - Returns 403 if user role is not in allowed roles array
   - Proceeds if authorized

3. **loggerMiddleware**: Logs write operations to SystemLog
   - Intercepts POST, PUT, PATCH, DELETE requests
   - Creates audit trail entry after successful operation
   - Logs: action, performedBy, targetCollection, targetId, timestamp

### Role-Based Access Control

| Route | Admin | Manager | Coach | Player |
|-------|-------|---------|-------|--------|
| POST /api/inventory | ✓ | ✓ | ✗ | ✗ |
| GET /api/inventory | ✓ | ✓ | ✓ | ✓ |
| PUT /api/inventory/:id/assign | ✓ | ✓ | ✗ | ✗ |
| PUT /api/inventory/:id/return | ✓ | ✓ | ✗ | ✗ |

## Integration with Existing System

### Controller Integration
Routes use the existing `inventoryController.js` with methods:
- `createItem(req, res)` - Creates new inventory item
- `getAllItems(req, res)` - Returns paginated inventory list
- `assignItem(req, res)` - Assigns item to player, emits Socket.io event
- `unassignItem(req, res)` - Records item return

### Socket.io Integration
The `assignItem` controller method emits real-time events:
```javascript
io.emit('inventory:assigned', {
  itemId: item._id,
  itemName: item.itemName,
  itemType: item.itemType,
  playerId: playerId,
  playerName: item.assignedTo?.fullName,
  assignedAt: item.assignedAt
});
```

### Database Integration
- Uses Mongoose `Inventory` model with schema validation
- Populates `assignedTo` field with player Profile data
- Implements virtual property `isAssigned` for status checking

## Requirements Validation

### Requirement 9.1: Inventory Item Creation
✓ Manager can create inventory items with itemName and itemType  
✓ POST /api/inventory endpoint with role guard  
✓ SystemLog entry created for audit trail

### Requirement 9.2: Inventory Assignment with Real-Time Updates
✓ Manager can assign items to players  
✓ PUT /api/inventory/:id/assign endpoint  
✓ Socket.io event `inventory:assigned` emitted  
✓ Player reference and assignment date stored

### Requirement 9.4: Inventory Return Tracking
✓ Manager can record item returns  
✓ PUT /api/inventory/:id/return endpoint  
✓ Return date tracking implemented  
✓ SystemLog entry created

### Additional Features
✓ Pagination support for inventory list (Requirement 9.5)  
✓ Assignment status filtering  
✓ Player profile population in responses  
✓ Comprehensive error handling with descriptive messages

## Testing Recommendations

### Manual Testing Steps
1. **Create Item Test:**
   ```bash
   POST /api/inventory
   Headers: Authorization: Bearer <manager_token>
   Body: {"itemName": "Training Jersey #10", "itemType": "Jersey"}
   Expected: 201 status, item created
   ```

2. **Get Items Test:**
   ```bash
   GET /api/inventory?page=1&limit=10
   Headers: Authorization: Bearer <any_token>
   Expected: 200 status, paginated list
   ```

3. **Assign Item Test:**
   ```bash
   PUT /api/inventory/<item_id>/assign
   Headers: Authorization: Bearer <manager_token>
   Body: {"playerId": "<player_profile_id>"}
   Expected: 200 status, Socket.io event emitted
   ```

4. **Return Item Test:**
   ```bash
   PUT /api/inventory/<item_id>/return
   Headers: Authorization: Bearer <manager_token>
   Body: {"returnDate": "2024-01-15T10:00:00Z"}
   Expected: 200 status, return recorded
   ```

5. **Role Guard Test:**
   ```bash
   POST /api/inventory
   Headers: Authorization: Bearer <player_token>
   Expected: 403 status, access denied
   ```

### Automated Testing
Consider adding tests for:
- Route middleware chain execution order
- Role-based access control enforcement
- Socket.io event emission on assignment
- SystemLog creation for write operations
- Pagination and filtering logic
- Error handling for invalid inputs

## Security Considerations

✓ JWT authentication required for all routes  
✓ Role-based authorization enforced  
✓ Input validation in controller layer  
✓ Mongoose schema validation for data integrity  
✓ Audit logging for all write operations  
✓ No sensitive data exposed in error messages

## Performance Considerations

✓ Pagination implemented (default 50 items per page)  
✓ Database indexes on assignedTo and itemType fields  
✓ Efficient query filtering for assignment status  
✓ Population of related data only when needed  
✓ Asynchronous logging to avoid blocking responses

## Next Steps

1. **Frontend Integration:** Create InventoryManagement component in Manager Panel
2. **Real-Time Updates:** Implement Socket.io listener for `inventory:assigned` events
3. **Testing:** Write unit and integration tests for routes
4. **Documentation:** Update API documentation with inventory endpoints

## Task Status

✓ Task 17.2 completed successfully  
✓ All routes created with proper middleware chains  
✓ Integration with server.js completed  
✓ Requirements 9.1, 9.2, 9.4 validated  
✓ Ready for frontend integration

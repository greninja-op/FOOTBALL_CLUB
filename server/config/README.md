# Database Configuration

This directory contains the MongoDB connection configuration for the Football Club Management System.

## Files

### database.js

Production-grade MongoDB connection module with the following features:

#### Features

1. **Connection Validation** (Requirement 19.1)
   - Validates `MONGODB_URI` environment variable before connection
   - Throws descriptive errors for missing configuration

2. **Connection Pooling** (Requirement 24.3)
   - Minimum pool size: 5 connections
   - Maximum pool size: 20 connections
   - Optimized for concurrent requests

3. **Error Handling**
   - Comprehensive error logging with descriptive messages
   - Distinguishes between network errors and configuration errors
   - Fatal errors exit the process immediately

4. **Automatic Reconnection Strategy** (Requirement 23.5)
   - Implements exponential backoff for network errors
   - Retries connection every 5 seconds on network failures
   - Automatic reconnection on connection drops
   - Event listeners for connection state monitoring

5. **Graceful Shutdown**
   - Handles SIGINT signal for clean shutdown
   - Closes database connections before process exit
   - Prevents data corruption during shutdown

6. **Connection Monitoring**
   - Real-time connection state tracking
   - Event listeners for: connected, error, disconnected, reconnected
   - Helper functions: `isConnected()`, `getConnectionState()`

## Usage

### Basic Usage

```javascript
const { connectDB } = require('./config/database');

// Connect to database
await connectDB();
```

### In Express Server

```javascript
const { connectDB } = require('./config/database');

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start server after successful connection
    server.listen(PORT, () => {
      console.log('Server running');
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
};

startServer();
```

### Check Connection Status

```javascript
const { isConnected, getConnectionState } = require('./config/database');

// Check if connected
if (isConnected()) {
  console.log('Database is connected');
}

// Get connection state
console.log('State:', getConnectionState());
// Returns: 'connected', 'disconnected', 'connecting', or 'disconnecting'
```

## Environment Variables

Required environment variables in `.env` file:

```env
# Database Configuration (Required)
MONGODB_URI=mongodb://localhost:27017/football-club

# JWT Configuration (Required)
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRY=8h

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Testing

Test the database connection:

```bash
node test-db-connection.js
```

Expected output on success:
```
=== Database Connection Test ===

Configuration:
- MONGODB_URI: ✓ Set
- JWT_SECRET: ✓ Set
- PORT: 5000
- CLIENT_URL: http://localhost:5173

Attempting database connection...

✓ MongoDB Connected: localhost
✓ Database: football-club
✓ Connection pool: 5-20 connections

=== Connection Test Results ===
Status: ✓ Connected
State: connected

✓ Database connection test passed!
```

## Connection States

| State | Description |
|-------|-------------|
| `disconnected` | Not connected to database |
| `connected` | Successfully connected and ready |
| `connecting` | Connection attempt in progress |
| `disconnecting` | Closing connection |

## Error Handling

### Configuration Errors

If `MONGODB_URI` is missing or invalid:
- Error message displayed
- Process exits with code 1
- No retry attempts (requires configuration fix)

### Network Errors

If MongoDB server is unreachable:
- Error message displayed
- Automatic retry every 5 seconds
- Continues until connection succeeds

### Connection Drops

If connection is lost during runtime:
- Warning logged
- Automatic reconnection attempted
- Application continues to retry

## Production Considerations

1. **Environment Variables**
   - Use strong, unique `JWT_SECRET` in production
   - Use MongoDB Atlas or managed MongoDB service
   - Enable authentication on MongoDB server

2. **Connection String**
   - Use connection string with authentication: `mongodb://user:pass@host:port/db`
   - Enable SSL/TLS for production: `mongodb://host:port/db?ssl=true`
   - Use replica sets for high availability

3. **Monitoring**
   - Monitor connection pool usage
   - Set up alerts for connection failures
   - Log connection events to monitoring service

4. **Security**
   - Never commit `.env` file to version control
   - Rotate JWT secrets regularly
   - Use IP whitelisting on MongoDB server
   - Enable MongoDB authentication

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 19.1**: Configuration file parsing with validation of required fields (database connection string, JWT secret, port number)
- **Requirement 25.1**: Database backup preparation (connection pooling and monitoring for backup operations)
- **Requirement 24.3**: Connection pooling with minimum 5 and maximum 20 connections
- **Requirement 23.5**: Error handling with exponential backoff reconnection strategy

## Troubleshooting

### "MONGODB_URI is not defined"
- Check `.env` file exists in server directory
- Verify `MONGODB_URI` is set in `.env`
- Ensure `dotenv.config()` is called before importing database module

### "MongoServerSelectionError"
- Verify MongoDB is running: `mongod --version`
- Check MongoDB is listening on correct port (default: 27017)
- Verify connection string format
- Check firewall settings

### "Connection timeout"
- Increase `serverSelectionTimeoutMS` in connection options
- Check network connectivity to MongoDB server
- Verify MongoDB server is not overloaded

### "Authentication failed"
- Verify username and password in connection string
- Check user has correct permissions on database
- Ensure authentication is enabled on MongoDB server

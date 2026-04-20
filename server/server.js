const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const { connectDB } = require('./config/database');
const { initializeSocketServer } = require('./socketServer');
const { setIO } = require('./utils/socketIO');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with authentication
const io = initializeSocketServer(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5174' // Allow alternate port if 5173 is in use
    ],
    credentials: true
  }
});

// Register io instance for controller access
setIO(io);

// Security Middleware (Requirement 21.2, 21.3)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Response compression (Requirement 24.4)
app.use(compression());

// CORS with strict origin policy (Requirement 21.3)
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174' // Allow alternate port if 5173 is in use
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for all API routes (Requirement 21.4)
app.use('/api', apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// Routes
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const userRoutes = require('./routes/userRoutes');
const systemLogRoutes = require('./routes/systemLogRoutes');
const fixtureRoutes = require('./routes/fixtureRoutes');
const documentRoutes = require('./routes/documentRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const profileRoutes = require('./routes/profileRoutes');
const disciplinaryRoutes = require('./routes/disciplinaryRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const injuryRoutes = require('./routes/injuryRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const playerDomainRoutes = require('./routes/playerDomainRoutes');
const publicRoutes = require('./routes/publicRoutes');
const financeRoutes = require('./routes/financeRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', systemLogRoutes);
app.use('/api/fixtures', fixtureRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/injuries', injuryRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/player-domain', playerDomainRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/finance', financeRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  const { isConnected, getConnectionState } = require('./config/database');
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: {
      connected: isConnected(),
      state: getConnectionState()
    }
  });
});

// Error handling middleware (must be AFTER all routes)
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler

const PORT = process.env.PORT || 5000;

// Initialize database connection before starting server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server only after successful database connection
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log('✓ All systems operational');
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = { app, io };

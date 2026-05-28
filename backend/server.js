require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: '*', // Allow all client queries for extreme local flexibility
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Route files
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Base Status Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Aether Productivity API Server is running.',
    mode: process.env.MONGODB_URI ? 'Production MongoDB' : 'Zero-Config Local Fallback Database'
  });
});

// Centralized error handler
app.use(errorHandler);

// Set Port
const PORT = process.env.PORT || 5000;

// Connect to Database first, then run server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server due to database issue:', err);
});

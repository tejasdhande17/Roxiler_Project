const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Store Rating System API is active.');
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

// Start listening
app.listen(PORT, () => {
    console.log(`[SERVER] Express server running on port ${PORT}`);
});

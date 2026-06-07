const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'store_rating_system',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('[DB] Connected to database successfully.');
        connection.release();
    } catch (error) {
        console.error('[DB ERROR] Database connection failed:', error.message);
        console.error('[DB ERROR] Ensure MySQL is running and that your credentials in backend/.env are correct.');
    }
})();

module.exports = pool;

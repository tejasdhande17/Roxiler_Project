const path = require('path');
// Add backend's node_modules to lookup path so we can resolve dependencies from the db/ folder
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from the backend folder
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function initializeDatabase() {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || 'root123';
    const port = process.env.DB_PORT || 3306;

    console.log(`[DB INIT] Connecting to MySQL at ${host}:${port} as ${user}...`);
    
    let connection;
    try {
        // Connect without database name first to create the database if it doesn't exist
        connection = await mysql.createConnection({
            host,
            user,
            password,
            port,
            multipleStatements: true
        });

        console.log('[DB INIT] Connected. Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('[DB INIT] Executing schema SQL queries...');
        await connection.query(schemaSql);

        console.log('[DB INIT] Database and tables initialized successfully.');
    } catch (error) {
        console.error('[DB INIT] Failed to initialize database:', error.message);
        console.error('[DB INIT] Please ensure your MySQL service is running and credentials in backend/.env are correct.');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();

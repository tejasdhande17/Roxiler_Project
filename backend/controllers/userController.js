const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Update user password (for normal users and store owners)
const updatePassword = async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old password and new password are required.' });
    }

    try {
        // Fetch current password hash
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = users[0];

        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect old password.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update in database
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('[USER PASSWORD UPDATE ERROR]', error);
        res.status(500).json({ error: 'Internal server error while updating password.' });
    }
};

// Get System Administrator Dashboard Stats
const getStats = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [[{ totalStores }]] = await db.query('SELECT COUNT(*) AS totalStores FROM stores');
        const [[{ totalRatings }]] = await db.query('SELECT COUNT(*) AS totalRatings FROM ratings');

        res.json({
            totalUsers,
            totalStores,
            totalRatings
        });
    } catch (error) {
        console.error('[USER GET STATS ERROR]', error);
        res.status(500).json({ error: 'Internal server error while fetching dashboard statistics.' });
    }
};

// Create a new user (System Admin only)
const createUser = async (req, res) => {
    const { name, email, password, address, role } = req.body;

    if (!role || !['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
        return res.status(400).json({ error: 'A valid role is required.' });
    }

    try {
        // Check if email already registered
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email address is already in use.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, address || null, role]
        );

        res.status(201).json({
            message: 'User created successfully.',
            userId: result.insertId
        });
    } catch (error) {
        console.error('[USER CREATE ERROR]', error);
        res.status(500).json({ error: 'Internal server error while creating new user.' });
    }
};

// View details and list of normal and admin users (includes filtering & sorting, and rating for Store Owners)
const getUsersList = async (req, res) => {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    let query = `
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.address, 
            u.role, 
            u.created_at,
            AVG(r.rating) AS average_rating
        FROM users u
        LEFT JOIN stores s ON s.owner_id = u.id
        LEFT JOIN ratings r ON r.store_id = s.id
        WHERE 1=1
    `;
    const queryParams = [];

    // Filters
    if (name) {
        query += ' AND u.name LIKE ?';
        queryParams.push(`%${name}%`);
    }
    if (email) {
        query += ' AND u.email LIKE ?';
        queryParams.push(`%${email}%`);
    }
    if (address) {
        query += ' AND u.address LIKE ?';
        queryParams.push(`%${address}%`);
    }
    if (role) {
        query += ' AND u.role = ?';
        queryParams.push(role);
    }

    query += ' GROUP BY u.id';

    // Sorting
    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at', 'average_rating'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const sortExpression = sortField === 'average_rating' ? 'average_rating' : `u.${sortField}`;
    query += ` ORDER BY ${sortExpression} ${order}`;

    try {
        const [results] = await db.query(query, queryParams);
        res.json(results);
    } catch (error) {
        console.error('[USER GET LIST ERROR]', error);
        res.status(500).json({ error: 'Internal server error while fetching user list.' });
    }
};

// Get all Store Owners (useful for Admin dropdown when creating a store)
const getStoreOwners = async (req, res) => {
    try {
        const [owners] = await db.query(
            'SELECT id, name, email FROM users WHERE role = "STORE_OWNER" ORDER BY name ASC'
        );
        res.json(owners);
    } catch (error) {
        console.error('[USER GET STORE OWNERS ERROR]', error);
        res.status(500).json({ error: 'Internal server error while fetching store owners.' });
    }
};

module.exports = {
    updatePassword,
    getStats,
    createUser,
    getUsersList,
    getStoreOwners
};

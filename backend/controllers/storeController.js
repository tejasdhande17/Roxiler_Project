const db = require('../config/db');

// Create a new store (System Admin only)
const createStore = async (req, res) => {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length < 3 || name.trim().length > 100) {
        return res.status(400).json({ error: 'Store name must be between 3 and 100 characters long.' });
    }
    if (!email) {
        return res.status(400).json({ error: 'Store email is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address format.' });
    }
    if (!address || address.length > 400) {
        return res.status(400).json({ error: 'Store address is required and must not exceed 400 characters.' });
    }
    if (!ownerId) {
        return res.status(400).json({ error: 'Store owner assignment is required.' });
    }

    try {
        // Verify ownerId exists and belongs to a STORE_OWNER
        const [owners] = await db.query('SELECT role FROM users WHERE id = ?', [ownerId]);
        if (owners.length === 0) {
            return res.status(400).json({ error: 'Assigned store owner does not exist.' });
        }
        if (owners[0].role !== 'STORE_OWNER') {
            return res.status(400).json({ error: 'Assigned user is not a Store Owner.' });
        }

        // Verify store email uniqueness
        const [existing] = await db.query('SELECT id FROM stores WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Store email is already registered.' });
        }

        // Insert new store
        const [result] = await db.query(
            'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
            [name, email, address, ownerId]
        );

        res.status(201).json({
            message: 'Store created successfully.',
            storeId: result.insertId
        });
    } catch (error) {
        console.error('[STORE CREATE ERROR]', error);
        res.status(500).json({ error: 'Internal server error while creating store.' });
    }
};

// List stores with overall rating and current user's rating (includes sorting and filtering)
const getStoresList = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, email, address, sortBy, sortOrder } = req.query;

    let query = `
        SELECT 
            s.id, 
            s.name, 
            s.email, 
            s.address, 
            s.owner_id, 
            u.name AS owner_name,
            COALESCE(AVG(r.rating), 0) AS overall_rating,
            (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_rating
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        LEFT JOIN users u ON u.id = s.owner_id
        WHERE 1=1
    `;
    const queryParams = [userId];

    // Restrict Store Owners to only see their own stores
    if (userRole === 'STORE_OWNER') {
        query += ' AND s.owner_id = ?';
        queryParams.push(userId);
    }

    // Filters
    if (name) {
        query += ' AND s.name LIKE ?';
        queryParams.push(`%${name}%`);
    }
    if (email) {
        query += ' AND s.email LIKE ?';
        queryParams.push(`%${email}%`);
    }
    if (address) {
        query += ' AND s.address LIKE ?';
        queryParams.push(`%${address}%`);
    }

    query += ' GROUP BY s.id';

    // Sorting
    const allowedSortFields = ['name', 'email', 'address', 'overall_rating'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const sortExpression = sortField === 'overall_rating' ? 'overall_rating' : `s.${sortField}`;
    query += ` ORDER BY ${sortExpression} ${order}`;

    try {
        const [results] = await db.query(query, queryParams);
        res.json(results);
    } catch (error) {
        console.error('[STORE GET LIST ERROR]', error);
        res.status(500).json({ error: 'Internal server error while fetching stores.' });
    }
};

module.exports = {
    createStore,
    getStoresList
};

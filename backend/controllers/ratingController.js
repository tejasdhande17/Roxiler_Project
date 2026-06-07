const db = require('../config/db');

// Submit a rating for a store (Normal User only)
const submitRating = async (req, res) => {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId) {
        return res.status(400).json({ error: 'Store ID is required.' });
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    try {
        // Check if store exists
        const [stores] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
        if (stores.length === 0) {
            return res.status(404).json({ error: 'Store not found.' });
        }

        // Check if rating already exists
        const [existing] = await db.query(
            'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
            [userId, storeId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'You have already rated this store. Use modify rating instead.' });
        }

        // Insert new rating
        await db.query(
            'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
            [userId, storeId, ratingVal]
        );

        res.status(201).json({ message: 'Rating submitted successfully.' });
    } catch (error) {
        console.error('[RATING SUBMIT ERROR]', error);
        res.status(500).json({ error: 'Internal server error while submitting rating.' });
    }
};

// Modify a rating for a store (Normal User only)
const modifyRating = async (req, res) => {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId) {
        return res.status(400).json({ error: 'Store ID is required.' });
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    try {
        // Check if rating exists
        const [existing] = await db.query(
            'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
            [userId, storeId]
        );
        if (existing.length === 0) {
            return res.status(404).json({ error: 'No existing rating found to modify.' });
        }

        // Update rating
        await db.query(
            'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
            [ratingVal, userId, storeId]
        );

        res.json({ message: 'Rating modified successfully.' });
    } catch (error) {
        console.error('[RATING MODIFY ERROR]', error);
        res.status(500).json({ error: 'Internal server error while modifying rating.' });
    }
};

// Get ratings list of users who rated stores owned by the Store Owner
const getStoreRatings = async (req, res) => {
    const ownerId = req.user.id;
    const { sortBy, sortOrder } = req.query;

    let query = `
        SELECT 
            r.id, 
            r.rating, 
            r.created_at,
            u.name AS user_name, 
            u.email AS user_email, 
            u.address AS user_address,
            s.name AS store_name
        FROM ratings r
        JOIN users u ON u.id = r.user_id
        JOIN stores s ON s.id = r.store_id
        WHERE s.owner_id = ?
    `;

    // Sorting
    const allowedSortFields = ['user_name', 'user_email', 'rating', 'created_at', 'store_name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    let sortExpression = '';
    if (sortField === 'user_name') sortExpression = 'u.name';
    else if (sortField === 'user_email') sortExpression = 'u.email';
    else if (sortField === 'store_name') sortExpression = 's.name';
    else if (sortField === 'rating') sortExpression = 'r.rating';
    else sortExpression = 'r.created_at';

    query += ` ORDER BY ${sortExpression} ${order}`;

    try {
        const [results] = await db.query(query, [ownerId]);
        res.json(results);
    } catch (error) {
        console.error('[RATING GET FOR OWNER ERROR]', error);
        res.status(500).json({ error: 'Internal server error while fetching store ratings.' });
    }
};

module.exports = {
    submitRating,
    modifyRating,
    getStoreRatings
};

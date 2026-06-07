const validateRegister = (req, res, next) => {
    const { name, email, password, address, role } = req.body;

    // Name: Min 20, Max 60
    if (!name || name.trim().length < 20 || name.trim().length > 60) {
        return res.status(400).json({ error: 'Name must be between 20 and 60 characters long.' });
    }

    // Email: Standard email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address format.' });
    }

    // Address: Max 400
    if (address && address.length > 400) {
        return res.status(400).json({ error: 'Address cannot exceed 400 characters.' });
    }

    // Password: 8-16 characters, must include at least one uppercase letter and one special character
    if (!password || password.length < 8 || password.length > 16) {
        return res.status(400).json({ error: 'Password must be between 8 and 16 characters.' });
    }

    const hasUppercase = /[A-Z]/.test(password);
    // Any character that is NOT a letter or a number counts as special
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasUppercase) {
        return res.status(400).json({ error: 'Password must include at least one uppercase letter.' });
    }
    if (!hasSpecial) {
        return res.status(400).json({ error: 'Password must include at least one special character.' });
    }

    // Role: ADMIN, USER, STORE_OWNER
    if (role && !['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Allowed roles are: ADMIN, USER, STORE_OWNER' });
    }

    next();
};

const validatePasswordUpdate = (req, res, next) => {
    const { newPassword } = req.body;

    // Password: 8-16 characters, must include at least one uppercase letter and one special character
    if (!newPassword || newPassword.length < 8 || newPassword.length > 16) {
        return res.status(400).json({ error: 'Password must be between 8 and 16 characters.' });
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);

    if (!hasUppercase) {
        return res.status(400).json({ error: 'Password must include at least one uppercase letter.' });
    }
    if (!hasSpecial) {
        return res.status(400).json({ error: 'Password must include at least one special character.' });
    }

    next();
};

module.exports = {
    validateRegister,
    validatePasswordUpdate
};

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const UserDashboard = () => {
    // Stores list state
    const [stores, setStores] = useState([]);
    
    // Search and sort states
    const [nameQuery, setNameQuery] = useState('');
    const [addressQuery, setAddressQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Password change states
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);

    // Rating submission state (key = storeId, value = rating selected in select element)
    const [selectedRatings, setSelectedRatings] = useState({});
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    const fetchStores = async () => {
        try {
            const queryParams = new URLSearchParams({
                name: nameQuery,
                address: addressQuery,
                sortBy: sortBy,
                sortOrder: sortOrder
            });
            const res = await fetch(`${API_BASE_URL}/stores/list?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStores(data);
                // Initialize rating select values with existing user ratings, default to 5
                const ratingVals = {};
                data.forEach(s => {
                    ratingVals[s.id] = s.user_rating || 5;
                });
                setSelectedRatings(ratingVals);
            }
        } catch (err) {
            console.error('Error fetching stores:', err);
        }
    };

    // Load stores
    useEffect(() => {
        fetchStores();
    }, [nameQuery, addressQuery, sortBy, sortOrder]);

    // Handle Password Change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwdError('New passwords do not match.');
            return;
        }

        // Validate password constraints: 8-16 chars, 1 uppercase, 1 special char
        const pwd = passwordData.newPassword;
        if (pwd.length < 8 || pwd.length > 16) {
            setPwdError('Password must be between 8 and 16 characters long.');
            return;
        }
        const hasUppercase = /[A-Z]/.test(pwd);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
        if (!hasUppercase) {
            setPwdError('Password must include at least one uppercase letter.');
            return;
        }
        if (!hasSpecial) {
            setPwdError('Password must include at least one special character.');
            return;
        }

        setPwdLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update password.');

            setPwdSuccess('Password updated successfully!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPwdError(err.message);
        } finally {
            setPwdLoading(false);
        }
    };

    // Submit a rating
    const handleRatingSubmit = async (storeId) => {
        setError('');
        setMessage('');
        const rating = selectedRatings[storeId];

        try {
            const res = await fetch(`${API_BASE_URL}/ratings/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ storeId, rating })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit rating.');

            setMessage('Rating submitted successfully!');
            fetchStores(); // Refresh list to update ratings
        } catch (err) {
            setError(err.message);
        }
    };

    // Modify an existing rating
    const handleRatingModify = async (storeId) => {
        setError('');
        setMessage('');
        const rating = selectedRatings[storeId];

        try {
            const res = await fetch(`${API_BASE_URL}/ratings/modify`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ storeId, rating })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to modify rating.');

            setMessage('Rating modified successfully!');
            fetchStores(); // Refresh list to update ratings
        } catch (err) {
            setError(err.message);
        }
    };

    // Sort handlers
    const toggleSort = (field) => {
        const order = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(order);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Welcome, {user ? user.name : 'User'}</h1>
                    <p>Find stores, view reviews, and submit ratings from 1 to 5 stars</p>
                </div>
            </div>

            {/* Error/Success Feedback */}
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <div className="dashboard-grid">
                {/* Left Column - Change Password */}
                <div>
                    <div className="card">
                        <h2 className="card-title">Change Password</h2>
                        {pwdError && <div className="alert alert-danger">{pwdError}</div>}
                        {pwdSuccess && <div className="alert alert-success">{pwdSuccess}</div>}

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group">
                                <label className="form-label">Old Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter old password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="8-16 characters, 1 uppercase, 1 special"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Confirm new password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={pwdLoading}>
                                {pwdLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - Stores and Ratings */}
                <div>
                    {/* Search Filters */}
                    <div className="filters-container">
                        <div className="filter-item">
                            <label className="form-label">Search Store Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name..."
                                value={nameQuery}
                                onChange={(e) => setNameQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-item">
                            <label className="form-label">Search Address</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by address..."
                                value={addressQuery}
                                onChange={(e) => setAddressQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-secondary" style={{ padding: '0.75rem' }} onClick={() => toggleSort('name')}>
                                Sort Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                            </button>
                            <button className="btn-secondary" style={{ padding: '0.75rem' }} onClick={() => toggleSort('address')}>
                                Sort Address {sortBy === 'address' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                            </button>
                            <button className="btn-secondary" style={{ padding: '0.75rem' }} onClick={() => toggleSort('overall_rating')}>
                                Sort Rating {sortBy === 'overall_rating' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                            </button>
                        </div>
                    </div>

                    {/* Stores Cards Grid */}
                    <div className="store-grid">
                        {stores.map(store => (
                            <div key={store.id} className="store-card">
                                <div className="store-name">{store.name}</div>
                                
                                <div className="store-address">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    {store.address}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Overall Rating</span>
                                        <span className="rating-badge">
                                            ★ {store.overall_rating ? parseFloat(store.overall_rating).toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                    {store.user_rating && (
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Your Rating</span>
                                            <span className="rating-badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                                                ★ {store.user_rating}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="rating-widget">
                                    <div className="form-label">
                                        {store.user_rating ? 'Modify your rating:' : 'Rate this store:'}
                                    </div>
                                    <div className="rating-input-row">
                                        <select
                                            className="form-select"
                                            style={{ padding: '0.4rem', width: '80px', flex: 'none' }}
                                            value={selectedRatings[store.id] || 5}
                                            onChange={(e) => setSelectedRatings({
                                                ...selectedRatings,
                                                [store.id]: parseInt(e.target.value)
                                            })}
                                        >
                                            <option value="1">1 Star</option>
                                            <option value="2">2 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="5">5 Stars</option>
                                        </select>

                                        {store.user_rating ? (
                                            <button 
                                                className="btn-secondary" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                                                onClick={() => handleRatingModify(store.id)}
                                            >
                                                Modify
                                            </button>
                                        ) : (
                                            <button 
                                                className="btn-primary" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                onClick={() => handleRatingSubmit(store.id)}
                                            >
                                                Submit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {stores.length === 0 && (
                            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                No stores available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

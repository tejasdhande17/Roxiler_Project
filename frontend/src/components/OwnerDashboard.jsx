import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const OwnerDashboard = () => {
    // Store Owner's stores
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState('');

    // Ratings list
    const [ratings, setRatings] = useState([]);

    // Password change states
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);

    // Sorting states for ratings list
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Fetch owned stores
    const fetchStores = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/stores/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStores(data);
                if (data.length > 0) {
                    setSelectedStoreId(data[0].id.toString());
                }
            }
        } catch (err) {
            console.error('Error fetching stores:', err);
        }
    };

    // Fetch ratings left for the owner's stores
    const fetchRatings = async () => {
        try {
            const queryParams = new URLSearchParams({
                sortBy: sortBy,
                sortOrder: sortOrder
            });
            const res = await fetch(`${API_BASE_URL}/ratings/owner-list?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setRatings(data);
            }
        } catch (err) {
            console.error('Error fetching ratings:', err);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        if (token) {
            fetchRatings();
        }
    }, [sortBy, sortOrder]);

    // Handle Password Change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwdError('New passwords do not match.');
            return;
        }

        const pwd = passwordData.newPassword;
        if (pwd.length < 8 || pwd.length > 16) {
            setPwdError('Password must be between 8 and 16 characters.');
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

    // Toggle sort order
    const toggleSort = (field) => {
        const order = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(order);
    };

    // Calculate metrics for the selected store
    const selectedStore = stores.find(s => s.id.toString() === selectedStoreId);
    
    // Filter ratings for the selected store
    const filteredRatings = ratings.filter(r => selectedStore && r.store_name === selectedStore.name);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Store Owner Dashboard</h1>
                    <p>Monitor customer ratings and average performance scores</p>
                </div>
            </div>

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

                {/* Right Column - Store Ratings list */}
                <div>
                    {stores.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                            <h3>No Stores Registered</h3>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                There are no stores registered under your account.<br />
                                Please contact the System Administrator to register a store for you.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Store Selector and Average Rating */}
                            <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: '1 1 300px' }}>
                                    <label className="form-label">Select Your Store</label>
                                    <select
                                        className="form-select"
                                        value={selectedStoreId}
                                        onChange={(e) => setSelectedStoreId(e.target.value)}
                                    >
                                        {stores.map(store => (
                                            <option key={store.id} value={store.id}>
                                                {store.name} ({store.address})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedStore && (
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', fontWeight: '500' }}>
                                            Average Rating
                                        </span>
                                        <span className="rating-badge" style={{ fontSize: '1.75rem', padding: '0.3rem 0.8rem' }}>
                                            ★ {selectedStore.overall_rating ? parseFloat(selectedStore.overall_rating).toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Ratings List */}
                            <div className="card">
                                <h3 className="card-title">
                                    <span>Submitted Ratings ({filteredRatings.length})</span>
                                </h3>

                                <div className="table-container">
                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th onClick={() => toggleSort('user_name')}>
                                                    Customer Name {sortBy === 'user_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th onClick={() => toggleSort('user_email')}>
                                                    Email {sortBy === 'user_email' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th>Address</th>
                                                <th onClick={() => toggleSort('rating')}>
                                                    Rating {sortBy === 'rating' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th onClick={() => toggleSort('created_at')}>
                                                    Date {sortBy === 'created_at' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRatings.map(r => (
                                                <tr key={r.id}>
                                                    <td style={{ fontWeight: '500' }}>{r.user_name}</td>
                                                    <td>{r.user_email}</td>
                                                    <td>{r.user_address || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span>}</td>
                                                    <td>
                                                        <span className="rating-badge" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                                                            ★ {r.rating}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(r.created_at).toLocaleDateString() + ' ' + new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                </tr>
                                            ))}
                                            {filteredRatings.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                        No ratings submitted for this store yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;

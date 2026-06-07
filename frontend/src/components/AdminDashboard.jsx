import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
    // Stats state
    const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

    // Lists state
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [owners, setOwners] = useState([]);

    // Filtering states
    const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
    const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });

    // Sorting states
    const [userSort, setUserSort] = useState({ field: 'name', order: 'asc' });
    const [storeSort, setStoreSort] = useState({ field: 'name', order: 'asc' });

    // Add User Form State
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
    const [userFormError, setUserFormError] = useState('');
    const [userFormSuccess, setUserFormSuccess] = useState('');

    // Add Store Form State
    const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
    const [storeFormError, setStoreFormError] = useState('');
    const [storeFormSuccess, setStoreFormSuccess] = useState('');

    // Selected User details view
    const [selectedUser, setSelectedUser] = useState(null);

    // Active Tab: 'users' or 'stores'
    const [activeTab, setActiveTab] = useState('users');

    const token = localStorage.getItem('token');

    // Fetch helper
    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const queryParams = new URLSearchParams({
                name: userFilters.name,
                email: userFilters.email,
                address: userFilters.address,
                role: userFilters.role,
                sortBy: userSort.field,
                sortOrder: userSort.order
            });
            const res = await fetch(`${API_BASE_URL}/users/list?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchStores = async () => {
        try {
            const queryParams = new URLSearchParams({
                name: storeFilters.name,
                email: storeFilters.email,
                address: storeFilters.address,
                sortBy: storeSort.field,
                sortOrder: storeSort.order
            });
            const res = await fetch(`${API_BASE_URL}/stores/list?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setStores(data);
        } catch (err) {
            console.error('Error fetching stores:', err);
        }
    };

    const fetchOwners = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/owners`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setOwners(data);
        } catch (err) {
            console.error('Error fetching owners:', err);
        }
    };

    // Load initial data
    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchStores();
        fetchOwners();
    }, []);

    // Refetch when filters or sorting change
    useEffect(() => {
        fetchUsers();
    }, [userFilters, userSort]);

    useEffect(() => {
        fetchStores();
    }, [storeFilters, storeSort]);

    // User Form Handler
    const handleAddUser = async (e) => {
        e.preventDefault();
        setUserFormError('');
        setUserFormSuccess('');

        // Form Validation Rules
        if (newUser.name.trim().length < 20 || newUser.name.trim().length > 60) {
            setUserFormError('Name must be between 20 and 60 characters long.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUser.email)) {
            setUserFormError('Please enter a valid email address.');
            return;
        }

        if (newUser.address.length > 400) {
            setUserFormError('Address cannot exceed 400 characters.');
            return;
        }

        if (newUser.password.length < 8 || newUser.password.length > 16) {
            setUserFormError('Password must be between 8 and 16 characters long.');
            return;
        }
        const hasUppercase = /[A-Z]/.test(newUser.password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(newUser.password);
        if (!hasUppercase) {
            setUserFormError('Password must include at least one uppercase letter.');
            return;
        }
        if (!hasSpecial) {
            setUserFormError('Password must include at least one special character.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/users/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create user.');

            setUserFormSuccess('User added successfully!');
            setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
            
            // Refresh counts and lists
            fetchStats();
            fetchUsers();
            fetchOwners();
        } catch (err) {
            setUserFormError(err.message);
        }
    };

    // Store Form Handler
    const handleAddStore = async (e) => {
        e.preventDefault();
        setStoreFormError('');
        setStoreFormSuccess('');

        if (newStore.name.trim().length < 3 || newStore.name.trim().length > 100) {
            setStoreFormError('Store Name must be between 3 and 100 characters long.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStore.email)) {
            setStoreFormError('Please enter a valid email address.');
            return;
        }

        if (newStore.address.length > 400) {
            setStoreFormError('Store address cannot exceed 400 characters.');
            return;
        }

        if (!newStore.ownerId) {
            setStoreFormError('Please select a Store Owner.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/stores/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newStore)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create store.');

            setStoreFormSuccess('Store created successfully!');
            setNewStore({ name: '', email: '', address: '', ownerId: '' });
            
            // Refresh counts and lists
            fetchStats();
            fetchStores();
        } catch (err) {
            setStoreFormError(err.message);
        }
    };

    // Sorting toggler
    const toggleUserSort = (field) => {
        const order = userSort.field === field && userSort.order === 'asc' ? 'desc' : 'asc';
        setUserSort({ field, order });
    };

    const toggleStoreSort = (field) => {
        const order = storeSort.field === field && storeSort.order === 'asc' ? 'desc' : 'asc';
        setStoreSort({ field, order });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Administrator Dashboard</h1>
                    <p>Manage users, stores, and monitor ratings across the platform</p>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Total Users</div>
                        <div className="stat-value">{stats.totalUsers}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Total Stores</div>
                        <div className="stat-value">{stats.totalStores}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Submitted Ratings</div>
                        <div className="stat-value">{stats.totalRatings}</div>
                    </div>
                </div>
            </div>

            {/* Dashboard Split Grid */}
            <div className="dashboard-grid">
                {/* Left Column - Add User / Add Store Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Add User Form */}
                    <div className="card">
                        <h2 className="card-title">Register New User</h2>
                        {userFormError && <div className="alert alert-danger">{userFormError}</div>}
                        {userFormSuccess && <div className="alert alert-success">{userFormSuccess}</div>}
                        
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label className="form-label">Name (20-60 chars)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter full name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                                <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Length: {newUser.name.trim().length} (Min 20)
                                </small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="email@example.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password (8-16 chars)</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="1 uppercase, 1 special char"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Enter physical address"
                                    value={newUser.address}
                                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                                    rows="2"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="USER">Normal User</option>
                                    <option value="STORE_OWNER">Store Owner</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-primary">Add User</button>
                        </form>
                    </div>

                    {/* Add Store Form */}
                    <div className="card">
                        <h2 className="card-title">Register New Store</h2>
                        {storeFormError && <div className="alert alert-danger">{storeFormError}</div>}
                        {storeFormSuccess && <div className="alert alert-success">{storeFormSuccess}</div>}
                        
                        <form onSubmit={handleAddStore}>
                            <div className="form-group">
                                <label className="form-label">Store Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter store name"
                                    value={newStore.name}
                                    onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Store Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="store@example.com"
                                    value={newStore.email}
                                    onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Enter store address"
                                    value={newStore.address}
                                    onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                                    rows="2"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Assign Owner</label>
                                <select
                                    className="form-select"
                                    value={newStore.ownerId}
                                    onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Store Owner --</option>
                                    {owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>
                                            {owner.name} ({owner.email})
                                        </option>
                                    ))}
                                </select>
                                {owners.length === 0 && (
                                    <small style={{ color: 'var(--danger-color)', display: 'block', marginTop: '0.25rem' }}>
                                        No Store Owners registered yet. Please add a Store Owner first.
                                    </small>
                                )}
                            </div>

                            <button type="submit" className="btn-primary" disabled={owners.length === 0}>
                                Create Store
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - User & Store Lists with Dynamic Filters & Sorting */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Tab Navigation */}
                    <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', gap: '1rem' }}>
                        <button
                            onClick={() => { setActiveTab('users'); setSelectedUser(null); }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                background: 'transparent',
                                borderBottom: activeTab === 'users' ? '3px solid var(--primary-color)' : 'none',
                                color: activeTab === 'users' ? 'var(--primary-color)' : 'var(--text-muted)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Registered Users
                        </button>
                        <button
                            onClick={() => { setActiveTab('stores'); setSelectedUser(null); }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                background: 'transparent',
                                borderBottom: activeTab === 'stores' ? '3px solid var(--primary-color)' : 'none',
                                color: activeTab === 'stores' ? 'var(--primary-color)' : 'var(--text-muted)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Registered Stores
                        </button>
                    </div>

                    {/* Listings */}
                    {activeTab === 'users' ? (
                        <div>
                            {/* User Filters */}
                            <div className="filters-container">
                                <div className="filter-item">
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Filter by name..."
                                        value={userFilters.name}
                                        onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>Email</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Filter by email..."
                                        value={userFilters.email}
                                        onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>Address</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Filter by address..."
                                        value={userFilters.address}
                                        onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                                    />
                                </div>
                                <div className="filter-item" style={{ flex: '0 1 120px' }}>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>Role</label>
                                    <select
                                        className="form-select"
                                        value={userFilters.role}
                                        onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                                    >
                                        <option value="">All Roles</option>
                                        <option value="USER">USER</option>
                                        <option value="STORE_OWNER">STORE_OWNER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="card" style={{ padding: '0' }}>
                                <div className="table-container">
                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th onClick={() => toggleUserSort('name')}>
                                                    Name {userSort.field === 'name' ? (userSort.order === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th onClick={() => toggleUserSort('email')}>
                                                    Email {userSort.field === 'email' ? (userSort.order === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th onClick={() => toggleUserSort('address')}>
                                                    Address {userSort.field === 'address' ? (userSort.order === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th onClick={() => toggleUserSort('role')}>
                                                    Role {userSort.field === 'role' ? (userSort.order === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id}>
                                                    <td style={{ fontWeight: '500' }}>{u.name}</td>
                                                    <td>{u.email}</td>
                                                    <td>{u.address || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span>}</td>
                                                    <td>
                                                        <span className="user-tag" style={{
                                                            backgroundColor: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'STORE_OWNER' ? '#ecfdf5' : '#eff6ff',
                                                            color: u.role === 'ADMIN' ? '#b91c1c' : u.role === 'STORE_OWNER' ? '#047857' : '#1d4ed8'
                                                        }}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setSelectedUser(u)}>
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                                        No users found matching filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Store Filters */}
                            <div className="filters-container">
                                <div className="filter-item">
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>Store Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Filter by name..."
                                        value={storeFilters.name}
                                        onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>Email</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Filter by email..."
                                        value={storeFilters.email}
                                        onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>Address</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Filter by address..."
                                        value={storeFilters.address}
                                        onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Stores Table */}
                            <div className="card" style={{ padding: '0' }}>
                                <div className="table-container">
                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th onClick={() => toggleStoreSort('name')}>
                                                    Store Name {storeSort.field === 'name' ? (storeSort.order === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th onClick={() => toggleStoreSort('email')}>
                                                    Email {storeSort.field === 'email' ? (storeSort.order === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th onClick={() => toggleStoreSort('address')}>
                                                    Address {storeSort.field === 'address' ? (storeSort.order === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th onClick={() => toggleStoreSort('overall_rating')}>
                                                    Overall Rating {storeSort.field === 'overall_rating' ? (storeSort.order === 'asc' ? '▲' : '▼') : ''}
                                                </th>
                                                <th>Owner</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stores.map(s => (
                                                <tr key={s.id}>
                                                    <td style={{ fontWeight: '500' }}>{s.name}</td>
                                                    <td>{s.email}</td>
                                                    <td>{s.address}</td>
                                                    <td>
                                                        <span className="rating-badge">
                                                            ★ {parseFloat(s.overall_rating).toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td>{s.owner_name}</td>
                                                </tr>
                                            ))}
                                            {stores.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                                        No stores found matching filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed User View Panel */}
                    {selectedUser && (
                        <div className="card" style={{ border: '2px solid var(--primary-color)' }}>
                            <div className="card-title">
                                <span>Detailed Information: {selectedUser.name}</span>
                                <button className="btn-secondary" style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setSelectedUser(null)}>
                                    Close Details
                                </button>
                            </div>
                            <div className="details-row">
                                <div className="details-label">Full Name:</div>
                                <div className="details-val">{selectedUser.name}</div>
                            </div>
                            <div className="details-row">
                                <div className="details-label">Email:</div>
                                <div className="details-val">{selectedUser.email}</div>
                            </div>
                            <div className="details-row">
                                <div className="details-label">Address:</div>
                                <div className="details-val">{selectedUser.address || 'N/A'}</div>
                            </div>
                            <div className="details-row">
                                <div className="details-label">User Role:</div>
                                <div className="details-val" style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedUser.role}</div>
                            </div>
                            {selectedUser.role === 'STORE_OWNER' && (
                                <div className="details-row">
                                    <div className="details-label">Owner Rating:</div>
                                    <div className="details-val">
                                        <span className="rating-badge" style={{ fontSize: '0.9rem' }}>
                                            ★ {selectedUser.average_rating ? parseFloat(selectedUser.average_rating).toFixed(2) : 'No ratings yet'}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                            (Avg rating of all owned stores)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

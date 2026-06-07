import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    const handleLogout = () => {
        // Clear tokens and credentials
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Store Rating System</span>
            </div>
            <div className="nav-user">
                <span className="user-name" style={{ fontWeight: '500', fontSize: '0.9rem' }}>{user.name}</span>
                <span className="user-tag">{user.role === 'STORE_OWNER' ? 'Store Owner' : user.role === 'ADMIN' ? 'Admin' : 'User'}</span>
                <button onClick={handleLogout} className="btn-logout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

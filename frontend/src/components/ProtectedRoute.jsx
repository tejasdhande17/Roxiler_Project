import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!token || !user) {
        // Not logged in: redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but not authorized for this role: redirect to login or show notice
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#4f46e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import './App.css';

// Decides landing dashboard depending on role or redirects to login if unauthenticated
const HomeRedirect = () => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (!token || !userJson) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userJson);
        if (user.role === 'ADMIN') {
            return <Navigate to="/admin" replace />;
        } else if (user.role === 'STORE_OWNER') {
            return <Navigate to="/owner" replace />;
        } else {
            return <Navigate to="/user" replace />;
        }
    } catch (e) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }
};

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Admin Dashboard */}
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Normal User Dashboard */}
                    <Route 
                        path="/user" 
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Store Owner Dashboard */}
                    <Route 
                        path="/owner" 
                        element={
                            <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                                <OwnerDashboard />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Fallback Redirects */}
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

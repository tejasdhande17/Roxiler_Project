import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const validateForm = () => {
        // Name validation: 20-60 characters
        if (name.trim().length < 20 || name.trim().length > 60) {
            setError('Name must be between 20 and 60 characters long. (Currently: ' + name.trim().length + ')');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        // Address validation: Max 400 characters
        if (address.length > 400) {
            setError('Address cannot exceed 400 characters.');
            return false;
        }

        // Password validation: 8-16 characters, at least one uppercase, one special character
        if (password.length < 8 || password.length > 16) {
            setError('Password must be between 8 and 16 characters long.');
            return false;
        }
        const hasUppercase = /[A-Z]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        if (!hasUppercase) {
            setError('Password must include at least one uppercase letter.');
            return false;
        }
        if (!hasSpecial) {
            setError('Password must include at least one special character.');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, address, role })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed.');
            }

            setSuccess('Registration successful! Redirecting to login page...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Register to rate stores or manage listings</p>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name (Min 20 characters)</label>
                        <input
                            type="text"
                            id="name"
                            className="form-input"
                            placeholder="Enter full name (20-60 characters)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <small style={{ color: name.trim().length >= 20 && name.trim().length <= 60 ? 'green' : 'var(--text-muted)', fontSize: '0.75rem' }}>
                            Character Count: {name.trim().length} / 60 (Min 20 required)
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            className="form-input"
                            placeholder="Enter physical address (optional, max 400 characters)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows="2"
                            style={{ resize: 'vertical' }}
                        />
                        <small style={{ color: address.length <= 400 ? 'var(--text-muted)' : 'red', fontSize: '0.75rem' }}>
                            Character Count: {address.length} / 400
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password (8-16 characters)</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="At least 1 uppercase and 1 special char"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Register As</label>
                        <select
                            id="role"
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="USER">Normal User</option>
                            <option value="STORE_OWNER">Store Owner</option>
                            <option value="ADMIN">System Administrator</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

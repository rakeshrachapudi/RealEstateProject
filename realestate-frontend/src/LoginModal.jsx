import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { BACKEND_BASE_URL } from "./config/config";

function LoginModal({ onClose }) {
    const [loginMethod, setLoginMethod] = useState('credentials'); // 'credentials' or 'register'
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        mobileNumber: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(null);
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData({ ...registerData, [name]: value });
        setError(null);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.data && data.data.token) {
                login(data.data.user, data.data.token);
                onClose();
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (registerData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (response.ok && data.data && data.data.token) {
                login(data.data.user, data.data.token);
                onClose();
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
            console.error('Register error:', error);
        } finally {
            setLoading(false);
        }
    };

    const modalBackdropStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const modalContentStyle = {
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '450px',
        fontFamily: 'system-ui',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        boxSizing: 'border-box',
        marginBottom: '1rem',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '14px',
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '1rem',
    };

    const toggleButtonStyle = {
        ...buttonStyle,
        background: '#6b7280',
        marginBottom: '0.5rem',
    };

    const errorStyle = {
        background: '#fee2e2',
        color: '#dc2626',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '1rem',
        fontSize: '14px',
        border: '1px solid #fca5a5',
    };

    return (
        <div style={modalBackdropStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '15px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '24px',
                        cursor: 'pointer',
                    }}
                >
                    ×
                </button>

                {error && <div style={errorStyle}>❌ {error}</div>}

                {!isSigningUp ? (
                    // LOGIN FORM
                    <form onSubmit={handleLogin}>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>🔑 Login</h2>

                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleLoginChange}
                            style={inputStyle}
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleLoginChange}
                            style={inputStyle}
                            required
                        />

                        <button type="submit" style={buttonStyle} disabled={loading}>
                            {loading ? '⏳ Logging in...' : '✅ Login'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsSigningUp(true);
                                setError(null);
                            }}
                            style={toggleButtonStyle}
                        >
                            📝 Create New Account
                        </button>
                    </form>
                ) : (
                    // REGISTRATION FORM
                    <form onSubmit={handleRegister}>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>✨ CREATE ACCOUNT</h2>

                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={registerData.firstName}
                            onChange={handleRegisterChange}
                            style={inputStyle}
                            required
                        />

                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={registerData.lastName}
                            onChange={handleRegisterChange}
                            style={inputStyle}
                            required
                        />
                         <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={registerData.username}
                            onChange={handleRegisterChange}
                            style={inputStyle}
                            required
                        />

                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          style={inputStyle}
                          required
                        />
                        <input
                            type="tel"
                            name="mobileNumber"
                            placeholder="Mobile Number"
                            value={registerData.mobileNumber}
                            onChange={handleRegisterChange}
                            style={inputStyle}
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password (min 6 chars)"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            style={inputStyle}
                            required
                        />

                        <button type="submit" style={buttonStyle} disabled={loading}>
                            {loading ? '⏳ Registering...' : '✅ Register'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsSigningUp(false);
                                setError(null);
                            }}
                            style={toggleButtonStyle}
                        >
                            🔑 Back to Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default LoginModal;
import React, { useState, useMemo } from 'react';
import { useAuth } from './AuthContext';

const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: 'Too Short', color: '#dc3545' };
    let score = 0;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;

    if (score < 2) return { strength: 'Weak', color: '#ffc107' };
    if (score < 4) return { strength: 'Medium', color: '#007bff' };
    return { strength: 'Strong', color: '#28a745' };
};

const SignupModal = ({ onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        mobileNumber: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (strength.strength === 'Too Short' || strength.strength === 'Weak') {
            setError('Please choose a stronger password.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                login(result.data.user, result.data.token);
                onClose();
            } else {
                setError(result.message || 'Signup failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={styles.closeBtn}>&times;</button>
                
                <div style={styles.header}>
                    <div style={styles.iconContainer}>
                        <span style={styles.icon}>✨</span>
                    </div>
                    <h2 style={styles.title}>Create Account</h2>
                    <p style={styles.subtitle}>Join us to find your dream property</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}
                    
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="John"
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Choose a unique username"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mobile Number (Optional)</label>
                        <input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="+91 1234567890"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Min. 6 characters"
                            required
                        />
                        {formData.password && (
                            <div style={styles.strengthIndicator}>
                                <span>Strength: </span>
                                <span style={{ color: strength.color, fontWeight: '600' }}>
                                    {strength.strength}
                                </span>
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <span style={styles.footerText}>Already have an account?</span>
                    <button 
                        onClick={() => {
                            onClose();
                            if (onSwitchToLogin) onSwitchToLogin();
                        }} 
                        style={styles.switchBtn}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '40px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        animation: 'slideUp 0.3s ease',
    },
    closeBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        border: 'none',
        background: 'transparent',
        fontSize: '32px',
        cursor: 'pointer',
        color: '#64748b',
        transition: 'color 0.2s',
        zIndex: 10,
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    iconContainer: {
        width: '80px',
        height: '80px',
        margin: '0 auto 20px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 2s infinite',
    },
    icon: {
        fontSize: '40px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#64748b',
    },
    form: {
        marginBottom: '20px',
    },
    row: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
    },
    inputGroup: {
        marginBottom: '20px',
        flex: 1,
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        transition: 'all 0.3s',
        boxSizing: 'border-box',
    },
    strengthIndicator: {
        marginTop: '8px',
        fontSize: '14px',
        color: '#64748b',
    },
    submitBtn: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s',
        marginTop: '10px',
    },
    error: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid #e2e8f0',
    },
    footerText: {
        color: '#64748b',
        fontSize: '14px',
        marginRight: '8px',
    },
    switchBtn: {
        background: 'transparent',
        border: 'none',
        color: '#f5576c',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
};

// Add animations
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        input:focus {
            outline: none;
            border-color: #f5576c !important;
            box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
        }
        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
        }
    `;
    document.head.appendChild(style);
}

export default SignupModal;

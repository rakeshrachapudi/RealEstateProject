import React, { useState } from 'react';
import { useAuth } from './AuthContext';

function LoginModal({ onClose }) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const { login } = useAuth();

    const handleChange = (input) => (e) => {
        setFormData({ ...formData, [input]: e.target.value });
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok && data.token) {
                login(data.user, data.token);
                onClose();
            } else {
                alert(data.message || 'Invalid username or password.');
            }
        } catch (error) {
            alert('An error occurred during login.');
        }
    };

    const modalBackdropStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
    const modalContentStyle = { background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', fontFamily: 'system-ui', position: 'relative' };
    const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' };
    const buttonStyle = { width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '1rem' };

    return (
        <div style={modalBackdropStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '15px', border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                <form onSubmit={handlePasswordLogin}>
                    <h2 style={{ marginTop: 0 }}>Login</h2>
                    <input type="text" value={formData.username} onChange={handleChange('username')} placeholder="Enter Username" required style={inputStyle} />
                    <input type="password" value={formData.password} onChange={handleChange('password')} placeholder="Enter Password" required style={inputStyle} />
                    <button type="submit" style={buttonStyle}>Login</button>
                </form>
            </div>
        </div>
    );
}

export default LoginModal;
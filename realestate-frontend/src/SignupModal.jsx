import React, { useState, useMemo } from 'react';

const modalStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};
const contentStyle = {
    backgroundColor: 'white', padding: '30px', borderRadius: '12px',
    width: '450px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)', position: 'relative',
};
const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '15px',
    border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box',
};
const buttonStyle = (color) => ({
    width: '100%', padding: '12px', background: color, color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '16px', fontWeight: 'bold', transition: 'background 0.3s',
});

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

const SignupModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', mobileNumber: '', username: '',
    });
    const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
    const isFormValid = formData.firstName && formData.lastName && formData.username && formData.email && formData.password.length >= 6 && formData.mobileNumber.length === 10;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (strength.strength === 'Too Short' || strength.strength === 'Weak') {
            alert('Please choose a stronger password.');
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                alert('User Registration Successful! Please log in.');
                onClose();
            } else {
                alert(data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Network error during registration.');
        }
    };

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#3498db' }}>Create Your Account</h2>
                <form onSubmit={handleRegister}>
                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} style={inputStyle} required />
                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} style={inputStyle} required />
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} style={inputStyle} required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} style={inputStyle} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} style={inputStyle} required />
                    {formData.password && (
                        <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                            Password Strength: <span style={{ color: strength.color, fontWeight: 'bold' }}>{strength.strength}</span>
                        </div>
                    )}
                    <input type="tel" name="mobileNumber" placeholder="10-Digit Phone Number" value={formData.mobileNumber} onChange={handleChange} style={inputStyle} required maxLength="10" />
                    <button type="submit" style={buttonStyle(isFormValid ? '#3498db' : '#ccc')} disabled={!isFormValid}>
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupModal;

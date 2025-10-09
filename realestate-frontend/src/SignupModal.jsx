import React, { useState, useMemo } from 'react';

// Simplified styles
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

// Password Strength Logic
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

const SignupModal = ({ onClose, onSignupSuccess }) => {
    const [step, setStep] = useState(1);
    // ✨ 1. Add 'username' to the state
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', phone: '', username: '',
    });
    const [otp, setOtp] = useState('');
    const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
    const isFormValid = formData.firstName && formData.lastName && formData.username && formData.email && formData.password.length >= 6 && formData.phone.length === 10;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        if (strength.strength === 'Too Short' || strength.strength === 'Weak') {
            alert('Please choose a stronger password.');
            return;
        }
        try {
            const fullMobileNumber = `+91${formData.phone}`;
            const response = await fetch('http://localhost:8080/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobileNumber: fullMobileNumber }),
            });
            if (response.ok) {
                alert('OTP sent successfully!');
                setStep(2);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to send OTP.');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert('Network error while sending OTP.');
        }
    };

    const handleOtpVerification = async (e) => {
        e.preventDefault();
        try {
            const fullMobileNumber = `+91${formData.phone}`;
            const response = await fetch('http://localhost:8080/api/auth/register-with-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, mobileNumber: fullMobileNumber, otp }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('User Registration Successful! Please log in.');
                onClose();
            } else {
                alert(data.message || 'OTP verification failed.');
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
                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#3498db' }}>Step {step}: {step === 1 ? 'Enter Details' : 'Verify Phone'}</h2>

                {step === 1 && (
                    <form onSubmit={handleDetailsSubmit}>
                        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} style={inputStyle} required />
                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} style={inputStyle} required />
                        {/* ✨ 2. Add the username input field */}
                        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} style={inputStyle} required />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} style={inputStyle} required />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} style={inputStyle} required />
                        {formData.password && (
                            <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                                Password Strength: <span style={{ color: strength.color, fontWeight: 'bold' }}>{strength.strength}</span>
                            </div>
                        )}
                        <input type="tel" name="phone" placeholder="10-Digit Phone Number" value={formData.phone} onChange={handleChange} style={inputStyle} required maxLength="10" />
                        <button type="submit" style={buttonStyle(isFormValid ? '#3498db' : '#ccc')} disabled={!isFormValid}>
                            Send Verification OTP
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOtpVerification}>
                        <p style={{ marginBottom: '15px', color: '#555' }}>
                            An OTP has been sent to +91 {formData.phone}. Please enter it below.
                        </p>
                        <input type="text" name="otp" placeholder="Enter 6-Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} style={inputStyle} required minLength="6" maxLength="6" />
                        <button type="submit" style={buttonStyle(otp.length === 6 ? '#28a745' : '#ccc')} disabled={otp.length !== 6}>
                            Verify & Register
                        </button>
                        <button type="button" onClick={() => setStep(1)} style={{ ...buttonStyle('#f59e0b'), marginTop: '10px' }}>
                            &larr; Change Details
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SignupModal;
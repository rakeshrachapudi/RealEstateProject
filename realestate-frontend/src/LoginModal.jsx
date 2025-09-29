import React, { useState } from 'react';
import { useAuth } from './AuthContext';

function LoginModal({ onClose }) {
    const [step, setStep] = useState(1);
    const [isNewUser, setIsNewUser] = useState(false);
    const [formData, setFormData] = useState({
        mobileNumber: '', otp: '', firstName: '', lastName: '', email: ''
    });
    const { login } = useAuth();

    const handleChange = (input) => (e) => {
        setFormData({ ...formData, [input]: e.target.value });
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        const fullMobileNumber = `+91${formData.mobileNumber}`;
        const response = await fetch('http://localhost:8080/api/auth/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobileNumber: fullMobileNumber }),
        });
        const data = await response.json();
        if (response.ok) {
            setIsNewUser(data.isNewUser);
            setStep(2);
        } else { alert('Failed to send OTP. Please check your number.'); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const fullMobileNumber = `+91${formData.mobileNumber}`;
        const response = await fetch('http://localhost:8080/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, mobileNumber: fullMobileNumber }),
        });
        const data = await response.json();
        if (response.ok && data.token) {
            login(data.user, data.token);
            onClose();
        } else { alert(data.message || 'Invalid or expired OTP.'); }
    };

    const modalBackdropStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    const modalContentStyle = {
        background: 'white', padding: '2rem', borderRadius: '8px',
        width: '400px', fontFamily: 'system-ui', position: 'relative'
    };
    const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' };
    const buttonStyle = { width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '1rem' };

    return (
        <div style={modalBackdropStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '15px', border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                {step === 1 ? (
                    <form onSubmit={handleRequestOtp}>
                        <h2 style={{marginTop: 0}}>Login / Register</h2>
                        <input type="tel" value={formData.mobileNumber} onChange={handleChange('mobileNumber')} placeholder="Enter 10-digit mobile number" required maxLength="10" style={inputStyle} />
                        <button type="submit" style={buttonStyle}>Send OTP</button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <h2>Verify Your Number</h2>
                        <p style={{ fontSize: '0.9rem', color: '#555' }}>Enter OTP sent to +91 {formData.mobileNumber}</p>
                        <input type="text" value={formData.otp} onChange={handleChange('otp')} placeholder="Enter OTP" required maxLength="6" style={inputStyle} />
                        {isNewUser && (
                            <>
                                <p style={{ fontSize: '0.9rem', color: '#555', fontWeight: '600' }}>Welcome! Please complete registration.</p>
                                <input type="text" value={formData.firstName} onChange={handleChange('firstName')} placeholder="First Name" required style={inputStyle} />
                                <input type="text" value={formData.lastName} onChange={handleChange('lastName')} placeholder="Last Name" required style={inputStyle} />
                                <input type="email" value={formData.email} onChange={handleChange('email')} placeholder="Email" required style={inputStyle} />
                            </>
                        )}
                        <button type="submit" style={buttonStyle}>Verify & Continue</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default LoginModal;

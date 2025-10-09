import React, { useState } from 'react';
import { useAuth } from './AuthContext';

function LoginModal({ onClose }) {
    const [loginMethod, setLoginMethod] = useState('select'); // 'select', 'otp', 'password'
    const [otpStep, setOtpStep] = useState(1);
    const [isNewUser, setIsNewUser] = useState(false);
    const [otpFormData, setOtpFormData] = useState({
        mobileNumber: '', otp: '', firstName: '', lastName: '', email: ''
    });
    const [passwordFormData, setPasswordFormData] = useState({
        username: '',
        password: ''
    });
    const { login } = useAuth();

    const handleOtpChange = (input) => (e) => {
        setOtpFormData({ ...otpFormData, [input]: e.target.value });
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        const fullMobileNumber = `+91${otpFormData.mobileNumber}`;
        const response = await fetch('http://localhost:8080/api/auth/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobileNumber: fullMobileNumber }),
        });
        const data = await response.json();
        if (response.ok) {
            setIsNewUser(data.isNewUser);
            setOtpStep(2);
        } else { alert('Failed to send OTP. Please check your number.'); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const fullMobileNumber = `+91${otpFormData.mobileNumber}`;
        const response = await fetch('http://localhost:8080/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...otpFormData, mobileNumber: fullMobileNumber }),
        });
        const data = await response.json();
        if (response.ok && data.token) {
            login(data.user, data.token);
            onClose();
        } else { alert(data.message || 'Invalid or expired OTP.'); }
    };

    const handlePasswordChange = (input) => (e) => {
        setPasswordFormData({ ...passwordFormData, [input]: e.target.value });
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/login-with-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordFormData),
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
    const secondaryButtonStyle = { ...buttonStyle, background: '#6c757d', marginTop: '1rem' };

    const renderContent = () => {
        if (loginMethod === 'password') {
            return (
                <form onSubmit={handlePasswordLogin}>
                    <h2 style={{ marginTop: 0 }}>Login with Password</h2>
                    <input type="text" value={passwordFormData.username} onChange={handlePasswordChange('username')} placeholder="Enter Username" required style={inputStyle} />
                    <input type="password" value={passwordFormData.password} onChange={handlePasswordChange('password')} placeholder="Enter Password" required style={inputStyle} />
                    <button type="submit" style={buttonStyle}>Login</button>
                    <button type="button" onClick={() => setLoginMethod('select')} style={secondaryButtonStyle}>&larr; Back to options</button>
                </form>
            );
        }

        if (loginMethod === 'otp') {
            return otpStep === 1 ? (
                <form onSubmit={handleRequestOtp}>
                    <h2 style={{ marginTop: 0 }}>Login with OTP</h2>
                    <input type="tel" value={otpFormData.mobileNumber} onChange={handleOtpChange('mobileNumber')} placeholder="Enter 10-digit mobile number" required maxLength="10" style={inputStyle} />
                    <button type="submit" style={buttonStyle}>Send OTP</button>
                    <button type="button" onClick={() => setLoginMethod('select')} style={secondaryButtonStyle}>&larr; Back to options</button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <h2>Verify Your Number</h2>
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>Enter OTP sent to +91 {otpFormData.mobileNumber}</p>
                    <input type="text" value={otpFormData.otp} onChange={handleOtpChange('otp')} placeholder="Enter OTP" required maxLength="6" style={inputStyle} />
                    {isNewUser && (
                        <>
                            <p style={{ fontSize: '0.9rem', color: '#555', fontWeight: '600' }}>Welcome! Please complete registration.</p>
                            <input type="text" value={otpFormData.firstName} onChange={handleOtpChange('firstName')} placeholder="First Name" required style={inputStyle} />
                            <input type="text" value={otpFormData.lastName} onChange={handleOtpChange('lastName')} placeholder="Last Name" required style={inputStyle} />
                            <input type="email" value={otpFormData.email} onChange={handleOtpChange('email')} placeholder="Email" required style={inputStyle} />
                        </>
                    )}
                    <button type="submit" style={buttonStyle}>Verify & Continue</button>
                </form>
            );
        }

        return (
            <div>
                <h2 style={{ marginTop: 0, textAlign: 'center' }}>Login</h2>
                <button onClick={() => setLoginMethod('otp')} style={buttonStyle}>Login with OTP</button>
                <button onClick={() => setLoginMethod('password')} style={secondaryButtonStyle}>Login with Username & Password</button>
            </div>
        );
    };

    return (
        <div style={modalBackdropStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '15px', border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                {renderContent()}
            </div>
        </div>
    );
}

export default LoginModal;
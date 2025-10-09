import React from 'react';

const modalStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};

const contentStyle = {
    backgroundColor: 'white', padding: '30px', borderRadius: '12px',
    width: '400px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    position: 'relative', fontFamily: 'system-ui'
};

const UserProfileModal = ({ user, onClose, logout }) => {
    if (!user) return null;

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>

                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#007bff', textAlign: 'center' }}>My Profile</h2>

                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Full Name:</p>
                    <p style={{ padding: '8px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>{user.firstName} {user.lastName}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Username:</p>
                    <p style={{ padding: '8px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>{user.username}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Email:</p>
                    <p style={{ padding: '8px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>{user.email}</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Phone (Login ID):</p>
                    <p style={{ padding: '8px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>{user.mobileNumber || user.phone || 'N/A'}</p>
                </div>

                <button
                    onClick={() => { logout(); onClose(); }}
                    style={{ width: '100%', padding: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default UserProfileModal;

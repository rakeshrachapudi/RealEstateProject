// src/pages/PlaceholderPage.jsx
import React from 'react';
import { styles } from '../styles.js';

const PlaceholderPage = ({ title }) => (
    <div style={{ ...styles.container, textAlign: 'center', padding: '80px 32px' }}>
        <h1 style={styles.pageTitle}>{title}</h1>
        <p style={styles.pageSubtitle}>This page is currently under construction. 🏗️ Please check back later!</p>
    </div>
);

export default PlaceholderPage;
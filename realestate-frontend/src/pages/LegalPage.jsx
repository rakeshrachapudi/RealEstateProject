// src/pages/LegalPage.jsx

import React from 'react';
import { styles } from '../styles.js'; // Assuming shared styles are here

const pageStyles = {
    container: {
        maxWidth: '900px',
        margin: '3rem auto',
        padding: '0 24px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        lineHeight: 1.6,
        color: '#333',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1e293b',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '15px',
        marginBottom: '20px',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#3b82f6',
        marginTop: '30px',
        marginBottom: '10px',
    },
    list: {
        marginLeft: '20px',
    }
};

const LegalPage = ({ title, content }) => {
    // Note: The content should be passed as an array of sections/paragraphs
    return (
        <div style={pageStyles.container}>
            <h1 style={pageStyles.title}>{title}</h1>

            {content.map((section, index) => (
                <div key={index}>
                    {section.title && <h2 style={pageStyles.sectionTitle}>{section.title}</h2>}
                    <p>{section.body}</p>
                    {section.list && (
                        <ul style={pageStyles.list}>
                            {section.list.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    )}
                </div>
            ))}

            <p style={{marginTop: '40px', fontSize: '0.85rem', textAlign: 'right'}}>Last Updated: November 2025</p>
        </div>
    );
};

export default LegalPage;
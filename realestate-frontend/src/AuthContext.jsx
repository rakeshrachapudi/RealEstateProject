import React, { createContext, useState, useEffect, useContext } from 'react';
// REMOVED: import { useNavigate } from 'react-router-dom'; <--- REMOVED

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    // REMOVED: const navigate = useNavigate(); <--- REMOVED

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.id && parsedUser.username) {
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } else {
                    throw new Error("Stored user data invalid.");
                }
            } catch (error) {
                console.error('Error parsing or validating stored user:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        if (!userData || !userData.id || !userData.username || !token) {
            console.error("Login failed: Invalid user data or token received.");
            return;
        }
        try {
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error storing login data:", error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        console.log("Logging out (clearing state/storage)...");
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        // REMOVED: navigate('/'); <--- REDIRECTION MOVED TO CALLING COMPONENT
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default to dark preference or local storage
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        console.log(`[ThemeContext] Current theme: ${theme}`);
        if (theme === 'dark') {
            root.classList.add('dark');
            console.log("[ThemeContext] Added 'dark' class to root. ClassList:", root.classList.toString());
        } else {
            root.classList.remove('dark');
            console.log("[ThemeContext] Removed 'dark' class from root. ClassList:", root.classList.toString());
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

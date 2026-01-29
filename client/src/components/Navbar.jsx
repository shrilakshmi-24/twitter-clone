import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const searchUsers = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/users/search?q=${query}`);
                setResults(res.data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white dark:bg-black p-4 shadow-lg fixed w-full top-0 z-10 transition-colors duration-200 border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400">
                    Tuweeter
                </Link>

                {/* Search Bar */}
                {user && (
                    <div className="relative w-64 max-w-xs mx-4">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 border border-transparent dark:border-gray-700"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {/* Dropdown Results */}
                        {query && (
                            <div className="absolute top-full left-0 w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg mt-2 shadow-xl z-50 max-h-60 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-2 text-center text-gray-500 text-sm">Searching...</div>
                                ) : results.length > 0 ? (
                                    results.map(user => (
                                        <Link
                                            key={user._id}
                                            to={`/${user.username}`}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition border-b border-gray-100 dark:border-gray-800 last:border-none"
                                            onClick={() => setQuery('')}
                                        >
                                            <img
                                                src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                                                alt={user.username}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="font-bold text-black dark:text-white text-sm truncate">{user.username}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-2 text-center text-gray-500 text-sm">No users found.</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex space-x-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-900 p-2 rounded-lg transition"
                            >
                                <img
                                    src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                                    alt="User"
                                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                                />
                                <span className="text-black dark:text-white font-medium hidden md:block">{user.username}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Settings Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-xl py-2 z-20 border border-gray-200 dark:border-gray-800">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                                        <p className="font-bold text-black dark:text-white truncate">{user.username}</p>
                                    </div>

                                    <Link
                                        to={`/${user.username}`}
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Profile
                                    </Link>

                                    <Link
                                        to="/requests"
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 flex justify-between items-center"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Follow Requests
                                        {user.followRequests?.length > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {user.followRequests.length}
                                            </span>
                                        )}
                                    </Link>

                                    <button
                                        onClick={toggleTheme}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 flex justify-between items-center"
                                    >
                                        <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                                        {theme === 'dark' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        )}
                                    </button>

                                    <div className="border-t border-gray-200 dark:border-gray-800 mt-1"></div>
                                    <button
                                        onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 transition">
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

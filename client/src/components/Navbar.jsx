import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
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

    return (
        <nav className="bg-gray-800 p-4 shadow-lg fixed w-full top-0 z-10">
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
                            className="w-full bg-gray-700 text-white rounded-full px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {/* Dropdown Results */}
                        {query && (
                            <div className="absolute top-full left-0 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 shadow-xl z-50 max-h-60 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-2 text-center text-gray-500 text-sm">Searching...</div>
                                ) : results.length > 0 ? (
                                    results.map(user => (
                                        <Link
                                            key={user._id}
                                            to={`/${user.username}`}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-700 transition border-b border-gray-700 last:border-none"
                                            onClick={() => setQuery('')}
                                        >
                                            <img
                                                src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                                                alt={user.username}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="font-bold text-white text-sm truncate">{user.username}</span>
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
                        <>
                            <Link to={`/${user.username}`} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2">
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

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 p-4 shadow-lg fixed w-full top-0 z-10">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400">
                    Tuweeter
                </Link>
                <div className="flex space-x-4">
                    {user ? (
                        <>
                            <span className="text-gray-300 self-center">Welcome, {user.username}</span>
                            <Link to="/profile" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
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

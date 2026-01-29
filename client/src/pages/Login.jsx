import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Logging in...');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            login(res.data.user, res.data.token);
            toast.dismiss(loadingToast);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">Login to Tuweeter</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 dark:border-transparent"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 dark:border-transparent"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;

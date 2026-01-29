import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        dob: '',
        gender: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                bio: user.bio || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                gender: user.gender || ''
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Updating profile...');
        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', formData);
            // Update context with new user data, keep same token
            const token = localStorage.getItem('token');
            login(res.data, token);
            toast.dismiss(loadingToast);
            toast.success('Profile updated!');
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.error || 'Update failed');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        maxLength="160"
                    ></textarea>
                </div>
                <div className="flex gap-4 mb-6">
                    <div className="w-1/2">
                        <label className="block text-gray-300 mb-2">Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-gray-300 mb-2">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default Profile;

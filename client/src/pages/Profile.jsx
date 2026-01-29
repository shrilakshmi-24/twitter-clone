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
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (user) {
            const data = {
                username: user.username || '',
                bio: user.bio || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                gender: user.gender || ''
            };
            setFormData(data);
            setInitialData(data);
            setPreview(user.avatar || null);
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Updating profile...');

        const data = new FormData();
        data.append('username', formData.username);
        data.append('bio', formData.bio);
        data.append('dob', formData.dob);
        data.append('gender', formData.gender);
        if (avatar) {
            data.append('avatar', avatar);
        }

        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={preview || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt="Profile Preview"
                        className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 object-cover"
                    />
                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition">
                        Change Profile Picture
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>

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
                    disabled={!avatar && JSON.stringify(formData) === JSON.stringify(initialData)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default Profile;

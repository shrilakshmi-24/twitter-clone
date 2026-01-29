import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const FollowRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/requests/pending`);
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/requests/${id}/accept`);
            setRequests(prev => prev.filter(req => req._id !== id));
            toast.success('Request accepted');
        } catch (error) {
            toast.error('Failed to accept');
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/requests/${id}/reject`);
            setRequests(prev => prev.filter(req => req._id !== id));
            toast.success('Request rejected');
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading requests...</div>;

    if (requests.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No pending follow requests.
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-6 p-4">
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Follow Requests</h2>
            <div className="space-y-4">
                {requests.map(user => (
                    <div key={user._id} className="flex items-center justify-between bg-white dark:bg-black p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800">
                        <Link to={`/${user.username}`} className="flex items-center gap-3">
                            <img
                                src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                                alt={user.username}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <span className="font-bold text-lg text-black dark:text-white block">{user.username}</span>
                            </div>
                        </Link>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAccept(user._id)}
                                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleReject(user._id)}
                                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-full font-bold transition"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FollowRequests;

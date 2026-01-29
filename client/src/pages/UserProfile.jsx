import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
    const { username } = useParams();
    const { user: currentUser, login } = useContext(AuthContext); // login needed to update current user stats
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(null); // 'followers' or 'following'

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${username}`);
                setProfile(res.data);
            } catch (error) {
                toast.error('User not found');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const handleFollow = async () => {
        try {
            const isFollowing = profile.followers.includes(currentUser._id);
            const endpoint = isFollowing ? 'unfollow' : 'follow';

            await axios.put(`http://localhost:5000/api/users/${profile._id}/${endpoint}`);

            // Update local profile state
            setProfile(prev => ({
                ...prev,
                followers: isFollowing
                    ? prev.followers.filter(id => id !== currentUser._id)
                    : [...prev.followers, currentUser._id]
            }));

            toast.success(isFollowing ? 'Unfollowed' : 'Followed');
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (loading) return <div className="text-center mt-20">Loading...</div>;
    if (!profile) return <div className="text-center mt-20">User not found</div>;

    const isOwnProfile = currentUser?._id === profile._id;
    const isFollowing = profile.followers.includes(currentUser?._id);

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
            <div className="flex items-center gap-6">
                <img
                    src={profile.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                    alt="avatar"
                    className="w-24 h-24 rounded-full border-4 border-gray-700"
                />
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white">{profile.username}</h2>
                    <p className="text-gray-400 mt-1">@{profile.username}</p>
                    {profile.bio && <p className="text-gray-300 mt-2">{profile.bio}</p>}

                    <div className="flex gap-6 mt-4">
                        <button onClick={() => setShowModal('following')} className="text-center hover:text-blue-400 transition">
                            <span className="font-bold text-white block">{profile.following?.length || 0}</span>
                            <span className="text-gray-500 text-sm">Following</span>
                        </button>
                        <button onClick={() => setShowModal('followers')} className="text-center hover:text-blue-400 transition">
                            <span className="font-bold text-white block">{profile.followers?.length || 0}</span>
                            <span className="text-gray-500 text-sm">Followers</span>
                        </button>
                    </div>
                </div>
                {isOwnProfile ? (
                    <Link
                        to="/profile"
                        className="px-6 py-2 rounded-full font-bold bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 transition"
                    >
                        Edit Profile
                    </Link>
                ) : (
                    <button
                        onClick={handleFollow}
                        className={`px-6 py-2 rounded-full font-bold transition ${isFollowing
                            ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-500'
                            : 'bg-white text-black hover:bg-gray-200'
                            }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
                <div className="text-gray-500 text-sm">Joined {new Date(profile.createdAt).toLocaleDateString()}</div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white capitalize">{showModal}</h3>
                            <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-4">
                            {profile[showModal]?.length === 0 ? (
                                <p className="text-gray-500 text-center">No {showModal} yet.</p>
                            ) : (
                                profile[showModal]?.map(user => (
                                    <Link
                                        key={user._id}
                                        to={`/${user.username}`}
                                        onClick={() => setShowModal(null)}
                                        className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded transition"
                                    >
                                        <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <span className="font-bold text-white block">{user.username}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;

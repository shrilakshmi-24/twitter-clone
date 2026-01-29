import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const TweetList = () => {
    const [tweets, setTweets] = useState([]);
    const [commentText, setCommentText] = useState({}); // { tweetId: 'text' }
    const [activeCommentBox, setActiveCommentBox] = useState(null); // tweetId
    const { user } = useContext(AuthContext);

    useEffect(() => {
        // Fetch initial tweets
        const fetchTweets = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/tweets');
                setTweets(res.data);
            } catch (error) {
                console.error("Error fetching tweets", error);
            }
        };
        fetchTweets();

        // Socket.io connection
        const socket = io('http://localhost:5000');

        socket.on('new_tweet', (tweet) => {
            setTweets((prev) => [tweet, ...prev]);
        });

        socket.on('tweet_liked', ({ tweetId, likes }) => {
            setTweets((prev) =>
                prev.map((t) => (t._id === tweetId ? { ...t, likes } : t))
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleLike = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/tweets/${id}/like`);
        } catch (error) {
            console.error("Error liking tweet", error);
        }
    };

    const handleCommentSubmit = async (e, tweetId) => {
        e.preventDefault();
        const text = commentText[tweetId];
        if (!text?.trim()) return;

        try {
            const res = await axios.post(`http://localhost:5000/api/tweets/${tweetId}/comment`, { text });
            // Update local state with new comments
            setTweets(prev => prev.map(t =>
                t._id === tweetId ? { ...t, comments: res.data } : t
            ));
            setCommentText({ ...commentText, [tweetId]: '' });
        } catch (error) {
            console.error("Error posting comment", error);
        }
    };

    const handleCommentLike = async (tweetId, commentId) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/tweets/${tweetId}/comments/${commentId}/like`);
            setTweets(prev => prev.map(t =>
                t._id === tweetId ? { ...t, comments: res.data } : t
            ));
        } catch (error) {
            console.error("Error liking comment", error);
        }
    };

    return (
        <div className="space-y-4">
            {tweets.map((tweet) => (
                <div key={tweet._id} className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <div className="flex space-x-3">
                        <img
                            src={tweet.author?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <Link to={`/${tweet.author?.username}`} className="font-bold text-white hover:underline">
                                    {tweet.author?.username || 'Unknown'}
                                </Link>
                                <span className="text-gray-500 text-sm">{new Date(tweet.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-200 mt-1 mb-2">{tweet.content}</p>
                            {tweet.image && (
                                <img src={tweet.image} alt="Tweet media" className="rounded-lg max-h-80 w-full object-cover mb-2 border border-gray-700" />
                            )}
                            <div className="mt-3 flex items-center space-x-4 text-gray-400">
                                <button
                                    onClick={() => handleLike(tweet._id)}
                                    className={`flex items-center space-x-1 hover:text-red-500 transition ${tweet.likes.includes(user?._id) ? 'text-red-500' : ''}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                    <span>{tweet.likes.length}</span>
                                </button>
                                <button
                                    onClick={() => setActiveCommentBox(activeCommentBox === tweet._id ? null : tweet._id)}
                                    className="flex items-center space-x-1 hover:text-blue-500 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>{tweet.comments?.length || 0}</span>
                                </button>
                            </div>

                            {/* Comment Section */}
                            {activeCommentBox === tweet._id && (
                                <div className="mt-3 bg-gray-900 bg-opacity-50 p-3 rounded-lg">
                                    <form onSubmit={(e) => handleCommentSubmit(e, tweet._id)} className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            className="flex-1 bg-gray-700 text-white rounded-full px-4 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                            placeholder="Write a comment..."
                                            value={commentText[tweet._id] || ''}
                                            onChange={(e) => setCommentText({ ...commentText, [tweet._id]: e.target.value })}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!commentText[tweet._id]?.trim()}
                                            className="text-blue-500 font-bold text-sm disabled:opacity-50"
                                        >
                                            Post
                                        </button>
                                    </form>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {tweet.comments?.map((comment, idx) => (
                                            <div key={idx} className="flex gap-2 w-full">
                                                <Link to={`/${comment.user?.username || comment.username}`}>
                                                    <img src={comment.user?.avatar || comment.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="user" className="w-8 h-8 rounded-full border border-gray-600" />
                                                </Link>
                                                <div className="flex-1">
                                                    <div className="bg-gray-800 rounded-2xl px-4 py-2 inline-block">
                                                        <Link to={`/${comment.user?.username || comment.username}`} className="font-bold text-sm text-white hover:underline block">
                                                            {comment.user?.username || comment.username}
                                                        </Link>
                                                        <p className="text-gray-300 text-sm">{comment.text}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-gray-500">
                                                        <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <button
                                                            onClick={() => handleCommentLike(tweet._id, comment._id)}
                                                            className={`font-semibold hover:text-red-500 transition flex items-center gap-1 ${comment.likes?.includes(user?._id) ? 'text-red-500' : ''}`}
                                                        >
                                                            Like {comment.likes?.length > 0 && <span>({comment.likes.length})</span>}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TweetList;

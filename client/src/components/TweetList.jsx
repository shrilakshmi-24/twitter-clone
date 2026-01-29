import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const TweetList = () => {
    const [tweets, setTweets] = useState([]);
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
                                <span className="font-bold text-white">{tweet.author?.username || 'Unknown'}</span>
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
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TweetList;

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const CreateTweet = () => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const { user } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) return;

        const formData = new FormData();
        formData.append('content', content);
        if (image) formData.append('image', image);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/tweets`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setContent('');
            setImage(null);
            toast.success('Tweet posted!');
        } catch (error) {
            console.error("Error creating tweet", error);
            toast.error('Failed to post tweet');
        }
    };

    return (
        <div className="bg-white dark:bg-black p-4 rounded-lg shadow mb-4 border border-gray-200 dark:border-gray-800">
            <div className="flex space-x-3">
                <img
                    src={user?.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                />
                <form onSubmit={handleSubmit} className="flex-1">
                    <textarea
                        className="w-full bg-gray-100 dark:bg-gray-900 text-black dark:text-white rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none border border-gray-300 dark:border-gray-800"
                        placeholder="What's happening?"
                        rows="2"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    <div className="flex justify-between items-center mt-2">
                        <label className="cursor-pointer text-blue-500 hover:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                        </label>
                        {image && <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{image.name}</span>}
                        <button
                            type="submit"
                            disabled={!content.trim() && !image}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-bold transition disabled:opacity-50"
                        >
                            Tweet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTweet;

import React from 'react';
import CreateTweet from '../components/CreateTweet';
import TweetList from '../components/TweetList';

const Home = () => {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Home</h1>
            <CreateTweet />
            <TweetList />
        </div>
    );
};

export default Home;

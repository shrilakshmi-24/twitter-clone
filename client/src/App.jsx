import React, { useContext, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const FollowRequests = lazy(() => import('./pages/FollowRequests'));

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="text-center mt-20">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-200">
      <Toaster position="top-center" />
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
          <Routes>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/requests" element={<PrivateRoute><FollowRequests /></PrivateRoute>} />

            <Route path="/:username" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default App;

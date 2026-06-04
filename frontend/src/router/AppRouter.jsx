import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import Home from '../pages/Home/Home';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import Dashboard from '../pages/Dashboard/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import MemoryVault from '../pages/MemoryVault/MemoryVault';
import EnergyTracker from '../pages/EnergyTracker/EnergyTracker';
import Overthinking from '../pages/Overthinking/Overthinking';
import Simulator from '../pages/Simulator/Simulator';
import Scripts from '../pages/Scripts/Scripts';
import Goals from '../pages/Goals/Goals';
import ProfilePage from '../pages/Profile/Profile';
import Forgot from '../pages/Auth/Forgot';
import NavBar from '../components/layout/Navbar';

function RouterWithNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNav = location.pathname.startsWith('/auth');

  React.useEffect(() => {
    const sync = () => {
      if (!isAuthenticated()) {
        navigate('/auth/login', { replace: true });
      }
    };
    window.addEventListener('auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, [navigate]);

  return (
    <>
      {!hideNav && <NavBar />}
      <div className={hideNav ? undefined : 'app-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot" element={<Forgot />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/vault" element={<ProtectedRoute><MemoryVault /></ProtectedRoute>} />
          <Route path="/energy" element={<ProtectedRoute><EnergyTracker /></ProtectedRoute>} />
          <Route path="/overthinking" element={<ProtectedRoute><Overthinking /></ProtectedRoute>} />
          <Route path="/simulate" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
          <Route path="/scripts" element={<ProtectedRoute><Scripts /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouterWithNav />
    </BrowserRouter>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/';
  };

  return (
    <nav className="bg-blue-600 text-white shadow p-4 flex gap-6 items-center flex-wrap">
      <Link to="/" className="font-bold text-lg">NGO Connect</Link>
      <Link to="/ngos" className="hover:underline">NGOs</Link>
      <Link to="/campaigns" className="hover:underline">Campaigns</Link>
      <Link to="/chatbot" className="hover:underline">Chatbot</Link>
      {isAuthenticated && <Link to="/ngo/profile" className="hover:underline">NGO Verification</Link>}
      <div className="ml-auto flex gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <button
              onClick={handleLogout}
              className="hover:underline cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

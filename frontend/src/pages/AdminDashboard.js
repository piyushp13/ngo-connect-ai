import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pending: 0, flagged: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.get('/admin/ngo-registrations'),
      api.get('/admin/flagged-ngos'),
      api.get('/admin/flagged-campaigns'),
      api.get('/users')
    ])
      .then(([pendingRes, flaggedNgosRes, flaggedCampaignsRes, usersRes]) => {
        if (!isMounted) return;
        const flaggedCount = (flaggedNgosRes.data?.length || 0) + (flaggedCampaignsRes.data?.length || 0);
        setStats({
          pending: pendingRes.data?.length || 0,
          flagged: flaggedCount,
          users: usersRes.data?.length || 0
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setStats({ pending: 0, flagged: 0, users: 0 });
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, NGOs, and content.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600">
              <h3 className="text-lg font-semibold text-gray-700">Pending NGO Verifications</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{loading ? '...' : stats.pending}</p>
              <Link to="/admin/verifications" className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                View & Verify
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
              <h3 className="text-lg font-semibold text-gray-700">Flagged Content</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{loading ? '...' : stats.flagged}</p>
              <Link to="/admin/flagged-content" className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                Review Content
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
              <h3 className="text-lg font-semibold text-gray-700">User Management</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{loading ? '...' : stats.users}</p>
               <Link to="/admin/users" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Manage Users
              </Link>
            </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/verifications" className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-center">
                <span className="text-2xl font-bold">✓</span>
                <p className="mt-2 font-semibold">Verify NGOs</p>
              </Link>
              <Link to="/admin/flagged-content" className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:shadow-lg transition text-center">
                <span className="text-2xl font-bold">🚫</span>
                <p className="mt-2 font-semibold">Review Flagged Content</p>
              </Link>
              <Link to="/admin/analytics" className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition text-center">
                <span className="text-2xl font-bold">📊</span>
                <p className="mt-2 font-semibold">View Analytics</p>
              </Link>
              <Link to="/admin/notifications" className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition text-center">
                <span className="text-2xl font-bold">📧</span>
                <p className="mt-2 font-semibold">Send Notifications</p>
              </Link>
            </div>
        </section>
      </div>
    </div>
  );
}

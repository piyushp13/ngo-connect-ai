import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.get('/users')
      .then(res => {
        if (!isMounted) return;
        setUsers(res.data || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setMessage('Failed to load users.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/user/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      setMessage('User deleted.');
    } catch (err) {
      setMessage('Failed to delete user.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600 mb-6">
          View users, manage roles, and handle account actions.
        </p>
        {message && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-3 mb-4">{message}</div>}
        {loading ? (
          <div className="text-gray-600">Loading users...</div>
        ) : (
          <div className="space-y-3">
            {users.length === 0 && <div className="text-gray-500">No users found.</div>}
            {users.map(user => (
              <div key={user._id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500">Role: {user.role}</p>
                </div>
                <button
                  onClick={() => handleDelete(user._id)}
                  disabled={user.role === 'admin' || user._id === currentUserId}
                  className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        <Link to="/admin" className="text-indigo-600 hover:underline">Back to Admin Dashboard</Link>
      </div>
    </div>
  );
}

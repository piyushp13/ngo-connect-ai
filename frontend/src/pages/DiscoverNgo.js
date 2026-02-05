import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function DiscoverNgo() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    api.get('/ngos')
      .then(res => setNgos(res.data))
      .catch(() => setError('Failed to load NGOs. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(ngos.map(n => n.category).filter(Boolean))];
    return unique.sort();
  }, [ngos]);

  const filtered = useMemo(() => {
    return ngos.filter(n => {
      const matchesSearch = n.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !category || (n.category || '').toLowerCase() === category.toLowerCase();
      const matchesLocation = !location || (n.location || '').toLowerCase().includes(location.toLowerCase());
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [ngos, searchTerm, category, location]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Discover NGOs</h1>
          <p className="text-gray-600 mt-2">Browse verified NGOs and find a cause that matches your passion.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/ngos"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              View All NGOs
            </Link>
            <Link
              to={isAuthenticated ? '/insights' : '/login'}
              className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50"
            >
              {isAuthenticated ? 'Get Smart Insights' : 'Login for Insights'}
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by location"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading NGOs...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No NGOs found. Try adjusting your filters.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(ngo => (
              <div key={ngo._id} className="bg-white rounded-lg shadow p-6 flex flex-col">
                <div className="flex items-center gap-3">
                  <img
                    src={ngo.logo || 'https://via.placeholder.com/60'}
                    alt={ngo.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{ngo.name}</h3>
                    <p className="text-sm text-gray-500">{ngo.category || 'NGO'}</p>
                  </div>
                </div>
                <p className="text-gray-600 mt-3 line-clamp-3">{ngo.description || ngo.mission || 'No description available.'}</p>
                <div className="mt-3 text-sm text-gray-500">
                  <span>{ngo.location || 'Location not specified'}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/ngos/${ngo._id}`}
                    className="flex-1 text-center px-3 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/campaigns"
                    className="flex-1 text-center px-3 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50"
                  >
                    Campaigns
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

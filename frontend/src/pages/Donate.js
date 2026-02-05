import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Donate() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [amounts, setAmounts] = useState({});
  const [status, setStatus] = useState({});
  const [submitting, setSubmitting] = useState({});
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    api.get('/campaigns')
      .then(res => setCampaigns(res.data))
      .catch(() => setError('Failed to load campaigns.'))
      .finally(() => setLoading(false));
  }, []);

  const donationCampaigns = useMemo(() => {
    return campaigns.filter(c => (c.goalAmount || 0) > 0);
  }, [campaigns]);

  const filtered = useMemo(() => {
    return donationCampaigns.filter(c => {
      const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !location || (c.location || '').toLowerCase().includes(location.toLowerCase());
      return matchesSearch && matchesLocation;
    });
  }, [donationCampaigns, searchTerm, location]);

  const handleDonate = async (campaignId) => {
    const rawAmount = amounts[campaignId];
    const amountValue = Number(rawAmount || 0);
    if (!amountValue || amountValue <= 0) {
      setStatus(prev => ({ ...prev, [campaignId]: 'Enter a valid amount.' }));
      return;
    }
    setSubmitting(prev => ({ ...prev, [campaignId]: true }));
    setStatus(prev => ({ ...prev, [campaignId]: '' }));
    try {
      await api.post(`/donations/campaign/${campaignId}`, { amount: amountValue });
      setCampaigns(prev => prev.map(c => {
        if (c._id !== campaignId) return c;
        const current = Number(c.currentAmount || 0);
        return { ...c, currentAmount: current + amountValue };
      }));
      setAmounts(prev => ({ ...prev, [campaignId]: '' }));
      setStatus(prev => ({ ...prev, [campaignId]: 'Donation successful. Thank you!' }));
    } catch (err) {
      setStatus(prev => ({ ...prev, [campaignId]: 'Donation failed. Please try again.' }));
    }
    setSubmitting(prev => ({ ...prev, [campaignId]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Donate</h1>
          <p className="text-gray-600 mt-2">Support campaigns that need funding and track your impact.</p>
          {!isAuthenticated && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/login" className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">
                Login to Donate
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg border border-red-600 text-red-600 font-semibold hover:bg-red-50">
                Create Account
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
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
          <div className="text-center py-12">Loading campaigns...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No fundraising campaigns found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(campaign => {
              const goal = Number(campaign.goalAmount || 0);
              const current = Number(campaign.currentAmount || 0);
              const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
              return (
                <div key={campaign._id} className="bg-white rounded-lg shadow p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{campaign.ngo?.name || 'NGO'}</p>
                  <p className="text-gray-600 mt-3 line-clamp-3">{campaign.description || 'No description available.'}</p>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>₹{current.toLocaleString()} raised</span>
                      <span>₹{goal.toLocaleString()} goal</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Enter amount"
                          value={amounts[campaign._id] || ''}
                          onChange={(e) => setAmounts(prev => ({ ...prev, [campaign._id]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => handleDonate(campaign._id)}
                          disabled={submitting[campaign._id]}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-400"
                        >
                          {submitting[campaign._id] ? 'Processing...' : 'Donate Now'}
                        </button>
                        {status[campaign._id] && (
                          <p className="text-sm text-gray-600 text-center">{status[campaign._id]}</p>
                        )}
                      </div>
                    ) : (
                      <Link
                        to="/login"
                        className="block w-full text-center px-4 py-2 rounded-lg border border-red-600 text-red-600 font-semibold hover:bg-red-50"
                      >
                        Login to Donate
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

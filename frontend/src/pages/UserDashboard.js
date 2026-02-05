import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RecommendedNgos from '../components/RecommendedNgos';
import PreferencesModal from '../components/PreferencesModal';
import { getUserPreferences } from '../services/api';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ ngos: 0, campaigns: 0, donations: 0 });
  const [myDonationTotal, setMyDonationTotal] = useState(0);
  const [myVolunteerCount, setMyVolunteerCount] = useState(0);
  const [donationDetails, setDonationDetails] = useState([]);
  const [volunteerDetails, setVolunteerDetails] = useState([]);
  const [showDonations, setShowDonations] = useState(false);
  const [showVolunteered, setShowVolunteered] = useState(false);
  const [ngoCount, setNgoCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [donationCampaignId, setDonationCampaignId] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationMessage, setDonationMessage] = useState('');
  const [volunteerCampaigns, setVolunteerCampaigns] = useState([]);
  const [volunteeredIds, setVolunteeredIds] = useState([]);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Helper to fetch donation and volunteer stats
  const fetchStats = () => {
    api.get('/donations/my')
      .then(res => {
        setDonationDetails(res.data);
        const total = res.data.reduce((sum, d) => sum + (d.amount || 0), 0);
        setMyDonationTotal(total);
      })
      .catch((err) => {
        setMyDonationTotal(0);
        setDonationDetails([]);
      });
    api.get('/campaigns/my/volunteered')
      .then(res => {
        setVolunteerDetails(res.data);
        setVolunteeredIds(res.data.map(c => c._id));
        setMyVolunteerCount(res.data.length);
      })
      .catch((err) => {
        setMyVolunteerCount(0);
        setVolunteerDetails([]);
        setVolunteeredIds([]);
      });
  };

  useEffect(() => {
    // Decode JWT to get user info
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (err) {
        console.error('Failed to decode token');
      }
    }
    // Fetch campaigns for donation
    api.get('/campaigns')
      .then(res => {
        setCampaigns(res.data);
        setCampaignCount(res.data.length);
      })
      .catch(() => {
        setCampaigns([]);
        setCampaignCount(0);
      })
      .finally(() => setLoading(false));
    // Fetch verified NGOs
    api.get('/ngos')
      .then(res => setNgoCount(res.data.length))
      .catch(() => setNgoCount(0));
    // Check user preferences
    checkPreferences();
    fetchStats();
    api.get('/notifications')
      .then(res => setNotifications(res.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
  }, []);

  useEffect(() => {
    const volunteerOnly = campaigns.filter(
      c =>
        c.volunteersNeeded &&
        c.volunteersNeeded.length > 0 &&
        !volunteeredIds.includes(c._id)
    );
    setVolunteerCampaigns(volunteerOnly.slice(0, 3));
  }, [campaigns, volunteeredIds]);

  const checkPreferences = async () => {
    try {
      const res = await getUserPreferences();
      const prefs = res.data;
      // Check if user has set any meaningful preferences
      const hasPrefs = prefs.location || 
                      (prefs.interests && prefs.interests.length > 0) ||
                      (prefs.causes && prefs.causes.length > 0) ||
                      (prefs.skills && prefs.skills.length > 0);
      setHasPreferences(hasPrefs);
    } catch (err) {
      setHasPreferences(false);
    }
  };

  const handleGetRecommendations = () => {
    if (hasPreferences) {
      navigate('/recommendations');
    } else {
      setShowPreferencesModal(true);
    }
  };

  const handlePreferencesComplete = () => {
    setHasPreferences(true);
    navigate('/recommendations');
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome, {user?.name || 'User'}!</h1>
          <p className="text-gray-600 mt-1">Your personal dashboard to discover and support NGOs.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/ngos')}>
            <p className="text-4xl">🔍</p>
            <h3 className="text-gray-600 mt-2">Verified NGOs</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{ngoCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/campaigns')}>
            <p className="text-4xl">📢</p>
            <h3 className="text-gray-600 mt-2">Active Campaigns</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{campaignCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition cursor-pointer" onClick={() => setShowDonations(true)}>
            <p className="text-4xl">💰</p>
            <h3 className="text-gray-600 mt-2">Donated</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">₹{myDonationTotal}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition cursor-pointer" onClick={() => setShowVolunteered(true)}>
            <p className="text-4xl">🤝</p>
            <h3 className="text-gray-600 mt-2">Volunteered</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{myVolunteerCount}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/profile" className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-800">📋 Complete Your Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">Add interests to get better recommendations.</p>
                </Link>
                <Link to="/ngos" className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-800">🔍 Browse Verified NGOs</h3>
                    <p className="text-sm text-gray-600 mt-1">Find NGOs by cause and location.</p>
                </Link>
                <Link to="/campaigns" className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-800">📢 View Campaigns</h3>
                    <p className="text-sm text-gray-600 mt-1">Donate or volunteer for a cause.</p>
                </Link>
                <Link to="/campaigns" className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-800">🤝 Volunteer in Campaigns</h3>
                    <p className="text-sm text-gray-600 mt-1">Join campaigns that need hands-on help.</p>
                </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">💡 Get Involved</h2>
            <form
                onSubmit={async e => {
                  e.preventDefault();
                  if (!donationCampaignId || !donationAmount) {
                    setDonationMessage('Please select a campaign and enter an amount.');
                    return;
                  }
                  setDonationLoading(true);
                  setDonationMessage('');
                  try {
                    await api.post(`/donations/campaign/${donationCampaignId}`, { amount: donationAmount });
                    setDonationMessage('Donation successful!');
                    setDonationAmount('');
                    setDonationCampaignId('');
                    fetchStats();
                    setTimeout(() => setDonationMessage(''), 3000);
                  } catch (err) {
                    setDonationMessage('Donation failed.');
                    console.error('Donation error:', err);
                  }
                  setDonationLoading(false);
                }}
                className="space-y-4"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700">Donate to a Campaign</label>
                    <select
                        value={donationCampaignId}
                        onChange={e => setDonationCampaignId(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        required
                    >
                        <option value="" disabled>Select a campaign</option>
                        {campaigns.filter(c => (c.goalAmount || 0) > 0).map(c => (
                            <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min="1"
                        placeholder="Amount"
                        value={donationAmount}
                        onChange={e => setDonationAmount(e.target.value)}
                        className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
                        required
                    />
                    <button
                        type="submit"
                        className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                        disabled={donationLoading}
                    >
                        {donationLoading ? 'Processing...' : 'Donate Now'}
                    </button>
                    {donationMessage && <p className="text-sm mt-2 text-center">{donationMessage}</p>}
                </div>
            </form>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔔 Notifications</h2>
          {notificationsLoading ? (
            <p className="text-gray-600">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map(note => (
                <div key={note._id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{note.title}</p>
                    <span className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{note.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {volunteerCampaigns.length > 0 && (
          <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🔥 Featured Volunteer Campaigns</h2>
              <Link to="/campaigns" className="text-indigo-600 hover:underline">View All →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {volunteerCampaigns.map(c => (
                <div key={c._id} className="border rounded-lg p-4 hover:shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {c.ngo?.logo && (
                      <img src={c.ngo.logo} alt={c.ngo.name} className="w-6 h-6 rounded-full" />
                    )}
                    <span className="text-sm text-gray-500">{c.ngo?.name || 'NGO'}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{c.description?.substring(0, 100) || ''}...</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{c.location || 'Location TBD'}</span>
                    <span>{c.volunteersNeeded?.length || 0} roles</span>
                  </div>
                  <Link 
                    to={`/campaigns/${c._id}`} 
                    className="block w-full text-center px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Volunteer Now
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">AI-Powered Recommendations</h2>
          <p className="mb-6 max-w-2xl mx-auto">Our smart algorithm suggests NGOs and campaigns based on your interests and activity. Let our AI guide you to the perfect cause.</p>
          <button 
            onClick={handleGetRecommendations}
            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105"
          >
            {hasPreferences ? 'See Your Recommendations →' : 'Get Personalized Recommendations'}
          </button>
        </div>
        
        <div className="mt-8">
          <RecommendedNgos />
        </div>
      </div>

      {/* Preferences Modal */}
      <PreferencesModal 
        isOpen={showPreferencesModal} 
        onClose={() => setShowPreferencesModal(false)}
        onComplete={handlePreferencesComplete}
      />

      {/* Modals */}
      {showDonations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Donations</h2>
                <button className="text-gray-500 hover:text-gray-800 text-2xl" onClick={() => setShowDonations(false)}>&times;</button>
            </div>
            {donationDetails.length === 0 ? (
              <p className="text-gray-600">You haven't made any donations yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {donationDetails.map((d) => (
                  <li key={d._id} className="py-3 flex justify-between items-center">
                    <span className="text-gray-700">
                      Donated to <span className="font-semibold">{d.campaign?.title || 'a campaign'}</span>
                    </span>
                    <span className="font-bold text-green-600">₹{d.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {showVolunteered && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Volunteered Campaigns</h2>
                    <button className="text-gray-500 hover:text-gray-800 text-2xl" onClick={() => setShowVolunteered(false)}>&times;</button>
                </div>
                {volunteerDetails.length === 0 ? (
                <p className="text-gray-600">You haven't volunteered for any campaigns yet.</p>
                ) : (
                <ul className="divide-y divide-gray-200">
                    {volunteerDetails.map((c) => (
                    <li key={c._id} className="py-3">
                        <p className="font-semibold text-gray-800">{c.title}</p>
                        <p className="text-sm text-gray-600">{c.description}</p>
                    </li>
                    ))}
                </ul>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

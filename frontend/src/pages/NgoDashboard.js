import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function NgoDashboard() {
  const [user, setUser] = useState(null);
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStats, setCampaignStats] = useState({ totalDonations: 0, volunteerCount: 0 });
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);

        if (payload.role === 'ngo') {
          api.get('/ngos/me')
            .then(async res => {
              setNgo(res.data);
              const ngoId = res.data._id;
              try {
                const campRes = await api.get('/campaigns');
                const related = campRes.data.filter(c => (c.ngo?._id || c.ngo) === ngoId);
                setCampaigns(related);
                const totalDonations = related.reduce((sum, c) => sum + (Number(c.currentAmount) || 0), 0);
                const volunteerCount = related.reduce((sum, c) => sum + ((c.volunteers || []).length), 0);
                setCampaignStats({ totalDonations, volunteerCount });
              } catch (err) {
                console.error('Failed to fetch campaigns:', err);
                setCampaigns([]);
                setCampaignStats({ totalDonations: 0, volunteerCount: 0 });
              }
            })
            .catch(err => console.error('Failed to fetch NGO profile:', err))
            .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
      } catch (err) {
        console.error('Failed to decode token');
        setLoading(false);
      }
    } else {
        setLoading(false);
    }

    api.get('/notifications')
      .then(res => setNotifications(res.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  const isVerified = ngo?.verified;
  const isPending = ngo?.verificationDocs?.length > 0 && !ngo.verified;
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">NGO Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {ngo?.name || user?.name}</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-3xl">📋</p>
                <h3 className="text-gray-600 mt-2">Profile Status</h3>
                {isVerified ? (
                    <p className="text-2xl font-bold text-green-600 mt-2">✅ Verified</p>
                ) : isPending ? (
                    <p className="text-2xl font-bold text-yellow-600 mt-2">⏳ Pending</p>
                ) : (
                    <p className="text-2xl font-bold text-red-600 mt-2">❌ Incomplete</p>
                )}
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-3xl">📢</p>
                <h3 className="text-gray-600 mt-2">Active Campaigns</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">{campaigns.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-3xl">💰</p>
                <h3 className="text-gray-600 mt-2">Total Donations</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">₹{campaignStats.totalDonations.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-3xl">👥</p>
                <h3 className="text-gray-600 mt-2">Volunteers</h3>
                <p className="text-2xl font-bold text-orange-600 mt-2">{campaignStats.volunteerCount}</p>
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

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/ngo/profile" className="block p-6 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition">
                        <h3 className="font-semibold text-blue-800">Update Your Profile</h3>
                        <p className="text-sm text-blue-600 mt-1">Keep your NGO's information up-to-date.</p>
                    </Link>
                    <Link to="/campaigns" className="block p-6 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-md transition">
                        <h3 className="font-semibold text-orange-800">View Campaigns</h3>
                        <p className="text-sm text-orange-600 mt-1">See your active campaigns and progress.</p>
                    </Link>
                    <Link to="/campaigns/create" className="block p-6 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition">
                        <h3 className="font-semibold text-green-800">Create New Campaign</h3>
                        <p className="text-sm text-green-600 mt-1">Launch a funding, volunteering, or hybrid campaign.</p>
                    </Link>
                    <Link to="/messages" className="block p-6 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition">
                        <h3 className="font-semibold text-purple-800">View Messages</h3>
                        <p className="text-sm text-purple-600 mt-1">Check inquiries from users.</p>
                    </Link>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Verification Status</h2>
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${isVerified ? 'bg-green-100' : isPending ? 'bg-yellow-100' : 'bg-red-100'}`}>
                        <h3 className={`font-semibold ${isVerified ? 'text-green-800' : isPending ? 'text-yellow-800' : 'text-red-800'}`}>
                            {isVerified ? 'Your NGO is Verified' : isPending ? 'Verification Pending' : 'Verification Incomplete'}
                        </h3>
                        <p className={`text-sm ${isVerified ? 'text-green-700' : isPending ? 'text-yellow-700' : 'text-red-700'}`}>
                            {isVerified 
                                ? "Congratulations! Your NGO is visible to all users."
                                : isPending 
                                    ? "Your documents are under review. This usually takes 24-48 hours." 
                                    : "Please complete your profile and submit verification documents."
                            }
                        </p>
                    </div>
                    {!isVerified && (
                        <Link to="/ngo/profile" className="block w-full text-center mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            {isPending ? 'Check Status' : 'Submit Documents'}
                        </Link>
                    )}
                </div>
            </div>
        </section>

        {/* Volunteer Campaigns Section */}
        <section className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🤝 Volunteer Needs in Your Campaigns</h2>
            <Link 
              to="/campaigns/create"
              className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Create Campaign
            </Link>
          </div>
          
          {campaigns.filter(c => c.volunteersNeeded && c.volunteersNeeded.length > 0).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.filter(c => c.volunteersNeeded && c.volunteersNeeded.length > 0).map(campaign => (
                <div key={campaign._id} className="border rounded-lg p-4 hover:shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{campaign.title}</h3>
                    <Link to={`/campaigns/${campaign._id}`} className="text-indigo-600 text-sm hover:underline">
                      View
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{campaign.description?.substring(0,150) || ''}...</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {campaign.volunteersNeeded?.slice(0, 4).map((role, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{role}</span>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{campaign.location || 'Location TBD'}</span>
                    <span>{campaign.volunteers?.length || 0} joined</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No volunteer campaigns yet.</p>
              <Link 
                to="/campaigns/create"
                className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors inline-block"
              >
                Create Your First Campaign
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

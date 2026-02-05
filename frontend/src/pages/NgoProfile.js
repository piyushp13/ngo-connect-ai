import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import ConfirmModal from '../components/ConfirmModal';
import { getUserRole } from '../utils/auth';

export default function NgoProfile() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [campaigns, setCampaigns] = useState([]);
  const [flagReason, setFlagReason] = useState('');
  const [flagMessage, setFlagMessage] = useState('');
  const [flagLoading, setFlagLoading] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const role = getUserRole();
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  useEffect(() => {
    api.get(`/ngos/${id}`)
      .then(res => {
        setNgo(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch NGO details. The NGO may not exist or is not verified.');
        setLoading(false);
      });
    
    api.get('/campaigns')
      .then(res => {
        const related = res.data.filter(c => (c.ngo?._id || c.ngo) === id);
        setCampaigns(related);
      })
      .catch(err => console.error('Failed to fetch campaigns:', err));
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading NGO profile...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!ngo) return <div className="p-8 text-center">This NGO profile is not available.</div>;

  const finData = ngo.financials?.years?.map((year, i) => ({
    year,
    Income: ngo.financials.income?.[i] || 0,
    Expenses: ngo.financials.expenses?.[i] || 0,
  })) || [];

  const TabButton = ({ active, onClick, children }) => (
    <button
      className={`py-2 px-4 font-semibold rounded-t-lg transition-colors duration-300 ${
        active
          ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
          : 'bg-transparent text-gray-500 hover:text-indigo-600'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const handleFlagNgo = async () => {
    if (!isAdmin && !isUser) {
      setFlagMessage('Please login to submit a request.');
      return;
    }
    if (ngo.flagged) {
      setFlagMessage('This NGO is already flagged.');
      return;
    }
    setFlagLoading(true);
    setFlagMessage('');
    try {
      if (isAdmin) {
        const res = await api.post(`/ngos/${id}/flag`, { reason: flagReason });
        setNgo(res.data.ngo);
        setFlagMessage('NGO flagged successfully.');
      } else {
        await api.post(`/ngos/${id}/flag-request`, { reason: flagReason });
        setFlagMessage('Request sent to admin for review.');
      }
      setFlagReason('');
    } catch (err) {
      setFlagMessage('Failed to submit request. Please try again.');
    }
    setFlagLoading(false);
    setFlagModalOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img src={ngo.logo || 'https://via.placeholder.com/150'} alt={`${ngo.name} logo`} className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover" />
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-gray-900">{ngo.name}</h1>
              <p className="mt-2 text-lg text-gray-600">{ngo.mission}</p>
              <div className="mt-4 flex justify-center md:justify-start gap-4">
                {ngo.verified && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">Verified</span>}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">{ngo.category}</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">{ngo.location}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>Overview</TabButton>
            <TabButton active={tab === 'campaigns'} onClick={() => setTab('campaigns')}>Campaigns</TabButton>
            <TabButton active={tab === 'volunteer'} onClick={() => setTab('volunteer')}>Volunteer</TabButton>
            <TabButton active={tab === 'about'} onClick={() => setTab('about')}>About Us</TabButton>
            <TabButton active={tab === 'contact'} onClick={() => setTab('contact')}>Contact & Legal</TabButton>
          </nav>
        </div>

        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Report This NGO</h2>
              {ngo.flagged && <span className="text-sm text-red-600 font-semibold">Flagged</span>}
            </div>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Reason for reporting (optional)"
              className="w-full border border-gray-300 rounded-md p-2 mb-3"
              rows={3}
              disabled={ngo.flagged}
            />
            <button
              onClick={() => setFlagModalOpen(true)}
              disabled={flagLoading || ngo.flagged}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
            >
              {ngo.flagged ? 'Already Flagged' : flagLoading ? 'Submitting...' : isAdmin ? 'Flag NGO' : 'Request Admin Review'}
            </button>
            {flagMessage && <p className="mt-2 text-sm text-gray-600">{flagMessage}</p>}
          </div>

          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Financials</h2>
                {finData.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={finData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `₹${value/100000}L`} />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="Income" fill="#818cf8" />
                        <Bar dataKey="Expenses" fill="#f87171" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p>Financial data not available.</p>}
              </div>
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Impact Metrics</h2>
                {ngo.impactMetrics?.length > 0 ? (
                  <ul className="space-y-3">
                    {ngo.impactMetrics.map((metric, i) => <li key={i} className="flex items-center"><span className="text-green-500 mr-2">✔</span> {metric}</li>)}
                  </ul>
                ) : <p>Impact data not available.</p>}
              </div>
            </div>
          )}
          {tab === 'campaigns' && (
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Campaigns</h2>
                {campaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campaigns.map(campaign => (
                      <Link to={`/campaigns/${campaign._id}`} key={campaign._id} className="block border rounded-lg p-4 hover:shadow-lg">
                        <h3 className="font-bold">{campaign.title}</h3>
                        <p className="text-sm text-gray-600">{campaign.description?.substring(0,100) || ''}...</p>
                      </Link>
                    ))}
                  </div>
                ) : <p>This NGO has no active campaigns.</p>}
              </div>
          )}
          {tab === 'volunteer' && (
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Volunteer With Us</h2>
              <p className="text-gray-600 mb-6">
                Join one of our active campaigns that need hands-on volunteer support.
              </p>
              {campaigns.filter(c => c.volunteersNeeded && c.volunteersNeeded.length > 0).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaigns.filter(c => c.volunteersNeeded && c.volunteersNeeded.length > 0).map(campaign => (
                    <div key={campaign._id} className="border rounded-lg p-4 hover:shadow-lg">
                      <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{campaign.description?.substring(0,150) || ''}...</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {campaign.volunteersNeeded?.slice(0, 4).map((role, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{role}</span>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-3">
                        <span>{campaign.location || 'Location TBD'}</span>
                        <span>{campaign.volunteers?.length || 0} joined</span>
                      </div>
                      <Link 
                        to={`/campaigns/${campaign._id}`} 
                        className="block w-full text-center px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Volunteer Now
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🤝</div>
                  <p className="text-gray-500">No volunteer campaigns available at the moment.</p>
                  <p className="text-sm text-gray-400 mt-2">Check back later or explore other NGOs.</p>
                </div>
              )}
              <div className="mt-8 text-center">
                <Link to="/campaigns" className="text-indigo-600 hover:underline">
                  Explore all campaigns →
                </Link>
              </div>
            </div>
          )}
          {tab === 'about' && (
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About {ngo.name}</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{ngo.about || 'Detailed information about this NGO is not yet available.'}</p>
            </div>
          )}
          {tab === 'contact' && (
            <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact & Legal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Contact Details</h3>
                        <p><strong>Address:</strong> {ngo.address || 'Not available'}</p>
                        <p><strong>Website:</strong> <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{ngo.website}</a></p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Registration Details</h3>
                        <p><strong>PAN:</strong> {ngo.registration?.pan || 'Not available'}</p>
                        <p><strong>Registration No:</strong> {ngo.registration?.regNo || 'Not available'}</p>
                        <p><strong>CSR:</strong> {ngo.registration?.csr || 'Not available'}</p>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        open={flagModalOpen}
        title={isAdmin ? 'Flag NGO' : 'Request Admin Review'}
        description={
          isAdmin
            ? 'This will mark the NGO as flagged and visible to admins.'
            : 'Your request will be sent to the admin team for review.'
        }
        confirmLabel={isAdmin ? 'Flag NGO' : 'Send Request'}
        onConfirm={handleFlagNgo}
        onCancel={() => setFlagModalOpen(false)}
        loading={flagLoading}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { getUserRole } from '../utils/auth';

export default function CampaignDetails() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState(0);
  const [campaignDone, setCampaignDone] = useState(false);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [volunteerMessage, setVolunteerMessage] = useState('');
  const [isVolunteered, setIsVolunteered] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagMessage, setFlagMessage] = useState('');
  const [flagLoading, setFlagLoading] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const role = getUserRole();
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  useEffect(() => {
    api.get(`/campaigns/${id}`)
      .then(res => {
        setCampaign(res.data);
        const requiredAmount = res.data.requiredDonationAmount ?? res.data.goalAmount ?? 0;
        const currentAmount = Number(res.data.currentAmount || 0);
        setDonatedAmount(currentAmount);
        setCampaignDone(requiredAmount > 0 && currentAmount >= requiredAmount);
        // Check if user already volunteered
        if (res.data.volunteers) {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setIsVolunteered(res.data.volunteers.includes(payload.id));
            } catch (e) {}
          }
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch campaign details.');
        setLoading(false);
      });
  }, [id]);

  const handleDonation = async (e) => {
    e.preventDefault();
    if (!donationAmount || +donationAmount <= 0) {
      setDonationMessage('Please enter a valid amount.');
      return;
    }
    if (campaignDone) {
      setDonationMessage('This campaign is already fully funded.');
      return;
    }
    setDonationLoading(true);
    setDonationMessage('');
    const amountValue = Number(donationAmount);
    try {
      await api.post(`/donations/campaign/${id}`, { amount: amountValue });
      setDonationMessage('Thank you for your generous donation!');
      setCampaign(prev => {
        if (!prev) return prev;
        const nextAmount = Number(prev.currentAmount || 0) + amountValue;
        return { ...prev, currentAmount: nextAmount };
      });
      const optimisticTotal = donatedAmount + amountValue;
      const requiredAmount = campaign?.requiredDonationAmount ?? campaign?.goalAmount ?? 0;
      setDonatedAmount(optimisticTotal);
      if (requiredAmount > 0 && optimisticTotal >= requiredAmount) {
        setCampaignDone(true);
      }
      // Refresh campaign data to show updated amount
      const updatedCampaign = await api.get(`/campaigns/${id}`);
      setCampaign(updatedCampaign.data);
      const updatedRequiredAmount = updatedCampaign.data.requiredDonationAmount ?? updatedCampaign.data.goalAmount ?? 0;
      const updatedCurrentAmount = Number(updatedCampaign.data.currentAmount || 0);
      setDonatedAmount(updatedCurrentAmount);
      setCampaignDone(updatedRequiredAmount > 0 && updatedCurrentAmount >= updatedRequiredAmount);
      setDonationAmount('');
    } catch (err) {
      setDonationMessage('Donation failed. Please try again.');
      console.error(err);
    }
    setDonationLoading(false);
  };

  const handleVolunteer = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setVolunteerMessage('Please login to volunteer for this campaign.');
      return;
    }
    setVolunteerLoading(true);
    setVolunteerMessage('');
    try {
      await api.post(`/campaigns/${id}/volunteer`);
      setIsVolunteered(true);
      setVolunteerMessage('Thank you for volunteering! Your time makes a difference.');
    } catch (err) {
      setVolunteerMessage('Failed to volunteer. Please try again.');
      console.error(err);
    }
    setVolunteerLoading(false);
  };

  const handleFlagCampaign = async () => {
    if (!isAdmin && !isUser) {
      setFlagMessage('Please login to submit a request.');
      return;
    }
    if (campaign?.flagged) {
      setFlagMessage('This campaign is already flagged.');
      return;
    }
    setFlagLoading(true);
    setFlagMessage('');
    try {
      if (isAdmin) {
        const res = await api.post(`/campaigns/${id}/flag`, { reason: flagReason });
        setCampaign(res.data.campaign);
        setFlagMessage('Campaign flagged successfully.');
      } else {
        await api.post(`/campaigns/${id}/flag-request`, { reason: flagReason });
        setFlagMessage('Request sent to admin for review.');
      }
      setFlagReason('');
    } catch (err) {
      setFlagMessage('Failed to submit request. Please try again.');
    }
    setFlagLoading(false);
    setFlagModalOpen(false);
  };
  
  if (loading) return <div className="p-8 text-center">Loading campaign...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!campaign) return <div className="p-8 text-center">This campaign is not available.</div>;

  const requiredDonationAmount = campaign.requiredDonationAmount ?? campaign.goalAmount ?? 0;
  const hasFunding = requiredDonationAmount > 0;
  const hasVolunteers = (campaign.volunteersNeeded && campaign.volunteersNeeded.length > 0);
  const percentage = requiredDonationAmount > 0 ? Math.min((campaign.currentAmount / requiredDonationAmount) * 100, 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <img src={campaign.image || 'https://via.placeholder.com/800x400'} alt={campaign.title} className="w-full h-96 object-cover"/>
              <div className="p-8">
                <h1 className="text-4xl font-extrabold text-gray-900">{campaign.title}</h1>
                <p className="mt-4 text-lg text-gray-600">{campaign.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {campaignDone && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">✅</div>
                  <div>
                    <p className="font-semibold">Campaign Done</p>
                    <p className="text-sm text-green-700">
                      This campaign has reached its funding goal. Thank you for your support!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {hasFunding && (
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Campaign Progress</h2>
              <div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="mt-2 flex justify-between text-lg font-semibold">
                  <span className="text-green-600">₹{campaign.currentAmount.toLocaleString()}</span>
                  <span className="text-gray-500">of ₹{requiredDonationAmount.toLocaleString()}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>Total Donated: ₹{donatedAmount.toLocaleString()}</span>
                  {campaignDone && <span className="font-semibold text-green-700">Campaign Done</span>}
                </div>
              </div>
            </div>
            )}
            
            {hasFunding && (
            <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Make a Donation</h2>
                <form onSubmit={handleDonation} className="space-y-4">
                    <div>
                        <label htmlFor="donation" className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                        <input
                            type="number"
                            id="donation"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., 500"
                            disabled={campaignDone}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                        disabled={donationLoading || campaignDone}
                    >
                        {campaignDone ? 'Campaign Done' : donationLoading ? 'Processing...' : 'Donate Now'}
                    </button>
                    {donationMessage && <p className="mt-2 text-sm text-center font-semibold">{donationMessage}</p>}
                </form>
            </div>
            )}

            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-800">Report Campaign</h2>
                {campaign.flagged && <span className="text-sm text-red-600 font-semibold">Flagged</span>}
              </div>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Reason for reporting (optional)"
                className="w-full border border-gray-300 rounded-md p-2 mb-3"
                rows={3}
                disabled={campaign.flagged}
              />
              <button
                onClick={() => setFlagModalOpen(true)}
                disabled={flagLoading || campaign.flagged}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
              >
                {campaign.flagged ? 'Already Flagged' : flagLoading ? 'Submitting...' : isAdmin ? 'Flag Campaign' : 'Request Admin Review'}
              </button>
              {flagMessage && <p className="mt-2 text-sm text-gray-600">{flagMessage}</p>}
            </div>
            
            {hasVolunteers && (
            <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Volunteer</h2>
                <p className="text-gray-600 mb-4">
                  Join {campaign.volunteers?.length || 0} other volunteers and make a hands-on impact.
                </p>
                {campaign.volunteersNeeded?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {campaign.volunteersNeeded.map((role, idx) => (
                      <span key={idx} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                )}
                {isVolunteered ? (
                  <div className="w-full text-center py-3 px-4 rounded-md bg-green-50 text-green-700 font-semibold border border-green-200">
                    ✓ You are already volunteering for this campaign
                  </div>
                ) : (
                  <button
                      onClick={handleVolunteer}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
                      disabled={volunteerLoading}
                  >
                      {volunteerLoading ? 'Processing...' : 'Volunteer Now'}
                  </button>
                )}
                {volunteerMessage && <p className="mt-2 text-sm text-center font-semibold">{volunteerMessage}</p>}
            </div>
            )}
            
            {campaign.ngo && (
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Organized By</h3>
                    <Link to={`/ngos/${campaign.ngo._id}`} className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-lg">
                        <img src={campaign.ngo.logo || 'https://via.placeholder.com/100'} alt={campaign.ngo.name} className="w-16 h-16 rounded-full object-cover"/>
                        <div>
                            <p className="font-bold text-lg text-gray-900">{campaign.ngo.name}</p>
                            <p className="text-indigo-600 hover:underline">View Profile</p>
                        </div>
                    </Link>
                </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={flagModalOpen}
        title={isAdmin ? 'Flag Campaign' : 'Request Admin Review'}
        description={
          isAdmin
            ? 'This will mark the campaign as flagged and visible to admins.'
            : 'Your request will be sent to the admin team for review.'
        }
        confirmLabel={isAdmin ? 'Flag Campaign' : 'Send Request'}
        onConfirm={handleFlagCampaign}
        onCancel={() => setFlagModalOpen(false)}
        loading={flagLoading}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAIRecommendations } from '../services/api';

export default function SmartInsights() {
  const [recommendations, setRecommendations] = useState({ ngos: [], campaigns: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAIRecommendations()
      .then(res => setRecommendations(res.data))
      .catch(() => setError('Failed to load smart insights.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Get Smart Insights</h1>
          <p className="text-gray-600 mt-2">See personalized recommendations and explore AI-powered support tools.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/chatbot" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
              Open Chatbot
            </Link>
            <Link to="/recommendations" className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50">
              Full Recommendations
            </Link>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to unlock insights</h2>
            <p className="text-gray-600 mt-2">Personalized matches are available after you login and set your preferences.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/login" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50">
                Register
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">Loading insights...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">{error}</div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Top NGO Matches</h2>
              {recommendations.ngos.length === 0 ? (
                <p className="text-gray-500">No NGO recommendations yet. Update your preferences to improve matches.</p>
              ) : (
                <div className="space-y-4">
                  {recommendations.ngos.slice(0, 3).map(item => (
                    <div key={item.ngo._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.ngo.name}</h3>
                          <p className="text-sm text-gray-500">{item.ngo.category || 'NGO'} · {item.ngo.location || 'Location TBD'}</p>
                        </div>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{Math.min(Math.round((item.score || 0) * 10), 99)}% match</span>
                      </div>
                      {item.reasons && item.reasons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.reasons.map((reason, idx) => (
                            <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{reason}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3">
                        <Link to={`/ngos/${item.ngo._id}`} className="text-indigo-600 font-semibold hover:underline">
                          View NGO
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Campaign Matches</h2>
              {recommendations.campaigns.length === 0 ? (
                <p className="text-gray-500">No campaign recommendations yet. Try updating your preferences.</p>
              ) : (
                <div className="space-y-4">
                  {recommendations.campaigns.slice(0, 3).map(item => {
                    const campaign = item.campaign;
                    const hasFunding = (campaign.goalAmount || 0) > 0;
                    const progress = hasFunding
                      ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)
                      : 0;
                    return (
                      <div key={campaign._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                            <p className="text-sm text-gray-500">{campaign.ngo?.name || 'NGO'}</p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{Math.min(Math.round((item.score || 0) * 10), 99)}% match</span>
                        </div>
                        {hasFunding ? (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>₹{campaign.currentAmount?.toLocaleString() || 0} raised</span>
                              <span>₹{campaign.goalAmount?.toLocaleString() || 0} goal</span>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500">
                            {campaign.volunteersNeeded?.length || 0} volunteer roles needed
                          </p>
                        )}
                        <div className="mt-3">
                          <Link to={`/campaigns/${campaign._id}`} className="text-green-600 font-semibold hover:underline">
                            View Campaign
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

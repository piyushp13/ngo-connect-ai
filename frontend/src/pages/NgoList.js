import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { getUserRole } from '../utils/auth';

export default function NgoList() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagLoading, setFlagLoading] = useState(false);
  const [flagMessage, setFlagMessage] = useState('');
  const [requestedIds, setRequestedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const role = getUserRole();
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  useEffect(() => {
    setLoading(true);
    api.get('/ngos')
      .then(response => {
        const verifiedNgos = response.data.filter(ngo => ngo.verified);
        setNgos(verifiedNgos);
        const categories = [...new Set(verifiedNgos.map(ngo => ngo.category))];
        setUniqueCategories(categories);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching NGOs:", error);
        setLoading(false);
      });
  }, []);

  const filteredNgos = ngos.filter(ngo => {
    return (
      (ngo.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (category === '' || ngo.category.toLowerCase() === category.toLowerCase()) &&
      (location === '' || (ngo.location && ngo.location.toLowerCase().includes(location.toLowerCase())))
    );
  });

  const openFlagModal = (ngo) => {
    setSelectedNgo(ngo);
    setFlagReason('');
    setFlagMessage('');
    setModalOpen(true);
  };

  const closeFlagModal = () => {
    setModalOpen(false);
    setSelectedNgo(null);
  };

  const handleFlagSubmit = async () => {
    if (!selectedNgo) return;
    setFlagLoading(true);
    setFlagMessage('');
    try {
      if (isAdmin) {
        const res = await api.post(`/ngos/${selectedNgo._id}/flag`, { reason: flagReason });
        setNgos(prev => prev.map(n => (n._id === selectedNgo._id ? res.data.ngo : n)));
        setFlagMessage('NGO flagged successfully.');
      } else if (isUser) {
        await api.post(`/ngos/${selectedNgo._id}/flag-request`, { reason: flagReason });
        setRequestedIds(prev => [...new Set([...prev, selectedNgo._id])]);
        setFlagMessage('Request sent to admin for review.');
      } else {
        setFlagMessage('Please login to submit a request.');
      }
    } catch (err) {
      setFlagMessage('Unable to submit request.');
    }
    setFlagLoading(false);
    setModalOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Our Partner NGOs
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Discover and connect with verified non-governmental organizations making a difference.
          </p>
        </header>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((cat, index) => (
              <option key={cat || `category-${index}`} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by location..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading NGOs...</p>
          </div>
        ) : filteredNgos.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">
            {filteredNgos.map(ngo => (
              <div key={ngo._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                <img className="h-56 w-full object-cover" src={ngo.logo || `https://source.unsplash.com/random/400x300?charity,${ngo.category}`} alt={ngo.name} />
                <div className="p-6">
                  <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">{ngo.category}</p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{ngo.name}</h3>
                    {ngo.verified && <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full">Verified</span>}
                  </div>
                  <p className="mt-2 text-gray-600 text-base">{(ngo.description || '').substring(0, 120)}...</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link to={`/ngos/${ngo._id}`} className="w-full inline-block text-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300">
                      View Details
                    </Link>
                    <button
                      onClick={() => openFlagModal(ngo)}
                      disabled={ngo.flagged || requestedIds.includes(ngo._id)}
                      className="w-full inline-block text-center px-6 py-2 border border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 disabled:text-gray-400 disabled:border-gray-300"
                    >
                      {ngo.flagged
                        ? 'Flagged'
                        : requestedIds.includes(ngo._id)
                          ? 'Request Sent'
                          : isAdmin
                            ? 'Flag NGO'
                            : 'Request Admin Review'}
                    </button>
                    {flagMessage && selectedNgo && selectedNgo._id === ngo._id && (
                      <p className="text-xs text-gray-600 text-center">{flagMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900">No NGOs Found</h2>
            <p className="mt-2 text-gray-500">Your search and filter combination did not return any results. Try adjusting your criteria.</p>
          </div>
        )}
      </div>
      <ConfirmModal
        open={modalOpen}
        title={isAdmin ? 'Flag NGO' : 'Request Admin Review'}
        description={
          isAdmin
            ? 'This will mark the NGO as flagged and visible to admins.'
            : 'Your request will be sent to the admin team for review.'
        }
        confirmLabel={isAdmin ? 'Flag NGO' : 'Send Request'}
        onConfirm={handleFlagSubmit}
        onCancel={closeFlagModal}
        loading={flagLoading}
      >
        <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
        <textarea
          value={flagReason}
          onChange={(e) => setFlagReason(e.target.value)}
          className="mt-2 w-full border border-gray-300 rounded-md p-2"
          rows={3}
          placeholder="Describe why this looks suspicious"
        />
      </ConfirmModal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function NgoProfileUpdate() {
  const [ngo, setNgo] = useState({
    name: '',
    email: '',
    category: '',
    description: '',
    location: ''
  });
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNgo = async () => {
      try {
        const res = await api.get('/ngos/me');
        setNgo(res.data);
      } catch (err) {
        console.log('No profile found, ready to create one.');
      }
    };
    fetchNgo();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setNgo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDocs(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // First, update the profile data
      const profileRes = await api.put('/ngos/me', ngo);
      setNgo(profileRes.data);
      setMessage('Profile updated successfully!');

      // Then, if there are documents, upload them
      if (docs.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < docs.length; i++) {
          formData.append('docs', docs[i]);
        }
        await api.post('/ngos/me/verify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('Profile and documents submitted successfully! Your NGO is under review.');
        setDocs([]);
        document.getElementById('fileInput').value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">NGO Profile & Verification</h1>
          <p className="mt-2 text-lg text-gray-600">Complete your profile to get verified and start connecting with supporters.</p>
        </header>

        {message && <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Organization Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <input id="name" type="text" name="name" value={ngo.name} onChange={handleProfileChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input id="email" type="email" name="email" value={ngo.email} onChange={handleProfileChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select id="category" name="category" value={ngo.category} onChange={handleProfileChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select Category</option>
                        <option value="Education">Education</option>
                        <option value="Health">Health</option>
                        <option value="Food">Food & Nutrition</option>
                        <option value="Disaster Relief">Disaster Relief</option>
                        <option value="Environment">Environment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input id="location" type="text" name="location" value={ngo.location} onChange={handleProfileChange} placeholder="City, Country" required className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" value={ngo.description} onChange={handleProfileChange} rows="5" placeholder="Tell us about your NGO and its mission" className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Verification Documents</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
              <p className="text-blue-800 font-semibold">Required Documents:</p>
              <ul className="text-blue-700 mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Registration Certificate</li>
                <li>Tax ID (12A/80G Certificate)</li>
                <li>Address Proof</li>
              </ul>
            </div>
            <div>
              <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700">Upload Documents</label>
              <input id="fileInput" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            </div>
            {docs.length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700">Selected Files ({docs.length}):</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                  {Array.from(docs).map((doc, idx) => <li key={idx}>{doc.name}</li>)}
                </ul>
              </div>
            )}
          </div>
          
          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors duration-300"
            >
              {loading ? 'Submitting...' : 'Save and Submit for Verification'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

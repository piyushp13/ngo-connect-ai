import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function UserProfile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    interests: '',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        const userData = {
          ...res.data,
          interests: Array.isArray(res.data.interests) ? res.data.interests.join(', ') : '',
          skills: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : '',
        };
        setUser(userData);
      } catch (err) {
        setError('Could not load user profile. Please try again later.');
      }
    };
    fetchUser();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const updatedUser = {
        ...user,
        interests: user.interests ? user.interests.split(',').map(item => item.trim()) : [],
        skills: user.skills ? user.skills.split(',').map(item => item.trim()) : [],
      };
      const res = await api.put('/auth/me', updatedUser);
      
      const userData = {
        ...res.data,
        interests: Array.isArray(res.data.interests) ? res.data.interests.join(', ') : '',
        skills: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : '',
      };
      
      setUser(userData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900">Your Profile</h1>
            <p className="mt-2 text-lg text-gray-600">Keep your information up-to-date to get the best recommendations.</p>
        </header>

        {message && <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1 flex flex-col items-center">
                <img className="h-32 w-32 rounded-full object-cover" src={`https://source.unsplash.com/random/200x200?face`} alt="Profile" />
                <button className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500">Change Picture</button>
            </div>
            <form onSubmit={submitProfile} className="md:col-span-2 space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleProfileChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleProfileChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Your Interests</label>
                    <input
                        id="interests"
                        type="text"
                        name="interests"
                        value={user.interests}
                        onChange={handleProfileChange}
                        placeholder="e.g., Education, Health, Environment"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate interests with a comma.</p>
                </div>

                <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Your Skills</label>
                    <input
                        id="skills"
                        type="text"
                        name="skills"
                        value={user.skills}
                        onChange={handleProfileChange}
                        placeholder="e.g., Web Development, Marketing, Writing"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate skills with a comma.</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors duration-300"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

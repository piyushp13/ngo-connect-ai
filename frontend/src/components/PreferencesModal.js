import React, { useState, useEffect } from 'react';
import { getUserPreferences, updateUserPreferences } from '../services/api';

const CAUSES = ['Education', 'Healthcare', 'Environment', 'Animal Welfare', 'Hunger', 'Women', 'Child', 'Disaster'];

export default function PreferencesModal({ isOpen, onClose, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [prefs, setPrefs] = useState({ location: '', interests: [] });

  useEffect(function() {
    if (isOpen) {
      fetchPrefs();
    }
  }, [isOpen]);

  async function fetchPrefs() {
    try {
      const resp = await getUserPreferences();
      setPrefs({
        location: resp.data.location || '',
        interests: resp.data.interests || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      await updateUserPreferences(prefs);
      if (onComplete) { onComplete(prefs); }
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Personalize Your Experience</h2>
          <p className="text-gray-600 mb-4">Help us find perfect matches for you</p>
          
          {fetching ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Location</label>
                <select
                  value={prefs.location}
                  onChange={function(e) { setPrefs({ ...prefs, location: e.target.value }); }}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select city</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Causes You Care About</label>
                <div className="flex flex-wrap gap-2">
                  {CAUSES.map(function(cause) {
                    return (
                      <button
                        key={cause}
                        type="button"
                        onClick={function() {
                          const newInterests = prefs.interests.includes(cause)
                            ? prefs.interests.filter(function(i) { return i !== cause; })
                            : [...prefs.interests, cause];
                          setPrefs({ ...prefs, interests: newInterests });
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          prefs.interests.includes(cause)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200'
                        }`}
                      >
                        {cause}
                      </button>
                    );
                  })}
                </div>
            </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              {loading ? 'Saving...' : 'Get Recommendations'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

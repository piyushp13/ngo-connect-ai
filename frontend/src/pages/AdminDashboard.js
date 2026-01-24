import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [ngos, setNgos] = useState([]);
  useEffect(() => { api.get('/admin/ngo-registrations').then(r => setNgos(r.data)); }, []);
  const verify = async id => {
    await api.post(`/admin/verify-ngo/${id}`);
    setNgos(ngos.filter(n => n._id !== id));
  };
  const reject = async id => {
    await api.post(`/admin/reject-ngo/${id}`);
    setNgos(ngos.filter(n => n._id !== id));
  };
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <h2 className="mt-6 font-bold">Pending NGO Registrations</h2>
      <div className="mt-4 grid grid-cols-1 gap-4">
        {ngos.map(n => (
          <div key={n._id} className="p-4 bg-white rounded shadow">
            <h2 className="font-bold">{n.name}</h2>
            <p>{n.email}</p>
            <button onClick={()=>verify(n._id)} className="px-3 py-1 bg-green-600 text-white rounded mr-2">Verify</button>
            <button onClick={()=>reject(n._id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import api from '../services/api';

export default function CreateCampaign() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [category, setCategory] = useState('');
  const [msg, setMsg] = useState('');

  const classify = async desc => {
    const res = await api.post('/ai/classify-campaign', { description: desc });
    setCategory(res.data.category);
  };

  const submit = async e => {
    e.preventDefault();
    await api.post('/campaigns', { title, description, location, goalAmount, category });
    setMsg('Campaign created!');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Create Campaign</h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
        <textarea value={description} onChange={e=>{setDescription(e.target.value); classify(e.target.value);}} placeholder="Description" className="w-full p-2 border rounded" />
        <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="w-full p-2 border rounded" />
        <input value={goalAmount} onChange={e=>setGoalAmount(e.target.value)} placeholder="Goal Amount" type="number" className="w-full p-2 border rounded" />
        <input value={category} readOnly placeholder="Category (auto)" className="w-full p-2 border rounded bg-gray-100" />
        <button className="w-full py-2 bg-green-600 text-white rounded">Create</button>
      </form>
      {msg && <div className="mt-2 text-green-600">{msg}</div>}
    </div>
  );
}

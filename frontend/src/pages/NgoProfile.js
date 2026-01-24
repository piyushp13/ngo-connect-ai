import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function NgoProfile(){
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  useEffect(()=>{ api.get(`/ngos/${id}`).then(r=>setNgo(r.data)).catch(()=>{}); },[id]);
  if(!ngo) return <div className="p-6">Loading or NGO not verified</div>;
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">{ngo.name}</h1>
      <p className="mt-2">{ngo.description}</p>
      <p className="mt-2 text-sm">Category: {ngo.category} • Location: {ngo.location}</p>
    </div>
  );
}

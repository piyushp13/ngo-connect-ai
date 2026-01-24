import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function CampaignDetails() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    api.get(`/campaigns/${id}`).then(r => setCampaign(r.data));
  }, [id]);

  if (!campaign) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{campaign.title}</h1>
      <p className="mt-4">{campaign.description}</p>
      <div className="mt-6">
        <p><span className="font-bold">Category:</span> {campaign.category}</p>
        <p><span className="font-bold">Location:</span> {campaign.location}</p>
        <p><span className="font-bold">Goal:</span> ${campaign.goal}</p>
        <p><span className="font-bold">Raised:</span> ${campaign.raised}</p>
      </div>
    </div>
  );
}
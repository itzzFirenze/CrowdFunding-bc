import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import DisplayCampaigns from '../components/DisplayCampaigns';
import { daysLeft } from '../utils';

const StatCard = ({ label, value, icon }) => (
   <div className="flex-1 min-w-[140px] flex flex-col items-center justify-center p-5 bg-[#1c1c24] rounded-[12px] gap-2">
      <span className="text-3xl">{icon}</span>
      <h3 className="font-epilogue font-bold text-[22px] text-white">{value}</h3>
      <p className="font-epilogue font-normal text-[13px] text-[#808191] text-center">{label}</p>
   </div>
);

const Profile = () => {
   const [isLoading, setIsLoading] = useState(false);
   const [campaigns, setCampaigns] = useState([]);

   const { address, contract, getUserCampaigns } = useStateContext();

   const fetchCampaigns = async () => {
      setIsLoading(true);
      const data = await getUserCampaigns();
      setCampaigns(data);
      setIsLoading(false);
   };

   useEffect(() => {
      if (contract) fetchCampaigns();
   }, [address, contract]);

   // Stats
   const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.amountCollected), 0).toFixed(4);
   const activeCampaigns = campaigns.filter(
      (c) => daysLeft(c.deadline) > 0 && Number(c.amountCollected) < Number(c.target)
   ).length;

   return (
      <div>
         {/* Stats bar */}
         {campaigns.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
               <StatCard icon="📋" label="Total Campaigns" value={campaigns.length} />
               <StatCard icon="💎" label="Total ETH Raised" value={`${totalRaised} ETH`} />
               <StatCard icon="🚀" label="Active Campaigns" value={activeCampaigns} />
            </div>
         )}

         <DisplayCampaigns
            title="My Campaigns"
            isLoading={isLoading}
            campaigns={campaigns}
         />
      </div>
   );
};

export default Profile;
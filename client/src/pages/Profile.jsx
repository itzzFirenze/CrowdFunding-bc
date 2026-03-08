import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import DisplayCampaigns from '../components/DisplayCampaigns';
import { daysLeft } from '../utils';

// Import icons from react-icons
import { FaClipboardList, FaEthereum, FaRocket } from 'react-icons/fa';

const StatCard = ({ label, value, icon: IconComponent, iconColor }) => (
   <div className="flex-1 min-w-[180px] flex items-center p-4 bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#374151] rounded-xl gap-4 hover:-translate-y-1 hover:shadow-lg hover:border-[#6366F1]/50 transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#374151]/40 ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
         <IconComponent size={20} />
      </div>
      <div className="flex flex-col">
         <p className="font-epilogue font-medium text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1">
            {label}
         </p>
         <h3 className="font-epilogue font-bold text-[20px] text-white leading-none">
            {value}
         </h3>
      </div>
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
         {/* Stats bar */}
         {campaigns.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
               <StatCard 
                  icon={FaClipboardList} 
                  iconColor="text-[#6366F1]" 
                  label="Total Campaigns" 
                  value={campaigns.length} 
               />
               <StatCard 
                  icon={FaEthereum} 
                  iconColor="text-[#10B981]" 
                  label="Total ETH Raised" 
                  value={totalRaised} 
               />
               <StatCard 
                  icon={FaRocket} 
                  iconColor="text-[#F59E0B]" 
                  label="Active Campaigns" 
                  value={activeCampaigns} 
               />
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
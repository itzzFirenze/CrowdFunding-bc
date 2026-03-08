import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import DisplayCampaigns from '../components/DisplayCampaigns';
import { daysLeft } from '../utils';

// Import icons from react-icons
import { FaChartBar, FaClock, FaGem, FaCheckCircle, FaGlobe, FaBook, FaHeart, FaLaptop, FaPalette, FaUsers, FaThumbtack } from 'react-icons/fa';

const SORT_OPTIONS = [
   { key: 'all', label: 'All', icon: <FaChartBar /> },
   { key: 'ending_soon', label: 'Ending Soon', icon: <FaClock /> },
   { key: 'most_funded', label: 'Most Funded', icon: <FaGem /> },
   { key: 'goal_reached', label: 'Goal Reached', icon: <FaCheckCircle /> },
];

const CATEGORIES = [
   { name: 'All', icon: <FaGlobe /> },
   { name: 'Education', icon: <FaBook /> },
   { name: 'Health', icon: <FaHeart /> },
   { name: 'Technology', icon: <FaLaptop /> },
   { name: 'Art', icon: <FaPalette /> },
   { name: 'Community', icon: <FaUsers /> },
   { name: 'Other', icon: <FaThumbtack /> }
];

const Home = () => {
   const [isLoading, setIsLoading] = useState(false);
   const [campaigns, setCampaigns] = useState([]);
   const [sortKey, setSortKey] = useState('all');
   const [activeCategory, setActiveCategory] = useState('All');
   const { address, contract, getCampaigns, search } = useStateContext();

   const fetchCampaigns = async () => {
      setIsLoading(true);
      const data = await getCampaigns();
      setCampaigns(data);
      setIsLoading(false);
   };

   useEffect(() => {
      if (contract) fetchCampaigns();
   }, [address, contract]);

   // Search filter
   let filtered = search
      ? campaigns.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
      : [...campaigns];

   // Category filter
   if (activeCategory !== 'All') {
      filtered = filtered.filter((c) => (c.category || 'Other') === activeCategory);
   }

   // Sort
   if (sortKey === 'ending_soon') {
      filtered = filtered
         .filter((c) => daysLeft(c.deadline) > 0 && Number(c.amountCollected) < Number(c.target))
         .sort((a, b) => a.deadline - b.deadline);
   } else if (sortKey === 'most_funded') {
      filtered = filtered.sort((a, b) => Number(b.amountCollected) - Number(a.amountCollected));
   } else if (sortKey === 'goal_reached') {
      filtered = filtered.filter((c) => Number(c.amountCollected) >= Number(c.target));
   }

   return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
         {/* Header Section */}
         <div className="mb-4">
            <h1 className="font-epilogue font-bold text-[28px] sm:text-[32px] text-white mb-2">
               Discover Campaigns
            </h1>
         </div>

         {/* Filters Section - Compact Row on Desktop */}
         <div className="flex flex-col lg:flex-row gap-6 mb-8 bg-[#1F2937]/50 p-4 rounded-2xl border border-[#374151]">

            {/* Sort Options */}
            <div className="flex-1">
               <p className="font-epilogue text-[12px] font-medium text-[#9CA3AF] mb-2 uppercase tracking-wide">
                  Sort By
               </p>
               <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                     <button
                        key={opt.key}
                        onClick={() => setSortKey(opt.key)}
                        className={`group px-3 py-1.5 rounded-lg font-epilogue text-[13px] font-semibold transition-all duration-300 border flex items-center gap-1.5 ${sortKey === opt.key
                           ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] border-transparent text-white shadow-md'
                           : 'bg-[#1F2937] border-[#374151] text-[#D1D5DB] hover:border-[#6366F1] hover:text-white'
                           }`}
                     >
                        <span className={`text-[14px] ${sortKey === opt.key ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                           {opt.icon}
                        </span>
                        {opt.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* Category Filters */}
            <div className="flex-[1.5]">
               <p className="font-epilogue text-[12px] font-medium text-[#9CA3AF] mb-2 uppercase tracking-wide">
                  Categories
               </p>
               <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                     <button
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`group px-3 py-1.5 rounded-full font-epilogue text-[13px] font-medium transition-all duration-300 border flex items-center gap-1.5 ${activeCategory === cat.name
                           ? 'bg-gradient-to-r from-[#10B981] to-[#059669] border-transparent text-white shadow-md'
                           : 'bg-[#1F2937] border-[#374151] text-[#D1D5DB] hover:border-[#10B981] hover:text-white'
                           }`}
                     >
                        <span className={`text-[14px] ${activeCategory === cat.name ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                           {cat.icon}
                        </span>
                        {cat.name}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Campaigns Display */}
         <DisplayCampaigns
            title="Campaigns"
            isLoading={isLoading}
            campaigns={filtered}
         />
      </div>
   );
};

export default Home;
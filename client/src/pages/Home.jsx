import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import DisplayCampaigns from '../components/DisplayCampaigns';
import { daysLeft } from '../utils';

const SORT_OPTIONS = [
   { key: 'all', label: 'All' },
   { key: 'ending_soon', label: '⏱ Ending Soon' },
   { key: 'most_funded', label: '💰 Most Funded' },
   { key: 'goal_reached', label: '🎉 Goal Reached' },
];

const CATEGORIES = ['All', 'Education', 'Health', 'Technology', 'Art', 'Community', 'Other'];

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
      <div>
         {/* Sort tabs */}
         <div className="flex flex-wrap gap-2 mb-4">
            {SORT_OPTIONS.map((opt) => (
               <button
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  className={`px-4 py-2 rounded-[20px] font-epilogue text-[13px] font-semibold transition-all duration-200 border ${sortKey === opt.key
                     ? 'bg-[#8c6dfd] border-[#8c6dfd] text-white'
                     : 'bg-transparent border-[#3a3a43] text-[#808191] hover:border-[#8c6dfd] hover:text-white'
                     }`}
               >
                  {opt.label}
               </button>
            ))}
         </div>

         {/* Category chips */}
         <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((cat) => (
               <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full font-epilogue text-[12px] font-medium transition-all duration-200 border ${activeCategory === cat
                     ? 'bg-[#1dc071] border-[#1dc071] text-white'
                     : 'bg-transparent border-[#3a3a43] text-[#808191] hover:border-[#1dc071] hover:text-white'
                     }`}
               >
                  {cat}
               </button>
            ))}
         </div>

         <DisplayCampaigns
            title="All Campaigns"
            isLoading={isLoading}
            campaigns={filtered}
         />
      </div>
   );
};

export default Home;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loader } from '../assets';
import FundCard from './FundCard';
import { FaSearch } from 'react-icons/fa';

const DisplayCampaigns = ({ title, isLoading, campaigns }) => {
   const navigate = useNavigate();

   const handleNavigate = (campaign) => {
      navigate(`/campaign-details/${campaign.title}`, { state: campaign });
   }

   return (
      <div>
         <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#374151]">
            <h1 className='font-epilogue font-bold text-[22px] text-white flex items-center gap-3'>
               {title}
               <span className='inline-flex items-center justify-center min-w-[32px] h-[32px] px-2 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[14px] font-semibold shadow-lg'>
                  {campaigns.length}
               </span>
            </h1>
         </div>

         <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {isLoading && (
               <div className="col-span-full flex items-center justify-center py-20">
                  <img src={loader} alt='loader' className='w-[100px] h-[100px] object-contain' />
               </div>
            )}

            {!isLoading && campaigns.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-[#1F2937] rounded-2xl border-2 border-dashed border-[#374151]">
                  <div className="w-20 h-20 rounded-full bg-[#374151] flex items-center justify-center mb-4 text-[#9CA3AF]">
                     <FaSearch size={32} />
                  </div>
                  <p className='font-epilogue font-bold text-[18px] text-white mb-2'>
                     No campaigns found
                  </p>
                  <p className="font-epilogue text-[14px] text-[#9CA3AF] max-w-md">
                     Try adjusting your filters or search terms to discover more campaigns
                  </p>
               </div>
            )}

            {!isLoading && campaigns.length > 0 && campaigns.map((campaign) =>
               <FundCard
                  key={campaign.pId}
                  {...campaign}
                  handleClick={() => handleNavigate(campaign)}
               />
            )}
         </div>
      </div>
   )
}

export default DisplayCampaigns;
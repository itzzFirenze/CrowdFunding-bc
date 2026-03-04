import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loader } from '../assets';
import FundCard from './FundCard';

const DisplayCampaigns = ({ title, isLoading, campaigns }) => {
   const navigate = useNavigate();

   const handleNavigate = (campaign) => {
      navigate(`/campaign-details/${campaign.title}`, { state: campaign });
   }

   return (
      <div>
         <h1 className='font-epilogue font-semibold text-[18px] text-white text-left'>
            {title} ({campaigns.length})
         </h1>
         <div className='flex flex-wrap mt-[20px] gap-[26px] '>
            {isLoading && (
               <img src={loader} alt='loader' className='w-[100px] h-[100px] object-contain' />
            )}

            {!isLoading && campaigns.length === 0 && (
               <div className="w-full flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-6xl mb-4">🔍</span>
                  <p className='font-epilogue font-semibold text-[16px] text-[#818183]'>
                     No campaigns found
                  </p>
                  <p className="font-epilogue text-[13px] text-[#4b5264] mt-1">
                     Try adjusting your filters or search terms
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

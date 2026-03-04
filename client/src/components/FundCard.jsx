import React from 'react';
import { thirdweb } from '../assets';
import { daysLeft, calculateBarPercentage } from '../utils';

const CATEGORY_COLORS = {
   Education: 'bg-[#3498db]',
   Health: 'bg-[#e74c3c]',
   Technology: 'bg-[#8c6dfd]',
   Art: 'bg-[#e67e22]',
   Community: 'bg-[#1dc071]',
   Other: 'bg-[#808191]',
};

const FundCard = ({ owner, title, description, target, deadline, amountCollected, image, handleClick, category }) => {
   const remainingDays = daysLeft(deadline);
   const isGoalReached = Number(amountCollected) >= Number(target);
   const isExpired = remainingDays === 0 && !isGoalReached;
   const progress = Math.min(calculateBarPercentage(target, amountCollected), 100);
   const resolvedCategory = category || 'Other';
   const categoryColor = CATEGORY_COLORS[resolvedCategory] || CATEGORY_COLORS.Other;

   return (
      <div
         className='sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer hover:scale-[1.02] transition-transform duration-200 overflow-hidden'
         onClick={handleClick}
      >
         {/* Image + status ribbon */}
         <div className="relative">
            <img src={image} alt={title} className='w-full h-[158px] object-cover' />
            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-[10px] font-epilogue font-semibold ${categoryColor}`}>
               {resolvedCategory}
            </span>
            {isGoalReached && (
               <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#1dc071] text-white text-[10px] font-epilogue font-semibold">
                  🎉 Funded
               </span>
            )}
            {isExpired && !isGoalReached && (
               <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#e74c3c] text-white text-[10px] font-epilogue font-semibold">
                  ⏰ Expired
               </span>
            )}
         </div>

         <div className='flex flex-col p-4'>
            <div className='block'>
               <h3 className='font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate'>{title}</h3>
               <p className='mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate'>{description}</p>
            </div>

            {/* Mini progress bar */}
            <div className="mt-3 mb-[10px]">
               <div className="w-full h-[4px] bg-[#3a3a43] rounded-full">
                  <div
                     className="h-full bg-[#4acd8d] rounded-full transition-all"
                     style={{ width: `${progress}%` }}
                  />
               </div>
               <p className="mt-1 font-epilogue text-[10px] text-[#4acd8d] text-right">{progress}%</p>
            </div>

            <div className='flex justify-between flex-wrap gap-2'>
               <div className='flex flex-col'>
                  <h4 className='font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]'>{amountCollected}</h4>
                  <p className='mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate'>
                     Raised of {target}
                  </p>
               </div>
               <div className='flex flex-col'>
                  <h4 className='font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]'>{remainingDays}</h4>
                  <p className='mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate'>
                     Days Left
                  </p>
               </div>
            </div>

            <div className='flex items-center mt-[16px] gap-[12px]'>
               <div className='w-[30px] h-[30px] rounded-full bg-[#13131a] flex justify-center items-center'>
                  <img src={thirdweb} alt="user" className='w-1/2 h-1/2 object-contain' />
               </div>
               <p className='flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate'>
                  by <span className='text-[#b2b3bd]'>{owner}</span>
               </p>
            </div>
         </div>
      </div>
   );
};

export default FundCard;
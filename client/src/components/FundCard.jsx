import React from 'react';
import { thirdweb } from '../assets';
import { daysLeft, calculateBarPercentage, resolveIpfsUrl } from '../utils';
import { FaCheckCircle, FaClock } from 'react-icons/fa';

const CATEGORY_COLORS = {
   Education: 'from-[#3B82F6] to-[#2563EB]',
   Health: 'from-[#EF4444] to-[#DC2626]',
   Technology: 'from-[#8B5CF6] to-[#7C3AED]',
   Art: 'from-[#F59E0B] to-[#D97706]',
   Community: 'from-[#10B981] to-[#059669]',
   Other: 'from-[#6B7280] to-[#4B5563]',
};

const FundCard = ({ owner, title, description, target, deadline, amountCollected, image, handleClick, category }) => {
   const remainingDays = daysLeft(deadline);
   const isGoalReached = Number(amountCollected) >= Number(target);
   const isExpired = remainingDays === 0 && !isGoalReached;
   const progress = Math.min(calculateBarPercentage(target, amountCollected), 100);
   const resolvedCategory = category || 'Other';
   const categoryGradient = CATEGORY_COLORS[resolvedCategory] || CATEGORY_COLORS.Other;

   return (
      <div
         className='w-full h-full flex flex-col rounded-2xl bg-gradient-to-br from-[#1F2937] to-[#111827] cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 overflow-hidden border border-[#374151] group'
         onClick={handleClick}
      >
         <div className="relative overflow-hidden shrink-0">
            <img
               src={resolveIpfsUrl(image)}
               alt={title}
               className='w-full h-[180px] object-cover group-hover:scale-110 transition-transform duration-500'
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Category badge */}
            <span className={`absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gradient-to-r ${categoryGradient} text-white text-[11px] font-epilogue font-bold shadow-lg backdrop-blur-sm`}>
               {resolvedCategory}
            </span>

            {/* Status badges */}
            {isGoalReached && (
               <span className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-[11px] font-epilogue font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                  <FaCheckCircle size={12} /> Funded
               </span>
            )}
            {isExpired && !isGoalReached && (
               <span className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white text-[11px] font-epilogue font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                  <FaClock size={12} /> Expired
               </span>
            )}
         </div>

         <div className='flex flex-col flex-1 p-5'>
            {/* Title & Description */}
            <div className='mb-4'>
               <h3 className='font-epilogue font-bold text-[17px] text-white leading-[26px] mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] transition-all min-h-[52px]'>
                  {title}
               </h3>
               <p className='font-epilogue font-normal text-[13px] text-[#9CA3AF] leading-[20px] line-clamp-2 min-h-[40px]'>
                  {description}
               </p>
            </div>

            <div className="mt-auto">
               {/* Progress Section */}
               <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                     <span className="font-epilogue text-[12px] font-medium text-[#9CA3AF]">
                        Progress
                     </span>
                     <span className="font-epilogue text-[12px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">
                        {progress}%
                     </span>
                  </div>
                  <div className="w-full h-[6px] bg-[#374151] rounded-full overflow-hidden">
                     <div
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/50"
                        style={{ width: `${progress}%` }}
                     />
                  </div>
               </div>

               {/* Stats Grid */}
               <div className='grid grid-cols-2 gap-3 mb-4 p-3 bg-[#111827] rounded-xl border border-[#374151]'>
                  <div className='flex flex-col'>
                     <h4 className='font-epilogue font-bold text-[15px] text-white leading-[22px] truncate'>
                        {amountCollected}
                     </h4>
                     <p className='mt-1 font-epilogue font-medium text-[11px] leading-[16px] text-[#9CA3AF] truncate'>
                        of {target} raised
                     </p>
                  </div>
                  <div className='flex flex-col text-right'>
                     <h4 className='font-epilogue font-bold text-[15px] text-white leading-[22px]'>
                        {remainingDays}
                     </h4>
                     <p className='mt-1 font-epilogue font-medium text-[11px] leading-[16px] text-[#9CA3AF]'>
                        {remainingDays === 1 ? 'Day Left' : 'Days Left'}
                     </p>
                  </div>
               </div>

               {/* Owner Info */}
               <div className='flex items-center gap-3 pt-3 border-t border-[#374151]'>
                  <div className='w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex justify-center items-center shadow-lg shrink-0'>
                     <img src={thirdweb} alt="user" className='w-[18px] h-[18px] object-contain' />
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className='font-epilogue text-[11px] text-[#9CA3AF] mb-0.5'>
                        Created by
                     </p>
                     <p className='font-epilogue font-semibold text-[13px] text-white truncate'>
                        {owner}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default FundCard;
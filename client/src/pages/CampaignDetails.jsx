import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { useToast } from '../context/ToastContext';
import { CustomButton, CountBox, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';
import {
   FaCircle, FaCheckCircle, FaClock, FaTimesCircle, FaMoneyBillWave,
   FaCrown, FaUndo, FaShareAlt, FaCheck, FaRegFrownOpen, FaHeart
} from 'react-icons/fa';

const QUICK_AMOUNTS = ['0.01', '0.05', '0.1', '0.5'];

const CATEGORY_COLORS = {
   Education: 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB]',
   Health: 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]',
   Technology: 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED]',
   Art: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]',
   Community: 'bg-gradient-to-r from-[#10B981] to-[#059669]',
   Other: 'bg-gradient-to-r from-[#6B7280] to-[#4B5563]',
};

const STATUS_CONFIG = {
   'Active': { color: 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10', icon: <FaCircle className="animate-pulse" /> },
   'Goal Reached': { color: 'text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10', icon: <FaCheckCircle /> },
   'Expired': { color: 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10', icon: <FaClock /> },
   'Cancelled': { color: 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10', icon: <FaTimesCircle /> },
   'Withdrawn': { color: 'text-[#6366F1] border-[#6366F1]/30 bg-[#6366F1]/10', icon: <FaMoneyBillWave /> },
};

// Action Button
const ActionButton = ({ title, onClick, styles, disabled = false, isLoading, icon: IconComponent }) => (
   <button
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-epilogue font-semibold text-[14px] transition-all duration-300 border ${disabled || isLoading
         ? 'opacity-40 cursor-not-allowed border-[#374151] text-[#9CA3AF] bg-[#1F2937]'
         : styles
         }`}
   >
      {isLoading ? (
         <span className="animate-spin text-lg"><FaCircle className="text-transparent border-t-current rounded-full border-2" /></span>
      ) : IconComponent && <IconComponent size={16} />}
      {title}
   </button>
);

// Section Heading
const SectionHeading = ({ children }) => (
   <h4 className="font-epilogue font-bold text-[18px] text-white uppercase tracking-wider">
      {children}
   </h4>
);

// Derive status from already-fetched campaign state
const deriveStatusFromState = (s, remaining) => {
   const STATUS_LABELS = {
      0: 'Active',
      1: 'Goal Reached',
      2: 'Expired',
      3: 'Cancelled',
      4: 'Withdrawn',
   };
   let code = 0;
   if (s.withdrawn) code = 4;
   else if (s.cancelled) code = 3;
   else if (Number(s.amountCollected) >= Number(s.target)) code = 1;
   else if (remaining === 0) code = 2;
   return { code, label: STATUS_LABELS[code] };
};

// Main Component
const CampaignDetails = () => {
   const { state } = useLocation();
   const navigate = useNavigate();
   const {
      donate, getDonations, withdrawFunds, cancelCampaign,
      claimRefund, getCampaignStatus, getDonorContribution,
      contract, address,
   } = useStateContext();
   const { showToast } = useToast();

   const [isLoading, setIsLoading] = useState(false);
   const [actionLoading, setActionLoading] = useState(null);
   const [amount, setAmount] = useState('');
   const [donators, setDonators] = useState([]);
   const [copied, setCopied] = useState(false);
   const [donorContrib, setDonorContrib] = useState('0');

   const remainingDays = daysLeft(state.deadline);
   const progressPct = Math.min(calculateBarPercentage(state.target, state.amountCollected), 100);
   const category = state.category || 'Other';
   const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

   const [campaignStatus, setCampaignStatus] = useState(() => deriveStatusFromState(state, daysLeft(state.deadline)));

   const isOwner = address && address.toLowerCase() === state.owner.toLowerCase();
   const statusLabel = campaignStatus?.label ?? '';
   const isActive = statusLabel === 'Active';
   const isGoalReached = statusLabel === 'Goal Reached';
   const isExpired = statusLabel === 'Expired';
   const isCancelled = statusLabel === 'Cancelled';
   const isWithdrawn = statusLabel === 'Withdrawn';

   const canDonate = isActive;
   const canWithdraw = isOwner && (isGoalReached || isExpired) && !isWithdrawn && !isCancelled && Number(state.amountCollected) > 0;
   const canCancel = isOwner && isActive && !isWithdrawn;
   const canRefund = !isOwner && (isCancelled || isExpired) && Number(donorContrib) > 0;

   const remainingToGoal = Math.max(0, Number(state.target) - Number(state.amountCollected));

   // Fetch data
   const fetchAll = async () => {
      const [donations, status] = await Promise.all([
         getDonations(state.pId),
         getCampaignStatus(state.pId),
      ]);
      setDonators(donations);
      setCampaignStatus(status);

      if (address) {
         const contrib = await getDonorContribution(state.pId, address);
         setDonorContrib(contrib);
      }
   };

   useEffect(() => {
      if (contract) fetchAll();
   }, [contract, address]);

   // Actions
   const withAction = (key, fn, successMsg, errorMsg) => async () => {
      setActionLoading(key);
      try {
         await fn();
         showToast(successMsg, 'success');
         await fetchAll();
      } catch (err) {
         console.error(err);
         const reason = err?.reason || err?.message || errorMsg;
         showToast(`${errorMsg}: ${reason}`, 'error');
      } finally {
         setActionLoading(null);
      }
   };

   const handleDonate = withAction(
      'donate',
      async () => {
         if (!amount || isNaN(amount) || Number(amount) <= 0)
            throw new Error('Please enter a valid ETH amount');

         // Calculate remaining amount needed to reach goal
         const targetAmount = Number(state.target);
         const currentAmount = Number(state.amountCollected);
         const remainingAmount = targetAmount - currentAmount;
         const donationAmount = Number(amount);

         // Check if donation would exceed the goal
         if (donationAmount > remainingAmount) {
            throw new Error(
               `Donation amount (${donationAmount} ETH) exceeds remaining goal amount (${remainingAmount.toFixed(4)} ETH). ` +
               `Please donate ${remainingAmount.toFixed(4)} ETH or less.`
            );
         }

         await donate(state.pId, amount);
         setAmount('');
         navigate('/');
      },
      'Donation successful! Thank you for your support.',
      'Donation failed'
   );

   const handleWithdraw = withAction(
      'withdraw',
      () => withdrawFunds(state.pId),
      'Funds withdrawn successfully!',
      'Withdrawal failed'
   );

   const handleCancel = withAction(
      'cancel',
      () => cancelCampaign(state.pId),
      'Campaign cancelled. Donors can now claim refunds.',
      'Cancel failed'
   );

   const handleRefund = withAction(
      'refund',
      () => claimRefund(state.pId),
      'Refund claimed successfully!',
      'Refund failed'
   );

   const handleShare = async () => {
      try {
         await navigator.clipboard.writeText(window.location.href);
         setCopied(true);
         showToast('Campaign link copied to clipboard!', 'info');
         setTimeout(() => setCopied(false), 2000);
      } catch {
         showToast('Could not copy link.', 'error');
      }
   };

   const formattedDeadline = new Date(state.deadline * 1000).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
   });

   const statusCfg = STATUS_CONFIG[statusLabel] || STATUS_CONFIG['Active'];

   return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
         {(isLoading) && <Loader />}

         {/* Status Banner */}
         {campaignStatus && (
            <div className={`w-full mb-6 px-6 py-4 rounded-xl flex items-center gap-4 border shadow-sm backdrop-blur-md ${statusCfg.color}`}>
               <span className="text-2xl">{statusCfg.icon}</span>
               <div>
                  <p className="font-epilogue font-bold text-[15px] uppercase tracking-wide">
                     Status: {statusLabel}
                  </p>
                  {isCancelled && (
                     <p className="font-epilogue text-[13px] opacity-80 mt-1">
                        This campaign was cancelled by the owner. Donors may claim refunds.
                     </p>
                  )}
                  {isWithdrawn && (
                     <p className="font-epilogue text-[13px] opacity-80 mt-1">
                        The campaign owner has withdrawn the raised funds.
                     </p>
                  )}
                  {isExpired && !isCancelled && !isWithdrawn && (
                     <p className="font-epilogue text-[13px] opacity-80 mt-1">
                        Campaign ended without reaching its goal. Donors may claim refunds.
                     </p>
                  )}
               </div>
            </div>
         )}

         {/* Hero */}
         <div className="w-full flex lg:flex-row flex-col gap-8">
            <div className="flex-1 flex-col">
               <div className="relative overflow-hidden rounded-2xl border border-[#374151]">
                  <img src={state.image} alt={state.title} className="w-full h-[410px] object-cover" />
                  <span className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-white text-[12px] font-epilogue font-bold shadow-lg backdrop-blur-sm ${categoryColor}`}>
                     {category}
                  </span>
               </div>
               {/* Progress bar */}
               <div className="mt-5 bg-[#1F2937]/50 p-4 rounded-xl border border-[#374151]">
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-epilogue text-[13px] font-medium text-[#9CA3AF] uppercase tracking-wide">Progress</span>
                     <span className="font-epilogue text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">{progressPct}%</span>
                  </div>
                  <div className="relative w-full h-[8px] bg-[#374151] rounded-full overflow-hidden">
                     <div
                        className="absolute h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-700 shadow-lg shadow-emerald-500/50"
                        style={{ width: `${progressPct}%` }}
                     />
                  </div>
               </div>
            </div>

            <div className="flex lg:w-[200px] w-full flex-wrap justify-between gap-6">
               <CountBox title="Days Left" value={remainingDays} />
               <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} />
               <CountBox title="Total Backers" value={donators.length} />
            </div>
         </div>

         {/* Body */}
         <div className="mt-10 flex lg:flex-row flex-col gap-8">
            <div className="flex-[2] flex flex-col gap-10">

               {/* Creator */}
               <div>
                  <SectionHeading>Creator</SectionHeading>
                  <div className="mt-4 flex flex-row items-center flex-wrap gap-4 p-4 bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#374151] rounded-2xl">
                     <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#374151] shadow-inner">
                        <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
                     </div>
                     <div>
                        <h4 className="font-epilogue font-semibold text-[15px] text-white break-all">{state.owner}</h4>
                        {isOwner && (
                           <span className="mt-1.5 flex items-center gap-1 w-fit px-3 py-1 rounded-full bg-indigo-500/20 text-[#6366F1] text-[11px] font-epilogue font-bold border border-indigo-500/30">
                              <FaCrown size={12} /> You (Owner)
                           </span>
                        )}
                     </div>
                  </div>
               </div>

               {/* Story */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <SectionHeading>Story</SectionHeading>
                     <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] hover:bg-[#374151] border border-[#374151] rounded-xl text-[#9CA3AF] hover:text-white transition-all duration-200 font-epilogue text-[13px] shadow-sm"
                     >
                        {copied ? <><FaCheck className="text-emerald-500" /> Copied!</> : <><FaShareAlt /> Share</>}
                     </button>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#374151] rounded-2xl">
                     <p className="font-epilogue font-normal text-[15px] text-[#9CA3AF] leading-[28px] text-justify whitespace-pre-wrap">
                        {state.description}
                     </p>
                     <div className="mt-6 pt-4 border-t border-[#374151] flex items-center gap-2">
                        <FaClock className="text-[#6366F1]" />
                        <p className="font-epilogue text-[13px] text-[#9CA3AF]">
                           Campaign ends: <span className="text-white font-medium">{formattedDeadline}</span>
                        </p>
                     </div>
                  </div>
               </div>

               {/* Donators */}
               <div>
                  <SectionHeading>
                     Donators <span className="text-[#9CA3AF] font-normal text-[14px] normal-case">({donators.length})</span>
                  </SectionHeading>
                  <div className="mt-4 flex flex-col gap-3">
                     {donators.length > 0 ? donators.map((item, index) => (
                        <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4 p-4 bg-[#1F2937] border border-[#374151] rounded-xl hover:border-[#6366F1]/50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#374151] flex items-center justify-center text-[12px] font-bold text-[#9CA3AF]">
                                 {index + 1}
                              </div>
                              <p className="font-epilogue font-medium text-[14px] text-[#D1D5DB] break-all truncate max-w-[150px] sm:max-w-[300px]">
                                 {item.donator}
                              </p>
                           </div>
                           <p className="font-epilogue font-bold text-[14px] text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669] whitespace-nowrap">
                              {item.donation} ETH
                           </p>
                        </div>
                     )) : (
                        <div className="flex flex-col items-center justify-center py-12 bg-[#1F2937]/50 border-2 border-dashed border-[#374151] rounded-2xl">
                           <FaRegFrownOpen className="text-4xl text-[#374151] mb-3" />
                           <p className="font-epilogue text-[16px] font-medium text-[#9CA3AF] mb-1">No donators yet.</p>
                           <p className="font-epilogue text-[13px] text-[#6B7280]">Be the first one to support this cause!</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 flex flex-col gap-6">

               {/* Owner Panel */}
               {isOwner && (
                  <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-[#1F2937] to-[#111827] rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                     <div className="flex items-center gap-2 mb-2 pb-3 border-b border-[#374151]">
                        <FaCrown className="text-indigo-500 text-xl" />
                        <h4 className="font-epilogue font-bold text-[16px] text-white">Owner Controls</h4>
                     </div>

                     {/* Withdraw */}
                     <ActionButton
                        title={isWithdrawn ? 'Already Withdrawn' : 'Withdraw Funds'}
                        icon={isWithdrawn ? FaCheckCircle : FaMoneyBillWave}
                        onClick={handleWithdraw}
                        isLoading={actionLoading === 'withdraw'}
                        disabled={!canWithdraw}
                        styles="border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 bg-transparent"
                     />
                     {!canWithdraw && !isWithdrawn && !isCancelled && isActive && (
                        <p className="font-epilogue text-[12px] text-[#9CA3AF] text-center -mt-2">
                           Available after deadline or when goal is reached
                        </p>
                     )}

                     {/* Cancel */}
                     <ActionButton
                        title={isCancelled ? 'Campaign Cancelled' : 'Cancel Campaign'}
                        icon={isCancelled ? FaTimesCircle : FaTimesCircle}
                        onClick={handleCancel}
                        isLoading={actionLoading === 'cancel'}
                        disabled={!canCancel}
                        styles="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 bg-transparent"
                     />
                     {!canCancel && isActive && (
                        <p className="font-epilogue text-[12px] text-[#9CA3AF] text-center -mt-2">
                           Cannot cancel after withdrawal
                        </p>
                     )}
                  </div>
               )}

               {/* Donor Refund Panel */}
               {!isOwner && (isCancelled || isExpired) && (
                  <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-[#1F2937] to-[#111827] rounded-2xl border border-orange-500/30 shadow-lg shadow-orange-500/10">
                     <div className="flex items-center gap-2 mb-2 pb-3 border-b border-[#374151]">
                        <FaUndo className="text-orange-500 text-xl" />
                        <h4 className="font-epilogue font-bold text-[16px] text-white">Claim Refund</h4>
                     </div>
                     {Number(donorContrib) > 0 ? (
                        <>
                           <p className="font-epilogue text-[14px] text-[#9CA3AF]">
                              Your contribution: <span className="text-[#10B981] font-bold">{donorContrib} ETH</span>
                           </p>
                           <ActionButton
                              title="Claim Full Refund"
                              icon={FaUndo}
                              onClick={handleRefund}
                              isLoading={actionLoading === 'refund'}
                              disabled={!canRefund}
                              styles="bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg shadow-orange-500/30 hover:scale-105"
                           />
                        </>
                     ) : (
                        <p className="font-epilogue text-[13px] text-[#9CA3AF] text-center py-4 bg-[#1F2937]/50 rounded-xl">
                           You have no contribution to refund on this campaign.
                        </p>
                     )}
                  </div>
               )}

               {/* Fund Panel */}
               <div className="flex-1">
                  <SectionHeading>Fund</SectionHeading>
                  <div className="mt-4 flex flex-col p-6 bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#374151] rounded-2xl gap-5 shadow-xl">
                     <p className="font-epilogue font-medium text-[16px] text-center text-[#9CA3AF]">
                        Support this campaign
                     </p>

                     {/* Show remaining amount if campaign is active */}
                     {canDonate && remainingToGoal > 0 && (
                        <div className="p-3 bg-[#1F2937]/70 rounded-xl border border-[#6366F1]/30">
                           <p className="font-epilogue text-[12px] text-[#9CA3AF] text-center">
                              Remaining to goal: <span className="text-[#10B981] font-bold">{remainingToGoal.toFixed(4)} ETH</span>
                           </p>
                        </div>
                     )}

                     {/* Quick-select amounts */}
                     <div>
                        <p className="font-epilogue text-[12px] text-[#9CA3AF] uppercase tracking-wide mb-3">Quick select:</p>
                        <div className="grid grid-cols-4 gap-2">
                           {QUICK_AMOUNTS.map((preset) => (
                              <button
                                 key={preset}
                                 onClick={() => canDonate && setAmount(preset)}
                                 disabled={!canDonate}
                                 className={`py-2 px-1 rounded-xl font-epilogue text-[13px] font-bold transition-all duration-300 border ${!canDonate
                                    ? 'opacity-30 cursor-not-allowed border-[#374151] text-[#9CA3AF] bg-[#1F2937]'
                                    : amount === preset
                                       ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] border-transparent text-white shadow-md'
                                       : 'bg-[#1F2937] border-[#374151] text-[#9CA3AF] hover:border-[#6366F1] hover:text-white'
                                    }`}
                              >
                                 {preset}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="relative">
                        <input
                           type="number"
                           placeholder="0.1"
                           step="0.01"
                           disabled={!canDonate}
                           className="w-full py-4 pl-6 pr-16 outline-none border border-[#374151] bg-[#1F2937]/50 font-epilogue font-bold text-white text-[20px] placeholder:text-[#9CA3AF]/50 rounded-xl focus:border-[#6366F1] focus:bg-[#1F2937] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-300 disabled:opacity-40"
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-epilogue font-bold text-[#9CA3AF]">
                           ETH
                        </span>
                     </div>

                     <CustomButton
                        btnType="button"
                        title={
                           actionLoading === 'donate' ? 'Processing...'
                              : !campaignStatus ? 'Loading...'
                                 : !canDonate ? statusLabel
                                    : 'Fund Campaign'
                        }
                        styles={`w-full py-4 transition-all duration-300 rounded-xl ${canDonate
                           ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-lg shadow-emerald-500/30 hover:scale-105 font-bold text-[16px]'
                           : 'bg-[#374151] text-[#9CA3AF] cursor-not-allowed border-none'
                           }`}
                        handleClick={canDonate ? handleDonate : null}
                     />

                     {canDonate && (
                        <p className="font-epilogue text-[12px] text-[#9CA3AF] text-center px-4 bg-[#1F2937]/50 py-3 rounded-xl border border-[#374151]/50">
                           Funds are held securely in the smart contract until the owner withdraws.
                        </p>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CampaignDetails;
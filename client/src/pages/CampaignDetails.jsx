import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { useToast } from '../context/ToastContext';
import { CustomButton, CountBox, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const QUICK_AMOUNTS = ['0.01', '0.05', '0.1', '0.5'];

const CATEGORY_COLORS = {
   Education: 'bg-[#3498db]',
   Health: 'bg-[#e74c3c]',
   Technology: 'bg-[#8c6dfd]',
   Art: 'bg-[#e67e22]',
   Community: 'bg-[#1dc071]',
   Other: 'bg-[#808191]',
};

const STATUS_CONFIG = {
   'Active': { color: 'text-[#4acd8d]  border-[#4acd8d]  bg-[#4acd8d]/10', icon: '🟢' },
   'Goal Reached': { color: 'text-[#1dc071]  border-[#1dc071]  bg-[#1dc071]/10', icon: '🎉' },
   'Expired': { color: 'text-[#e67e22]  border-[#e67e22]  bg-[#e67e22]/10', icon: '⏰' },
   'Cancelled': { color: 'text-[#e74c3c]  border-[#e74c3c]  bg-[#e74c3c]/10', icon: '❌' },
   'Withdrawn': { color: 'text-[#8c6dfd]  border-[#8c6dfd]  bg-[#8c6dfd]/10', icon: '💰' },
};

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionButton = ({ title, onClick, styles, disabled = false, isLoading }) => (
   <button
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-[10px] font-epilogue font-semibold text-[14px] transition-all duration-200 border ${disabled || isLoading
         ? 'opacity-40 cursor-not-allowed border-[#3a3a43] text-[#808191]'
         : styles
         }`}
   >
      {isLoading ? (
         <span className="animate-spin text-lg">⏳</span>
      ) : null}
      {title}
   </button>
);

// ─── Section Heading ──────────────────────────────────────────────────────────
const SectionHeading = ({ children }) => (
   <h4 className="font-epilogue font-bold text-[18px] text-white uppercase tracking-wide">
      {children}
   </h4>
);

// ─── Derive status from already-fetched campaign state (avoids null flash) ───
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

// ─── Main Component ───────────────────────────────────────────────────────────
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
   const [actionLoading, setActionLoading] = useState(null); // 'withdraw'|'cancel'|'refund'|'donate'
   const [amount, setAmount] = useState('');
   const [donators, setDonators] = useState([]);
   const [copied, setCopied] = useState(false);
   const [donorContrib, setDonorContrib] = useState('0');   // ETH string

   const remainingDays = daysLeft(state.deadline);
   const progressPct = Math.min(calculateBarPercentage(state.target, state.amountCollected), 100);
   const category = state.category || 'Other';
   const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

   // Seed status from already-known fields so nothing flashes disabled
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

   // ─── Fetch data ─────────────────────────────────────────────────────────────
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

   // ─── Actions ──────────────────────────────────────────────────────────────
   const withAction = (key, fn, successMsg, errorMsg) => async () => {
      setActionLoading(key);
      try {
         await fn();
         showToast(successMsg, 'success');
         await fetchAll(); // refresh status
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
         await donate(state.pId, amount);
         setAmount('');
         navigate('/');
      },
      '🎉 Donation successful! Thank you for your support.',
      'Donation failed'
   );

   const handleWithdraw = withAction(
      'withdraw',
      () => withdrawFunds(state.pId),
      '💰 Funds withdrawn successfully!',
      'Withdrawal failed'
   );

   const handleCancel = withAction(
      'cancel',
      () => cancelCampaign(state.pId),
      '❌ Campaign cancelled. Donors can now claim refunds.',
      'Cancel failed'
   );

   const handleRefund = withAction(
      'refund',
      () => claimRefund(state.pId),
      '💸 Refund claimed successfully!',
      'Refund failed'
   );

   const handleShare = async () => {
      try {
         await navigator.clipboard.writeText(window.location.href);
         setCopied(true);
         showToast('Campaign link copied to clipboard! 🔗', 'info');
         setTimeout(() => setCopied(false), 2000);
      } catch {
         showToast('Could not copy link.', 'error');
      }
   };

   const formattedDeadline = new Date(state.deadline * 1000).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
   });

   const statusCfg = STATUS_CONFIG[statusLabel] || STATUS_CONFIG['Active'];

   // ─── Render ───────────────────────────────────────────────────────────────
   return (
      <div>
         {(isLoading) && <Loader />}

         {/* ── Status Banner ── */}
         {campaignStatus && (
            <div className={`w-full mb-5 px-5 py-3 rounded-[10px] flex items-center gap-3 border ${statusCfg.color}`}>
               <span className="text-2xl">{statusCfg.icon}</span>
               <div>
                  <p className="font-epilogue font-bold text-[15px]">
                     Status: {statusLabel}
                  </p>
                  {isCancelled && (
                     <p className="font-epilogue text-[13px] opacity-80">
                        This campaign was cancelled by the owner. Donors may claim refunds.
                     </p>
                  )}
                  {isWithdrawn && (
                     <p className="font-epilogue text-[13px] opacity-80">
                        The campaign owner has withdrawn the raised funds.
                     </p>
                  )}
                  {isExpired && !isCancelled && !isWithdrawn && (
                     <p className="font-epilogue text-[13px] opacity-80">
                        Campaign ended without reaching its goal. Donors may claim refunds.
                     </p>
                  )}
               </div>
            </div>
         )}

         {/* ── Hero ── */}
         <div className="w-full flex md:flex-row flex-col mt-2 gap-[30px]">
            <div className="flex-1 flex-col">
               <div className="relative">
                  <img src={state.image} alt={state.title} className="w-full h-[410px] object-cover rounded-xl" />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-[11px] font-epilogue font-semibold ${categoryColor}`}>
                     {category}
                  </span>
               </div>
               {/* Progress bar */}
               <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                     <span className="font-epilogue text-[12px] text-[#808191]">Progress</span>
                     <span className="font-epilogue text-[12px] font-semibold text-[#4acd8d]">{progressPct}%</span>
                  </div>
                  <div className="relative w-full h-[8px] bg-[#3a3a43] rounded-full">
                     <div
                        className="absolute h-full bg-[#4acd8d] rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                     />
                  </div>
               </div>
            </div>

            <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
               <CountBox title="Days Left" value={remainingDays} />
               <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} />
               <CountBox title="Total Backers" value={donators.length} />
            </div>
         </div>

         {/* ── Body ── */}
         <div className="mt-[16px] flex lg:flex-row flex-col gap-5">
            <div className="flex-[2] flex flex-col gap-[40px]">

               {/* Creator */}
               <div>
                  <SectionHeading>Creator</SectionHeading>
                  <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
                     <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32]">
                        <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
                     </div>
                     <div>
                        <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{state.owner}</h4>
                        {isOwner && (
                           <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-[#8c6dfd]/20 text-[#8c6dfd] text-[11px] font-epilogue font-semibold">
                              You (Owner)
                           </span>
                        )}
                     </div>
                  </div>
               </div>

               {/* Story */}
               <div>
                  <div className="flex items-center justify-between mb-[20px]">
                     <SectionHeading>Story</SectionHeading>
                     <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2c2f32] hover:bg-[#3a3a43] rounded-[10px] text-[#808191] hover:text-white transition-all duration-200 font-epilogue text-[13px]"
                     >
                        {copied ? '✅ Copied!' : '🔗 Share'}
                     </button>
                  </div>
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                     {state.description}
                  </p>
                  <p className="mt-3 font-epilogue text-[13px] text-[#4b5264]">
                     📅 Campaign ends: <span className="text-[#808191]">{formattedDeadline}</span>
                  </p>
               </div>

               {/* Donators */}
               <div>
                  <SectionHeading>
                     Donators{' '}
                     <span className="text-[#808191] font-normal text-[14px] normal-case">({donators.length})</span>
                  </SectionHeading>
                  <div className="mt-[20px] flex flex-col gap-3">
                     {donators.length > 0 ? donators.map((item, index) => (
                        <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4 p-3 bg-[#1c1c24] rounded-[10px]">
                           <p className="font-epilogue font-normal text-[14px] text-[#b2b3bd] break-all">
                              {index + 1}. {item.donator}
                           </p>
                           <p className="font-epilogue font-semibold text-[14px] text-[#4acd8d] whitespace-nowrap">
                              {item.donation} ETH
                           </p>
                        </div>
                     )) : (
                        <div className="flex flex-col items-center justify-center py-10">
                           <span className="text-5xl mb-3">💸</span>
                           <p className="font-epilogue text-[16px] text-[#808191]">No donators yet.</p>
                           <p className="font-epilogue text-[13px] text-[#4b5264]">Be the first one to donate!</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* ── Right Column ── */}
            <div className="flex-1 flex flex-col gap-5">

               {/* ── Owner Panel ── */}
               {isOwner && (
                  <div className="flex flex-col gap-3 p-5 bg-[#1c1c24] rounded-[10px] border border-[#8c6dfd]/30">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">👑</span>
                        <h4 className="font-epilogue font-bold text-[16px] text-white">Owner Controls</h4>
                     </div>

                     {/* Withdraw */}
                     <ActionButton
                        title={isWithdrawn ? '✅ Already Withdrawn' : '💰 Withdraw Funds'}
                        onClick={handleWithdraw}
                        isLoading={actionLoading === 'withdraw'}
                        disabled={!canWithdraw}
                        styles="border-[#1dc071] text-[#1dc071] hover:bg-[#1dc071]/10"
                     />
                     {!canWithdraw && !isWithdrawn && !isCancelled && isActive && (
                        <p className="font-epilogue text-[11px] text-[#4b5264] text-center -mt-1">
                           Available after deadline or when goal is reached
                        </p>
                     )}

                     {/* Cancel */}
                     <ActionButton
                        title={isCancelled ? '❌ Campaign Cancelled' : '🚫 Cancel Campaign'}
                        onClick={handleCancel}
                        isLoading={actionLoading === 'cancel'}
                        disabled={!canCancel}
                        styles="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c]/10"
                     />
                     {!canCancel && isActive && (
                        <p className="font-epilogue text-[11px] text-[#4b5264] text-center -mt-1">
                           Cannot cancel after withdrawal
                        </p>
                     )}
                  </div>
               )}

               {/* ── Donor Refund Panel ── */}
               {!isOwner && (isCancelled || isExpired) && (
                  <div className="flex flex-col gap-3 p-5 bg-[#1c1c24] rounded-[10px] border border-[#e67e22]/30">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">💸</span>
                        <h4 className="font-epilogue font-bold text-[16px] text-white">Claim Refund</h4>
                     </div>
                     {Number(donorContrib) > 0 ? (
                        <>
                           <p className="font-epilogue text-[13px] text-[#808191]">
                              Your contribution: <span className="text-[#4acd8d] font-semibold">{donorContrib} ETH</span>
                           </p>
                           <ActionButton
                              title="💸 Claim Full Refund"
                              onClick={handleRefund}
                              isLoading={actionLoading === 'refund'}
                              disabled={!canRefund}
                              styles="border-[#e67e22] text-[#e67e22] hover:bg-[#e67e22]/10"
                           />
                        </>
                     ) : (
                        <p className="font-epilogue text-[13px] text-[#808191] text-center py-2">
                           You have no contribution to refund on this campaign.
                        </p>
                     )}
                  </div>
               )}

               {/* ── Fund Panel ── */}
               <div className="flex-1">
                  <h4 className="font-epilogue font-bold text-[18px] text-white uppercase">Fund</h4>
                  <div className="mt-[20px] flex flex-col p-5 bg-[#1c1c24] rounded-[10px] gap-4">
                     <p className="font-epilogue font-medium text-[18px] leading-[30px] text-center text-[#808191]">
                        Fund the Campaign
                     </p>

                     {/* Quick-select amounts */}
                     <div>
                        <p className="font-epilogue text-[12px] text-[#4b5264] mb-2">Quick select:</p>
                        <div className="grid grid-cols-4 gap-2">
                           {QUICK_AMOUNTS.map((preset) => (
                              <button
                                 key={preset}
                                 onClick={() => canDonate && setAmount(preset)}
                                 disabled={!canDonate}
                                 className={`py-2 px-1 rounded-[8px] font-epilogue text-[12px] font-semibold transition-all duration-200 border ${!canDonate
                                    ? 'opacity-30 cursor-not-allowed border-[#3a3a43] text-[#4b5264]'
                                    : amount === preset
                                       ? 'bg-[#8c6dfd] border-[#8c6dfd] text-white'
                                       : 'bg-transparent border-[#3a3a43] text-[#808191] hover:border-[#8c6dfd] hover:text-white'
                                    }`}
                              >
                                 {preset}
                              </button>
                           ))}
                        </div>
                     </div>

                     <input
                        type="number"
                        placeholder="ETH 0.1"
                        step="0.01"
                        disabled={!canDonate}
                        className="w-full py-[10px] sm:px-[20px] px-[15px] border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px] focus:outline-none focus:border-[#8c6dfd] transition-colors disabled:opacity-30"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                     />

                     <CustomButton
                        btnType="button"
                        title={
                           actionLoading === 'donate' ? '⏳ Processing...'
                              : !campaignStatus ? 'Loading...'
                                 : !canDonate ? `${statusCfg.icon} ${statusLabel}`
                                    : 'Fund Campaign'
                        }
                        styles={`w-full transition-colors ${canDonate
                           ? 'bg-[#8c6dfd] hover:bg-[#7b5fdc]'
                           : 'bg-[#3a3a43] cursor-not-allowed'
                           }`}
                        handleClick={canDonate ? handleDonate : null}
                     />

                     {canDonate && (
                        <p className="font-epilogue text-[11px] text-[#4b5264] text-center">
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
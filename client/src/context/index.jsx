import React, { useContext, createContext, useState } from "react";
import {
   useAddress,
   useContract,
   useContractWrite,
   useMetamask,
   useDisconnect
} from "@thirdweb-dev/react";
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
   const { contract } = useContract(
      "0xa2b9860CF6071Cba3E3DA90F700a0cdaC558732D"
   );

   const { mutateAsync: createCampaign } = useContractWrite(
      contract,
      "createCampaign"
   );

   const address = useAddress();
   const connect = useMetamask();
   const disconnect = useDisconnect();

   const [search, setSearch] = useState('');

   // ─── Campaign Status Enum ──────────────────────────────────────────────────
   // Mirrors the Solidity enum: Active=0, GoalReached=1, Expired=2, Cancelled=3, Withdrawn=4
   const STATUS_LABELS = {
      0: 'Active',
      1: 'Goal Reached',
      2: 'Expired',
      3: 'Cancelled',
      4: 'Withdrawn',
   };

   // ─── Create Campaign ───────────────────────────────────────────────────────
   const publishCampaign = async (form) => {
      if (!address) throw new Error("Wallet not connected");
      try {
         const data = await createCampaign({
            args: [
               address,
               form.title,
               form.description,
               form.category || 'Other',
               ethers.utils.parseEther(form.target.toString()),
               Math.floor(new Date(form.deadline).getTime() / 1000),
               form.image,
            ],
         });
         console.log("Campaign created:", data);
         return data;
      } catch (error) {
         console.error("Contract call failure:", error);
         throw error;
      }
   };

   // ─── Read Campaigns ────────────────────────────────────────────────────────
   const getCampaigns = async () => {
      const campaigns = await contract.call("getCampaigns");
      return campaigns.map((campaign, i) => ({
         owner: campaign.owner,
         title: campaign.title,
         description: campaign.description,
         category: campaign.category || 'Other',
         target: ethers.utils.formatEther(campaign.target.toString()),
         deadline: campaign.deadline.toNumber(),
         amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
         image: campaign.image,
         cancelled: campaign.cancelled,
         withdrawn: campaign.withdrawn,
         pId: i,
      }));
   };

   const getUserCampaigns = async () => {
      const allCampaigns = await getCampaigns();
      return allCampaigns.filter((campaign) => campaign.owner === address);
   };

   // ─── Donate ───────────────────────────────────────────────────────────────
   const donate = async (pId, amount) => {
      return await contract.call(
         "donateToCampaign",
         [pId],
         { value: ethers.utils.parseEther(amount) }
      );
   };

   // ─── Withdraw Funds ───────────────────────────────────────────────────────
   const withdrawFunds = async (pId) => {
      return await contract.call("withdrawFunds", [pId]);
   };

   // ─── Cancel Campaign ──────────────────────────────────────────────────────
   const cancelCampaign = async (pId) => {
      return await contract.call("cancelCampaign", [pId]);
   };

   // ─── Claim Refund ─────────────────────────────────────────────────────────
   const claimRefund = async (pId) => {
      return await contract.call("claimRefund", [pId]);
   };

   // ─── Get Campaign Status ──────────────────────────────────────────────────
   const getCampaignStatus = async (pId) => {
      const statusNum = await contract.call("getCampaignStatus", [pId]);
      // Contract returns a uint8 which ethers wraps as BigNumber — convert to plain int
      const code = statusNum?.toNumber?.() ?? Number(statusNum);
      return {
         code,
         label: STATUS_LABELS[code] ?? 'Unknown',
      };
   };

   // ─── Get Donor Contribution ───────────────────────────────────────────────
   const getDonorContribution = async (pId, donorAddress) => {
      const wei = await contract.call("getDonorContribution", [pId, donorAddress]);
      return ethers.utils.formatEther(wei.toString());
   };

   // ─── Get Donations list ───────────────────────────────────────────────────
   const getDonations = async (pId) => {
      const donations = await contract.call("getDonators", [pId]);
      const count = donations[0].length;
      const parsed = [];
      for (let i = 0; i < count; i++) {
         parsed.push({
            donator: donations[0][i],
            donation: ethers.utils.formatEther(donations[1][i].toString()),
         });
      }
      return parsed;
   };

   return (
      <StateContext.Provider
         value={{
            address,
            contract,
            connect,
            disconnect,
            createCampaign: publishCampaign,
            getCampaigns,
            getUserCampaigns,
            donate,
            getDonations,
            withdrawFunds,
            cancelCampaign,
            claimRefund,
            getCampaignStatus,
            getDonorContribution,
            search,
            setSearch,
         }}
      >
         {children}
      </StateContext.Provider>
   );
};

export const useStateContext = () => useContext(StateContext);
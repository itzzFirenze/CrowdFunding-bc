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
      "0xdaFFF163FA93cC389f4584B1D5fB138D4988B4D3"
   );

   const { mutateAsync: createCampaign } = useContractWrite(
      contract,
      "createCampaign"
   );

   const address = useAddress();
   const connect = useMetamask();
   const disconnect = useDisconnect();

   const [search, setSearch] = useState('');

   const publishCampaign = async (form) => {
      if (!address) {
         throw new Error("Wallet not connected");
      }

      try {
         const data = await createCampaign({
            args: [
               address, // owner
               form.title, // string
               form.description, // string
               ethers.utils.parseEther(form.target.toString()), // uint256
               Math.floor(new Date(form.deadline).getTime() / 1000), // seconds
               form.image, // string
            ],
         });

         console.log("Contract call success:", data);
         return data;
      } catch (error) {
         console.error("Contract call failure:", error);
         throw error;
      }
   };

   const getCampaigns = async () => {
      const campaigns = await contract.call("getCampaigns");

      const parsedCampaigns = campaigns.map((campaign, i) => ({
         owner: campaign.owner,
         title: campaign.title,
         description: campaign.description,
         target: ethers.utils.formatEther(campaign.target.toString()),
         deadline: campaign.deadline.toNumber(),
         amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
         image: campaign.image,
         pId: i
      }));
      return parsedCampaigns;
   }

   const getUserCampaigns = async () => {
      const allCampaigns = await getCampaigns();
      const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

      return filteredCampaigns;
   }

   const donate = async (pId, amount) => {
      const data = await contract.call("donateToCampaign", [pId], { value: ethers.utils.parseEther(amount) });

      return data;
   }

   const getDonations = async (pId) => {
      const donations = await contract.call("getDonators", [pId]);
      const numberofDonations = donations[0].length;

      const parsedDonations = [];
      for (let i = 0; i < numberofDonations; i++) {
         parsedDonations.push({
            donator: donations[0][i],
            donation: ethers.utils.formatEther(donations[1][i].toString())
         });
      }

      return parsedDonations;
   }

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
            search,
            setSearch
         }}
      >
         {children}
      </StateContext.Provider>
   );
};

export const useStateContext = () => useContext(StateContext);
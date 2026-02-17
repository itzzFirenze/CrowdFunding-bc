import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import DisplayCampaigns from '../components/DisplayCampaigns';

const Home = () => {
   const [isLoading, setIsLoading] = useState(false);
   const [campaigns, setCampaigns] = useState([]);

   const { address, contract, getCampaigns, search } = useStateContext();

   const fetchCampaigns = async () => {
      setIsLoading(true);
      const data = await getCampaigns();
      setCampaigns(data);
      setIsLoading(false);
   }

   useEffect(() => {
      if (contract) {
         fetchCampaigns();
      }
   }, [address, contract]);

   const filteredCampaigns = campaigns.filter((campaign) =>
      campaign.title.toLowerCase().includes(search.toLowerCase())
   );

   return (
      <DisplayCampaigns
         title="All Campaigns"
         isLoading={isLoading}
         // 3. Pass filtered campaigns instead of raw campaigns
         campaigns={search ? filteredCampaigns : campaigns}
      />
   )
}

export default Home;
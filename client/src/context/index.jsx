import React, { useContext, createContext } from "react";
import {
  useAddress,
  useContract,
  useContractWrite,
  useMetamask,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(
    "0x6321A8cAF16f7e9fE5f98ed89f80B843c1003320"
  );

  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    "createCampaign"
  );

  const address = useAddress();
  const connect = useMetamask();

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

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);

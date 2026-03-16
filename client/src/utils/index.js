export const daysLeft = (deadline) => {
   const difference = deadline * 1000 - Date.now();

   const remainingDays = difference / (1000 * 60 * 60 * 24);

   return Math.max(Math.ceil(remainingDays), 0);
};



export const calculateBarPercentage = (goal, raisedAmount) => {
   const percentage = Math.round((raisedAmount * 100) / goal);

   return percentage;
};

export const checkIfImage = (url, callback) => {
   const img = new Image();
   img.src = url;

   if (img.complete) callback(true);

   img.onload = () => callback(true);
   img.onerror = () => callback(false);
};

/**
 * Resolve an IPFS CID or ipfs:// URI to a public Pinata gateway URL.
 * Plain https:// URLs are returned unchanged (backwards-compatible).
 * @param {string} urlOrCid
 * @returns {string}
 */
export const resolveIpfsUrl = (urlOrCid) => {
  if (!urlOrCid) return '';
  if (urlOrCid.startsWith('ipfs://')) {
    const cid = urlOrCid.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  // Already a plain CID without prefix (fallback)
  if (!urlOrCid.startsWith('http') && /^[A-Za-z0-9]{46,}$/.test(urlOrCid)) {
    return `https://gateway.pinata.cloud/ipfs/${urlOrCid}`;
  }
  return urlOrCid;
};

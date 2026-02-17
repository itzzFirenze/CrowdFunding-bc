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

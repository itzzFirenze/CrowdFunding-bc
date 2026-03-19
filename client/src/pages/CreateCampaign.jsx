import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CustomButton, FormField, Loader, IpfsImageUpload } from '../components';

const CATEGORIES = ['Education', 'Health', 'Technology', 'Art', 'Community', 'Other'];

const CreateCampaign = () => {
   const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
   const { createCampaign } = useStateContext();
   const [form, setForm] = useState({
      name: '',
      title: '',
      description: '',
      target: '',
      deadline: '',
      image: '',
      category: 'Other',
   });

   const handleFormFieldChange = (fieldName, e) => {
      setForm({ ...form, [fieldName]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.image) {
         alert('Please upload a campaign image before submitting.');
         return;
      }
      setIsLoading(true);
      try {
         await createCampaign({ ...form });
         navigate('/');
      } catch (err) {
         console.error(err);
         alert('Failed to create campaign. Please try again.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className='bg-gradient-to-br from-[#1F2937]/80 to-[#111827]/80 border border-[#374151] flex justify-center items-center flex-col rounded-2xl sm:p-10 p-4 shadow-xl backdrop-blur-sm max-w-[1440px] mx-auto'>
         {isLoading && <Loader />}

         {/* Header Banner */}
         <div className='flex justify-center items-center p-[16px] sm:min-w-[380px] bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl shadow-lg shadow-indigo-500/30 mt-2 mb-[40px]'>
            <h1 className='font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white'>
               Start a Campaign
            </h1>
         </div>

         <form onSubmit={handleSubmit} className='w-full flex flex-col gap-[30px]'>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-[40px]'>
               <FormField
                  labelName="Your Name *"
                  placeholder="John Doe"
                  inputType="text"
                  value={form.name}
                  handleChange={(e) => handleFormFieldChange('name', e)}
               />
               <FormField
                  labelName="Campaign Title *"
                  placeholder="Write a title"
                  inputType="text"
                  value={form.title}
                  handleChange={(e) => handleFormFieldChange('title', e)}
               />
            </div>

            <FormField
               labelName="Story *"
               placeholder="Write your campaign story..."
               isTextArea
               value={form.description}
               handleChange={(e) => handleFormFieldChange('description', e)}
            />

            {/* Category dropdown */}
            <div className='flex flex-col flex-1 w-full'>
               <label className='font-epilogue font-medium text-[13px] leading-[22px] text-[#9CA3AF] mb-[10px] uppercase tracking-wide'>
                  Category *
               </label>
               <select
                  value={form.category}
                  onChange={(e) => handleFormFieldChange('category', e)}
                  className='py-[15px] sm:px-[25px] px-[15px] outline-none border border-[#374151] bg-[#1F2937]/50 font-epilogue text-white text-[14px] placeholder:text-[#9CA3AF] rounded-xl focus:border-[#6366F1] focus:bg-[#1F2937] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-300 w-full cursor-pointer'
               >
                  {CATEGORIES.map((cat) => (
                     <option key={cat} value={cat} className="bg-[#1F2937] text-white py-2">
                        {cat}
                     </option>
                  ))}
               </select>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-[40px]'>
               <FormField
                  labelName="Goal *"
                  placeholder="ETH 0.50"
                  inputType="text"
                  value={form.target}
                  handleChange={(e) => handleFormFieldChange('target', e)}
               />
               <FormField
                  labelName="End Date *"
                  placeholder="End Date"
                  inputType="date"
                  value={form.deadline}
                  handleChange={(e) => handleFormFieldChange('deadline', e)}
               />
            </div>

            {/* Campaign Image — IPFS Upload */}
            <div className='flex flex-col flex-1 w-full'>
               <label className='font-epilogue font-medium text-[13px] leading-[22px] text-[#9CA3AF] mb-[10px] uppercase tracking-wide'>
                  Campaign Image *&nbsp;
               </label>
               <IpfsImageUpload
                  value={form.image}
                  onChange={(cid) => setForm({ ...form, image: cid })}
               />
            </div>

            {/* Submit Button */}
            <div className='flex justify-center items-center mt-[40px] mb-4'>
               <CustomButton
                  btnType="submit"
                  title="Submit New Campaign"
                  styles="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all w-full sm:w-auto px-10 py-4 text-[16px]"
               />
            </div>
         </form>
      </div>
   );
};

export default CreateCampaign;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';
import { checkIfImage } from '../utils';

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
      checkIfImage(form.image, async (exists) => {
         if (exists) {
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
         } else {
            alert('Please provide a valid image URL.');
            setForm({ ...form, image: '' });
         }
      });
   };

   return (
      <div className='bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4'>
         {isLoading && <Loader />}

         <div className='flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]'>
            <h1 className='font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white'>
               Start a Campaign
            </h1>
         </div>

         <form onSubmit={handleSubmit} className='w-full mt-[65px] flex flex-col gap-[30px]'>
            <div className='flex flex-wrap gap-[40px]'>
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
               <label className='font-epilogue font-medium text-[14px] leading-[22px] text-[#808191] mb-[10px]'>
                  Category *
               </label>
               <select
                  value={form.category}
                  onChange={(e) => handleFormFieldChange('category', e)}
                  className='py-[15px] sm:px-[25px] px-[15px] border-[1px] border-[#3a3a43] bg-[#1c1c24] font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px] focus:outline-none focus:border-[#8c6dfd] transition-colors w-full sm:w-[48%] cursor-pointer'
               >
                  {CATEGORIES.map((cat) => (
                     <option key={cat} value={cat} className="bg-[#1c1c24] text-white">
                        {cat}
                     </option>
                  ))}
               </select>
            </div>

            <div className='flex flex-wrap gap-[40px]'>
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

            <FormField
               labelName="Campaign Image *"
               placeholder="Place image URL of your campaign"
               inputType="url"
               value={form.image}
               handleChange={(e) => handleFormFieldChange('image', e)}
            />

            <div className='flex justify-center items-center mt-[40px]'>
               <CustomButton
                  btnType="submit"
                  title="Submit New Campaign"
                  styles="bg-[#1dc071]"
               />
            </div>
         </form>
      </div>
   );
};

export default CreateCampaign;
import React from 'react'

const FormField = ({ labelName, placeholder, inputType, isTextArea, value, handleChange }) => {
   // Shared styles for both input and textarea
   const baseInputStyles = "py-[15px] sm:px-[25px] px-[15px] outline-none border border-[#374151] bg-[#1F2937]/50 font-epilogue text-white text-[14px] placeholder:text-[#9CA3AF] rounded-xl focus:border-[#6366F1] focus:bg-[#1F2937] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-300 sm:min-w-[300px]";

   return (
      <label className='flex-1 w-full flex flex-col'>
         {labelName && (
            <span className='font-epilogue font-medium text-[13px] leading-[22px] text-[#9CA3AF] mb-[10px] uppercase tracking-wide'>
               {labelName}
            </span>
         )}
         {isTextArea ? (
            <textarea
               required
               value={value}
               onChange={handleChange}
               rows={8}
               placeholder={placeholder}
               className={baseInputStyles}
            />
         ) : (
            <input
               required
               value={value}
               onChange={handleChange}
               type={inputType}
               step='0.1'
               placeholder={placeholder}
               className={baseInputStyles}
            />
         )}
      </label>
   )
}

export default FormField;
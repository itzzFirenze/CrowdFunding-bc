import React from 'react'
import { loader } from '../assets';

const Loader = () => {
   return (
      <div className='fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-center items-center flex-col'>
         <div className="bg-[#1F2937] border border-[#374151] p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-[320px]">
            <div className="relative w-[100px] h-[100px] mb-6">
               {/* Optional subtle glow behind the loader */}
               <div className="absolute inset-0 bg-indigo-500 blur-[30px] opacity-30 rounded-full animate-pulse" />
               <img src={loader} alt="Loader" className='relative w-full h-full object-contain' />
            </div>

            <h2 className='font-epilogue font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-[22px] mb-2'>
               Processing
            </h2>
            <p className='font-epilogue font-normal text-center text-[#9CA3AF] text-[14px] leading-relaxed'>
               Transaction is in progress.<br />Please do not close this window.
            </p>
         </div>
      </div>
   )
}

export default Loader;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logo, sun } from '../assets';
import { navlinks } from '../constants';
import { useStateContext } from '../context';

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
   <div 
      className={`w-[48px] h-[48px] rounded-xl flex justify-center items-center transition-all duration-300 ${!disabled && 'cursor-pointer hover:scale-105'} ${
         isActive && isActive === name 
         ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-lg shadow-indigo-500/30' 
         : 'bg-transparent hover:bg-[#374151]'
      } ${styles}`} 
      onClick={handleClick}
   >
      {!isActive ? (
         <img src={imgUrl} alt="fund_logo" className='w-1/2 h-1/2 opacity-70' />
      ) : (
         <img 
            src={imgUrl} 
            alt="fund_logo" 
            className={`w-1/2 h-1/2 transition-all ${isActive !== name ? 'grayscale opacity-70' : 'brightness-200'}`} 
         />
      )}
   </div>
)

const Sidebar = () => {
   const navigate = useNavigate();
   const { disconnect } = useStateContext();

   const [isActive, setIsActive] = useState('dashboard');
   
   return (
      <div className='flex justify-between items-center flex-col sticky top-5 h-[93vh]'>
         <Link to="/">
            <div className="w-[52px] h-[52px] rounded-xl bg-[#1F2937] border border-[#374151] flex justify-center items-center hover:border-[#6366F1] transition-all hover:shadow-lg hover:shadow-indigo-500/20 group">
               <img src={logo} alt="logo" className="w-[60%] h-[60%] group-hover:scale-110 transition-transform" />
            </div>
         </Link>

         <div className='flex-1 flex flex-col justify-between items-center bg-[#1F2937] border border-[#374151] rounded-[24px] w-[76px] py-4 mt-12 shadow-xl'>
            <div className='flex flex-col justify-center items-center gap-4'>
               {navlinks.map((link) => (
                  <Icon
                     key={link.name}
                     {...link}
                     isActive={isActive}
                     handleClick={() => {
                        if (link.name === "logout") {
                           disconnect();
                           navigate("/");
                        }
                        else if (!link.disabled) {
                           setIsActive(link.name);
                           navigate(link.link);
                        }
                     }}
                  />
               ))}
            </div>
            {/* <Icon styles="bg-[#1c1c24] shadow-secondary" imgUrl={sun} /> */}
         </div>
      </div>
   )
}

export default Sidebar;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CustomButton } from './';
import { logo, menu, searchIcon, thirdweb } from '../assets';
import { navlinks } from '../constants';

const Navbar = () => {
   const navigate = useNavigate();
   const [isActive, setIsActive] = useState('dashboard');
   const [toggleDrawer, setToggleDrawer] = useState(false);
   const { connect, address, search, setSearch } = useStateContext();

   return (
      <div className='flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6'>
         {/* Search Bar */}
         <div className='lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px] bg-[#1F2937] border border-[#374151] rounded-full focus-within:border-[#6366F1] focus-within:ring-2 focus-within:ring-[#6366F1]/20 transition-all duration-300'>
            <input
               type="text"
               placeholder='Search for campaigns...'
               className='flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#9CA3AF] text-white bg-transparent outline-none'
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <div className='w-[72px] h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] flex justify-center items-center cursor-pointer shadow-md hover:scale-105 transition-transform'>
               <img src={searchIcon} alt={searchIcon} className='w-[15px] h-[15px] object-contain brightness-200' />
            </div>
         </div>

         {/* Desktop Navigation */}
         <div className='sm:flex hidden flex-row justify-end gap-4'>
            <CustomButton
               btnType="button"
               title={address ? 'Create a campaign' : 'Connect'}
               styles={address
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-lg shadow-indigo-500/30'}
               handleClick={() => {
                  if (address) {
                     navigate('create-campaign');
                  } else {
                     connect();
                  }
               }}
            />
            <Link to='/profile'>
               <div className='w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#374151] flex justify-center items-center cursor-pointer hover:border-[#6366F1] transition-all hover:shadow-lg'>
                  <div className="w-[85%] h-[85%] rounded-full bg-[#374151] flex justify-center items-center overflow-hidden">
                     <img src={thirdweb} alt="user" className='w-[60%] h-[60%] object-contain' />
                  </div>
               </div>
            </Link>
         </div>

         {/* Mobile Navigation */}
         <div className='sm:hidden flex justify-between items-center relative'>
            <div className='w-[40px] h-[40px] rounded-xl bg-[#1F2937] border border-[#374151] flex justify-center items-center cursor-pointer'>
               <img src={logo} alt="logo" className='w-[60%] h-[60%] object-contain' />
            </div>
            <img
               src={menu}
               alt="menu"
               className='w-[34px] h-[24px] object-contain cursor-pointer'
               onClick={() => setToggleDrawer((prev) => !prev)}
            />

            {/* Mobile Dropdown Drawer */}
            <div className={`absolute top-[60px] right-0 left-0 bg-[#1F2937]/95 backdrop-blur-md border border-[#374151] rounded-2xl z-10 shadow-2xl py-4 ${!toggleDrawer ? '-translate-y-[120vh] opacity-0' : 'translate-y-0 opacity-100'} transition-all duration-500 ease-in-out`}>
               <ul className='mb-4 px-2'>
                  {navlinks.map((link) => (
                     <li
                        key={link.name}
                        className={`flex p-4 rounded-xl mb-2 cursor-pointer transition-all ${isActive === link.name ? 'bg-gradient-to-r from-[#6366F1]/20 to-transparent border-l-4 border-[#6366F1]' : 'hover:bg-[#374151]/50'}`}
                        onClick={() => {
                           setIsActive(link.name);
                           setToggleDrawer(false);
                           navigate(link.link);
                        }}
                     >
                        <img
                           src={link.imgUrl}
                           alt={link.name}
                           className={`w-[24px] h-[24px] object-contain ${isActive === link.name ? 'grayscale-0 brightness-200' : 'grayscale opacity-70'}`}
                        />
                        <p className={`ml-[20px] font-epilogue font-semibold text-[15px] capitalize ${isActive === link.name ? 'text-white' : 'text-[#9CA3AF]'}`}>
                           {link.name}
                        </p>
                     </li>
                  ))}
               </ul>
               <div className='flex mx-4'>
                  <CustomButton
                     btnType="button"
                     title={address ? 'Create a campaign' : 'Connect Wallet'}
                     styles={`w-full ${address ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]'}`}
                     handleClick={() => {
                        setToggleDrawer(false);
                        if (address) {
                           navigate('create-campaign');
                        } else {
                           connect();
                        }
                     }}
                  />
               </div>
            </div>
         </div>
      </div>
   )
}

export default Navbar;
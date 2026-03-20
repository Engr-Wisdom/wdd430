import { GlobeAltIcon } from '@heroicons/react/24/outline';
import React from 'react'

const Navbar = () => {
  return (
    <div className='bg-gray-200 w-48 fixed top-0 left-0 h-screen p-2 pt-5 flex flex-cols'>
      <div className='bg-blue-600 w-full h-40 rounded-2xl p-4'>
        <GlobeAltIcon />
        <h1 className='text-2xl text-white'>Acme</h1>
      </div>


    </div>
  )
}

export default Navbar

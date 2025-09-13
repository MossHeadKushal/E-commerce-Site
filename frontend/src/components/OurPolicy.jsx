import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
      <div>
        <img src={assets.exchange} className='w-12 m-auto mb-5' alt="" />
        <p className='font-semibold'>Easy Exchange Policy</p>
        <p className='text-gray-400'>We offer good exchange policy!!</p>
      </div>
      <div>
        <img src={assets.returnn} className='w-12 m-auto mb-5' alt="" />
        <p className='font-semibold'>10 Days return policy</p>
        <p className='text-gray-400'>Time and tide waits for none!!</p>
      </div>
      <div>
        <img src={assets.support} className='w-12 m-auto mb-5' alt="" />
        <p className='font-semibold'>Best CUstomer Support</p>
        <p className='text-gray-400'>24 Hours Customer Support!!</p>
      </div>
    </div>
  )
}

export default OurPolicy

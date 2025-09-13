import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    
    <div>
        <hr />
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-small'>
        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maiores, earum minima accusamus iste itaque quia? Consectetur, soluta molestias ea, tempora exercitationem ipsum odio, ab deserunt corporis deleniti alias? Dignissimos, vel.</p>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>Home</li>
                <li>About Us</li>
                <li>Delivery</li>
                <li>Privacy Policy</li>
            </ul>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+977-9860575731</li>
                <li>kharel.kushal57@gmail.com</li>
            </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2025 @kharel.kushal57@gmail.com - All Rights Reserved.</p>
      </div>
    </div>
  )
}

export default Footer

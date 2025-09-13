import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ut illo cumque error consectetur doloremque? Nobis amet velit ipsam quod placeat iusto, esse laborum repellat ullam obcaecati nesciunt, laudantium dolores eius?</p>
          <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Doloremque praesentium doloribus et iusto, optio incidunt atque nam repellendus, ratione facilis maxime minima rem excepturi in aspernatur, saepe qui! Odio, quibusdam.</p>
          <b className='text-gray-800'>Our Mission</b>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab debitis, dolore alias esse deserunt fugit incidunt quibusdam sed minima quaerat suscipit doloribus amet eum earum. Explicabo et blanditiis in minima.</p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum, repellat? Amet, facere maxime incidunt veritatis illum eos quibusdam quisquam explicabo cum quidem totam molestiae voluptates, harum tempore corrupti, necessitatibus minima!</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Covinience:</b>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum, repellat? Amet, facere maxime incidunt veritatis illum eos quibusdam quisquam explicabo cum quidem totam molestiae voluptates, harum tempore corrupti, necessitatibus minima!</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum, repellat? Amet, facere maxime incidunt veritatis illum eos quibusdam quisquam explicabo cum quidem totam molestiae voluptates, harum tempore corrupti, necessitatibus minima!</p>
        </div>
      </div>

    </div>
  )
}

export default About

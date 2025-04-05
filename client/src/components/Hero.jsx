import React, { useState, useEffect } from 'react';
import banner from '../assets/banner.jpg';
import banner2 from '../assets/banner2.png';

import bannerMobile from '../assets/banner-mobile.jpg';
import bannerMobile2 from '../assets/banner-mobile-2.png';
import bannerMobile3 from '../assets/banner-mobile-3.png';

import './Hero.css'; // Importing CSS for animations

function Hero() 
{
  const images = {
    mobile: [
      { src: bannerMobile, url: 'https://editing-pack.vercel.app' },
      { src: bannerMobile2 },
      { src: bannerMobile3 }
    ],
    desktop: [
      { src: banner, url: 'https://editing-pack.vercel.app' },
      { src: banner2 }
    ]
  };

  const [currentMobile, setCurrentMobile] = useState(0);
  const [currentDesktop, setCurrentDesktop] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMobile((prev) => (prev + 1) % images.mobile.length);
      setCurrentDesktop((prev) => (prev + 1) % images.desktop.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.mobile.length, images.desktop.length]);

  return (
    <div className='container mx-auto'>
      {/* Desktop Images */}
      <div className='w-full h-full hidden lg:block slide-in'>
        {images?.desktop[currentDesktop]?.url ? (
          <div style={{ cursor: 'pointer' }} onClick={() => window.open(images.desktop[currentDesktop].url, '_blank')}>
            <img src={images.desktop[currentDesktop].src} className='w-full h-full' alt='banner' />
          </div>
        ) : (
          <img src={images.desktop[currentDesktop].src} className='w-full h-full' alt='banner' />
        )}
      </div>

      {/* Mobile Images */}
      <div className='w-full h-full lg:hidden slide-in'>
        {images?.mobile[currentMobile]?.url ? (
          <div style={{ cursor: 'pointer' }} onClick={() => window.open(images.mobile[currentMobile].url, '_blank')}>
            <img src={images.mobile[currentMobile].src} className='w-full h-full' alt='banner' />
          </div>
        ) : (
          <img src={images.mobile[currentMobile].src} className='w-full h-full' alt='banner' />
        )}
      </div>
    </div>
  );
}

export default Hero;

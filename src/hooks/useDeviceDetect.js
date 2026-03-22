import { useState, useEffect } from 'react';

export default function useDeviceDetect() {
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Considered mobile if width <= 1080 (consistent with CSS media query)
      // OR if it has a mobile user agent (catches phones in landscape where width > 1080)
      const isMobileDevice = window.innerWidth <= 1080 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setMobile(isMobileDevice);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
}

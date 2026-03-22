import { useState, useEffect } from 'react';

export default function useDeviceDetect() {
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Menyesuaikan logika deteksi mobile sesuai lebar layar (contoh: <= 768px dihitung mobile)
      // Bisa juga menggunakan regex userAgent, namun pengecekan dimensi lebih aman dalam konteks resize viewport
      setMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    };

    handleResize(); // trigger saat komponen pertama dimuat

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
}

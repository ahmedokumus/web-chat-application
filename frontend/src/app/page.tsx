"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

export default function Home() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <Confetti
        width={dimensions.width-100}
        height={dimensions.height-100}
        numberOfPieces={100}
        recycle={true}
      />
      
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold text-white mb-4">WebChat</h1>
        <p className="text-xl text-white/80">Arkadaşlarınla güvenli bir şekilde sohbet et!</p>
      </div>

      <div className="space-y-4 w-full max-w-md">
        <Link href="/login" className="block">
          <button className="w-full bg-white text-purple-600 rounded-lg py-3 px-6 font-semibold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg">
            Giriş Yap
          </button>
        </Link>
        
        <Link href="/register" className="block">
          <button className="w-full bg-purple-700 text-white rounded-lg py-3 px-6 font-semibold text-lg hover:bg-purple-800 transition-all transform hover:scale-105 shadow-lg border-2 border-white/20">
            Kayıt Ol
          </button>
        </Link>
      </div>

      <div className="mt-12 text-white/60 text-sm">
        <p>En iyi deneyim için modern bir tarayıcı kullanmanızı öneririz.</p>
      </div>
    </div>
  );
}

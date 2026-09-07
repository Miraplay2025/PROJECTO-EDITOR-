import React, { useEffect, useState } from 'react';
import { Film, Sparkles, Cpu } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 350);

    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center text-white select-none">
      <div className="relative flex flex-col items-center">
        {/* Animated Brand Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] animate-pulse">
            <Film size={42} className="text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#020617] flex items-center justify-center">
            <Sparkles size={12} className="text-slate-950" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black tracking-wider text-white">
          CinemaMotion
          <span className="text-indigo-400 font-extrabold ml-1">STUDIO PRO</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Android Native Engine • Media3 & Hardware VideoCodec
        </p>

        {/* Pulsing Dots loader */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" />
          </div>
          <span className="text-xs text-slate-500 font-mono mt-1">
            Inicializando decodificadores{dots}
          </span>
        </div>
      </div>
    </div>
  );
};

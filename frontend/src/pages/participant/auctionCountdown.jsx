import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuctionCountdown() {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/auction-arena", { replace: true });
    }
  }, [count, navigate]);

  return (
    <div className="min-h-screen bg-[#000] flex flex-col items-center justify-center relative overflow-hidden">

      {/* 1. ATMOSPHERIC THEME ELEMENTS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Carbon Fiber Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        {/* Amber Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-600/10 rotate-45 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-red-700/5 -rotate-12 blur-[100px]"></div>

        {/* Tactical Skew Background */}
        <div className="absolute inset-0 bg-[#0a0a0c] skew-y-[-10deg] translate-y-1/2 border-t border-white/5"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">

        {/* Status Header */}
        <div className="mb-12 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
          </div>
          <h2 className="text-white/30 text-xs font-black uppercase tracking-[0.3em] italic">Preparing Auction Arena</h2>
        </div>

        {/* The Countdown Number */}
        <div key={count} className="relative group cursor-default">
          {/* Traveling Wave Ring around Number */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full overflow-hidden p-[2px] opacity-40">
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#f59e0b_90%,#ef4444_100%)] animate-[spin_3s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-[#000] rounded-full"></div>
          </div>

          {/* Decorative Backglow */}
          <div className="absolute inset-0 blur-[100px] bg-yellow-600/20 scale-150 animate-pulse"></div>

          <h1 className="text-[12rem] sm:text-[18rem] font-[1000] leading-none bg-gradient-to-b from-white via-yellow-200 to-yellow-600 bg-clip-text text-transparent italic tracking-tighter transition-all duration-300 animate-count-pop select-none">
            {count > 0 ? count : "GO"}
          </h1>

          {/* Floating Orbitals */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-white/10 rounded-full animate-[spin_8s_linear_infinite] scale-125 border-dashed"></div>
        </div>

        {/* Progress Indicators */}
        <div className="mt-20 flex items-center justify-center gap-6">
          {[3, 2, 1].map((i) => (
            <div key={i} className="relative group">
              <div className={`h-2 w-20 rounded-sm skew-x-[-20deg] transition-all duration-700 ease-out ${count <= i
                ? 'bg-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.6)]'
                : 'bg-white/5'
                }`}></div>
              {count === i && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-yellow-500 animate-bounce italic tracking-widest">
                  READY
                </div>
              )}
            </div>
          ))}
        </div>


      </div>

      <style>{`
        @keyframes count-pop {
          0% { 
            transform: scale(0.5) rotate(-10deg); 
            opacity: 0; 
            filter: blur(30px) brightness(3); 
          }
          50% {
            transform: scale(1.1) rotate(2deg);
            opacity: 1;
            filter: blur(0px) brightness(1.5);
          }
          100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1; 
            filter: blur(0px) brightness(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-count-pop {
          animation: count-pop 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
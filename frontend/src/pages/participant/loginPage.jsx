

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { TESTING_CONFIG } from '../../config/testingConfig';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');

  // LOGIC PRESERVED 100%
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessLoader, setShowSuccessLoader] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || showSuccessLoader) return;
    setError('');
    setLoading(true);

    const phone = phoneNumber.trim();
    // Validate Phone Number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'participants'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const matched = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        sessionStorage.setItem('currentParticipant', JSON.stringify(matched));
        setShowSuccessLoader(true);
        setLoading(false);
        window.location.href = "/lobby";
      } else {
        setError('Phone number not registered. Please contact Admin.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to verify credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    /* OUTER WINDOW FRAME - THIS ADDS THE WAVE TO THE FULL PAGE BORDER */
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4 relative overflow-hidden font-sans italic border-[6px] border-transparent">

      {/* WINDOW-LEVEL TRAVELING WAVE */}
      <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_80%,#f59e0b_90%,#fbbf24_100%)] animate-[spin_8s_linear_infinite] pointer-events-none opacity-40"></div>

      {/* 1. AGGRESSIVE GEOMETRIC BACKGROUND - PRESERVED */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-[#1a1a1e] skew-x-[-20deg] translate-x-32 border-l border-white/5"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-40"></div>
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-40"></div>
      </div>

      {showSuccessLoader ? (
        <div className="relative z-20 text-center scale-125 transition-all">
          <div className="inline-block p-1 bg-gradient-to-tr from-yellow-400 via-yellow-200 to-yellow-600 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.4)]">
            <div className="bg-[#0a0a0c] p-6 rounded-full">
              <span className="text-4xl">🔨</span>
            </div>
          </div>
          <h2 className="text-4xl font-[1000] text-white mt-6 tracking-tighter italic">Successfully Verified!</h2>
          <p className="text-yellow-500 font-bold uppercase tracking-[0.3em] mt-2">Entering Lobby...</p>
        </div>
      ) : (
        <div className="w-full max-w-lg relative z-10 animate-[fadeIn_0.8s_ease-out]">

          {/* HEADER SECTION */}
          <div className="mb-10 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-12 bg-yellow-500"></div>
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em]">Live Auction </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-[1000] text-white tracking-tighter leading-none uppercase">
              TECHNO<span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700">BID</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold mt-2 tracking-wide ml-1">PARTICIPANT PORTAL</p>
          </div>

          {/* MAIN CARD WITH TRAVELING WAVE BORDER */}
          <div className="relative p-[3px] overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">

            {/* CARD-LEVEL TRAVELING WAVE (Faster than window wave) */}
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_65%,#f59e0b_85%,#ef4444_100%)] animate-[spin_4s_linear_infinite]"></div>

            <div className="relative bg-gradient-to-br from-[#16161a] to-[#0a0a0c] p-8 md:p-14 rounded-[21px] overflow-hidden border border-white/5">

              <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none">
                <h2 className="text-9xl font-black text-white">IPL</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Bidder Credentials</label>
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  </div>

                  <div className="relative group/input">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ''); // Only numbers
                        if (val.length <= 10) setPhoneNumber(val);
                      }}
                      placeholder="ENTER PHONE NO."
                      className="w-full bg-[#1c1c21] border border-white/10 px-6 py-5 rounded-lg text-white font-mono text-xl focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder:text-slate-400 shadow-inner"
                      required
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-500 group-focus-within/input:w-full transition-all duration-500"></div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg p-[1px] shadow-2xl active:scale-[0.98] transition-all group/btn"
                >
                  <div className="bg-[#0a0a0c] group-hover/btn:bg-transparent h-full w-full rounded-lg flex items-center justify-center transition-all duration-300">
                    <span className="text-white group-hover/btn:text-black font-black text-2xl uppercase italic tracking-tighter">
                      {loading ? "CHECKING DATA..." : "ENTER AUCTION LOBBY"}
                    </span>
                  </div>
                </button>
              </form>

              {error && (
                <div className="mt-8 text-center bg-red-950/20 border border-red-500/30 py-3 px-4 rounded animate-[shake_0.5s_ease-in-out]">
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-none tracking-tighter italic">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ===== TESTING FEATURE: SELF-REGISTRATION LINK ===== */}
          {/* To disable: Set ENABLE_SELF_REGISTRATION to false in src/config/testingConfig.js */}
          {TESTING_CONFIG.ENABLE_SELF_REGISTRATION && (
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Not registered yet?{' '}
                <Link
                  to="/register"
                  className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors underline decoration-yellow-500/30 hover:decoration-yellow-500"
                >
                  Register Here
                </Link>
              </p>
            </div>
          )}

          {/* TEAM FRANCHISE FOOTER */}
          <div className="mt-12 flex items-center gap-6 opacity-30">
            <div className="text-white text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] whitespace-nowrap">IPL Teams</div>
            <div className="flex-1 h-px bg-slate-800 "></div>
            <div className="flex gap-4">
              <div className="w-2 h-2 bg-blue-600 rotate-45"></div>
              <div className="w-2 h-2 bg-yellow-500 rotate-45"></div>
              <div className="w-2 h-2 bg-purple-700 rotate-45"></div>
              <div className="w-2 h-2 bg-red-600 rotate-45"></div>
            </div>
          </div>
        </div>
      )}

      {/* CSS ANIMATIONS */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
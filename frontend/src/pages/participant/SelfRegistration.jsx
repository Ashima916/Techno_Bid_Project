import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const SelfRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        enrollmentNumber: '',
        name: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessLoader, setShowSuccessLoader] = useState(false);
    const [error, setError] = useState('');
    const [participants, setParticipants] = useState([]);
    const MAX_PARTICIPANTS = 80;

    // Fetch participants to check for duplicates
    useEffect(() => {
        const q = query(collection(db, 'participants'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const participantsList = [];
            querySnapshot.forEach((doc) => {
                participantsList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setParticipants(participantsList);
        }, (error) => {
            console.error("Error fetching participants: ", error);
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || showSuccessLoader) return;
        setError('');
        setLoading(true);

        // Validate required fields
        if (!formData.enrollmentNumber || !formData.name || !formData.phone) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        // Validate phone number format
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Please enter a valid 10-digit phone number');
            setLoading(false);
            return;
        }

        // Check for duplicate phone number
        const duplicate = participants.find(p => p.phone === formData.phone);
        if (duplicate) {
            setError('This phone number is already registered!');
            setLoading(false);
            return;
        }

        // Check for duplicate enrollment number
        const duplicateEnrollment = participants.find(p => p.enrollmentNumber === formData.enrollmentNumber);
        if (duplicateEnrollment) {
            setError('This enrollment number is already registered!');
            setLoading(false);
            return;
        }

        // Prevent adding beyond max
        if (participants.length >= MAX_PARTICIPANTS) {
            setError(`Maximum of ${MAX_PARTICIPANTS} participants reached. Registration closed.`);
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, 'participants'), {
                enrollmentNumber: formData.enrollmentNumber,
                name: formData.name,
                phone: formData.phone,
                createdAt: new Date().toISOString()
            });

            setShowSuccessLoader(true);
            setLoading(false);

            // Redirect to login page after animation
            setTimeout(() => {
                window.location.href = '/';
            }, 2500);

        } catch (err) {
            console.error('Registration error:', err);
            setError('Error in registration. Please try again.');
            setLoading(false);
        }
    };

    return (
        /* OUTER WINDOW FRAME - MATCHING LOGIN PAGE */
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 relative overflow-hidden font-sans italic border-[3px] sm:border-[6px] border-transparent">

            {/* WINDOW-LEVEL TRAVELING WAVE */}
            <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_80%,#f59e0b_90%,#fbbf24_100%)] animate-[spin_8s_linear_infinite] pointer-events-none opacity-40"></div>

            {/* AGGRESSIVE GEOMETRIC BACKGROUND - PRESERVED */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60%] h-full bg-[#1a1a1e] skew-x-[-20deg] translate-x-32 border-l border-white/5"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-96 sm:h-96 bg-yellow-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-40"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-40"></div>
            </div>

            {showSuccessLoader ? (
                <div className="relative z-20 text-center scale-100 sm:scale-125 transition-all px-4">
                    <div className="inline-block p-1 bg-gradient-to-tr from-yellow-400 via-yellow-200 to-yellow-600 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                        <div className="bg-[#0a0a0c] p-4 sm:p-6 rounded-full">
                            <span className="text-3xl sm:text-4xl">✅</span>
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-[1000] text-white mt-4 sm:mt-6 tracking-tighter italic">Registration Complete!</h2>
                    <p className="text-yellow-500 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 text-xs sm:text-base">Redirecting to Login...</p>
                </div>
            ) : (
                <div className="w-full max-w-lg relative z-10 animate-[fadeIn_0.8s_ease-out]">

                    {/* HEADER SECTION */}
                    <div className="mb-6 sm:mb-10 relative">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-yellow-500"></div>
                            <span className="text-[8px] sm:text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] sm:tracking-[0.5em]">New Bidder</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-[1000] text-white tracking-tighter leading-none uppercase">
                            REGISTER<span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700">NOW</span>
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-bold mt-1 sm:mt-2 tracking-wide ml-0.5 sm:ml-1">JOIN THE AUCTION</p>

                        {/* Participant Counter */}
                        <div className="mt-3 sm:mt-4 inline-block">
                            <div className="bg-[#1c1c21] border border-yellow-500/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Registered: </span>
                                <span className="text-yellow-400 font-black text-base sm:text-lg">{participants.length}</span>
                                <span className="text-slate-600 font-bold text-sm sm:text-base">/{MAX_PARTICIPANTS}</span>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CARD WITH TRAVELING WAVE BORDER */}
                    <div className="relative p-[2px] sm:p-[3px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">

                        {/* CARD-LEVEL TRAVELING WAVE (Faster than window wave) */}
                        <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_65%,#f59e0b_85%,#ef4444_100%)] animate-[spin_4s_linear_infinite]"></div>

                        <div className="relative bg-gradient-to-br from-[#16161a] to-[#0a0a0c] p-6 sm:p-8 md:p-14 rounded-[19px] sm:rounded-[21px] overflow-hidden border border-white/5">

                            <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none">
                                <h2 className="text-7xl sm:text-9xl font-black text-white">REG</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
                                {/* Enrollment Number */}
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Enrollment No.</label>
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-600 animate-pulse"></span>
                                    </div>
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            name="enrollmentNumber"
                                            value={formData.enrollmentNumber}
                                            onChange={handleChange}
                                            placeholder="ENTER ENROLLMENT NUMBER"
                                            className="w-full bg-[#1c1c21] border border-white/10 px-4 sm:px-6 py-3 sm:py-5 rounded-lg text-white font-mono text-base sm:text-xl focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-base shadow-inner"
                                            required
                                        />
                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-500 group-focus-within/input:w-full transition-all duration-500"></div>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Full Name</label>
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-600 animate-pulse"></span>
                                    </div>
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="ENTER YOUR FULL NAME"
                                            className="w-full bg-[#1c1c21] border border-white/10 px-4 sm:px-6 py-3 sm:py-5 rounded-lg text-white font-mono text-base sm:text-xl focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-base shadow-inner"
                                            required
                                        />
                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-500 group-focus-within/input:w-full transition-all duration-500"></div>
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Phone Number</label>
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-600 animate-pulse"></span>
                                    </div>
                                    <div className="relative group/input">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, ''); // Only numbers
                                                if (val.length <= 10) {
                                                    setFormData(prev => ({ ...prev, phone: val }));
                                                }
                                            }}
                                            placeholder="ENTER PHONE NO."
                                            className="w-full bg-[#1c1c21] border border-white/10 px-4 sm:px-6 py-3 sm:py-5 rounded-lg text-white font-mono text-base sm:text-xl focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-base shadow-inner"
                                            required
                                        />
                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-500 group-focus-within/input:w-full transition-all duration-500"></div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 sm:h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg p-[1px] shadow-2xl active:scale-[0.98] transition-all group/btn mt-6 sm:mt-8"
                                >
                                    <div className="bg-[#0a0a0c] group-hover/btn:bg-transparent h-full w-full rounded-lg flex items-center justify-center transition-all duration-300">
                                        <span className="text-white group-hover/btn:text-black font-black text-lg sm:text-2xl uppercase italic tracking-tighter px-2">
                                            {loading ? "PROCESSING..." : "COMPLETE REGISTRATION"}
                                        </span>
                                    </div>
                                </button>
                            </form>

                            {error && (
                                <div className="mt-6 sm:mt-8 text-center bg-red-950/20 border border-red-500/30 py-2.5 sm:py-3 px-3 sm:px-4 rounded animate-[shake_0.5s_ease-in-out]">
                                    <p className="text-red-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest leading-tight sm:leading-none italic">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Already Registered Link */}
                            <div className="mt-6 sm:mt-8 text-center border-t border-white/5 pt-4 sm:pt-6">
                                <p className="text-xs sm:text-sm text-slate-500">
                                    Already registered?{' '}
                                    <button
                                        onClick={() => navigate('/')}
                                        className="text-yellow-400 hover:text-yellow-300 font-black transition-colors uppercase text-[10px] sm:text-xs tracking-wider"
                                    >
                                        Go to Login →
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER NOTE */}
                    <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-6 opacity-30">
                        <div className="text-white text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">New Participant</div>
                        <div className="flex-1 h-px bg-slate-800"></div>
                        <div className="flex gap-2 sm:gap-4">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rotate-45"></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rotate-45"></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-700 rotate-45"></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rotate-45"></div>
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
};

export default SelfRegistration;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function ResultPage() {
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = JSON.parse(sessionStorage.getItem("currentParticipant"));
        if (!stored) {
            navigate("/");
            return;
        }

        const fetchTeam = async () => {
            try {
                let tid = stored.teamId;
                if (!tid) {
                    const q = query(
                        collection(db, "teams"),
                        where("members", "array-contains", stored.phone)
                    );
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        tid = snap.docs[0].id;
                    }
                }
                if (!tid) {
                    setLoading(false);
                    return;
                }
                const docRef = doc(db, "teams", tid);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setTeam(snap.data());
                }
            } catch (err) {
                console.error("Error fetching result team:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 blur-lg bg-amber-500/20 rounded-full animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <p className="font-mono tracking-widest uppercase opacity-50">Team Data Not Found</p>
            </div>
        );
    }

    const players = team.boughtPlayers?.filter(p => (Number(p.id) < 1000) && !p.role?.toLowerCase().includes('accessory')) || [];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-amber-500/30">

            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* HEADER SECTION */}
                {/* HEADER SECTION */}
                <div className="text-center space-y-6">
                    {players.length < 11 ? (
                        <>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                                Disqualified
                            </div>

                            <h1 className="text-5xl md:text-8xl font-[1000] italic leading-tight uppercase tracking-tighter">
                                <span className="text-red-600">ELIMINATED</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 drop-shadow-2xl opacity-50 text-4xl md:text-6xl">
                                    {team.name?.toUpperCase() || "TEAM"}
                                </span>
                            </h1>

                            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium tracking-wide leading-relaxed">
                                Minimum Criteria Not Met: <span className="text-red-500 font-bold">Less than 11 Players</span> <br />
                                <span className="text-slate-500/80 font-black italic">Better luck next season...</span>
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                Live Auction
                            </div>

                            <h1 className="text-5xl md:text-8xl font-[1000] italic leading-tight uppercase tracking-tighter">
                                <span className="text-white">GOOD GAME,</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 drop-shadow-2xl">
                                    {team.name?.toUpperCase() || "TEAM"}
                                </span>
                            </h1>

                            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium tracking-wide leading-relaxed">
                                The Auction has ended. Calculating Results.... <br />
                                <span className="text-amber-500/80 font-black italic">Winner will be announced soon...</span>
                            </p>

                            {/* Playing 11 Selection Button */}
                            <div className="mt-8">
                                <button
                                    onClick={() => navigate("/playing11")}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all active:scale-95"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        Select Playing 11
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                                <p className="text-xs text-slate-500 mt-3">
                                    Team leaders can select their final 11 players
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* TOP LEVEL METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#0d0d0f] rounded-3xl border border-white/5 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Wallet Balance</p>
                        <p className="text-4xl font-black text-white italic">₹{team.purse?.toLocaleString()}</p>
                    </div>

                    <div className="bg-[#0d0d0f] rounded-3xl border border-white/5 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Players</p>
                        <p className="text-4xl font-black text-white italic">{players.length} <span className="text-sm not-italic font-bold text-slate-600 uppercase ml-2">Players</span></p>
                    </div>
                </div>

                {/* SQUAD SECTION */}
                <div className="space-y-8 pb-20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Your Squad</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {players.map((p, i) => (
                            <div key={i} className="group flex items-center gap-5 bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all hover:bg-white/[0.04]">
                                <div className="w-14 h-14 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center font-black text-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all italic">
                                    {p.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-white uppercase italic tracking-tighter text-lg">{p.name} {p.overseas ? <span className="text-sm text-blue-400 ml-1 normal-case not-italic font-bold">(Overseas)</span> : null}</h3>
                                    <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.2em]">{p.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Bought For</p>
                                    <p className="font-black text-white italic">₹{p.price?.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {players.length === 0 && <p className="text-slate-600 font-bold italic py-8 text-center col-span-full uppercase tracking-widest opacity-30">No Players Bought</p>}
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
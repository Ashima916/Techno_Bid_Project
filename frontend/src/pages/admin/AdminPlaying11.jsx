import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminPlaying11() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to all teams with Playing 11 submitted
        const teamsRef = collection(db, "teams");

        const unsubscribe = onSnapshot(teamsRef, (snapshot) => {
            const teamsData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(team => team.playing11 && team.playing11.length === 11) // Only teams with Playing 11
                .sort((a, b) => (b.playing11AvgRank || 0) - (a.playing11AvgRank || 0)); // Sort by avg rank desc

            setTeams(teamsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f111a] text-slate-200 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading Playing 11 data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f111a] text-slate-200 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-4 md:p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
                                Playing <span className="text-violet-500">11</span> Submissions
                            </h1>
                            <p className="text-slate-400 text-xs md:text-sm">
                                View all teams' Playing 11 selections and average ranks
                            </p>
                        </div>

                        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 md:px-6 py-2 md:py-3">
                            <p className="text-xs text-violet-400 font-bold uppercase tracking-wider">Total Teams</p>
                            <p className="text-2xl md:text-3xl font-black text-violet-500">{teams.length}</p>
                        </div>
                    </div>
                </div>

                {/* Teams List */}
                {teams.length === 0 ? (
                    <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-bold">No Playing 11 submissions yet</p>
                        <p className="text-slate-600 text-sm mt-2">Teams will appear here once they submit their Playing 11</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {teams.map((team, index) => (
                            <div
                                key={team.id}
                                className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:border-violet-500/30 transition-all"
                            >
                                {/* Team Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-600/20 rounded-xl flex items-center justify-center">
                                            <span className="text-xl md:text-2xl font-black text-violet-400">#{index + 1}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-white">
                                                {team.name.toLowerCase().includes('team') ? team.name : `Team ${team.name}`}
                                            </h2>
                                            <p className="text-[10px] md:text-xs text-slate-500 mt-1">
                                                Submitted: {new Date(team.playing11SubmittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 md:gap-4 w-full md:w-auto">
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 md:px-6 py-2 md:py-3 flex-1 md:flex-initial">
                                            <p className="text-[10px] md:text-xs text-yellow-400 font-bold uppercase tracking-wider">Avg Rank</p>
                                            <p className="text-xl md:text-3xl font-black text-yellow-500">
                                                {team.playing11AvgRank?.toFixed(2) || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 md:px-6 py-2 md:py-3 flex-1 md:flex-initial">
                                            <p className="text-[10px] md:text-xs text-blue-400 font-bold uppercase tracking-wider">Purse Left</p>
                                            <p className="text-lg md:text-2xl font-black text-blue-500">
                                                ₹{team.purse?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Playing 11 Grid */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                                        Playing 11 Squad
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {team.playing11.map((player, pIndex) => (
                                            <div
                                                key={player.id}
                                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 hover:border-violet-500/50 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest">
                                                        {player.role}
                                                    </span>
                                                    <span className="text-xs font-black text-slate-600">
                                                        #{pIndex + 1}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-black text-white uppercase leading-tight mb-2">
                                                    {player.name}
                                                </h4>

                                                <div className="flex items-center justify-between text-xs">
                                                    <div>
                                                        <p className="text-slate-500 font-bold uppercase text-[8px]">Price</p>
                                                        <p className="text-white font-black">₹{player.price?.toLocaleString()}</p>
                                                    </div>

                                                    {player.rank && (
                                                        <div className="text-right">
                                                            <p className="text-slate-500 font-bold uppercase text-[8px]">Rank</p>
                                                            <p className="text-yellow-400 font-black">{player.rank.toFixed(1)}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {player.overseas && (
                                                    <span className="inline-block mt-2 text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                                                        Overseas
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Team Stats Summary */}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                                        <div>
                                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase">Total Players</p>
                                            <p className="text-lg md:text-xl font-black text-white">{team.playing11.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase">Overseas</p>
                                            <p className="text-lg md:text-xl font-black text-blue-400">
                                                {team.playing11.filter(p => p.overseas).length}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase">Total Value</p>
                                            <p className="text-lg md:text-xl font-black text-green-400">
                                                ₹{team.playing11.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

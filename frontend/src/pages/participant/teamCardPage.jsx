import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

export default function TeamCardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Logic States (Untouched)
  const [participant, setParticipant] = useState(undefined);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamId, setTeamId] = useState(null);
  const [ignoreOpenStatus, setIgnoreOpenStatus] = useState(location.state?.lockedByAdmin || false);
  const [memberCount, setMemberCount] = useState(0);
  const [budgetDisplay, setBudgetDisplay] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("currentParticipant") || "null");
    setParticipant(stored);
  }, []);

  useEffect(() => {
    if (ignoreOpenStatus) {
      const timer = setTimeout(() => setIgnoreOpenStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [ignoreOpenStatus]);

  useEffect(() => {
    if (participant === undefined) return;
    if (!participant?.phone) {
      navigate("/", { replace: true });
      return;
    }

    const lobbyRef = doc(db, "settings", "lobby");
    const unsubscribeLobby = onSnapshot(lobbyRef, (docSnap) => {
      if (docSnap.exists()) {
        const status = docSnap.data().status || "OPEN";
        if (status === "OPEN") {
          if (!ignoreOpenStatus) navigate("/lobby", { replace: true });
        } else if (status === "STARTING") {
          navigate("/countdown", { replace: true });
        }
      }
    });
    return () => unsubscribeLobby();
  }, [participant, navigate, ignoreOpenStatus]);

  useEffect(() => {
    if (!participant) return;
    const pid = participant.phone; // Use Phone Key
    if (!pid) return;

    if (participant.teamId) {
      setTeamId(participant.teamId);
      return;
    }

    const findTeam = async () => {
      try {
        const teamsRef = collection(db, "teams");
        // Check if members array contains this phone number
        const q = query(teamsRef, where("members", "array-contains", pid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setTeamId(snapshot.docs[0].id);
        else {
          setError("You have not been assigned to a team yet.");
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to find your team mapping.");
        setLoading(false);
      }
    };
    findTeam();
  }, [participant]);

  useEffect(() => {
    if (!teamId) return;
    const teamRef = doc(db, "teams", teamId);
    const unsubscribe = onSnapshot(teamRef, async (docSnap) => {
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        const membersArr = rawData.members || [];
        let enrichedMembers = [];
        if (membersArr.length > 0) {
          try {
            // Match Phone Numbers in members array to Participants collection
            // NOTE: Firestore 'in' query limit is 10. Team size max 5, so safe.
            const pQuery = query(collection(db, "participants"), where("phone", "in", membersArr));
            const pSnap = await getDocs(pQuery);
            const pMap = {};
            pSnap.forEach(d => {
              const data = d.data();
              pMap[data.phone] = data.name;
            });
            enrichedMembers = membersArr.map(m => ({
              enrollmentNumber: m, // 'm' is phone now, keep key for generic usage or rename
              phone: m,
              name: pMap[m] || m
            }));
          } catch (e) {
            console.error("Enrichment error:", e);
            enrichedMembers = membersArr.map(m => ({ phone: m, name: m }));
          }
        }
        const data = { id: docSnap.id, ...rawData, participants: enrichedMembers };
        setTeamData(data);
        animateNumbers(enrichedMembers.length, data.purse || 0);
      } else setError("Team document not found.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [teamId]);

  const mIntervalRef = React.useRef(null);
  const bIntervalRef = React.useRef(null);

  const animateNumbers = (targetMembers, targetPurse) => {
    // Clear existing
    if (mIntervalRef.current) clearInterval(mIntervalRef.current);
    if (bIntervalRef.current) clearInterval(bIntervalRef.current);

    // Jump to final values immediately if 0 to likely fix "stuck at 0" issues or just for simplicity
    if (targetPurse === 0) {
      setBudgetDisplay(0);
    }

    let mCount = 0; // Or better, start from current state? For now, 0 is fine.
    mIntervalRef.current = setInterval(() => {
      if (mCount >= targetMembers) { setMemberCount(targetMembers); clearInterval(mIntervalRef.current); }
      else { mCount++; setMemberCount(mCount); }
    }, 100);

    const duration = 2000, steps = 60, stepValue = targetPurse / steps;
    let bCurrent = 0;
    bIntervalRef.current = setInterval(() => {
      bCurrent += stepValue;
      if (bCurrent >= targetPurse) { setBudgetDisplay(targetPurse); clearInterval(bIntervalRef.current); }
      else setBudgetDisplay(Math.floor(bCurrent));
    }, duration / steps);
  };

  const formatBudget = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000] text-yellow-500 font-black italic">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="uppercase tracking-[0.5em] text-xs animate-pulse">Loading Team Card...</p>
        </div>
      </div>
    );
  }

  const members = teamData?.participants || [];

  return (
    <div className="min-h-screen bg-[#000] text-slate-100 relative font-sans overflow-hidden flex items-center justify-center p-6 border-[6px] border-transparent">

      {/* 1. WINDOW-LEVEL TRAVELING WAVE (THEME SYNC) */}
      <div className="fixed inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_80%,#f59e0b_90%,#fbbf24_100%)] animate-[spin_12s_linear_infinite] pointer-events-none opacity-20"></div>

      {/* 2. AGGRESSIVE BACKGROUND TEXTURE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-[#0a0a0c] skew-x-[-20deg] translate-x-32 border-l border-white/5 opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* THE MAIN CARD WITH TRAVELING WAVE BORDER */}
        <div className="relative p-[3px] overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-card-entry">

          {/* CARD TRAVELING WAVE */}
          <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_65%,#f59e0b_85%,#ef4444_100%)] animate-[spin_4s_linear_infinite]"></div>

          <div className="relative bg-[#0d0d0f] rounded-[2.3rem] overflow-hidden">

            {/* Header Section */}
            <div className="p-8 pb-4 text-center relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black text-white pointer-events-none italic">TEAM</div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]"></span>
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">LIVE AUCTION</span>
              </div>

              <h1 className="text-5xl font-[1000] italic tracking-tighter text-white uppercase mb-2">
                {(() => {
                  const n = teamData?.name || "REDACTED";
                  return n.toLowerCase().startsWith("team") ? n : `Team ${n}`;
                })()}
              </h1>
              <div className="h-1.5 w-24 bg-gradient-to-r from-yellow-500 to-orange-600 mx-auto rounded-full mb-8 shadow-[0_0_20px_rgba(234,179,8,0.4)]"></div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-left transition-all hover:bg-white/[0.06]">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Team Size</p>
                  <p className="text-4xl font-black text-white italic">{memberCount}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-left transition-all hover:bg-white/[0.06]">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Current Wallet</p>
                  <p className="text-xl font-black text-yellow-500 truncate italic">{formatBudget(budgetDisplay)}</p>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div className="p-8 pt-4">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Active Members</h3>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {members.length > 0 ? (
                  members.map((m, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-[#151517] border border-white/5 p-4 rounded-xl hover:border-yellow-500/50 transition-all group animate-slide-right"
                      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center font-black text-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                        0{index + 1}
                      </div>
                      <div className="flex flex-col flex-1 truncate">
                        <span className="text-sm font-black text-white group-hover:text-yellow-500 transition-colors truncate uppercase italic">{m?.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider">{m?.phone}</span>
                      </div>
                      <div className="w-1 h-4 rounded-full bg-yellow-500 group-hover:h-6 transition-all"></div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Waiting for Auction to Start...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Status */}
            <div className="bg-yellow-500/5 p-6 border-t border-white/5 text-center relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.4em] italic">Waiting for Auctioneer's Signal...</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 text-center bg-red-950/20 border border-red-500/30 p-4 rounded-xl animate-pulse">
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes card-entry {
          from { opacity: 0; transform: scale(0.9) translateY(40px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-card-entry { animation: card-entry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-right { opacity: 0; animation: slide-right 0.6s ease-out forwards; }
        .animate-shimmer { animation: shimmer 3s infinite; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234, 179, 8, 0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";
import { db } from "../../firebase";

export default function ResultsAndLogs() {
  const [teams, setTeams] = useState([]);
  const [playersMap, setPlayersMap] = useState({});
  const [status, setStatus] = useState("IDLE");

  useEffect(() => {
    const unsubLobby = onSnapshot(doc(db, "settings", "lobby"), (docSnap) => {
      if (docSnap.exists()) {
        const lobbyData = docSnap.data();
        if (lobbyData.status === "RESULTS" || lobbyData.status === "ENDED") {
          setStatus("ENDED");
        } else {
          setStatus(lobbyData.status || "IDLE");
        }
      }
    });

    // 1. Listen to Players Collection (Source of Truth for Ranks)
    const unsubPlayers = onSnapshot(collection(db, "players"), (snap) => {
      const map = {};
      snap.docs.forEach(doc => {
        map[doc.id] = doc.data(); // Key is String(ID)
      });
      setPlayersMap(map);
    });

    // 2. Listen to Teams
    const q = query(collection(db, "teams"), orderBy("name"));
    const unsubTeams = onSnapshot(q, (snapshot) => {
      const rawTeams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(rawTeams);
    });

    return () => {
      unsubLobby();
      unsubPlayers();
      unsubTeams();
    };
  }, []);

  // Compute final data with ranks from Players DB
  const computedTeams = teams.map(team => {
    const boughtPlayers = team.boughtPlayers || [];

    // Enrich bought players with rank & overseas status from source of truth
    const enrichedPlayers = boughtPlayers.map(p => {
      const pDetails = playersMap[String(p.id)];

      // Aligned with PlayerCard logic: Trusted source is the purchased player record (p)
      // We avoid pDetails for overseas check to prevent issues with mismatched DB data
      const isOverseas = !!(p.overseas || p.auction?.overseas || p.country?.includes("✈️"));

      return {
        ...p,
        rank: Number(pDetails?.rank) || Number(pDetails?.importanceScore) || Number(p.rank) || Number(p.importanceScore) || 0,
        isOverseas: isOverseas
      };
    });

    const overseasCount = enrichedPlayers.filter(p => p.isOverseas).length;
    const validPlayers = enrichedPlayers.filter(p => (Number(p.id) < 1000) && !p.role?.toLowerCase().includes('accessory'));
    const isEliminated = (status === "ENDED" || status === "RESULTS") && validPlayers.length < 11;

    return { ...team, boughtPlayers: enrichedPlayers, overseasCount, isEliminated };
  });

  const eliminatedCount = computedTeams.filter(team => team.isEliminated).length;

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
              Final <span className="text-violet-500">Standings</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              Confidential Admin View • Players sorted by Rank
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Eliminated Teams</p>
            <p className="text-2xl font-black text-white">{eliminatedCount}</p>
          </div>
        </div>

        {/* RESULTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {computedTeams.map((team) => (
            <div
              key={team.id}
              className={`bg-[#161822] rounded-3xl border overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group ${team.isEliminated ? 'border-red-500/50 opacity-80' : 'border-white/5 hover:border-violet-500/20'}`}
            >
              {/* Card Header */}
              <div className="bg-white/[0.03] p-6 flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black text-white uppercase italic truncate">
                      {team.name}
                    </h2>
                    {team.isEliminated && (
                      <span className="bg-red-500/20 text-red-500 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-red-500/30 tracking-wider">Eliminated</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Wallet: <span className="text-emerald-400">₹{team.purse}</span>
                  </p>
                </div>
              </div>

              {/* Roster Summary */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-3">Acquisitions (By Rank)</p>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                    {team.boughtPlayers && team.boughtPlayers.length > 0 ? (
                      team.boughtPlayers
                        .sort((a, b) => (Number(b.rank) || 0) - (Number(a.rank) || 0))
                        .map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm group/item">
                            <div className="flex items-center gap-2 truncate flex-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/item:bg-violet-500 transition-colors"></span>
                              <span className="text-slate-300 truncate">
                                {p.name} {p.isOverseas && <span className="text-blue-400 text-[10px] font-bold ml-1">(Overseas)</span>}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-slate-500 ml-2">
                              Rank: {Number(p.rank) || 0}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-600 italic">No players purchased</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Total Bought: <span className={team.isEliminated ? "text-red-500" : "text-white"}>{team.boughtPlayers?.filter(p => (Number(p.id) < 1000) && !p.role?.toLowerCase().includes('accessory')).length || 0}</span></span>
                  <span className="text-slate-500 font-bold">Overseas: <span className="text-blue-400">{team.overseasCount || 0}/8</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {computedTeams.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p>No teams found.</p>
          </div>
        )}

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

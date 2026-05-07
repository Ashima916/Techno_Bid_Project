import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LobbyTeamCard from "../../components/LobbyTeamCard";
import { initLobbySocket } from "../../sockets/lobbyClient";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useToast } from "../../context/ToastContext";

export default function Lobby() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const socketRef = useRef(null);
  const socketInitialized = useRef(false);

  const [teams, setTeams] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [checkingSession, setCheckingSession] = useState(true);
  const [participant, setParticipant] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  /* ---------------- LOGIC (UNTOUCHED - 100% PRESERVED) ---------------- */
  /* ---------------- OPTIMIZED LOGIC ---------------- */
  // 1. Cache participants map for instant lookup (No buffering)
  const participantsMapRef = useRef({});

  useEffect(() => {
    const stored = sessionStorage.getItem("currentParticipant");
    if (stored) setParticipant(JSON.parse(stored));
    setCheckingSession(false);

    // 🔥 FETCH ONCE: Load all participant names immediately
    const fetchParticipants = async () => {
      try {
        const snap = await getDocs(collection(db, "participants"));
        const map = {};
        snap.forEach(doc => {
          const d = doc.data();
          // Map Phone -> Name (fallback to Phone if no name)
          // Also handle legacy Enrollment if needed but prioritize Phone as that's the new ID
          const key = d.phone || d.enrollmentNumber;
          map[key] = d.name || d.phone || d.enrollmentNumber;
        });
        participantsMapRef.current = map;
      } catch (e) {
        console.error("Failed to load participants", e);
      } finally {
        setDataLoaded(true);
      }
    };
    fetchParticipants();
  }, []);

  // 2. Synchronous enrichment using cached map
  const enrichTeamsSync = (incomingTeams) => {
    if (!Array.isArray(incomingTeams)) return [];
    return incomingTeams.map(t => ({
      ...t,
      memberIds: t.members, // Preserve ID
      members: (t.members || []).map(en => participantsMapRef.current[en] || en)
    }));
  };

  useEffect(() => {
    if (checkingSession || !participant || !dataLoaded) return;
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    socketRef.current = initLobbySocket({
      phone: participant.phone,
      onUpdate: (data) => {
        if (data?.locked === true) {
          socketRef.current?.disconnect();
          navigate("/team-card", { replace: true, state: { lockedByAdmin: true } });
          return;
        }

        if (data && data.teams) {
          // 🔥 ZERO DELAY: Use memory cache
          const enriched = enrichTeamsSync(data.teams);

          // SORT: My Team First
          if (participant?.phone) {
            enriched.sort((a, b) => {
              const am = a.memberIds?.includes(participant.phone) ? 1 : 0;
              const bm = b.memberIds?.includes(participant.phone) ? 1 : 0;
              return bm - am;
            });
          }
          setTeams(enriched);
        } else {
          socketRef.current.requestTeams();
        }
      },
      onError: (err) => { showToast(err.message || "Lobby error", 5000, 'error'); },
    });

    socketRef.current.requestTeams();

    return () => {
      socketRef.current?.disconnect();
      socketInitialized.current = false;
    };
  }, [checkingSession, participant, navigate, dataLoaded]);

  const handleJoinTeam = (team) => {
    if (!participant) return;
    socketRef.current.joinTeam({ teamId: team.id, phone: participant.phone });
  };

  const handleCreateTeam = () => {
    console.log("[DEBUG] handleCreateTeam called");
    console.log("[DEBUG] participant:", participant);
    console.log("[DEBUG] teamName:", teamName);
    console.log("[DEBUG] teamSize:", teamSize, "Type:", typeof teamSize);

    if (!participant) {
      console.log("[DEBUG] No participant found!");
      return;
    }
    if (!teamName.trim()) {
      console.log("[DEBUG] Team name is empty!");
      showToast("Please enter a team name", 3000, 'warning');
      return;
    }
    if (!teamSize || teamSize <= 0 || teamSize > 5) {
      console.log("[DEBUG] Team size validation failed. teamSize:", teamSize);
      showToast("Team size must be between 1 and 5", 3000, 'warning');
      return;
    }

    const teamData = {
      name: teamName.trim(),
      maxSize: teamSize,
      phone: participant.phone
    };
    console.log("[DEBUG] Emitting createTeam with data:", teamData);

    socketRef.current.createTeam(teamData);
    setShowCreate(false); setTeamName(""); setTeamSize(1);
  };

  if (checkingSession) return <div className="min-h-screen bg-[#000] flex items-center justify-center text-yellow-500 font-mono tracking-widest italic animate-pulse">INITIATING_CORE...</div>;

  return (
    <div className="min-h-screen bg-[#000] text-white relative font-sans overflow-x-hidden p-6 md:p-10">

      {/* 1. CLEAN DARK BACKGROUND (NO WINDOW WAVE) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-[#0a0a0c] skew-x-[-20deg] translate-x-32 border-l border-white/5 opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-white/10 pb-10">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.5em]">Live  </span>
            </div>
            <h1 className="text-6xl font-[1000] tracking-tighter uppercase italic">
              AUCTION <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600">LOBBY</span>
            </h1>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="group relative px-10 py-5 bg-yellow-500 text-black font-black uppercase italic tracking-tighter rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_10px_40px_rgba(234,179,8,0.2)] active:scale-95"
          >
            <span className="relative z-10 text-xl">+ CREATE NEW TEAM</span>
          </button>
        </div>

        {/* Teams Display Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teams.length > 0 ? (
            teams.map((team, index) => (
              <div key={team.id} className="animate-card-fade relative p-[2px] rounded-2xl overflow-hidden group" style={{ animationDelay: `${index * 0.08}s` }}>

                {/* TRAVELING WAVE ONLY ON CARD HOVER */}
                <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#f59e0b_90%,#ef4444_100%)] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative bg-[#0d0d0f] rounded-2xl">
                  <LobbyTeamCard
                    team={team}
                    onJoin={() => handleJoinTeam(team)}
                    isMyTeam={team.memberIds?.includes(participant?.phone)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-48 rounded-[3rem] bg-white/[0.01] border-2 border-dashed border-white/5 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping"></div>
              </div>
              <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white/20">Waiting for Teams...</p>
            </div>
          )}
        </section>
      </div>

      {/* Creation Modal Overlay */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative p-[3px] rounded-[2.5rem] overflow-hidden w-full max-w-md animate-modal-pop">
            {/* THE TRAVELING WAVE BORDER AROUND MODAL */}
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_60%,#f59e0b_80%,#ef4444_100%)] animate-[spin_3s_linear_infinite]"></div>

            <div className="relative bg-[#0a0a0c] p-12 rounded-[2.3rem]">
              <h2 className="text-4xl font-[1000] italic uppercase tracking-tighter text-white mb-10 text-center">
                CREATE <span className="text-yellow-500">TEAM</span>
              </h2>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g. STRIKER_X"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-6 py-4 bg-[#151517] border border-white/10 rounded-xl focus:border-yellow-500 outline-none text-white font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Team Size</label>
                  <input
                    type="number"
                    min="1" max="5"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value) || "")}
                    className="w-full px-6 py-4 bg-[#151517] border border-white/10 rounded-xl focus:border-yellow-500 outline-none text-white font-bold"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button onClick={handleCreateTeam} className="w-full bg-yellow-500 text-black font-[1000] py-5 rounded-xl uppercase italic text-xl transition-all shadow-xl active:scale-95">Create Team</button>
                  <button onClick={() => setShowCreate(false)} className="w-full bg-white/5 text-slate-500 font-bold py-4 rounded-xl uppercase tracking-widest text-xs">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes card-fade { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes modal-pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-card-fade { animation: card-fade 0.6s ease-out forwards; opacity: 0; }
        .animate-modal-pop { animation: modal-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
}
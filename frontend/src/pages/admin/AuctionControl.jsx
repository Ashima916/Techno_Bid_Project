import { useEffect, useState, useRef, useCallback } from "react";
import { doc, updateDoc, onSnapshot, collection } from "firebase/firestore";
import { db } from "../../firebase";
import PlayerCard from "../../components/PlayerCard";
import {
  initAuctionSocket,
  adminSelectPlayer,
  adminPauseAuction,
  adminResumeAuction,
  disconnectAuctionSocket
} from "../../sockets/auctionClient";
import {
  Play,
  Pause,
  RotateCcw,
  Gavel,
  ChevronRight,
  LayoutGrid,
  Zap,
  AlertTriangle,
  Info,
  Search,
  ChevronDown,
  X
} from "lucide-react";

// Premium Card Design (Synced with Participant)



const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000/api/admin"
  : "https://technobid.onrender.com/api/admin";

export default function AuctionControl() {
  const [status, setStatus] = useState("IDLE"); // IDLE | LIVE
  const [rawStatus, setRawStatus] = useState("");
  const [phase, setPhase] = useState("BATTERS");
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [liveAuctionData, setLiveAuctionData] = useState(null);
  const [teamsList, setTeamsList] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [useSpecialToken, setUseSpecialToken] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // To detect clicks outside

  const [showAssignModal, setShowAssignModal] = useState(false);

  const currentPlayerIdRef = useRef(null);

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const currentPlayer = players[currentIndex] ? (
    liveAuctionData?.player?.id && String(liveAuctionData.player.id) === String(players[currentIndex].id) && liveAuctionData?.status
      ? {
        ...players[currentIndex],
        ...liveAuctionData.player,
        status: liveAuctionData.status,
        wasSent: true // Force true if physically on auction
      }
      : players[currentIndex]
  ) : null;

  // Keep Ref updated with latest ID to combat stale closures in useEffect
  currentPlayerIdRef.current = currentPlayer?.id;

  // Real-time Teams Listener (Fixes Stale Wallet in Dropdown)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teams"), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeamsList(list);
    }, (error) => console.error("Teams listener error:", error));
    return () => unsub();
  }, []);

  const handleAssignPlayer = async () => {
    if (!selectedTeamId) return alert("Please select a team");
    // Always require a valid price, even with special token
    if (!soldPrice || Number(soldPrice) <= 0) return alert("Please enter a valid sold price");

    // Check if price is less than base price
    const basePrice = currentPlayer?.auction?.base || 0;
    if (Number(soldPrice) < basePrice) {
      return alert(`Price cannot be less than base price of ₹${basePrice}`);
    }

    if (!currentPlayer) return;

    setIsAssigning(true);
    try {
      await callAPI(`${API}/assign-player`, {
        playerId: currentPlayer.id,
        teamId: selectedTeamId,
        soldPrice: Number(soldPrice), // Always send the entered price
        useSpecialToken: useSpecialToken
      });
      // The socket/live listener will update the UI automatically once status changes to SOLD
      setSelectedTeamId("");
      setSoldPrice("");
      setUseSpecialToken(false);
      setShowAssignModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to assign: " + e.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleMarkAsUnsold = async () => {
    if (!currentPlayer) return;
    if (!window.confirm(`Are you sure you want to mark ${currentPlayer.name} as UNSOLD?`)) return;

    setIsAssigning(true);
    try {
      await callAPI(`${API}/mark-unsold`, {
        playerId: currentPlayer.id
      });
      // The socket/live listener will update the UI automatically once status changes to UNSOLD
      setSelectedTeamId("");
      setSoldPrice("");
      setUseSpecialToken(false);
      setShowAssignModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to mark as unsold: " + e.message);
    } finally {
      setIsAssigning(false);
    }
  };

  /* ================= LOGIC ================= */
  const fetchPlayers = useCallback(async (selectedPhase, shouldResetIndex = true) => {
    // Capture ID from Ref (Current State)
    const savedId = currentPlayerIdRef.current;

    try {
      const res = await fetch(`${API}/players?phase=${selectedPhase}`);
      const data = await res.json();
      const newPlayers = data.players || [];
      setPlayers(newPlayers);

      if (shouldResetIndex) {
        setCurrentIndex(0);
      } else if (savedId) {
        // Restore position of the same player
        const newIndex = newPlayers.findIndex(p => p.id === savedId);
        if (newIndex !== -1) {
          setCurrentIndex(newIndex);
        } else if (currentIndexRef.current >= newPlayers.length) {
          // Safety fallback if player gone and index out of bounds
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      console.error("Fetch Players Error:", err);
      setMessage("❌ Failed to load players: " + (err.message || "Unknown error"));
    }
  }, []);

  useEffect(() => {
    fetchPlayers(phase, true);
  }, [phase, fetchPlayers]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to Lobby Settings
  useEffect(() => {
    const lobbyRef = doc(db, "settings", "lobby");
    const unsubscribe = onSnapshot(lobbyRef, (docSnap) => {
      if (docSnap.exists()) {
        const lobbyData = docSnap.data();
        setRawStatus(lobbyData.status || "");
        if (lobbyData.status === "STARTING" || lobbyData.status === "LIVE") {
          setStatus("LIVE");
        } else if (lobbyData.status === "PAUSED") {
          setStatus("PAUSED");
        } else if (lobbyData.status === "RESULTS" || lobbyData.status === "ENDED") {
          setStatus("ENDED");
        } else {
          setStatus("IDLE");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Live Auction Data (VIA SOCKET NOW) & Refresh List on End
  useEffect(() => {
    const handleSocketUpdate = (data) => {
      // console.log("Admin Socket Update:", data);
      setLiveAuctionData(prev => ({
        ...prev,
        ...data
      }));

      // Automatically open modal when player is pushed to auction
      if (data.status === "ON_AUCTION") {
        setShowAssignModal(true);
        // Reset form fields
        setSoldPrice("");
        setSelectedTeamId("");
        setUseSpecialToken(false);
      }

      // Close modal if player is no longer on auction
      if (data.status !== "ON_AUCTION") {
        setShowAssignModal(false);
      }

      // Refresh player list if auction just finished
      if (data.status === "SOLD" || data.status === "UNSOLD") {
        fetchPlayers(phase, false); // Keep index, refresh list to show status
      }
    };

    initAuctionSocket({
      onSync: (data) => handleSocketUpdate(data),
      onUpdate: (data) => handleSocketUpdate(data),
      onError: (err) => setMessage("⚠️ " + err)
    });

    return () => disconnectAuctionSocket();
  }, [fetchPlayers, phase]);

  // Sync View to Live Player (Preserves state on refresh)
  const lastSyncedIdRef = useRef(null);

  useEffect(() => {
    if (liveAuctionData?.player?.id && players.length > 0) {
      // Only sync if we are in an active flow or on auction
      if (["ACTIVE", "ON_AUCTION", "SOLD"].includes(liveAuctionData.status)) {
        const liveId = String(liveAuctionData.player.id);

        // Only sync if the live player has CHANGED from what we last saw
        // This prevents locking the view, allowing admin to browse next/prev
        if (lastSyncedIdRef.current !== liveId) {
          const idx = players.findIndex(p => String(p.id) === liveId);
          if (idx !== -1) {
            setCurrentIndex(idx);
            lastSyncedIdRef.current = liveId;
          }
        }
      }
    }
  }, [liveAuctionData?.player?.id, players]);

  const callAPI = async (url, body = null) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON API Response:", text);
        throw new Error("Server returned non-JSON response (check console)");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      setMessage(data.message || "Action completed");
      return true;
    } catch (err) {
      console.error("API Call Error:", err);
      setMessage("❌ Error: " + (err.message || "Backend not reachable"));
      return false;
    }
  };

  const togglePause = () => {
    if (status === "PAUSED") adminResumeAuction();
    else adminPauseAuction();
  };

  const endAuction = async () => {
    if (!window.confirm("⚠️ Are you sure you want to END the auction? This will move all participants to the Results page.")) return;
    try {
      await updateDoc(doc(db, "settings", "lobby"), { status: "RESULTS" });
    } catch (err) {
      console.error("Failed to end auction", err);
    }
  };

  const startAuction = async () => {
    try {
      if (rawStatus !== "LOCKED") {
        setMessage("⚠️ Please LOCK the lobby first (in Lobby Management)");
        return;
      }
      const lobbyRef = doc(db, "settings", "lobby");
      await updateDoc(lobbyRef, { status: "STARTING" });
      const success = await callAPI(`${API}/start-auction`);
      if (success) {
        setStatus("LIVE");
        setMessage("✅ Auction Started successfully!");
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  };

  const sendPlayerToAuction = async () => {
    if (!currentPlayer) return;
    // SOCKET EMIT
    adminSelectPlayer(currentPlayer.id);
    setMessage(`🎯 pushing ${currentPlayer.name}...`);
  };

  const nextPlayer = () => {
    setCurrentIndex((i) => i + 1 < players.length ? i + 1 : i);
  };

  const prevPlayer = () => {
    setCurrentIndex((i) => i - 1 >= 0 ? i - 1 : i);
  };

  const restartAuction = async () => {
    if (!window.confirm("⚠️ Are you sure you want to RESTART?")) return;
    try {
      const lobbyRef = doc(db, "settings", "lobby");
      await updateDoc(lobbyRef, { status: "LOCKED" });
      const success = await callAPI(`${API}/restart-auction`);
      if (success) {
        setStatus("IDLE");
        setPhase("BATTERS");
        fetchPlayers("BATTERS");
        setMessage("🔄 Auction has been restarted.");
      }
    } catch (err) {
      setMessage("❌ Error restarting: " + err.message);
    }
  };

  /* ================= MODERN UI ================= */

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-200 p-4 md:p-8 font-sans relative">
      {/* PLAYER ASSIGNMENT MODAL */}
      {showAssignModal && currentPlayer?.status === "ON_AUCTION" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-[#161822] border border-violet-500/50 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center space-y-6 animate-in zoom-in-95">

            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mx-auto w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mb-4">
              <Zap size={32} className="text-violet-400" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Assign Player</h2>
              <p className="text-slate-400 text-sm mt-2">Select winning team and enter final price after offline bidding</p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <p className="text-xs uppercase font-bold text-slate-500 tracking-widest mb-1">Player</p>
              <p className="text-xl font-bold text-white">{currentPlayer?.name} ({currentPlayer?.role})</p>
              <p className="text-xs text-slate-400 mt-2">Base Price: <span className="text-yellow-500 font-bold">₹{currentPlayer?.auction?.base || 0}</span></p>
            </div>

            <div className="space-y-4">
              <div className="text-left">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Assign To Team</label>
                <select
                  className="w-full mt-1 bg-slate-800 text-white p-4 rounded-xl border border-white/10 focus:ring-2 focus:ring-violet-500 outline-none"
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    // Reset special token if team already used it
                    const team = teamsList.find(t => t.id === e.target.value);
                    if (team?.specialTokenUsed) {
                      setUseSpecialToken(false);
                    }
                  }}
                >
                  <option value="">-- Select Winner --</option>
                  {teamsList.map(t => {
                    // Always check if team has enough funds
                    const enteredPrice = Number(soldPrice) || 0;
                    const walletBalance = Number(t.purse || 0);
                    const hasInsufficientFunds = enteredPrice > 0 && walletBalance < enteredPrice;

                    // Check player count (max 15 players per team)
                    const playerCount = (t.boughtPlayers || []).filter(p => Number(p.id) < 1000 && !p.role?.toLowerCase().includes('accessory')).length;
                    const isSquadFull = playerCount >= 15;

                    // Check overseas limit (max 8 overseas players per team)
                    const isCurrentPlayerOverseas = currentPlayer?.auction?.overseas || currentPlayer?.overseas;
                    const overseasCount = (t.boughtPlayers || []).reduce((count, p) => {
                      const pOverseas = p.auction?.overseas || p.overseas || (p.country && p.country.includes("Overseas"));
                      return count + (pOverseas ? 1 : 0);
                    }, 0);
                    const hasOverseasLimitReached = isCurrentPlayerOverseas && overseasCount >= 8;

                    return (
                      <option
                        key={t.id}
                        value={t.id}
                        disabled={hasInsufficientFunds || isSquadFull || hasOverseasLimitReached}
                      >
                        {t.name} (Wallet: ₹{t.purse}, Players: {playerCount}/15, Overseas: {overseasCount}/8)
                        {t.specialTokenUsed ? " - Token Used" : ""}
                        {isSquadFull ? " - Squad Full" : ""}
                        {hasOverseasLimitReached ? " - Overseas Limit Reached" : ""}
                        {hasInsufficientFunds ? " - Insufficient Funds" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="text-left">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-800/50 p-4 rounded-xl border border-white/10 hover:border-violet-500/50 transition-all">
                  <input
                    type="checkbox"
                    checked={useSpecialToken}
                    disabled={teamsList.find(t => t.id === selectedTeamId)?.specialTokenUsed}
                    onChange={(e) => setUseSpecialToken(e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-700 border-white/20 text-violet-600 focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-white">Use Special Token</span>
                    <p className="text-xs text-slate-400 mt-0.5">Mark this assignment with special token (one-time per team)</p>
                  </div>
                </label>
              </div>

              {/* Price input - ALWAYS VISIBLE */}
              <div className="text-left">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Sold Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="Enter final price"
                  className="w-full mt-1 bg-slate-800 text-white p-4 rounded-xl border border-white/10 focus:ring-2 focus:ring-violet-500 outline-none"
                  value={soldPrice}
                  onChange={(e) => {
                    const newPrice = e.target.value;
                    setSoldPrice(newPrice);

                    // Clear selected team if they can't afford the new price
                    if (selectedTeamId && newPrice) {
                      const selectedTeam = teamsList.find(t => t.id === selectedTeamId);
                      if (selectedTeam && selectedTeam.purse < Number(newPrice)) {
                        setSelectedTeamId("");
                      }
                    }
                  }}
                />
                {soldPrice && Number(soldPrice) > 0 && (
                  <>
                    <p className="text-xs text-slate-400 mt-2 ml-1">
                      {teamsList.filter(t => t.purse >= Number(soldPrice)).length} team(s) can afford this price
                    </p>
                    {Number(soldPrice) < (currentPlayer?.auction?.base || 0) && (
                      <p className="text-xs text-red-400 mt-1 ml-1 font-bold">
                        ⚠️ Price is below base price of ₹{currentPlayer?.auction?.base}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAssignPlayer}
                  disabled={isAssigning}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigning ? "Processing..." : "Confirm Assignment"}
                </button>

                <button
                  onClick={handleMarkAsUnsold}
                  disabled={isAssigning}
                  className="w-full bg-red-600/10 hover:bg-red-600 border-2 border-red-500/50 hover:border-red-500 text-red-500 hover:text-white font-black uppercase py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigning ? "Processing..." : "Mark as Unsold"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }

      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP NAV / HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 text-violet-400 mb-1">
              <Gavel size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Control Center</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Auction <span className="text-violet-500">Live</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">


            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border ${status === "LIVE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              status === "PAUSED" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                "bg-slate-800 border-white/5 text-slate-400"
              }`}>
              <div className={`h-2 w-2 rounded-full ${status === "LIVE" ? "bg-emerald-500 animate-pulse" :
                status === "PAUSED" ? "bg-amber-500" :
                  "bg-slate-600"
                }`} />
              <span className="text-xs font-bold uppercase">{status}</span>
            </div>

            {status === "IDLE" ? (
              <button
                onClick={startAuction}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Play size={20} fill="currentColor" />
                Start Auction
              </button>
            ) : status === "ENDED" ? (
              <button
                onClick={restartAuction}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <RotateCcw size={20} />
                Reset Auction
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={togglePause}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all active:scale-95 ${status === "PAUSED"
                    ? "bg-amber-500 shadow-amber-500/20 hover:brightness-110"
                    : "bg-slate-700 hover:bg-slate-600"
                    }`}
                >
                  {status === "PAUSED" ? (
                    <>
                      <Play size={20} fill="currentColor" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause size={20} fill="currentColor" /> Pause
                    </>
                  )}
                </button>

                <button
                  onClick={endAuction}
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/50 px-4 py-3 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                  title="End Auction & Show Results"
                >
                  <AlertTriangle size={20} />
                  End
                </button>
              </div>
            )}
          </div>
        </header>

        {/* NOTIFICATION TOAST (Minimal) */}
        {message && (
          <div className="flex items-center gap-3 bg-violet-600/20 border border-violet-500/30 p-4 rounded-2xl animate-in slide-in-from-top-4 duration-300">
            <Info size={18} className="text-violet-400" />
            <p className="text-sm font-medium text-violet-200">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: PLAYER SELECTION & CONTROLS */}
          <div className="lg:col-span-4 space-y-6">

            {/* START BUTTON PANEL */}
            {status === "IDLE" && (!liveAuctionData || liveAuctionData.status === "IDLE") && (
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-1 rounded-3xl shadow-lg shadow-violet-900/20">
                <button
                  onClick={startAuction}
                  className="w-full bg-[#0f111a]/20 backdrop-blur-sm p-6 rounded-[22px] flex flex-col items-center gap-3 group transition-all hover:bg-transparent"
                >
                  <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                    <Zap size={24} className="fill-white text-white" />
                  </div>
                  <span className="font-black text-white tracking-wide uppercase">Initialize Global Auction</span>
                </button>
              </div>
            )}

            {/* PHASE SELECTOR */}
            <section className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl">
              <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                <LayoutGrid size={14} /> Category Phase
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {["BATTERS", "BOWLERS", "WICKET_KEEPER", "ALL_ROUNDER"].map((p) => (
                  <button
                    key={p}
                    onClick={async () => {
                      setPhase(p);
                      await callAPI(`${API}/change-phase`, { phase: p });
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${phase === p
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    {p}
                    {phase === p && <ChevronRight size={16} />}
                  </button>
                ))}
              </div>
            </section>


          </div>

          {/* RIGHT COLUMN: CURRENT PLAYER DISPLAY */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 h-full flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white">Stage Command</h2>
                  <p className="text-sm text-slate-500 italic">Select and push player to live arena</p>
                </div>

                <div className="relative w-full md:w-72 z-[100]" ref={dropdownRef}>

                  {/* Trigger Button */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-slate-800 text-white text-sm font-bold px-4 py-3 rounded-xl border border-white/10 flex items-center justify-between hover:bg-slate-700 transition-all outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <span className="truncate mr-2">
                      {currentPlayer ? (
                        <>
                          {currentPlayer.status === "SOLD" ? "🟢 " : currentPlayer.wasSent && currentPlayer.status === "UNSOLD" ? "🔴 " : currentPlayer.wasSent ? "✔ " : "⚪ "}
                          {currentPlayer.name}
                        </>
                      ) : "Select Player..."}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Content */}
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-[#1a1d2d] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-200 origin-top z-[110]">

                      {/* Search Input Sticky Top */}
                      <div className="p-2 border-b border-white/5 bg-[#1a1d2d] sticky top-0 z-10">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                          <input
                            autoFocus
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-slate-900/50 text-white text-xs font-bold pl-9 pr-3 py-2.5 rounded-lg border border-white/5 outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Scrollable List */}
                      <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                        {players
                          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((p) => {
                            let prefixColor = "bg-slate-600";
                            if (p.status === "SOLD") prefixColor = "bg-emerald-500";
                            else if (p.status === "UNSOLD" && p.wasSent) prefixColor = "bg-red-500";
                            else if (p.wasSent) prefixColor = "bg-blue-500"; // Active/Sent

                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  // Ensure loose equality or string conversion
                                  const index = players.findIndex(orig => String(orig.id) === String(p.id));
                                  if (index !== -1) {
                                    setCurrentIndex(index);
                                  }
                                  setIsDropdownOpen(false);
                                  setSearchQuery("");
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 hover:bg-white/5 transition-colors ${p.id === currentPlayer?.id ? "bg-violet-600/20 text-violet-200" : "text-slate-300"}`}
                              >
                                <span className={`w-2 h-2 rounded-full ${prefixColor} shrink-0`} />
                                <span className="truncate font-medium">{p.name}</span>
                              </button>
                            );
                          })}
                        {players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="p-4 text-center text-slate-500 text-xs font-medium">No players found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {currentPlayer?.status === "SOLD" && (
                <div className="mb-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
                  <AlertTriangle className="text-amber-500" size={20} />
                  <div>
                    <p className="text-amber-400 font-bold text-sm uppercase tracking-wider">Player Sold</p>
                    <p className="text-white font-medium text-sm">
                      Sold to <span className="font-bold text-amber-400">{currentPlayer.soldToTeamName || `Team ${currentPlayer.soldToTeamId}`}</span> for <span className="font-bold text-white">₹{currentPlayer.soldPrice}</span>
                    </p>
                  </div>
                </div>
              )}

              {currentPlayer?.status === "UNSOLD" && currentPlayer.wasSent && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                  <AlertTriangle className="text-red-500" size={20} />
                  <div>
                    <p className="text-red-400 font-bold text-sm uppercase tracking-wider">Player Unsold</p>
                    <p className="text-white font-medium text-sm">
                      This player was not picked by any team.
                    </p>
                  </div>
                </div>
              )}

              {!currentPlayer ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl py-20">
                  <div className="p-4 bg-slate-800 rounded-full mb-4">
                    <LayoutGrid size={32} className="text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-medium">Wait List Empty</p>
                </div>
              ) : (
                <div className="flex-1 space-y-8 animate-in fade-in zoom-in-95 duration-500">

                  {/* Player is on auction - waiting for assignment */}
                  {currentPlayer?.status === "ON_AUCTION" && (
                    <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-violet-400 text-[10px] font-black uppercase tracking-widest">On Auction</p>
                        <p className="text-xl font-bold text-white">Awaiting assignment...</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#0f111a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex justify-center w-full max-w-[400px] mx-auto">
                    <PlayerCard
                      player={currentPlayer}
                      status={
                        currentPlayer.status === "SOLD" ? "SOLD" :
                          currentPlayer.status === "UNSOLD" && currentPlayer.wasSent ? "UNSOLD" :
                            "ACTIVE"
                      }
                      winningTeam={currentPlayer.soldToTeamName || `Team ${currentPlayer.soldToTeamId}`}
                      finalPrice={currentPlayer.soldPrice}
                      className="w-full h-[550px] md:h-[600px] rounded-[2.5rem]"
                      showBidButton={false}
                      isAdmin={true}
                    />
                  </div>

                  <div className="space-y-3">
                    {/* Assign Player Button - Shows when player is on auction */}
                    {((currentPlayer.status === "ON_AUCTION") ||
                      (liveAuctionData?.status === "ON_AUCTION" && String(liveAuctionData?.player?.id) === String(currentPlayer.id))) && (
                        <button
                          onClick={() => {
                            setSoldPrice("");
                            setSelectedTeamId("");
                            setUseSpecialToken(false);
                            setShowAssignModal(true);
                          }}
                          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-tighter transition-all px-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-600/30 animate-pulse"
                        >
                          <Gavel size={22} />
                          Assign Player to Team
                        </button>
                      )}

                    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                      <button
                        onClick={sendPlayerToAuction}
                        disabled={currentPlayer.wasSent || status === "PAUSED"}
                        className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all px-6 ${currentPlayer.wasSent || status === "PAUSED"
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                          : "bg-white text-black hover:bg-violet-400"
                          }`}
                      >
                        <Gavel size={20} />
                        {currentPlayer.wasSent ? "Sent" : status === "PAUSED" ? "Paused" : "Push"}
                      </button>
                      <button
                        onClick={prevPlayer}
                        className="flex items-center justify-center bg-slate-800 text-white p-4 rounded-2xl font-bold hover:bg-slate-700 transition-all border border-white/5 w-16"
                        title="Previous Player"
                      >
                        <ChevronRight size={18} className="rotate-180" />
                      </button>
                      <button
                        onClick={nextPlayer}
                        className="flex items-center justify-center bg-slate-800 text-white p-4 rounded-2xl font-bold hover:bg-slate-700 transition-all border border-white/5 w-16"
                        title="Next Player"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div >
  );
}
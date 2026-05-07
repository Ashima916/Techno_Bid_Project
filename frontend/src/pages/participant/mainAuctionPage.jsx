
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import PlayerCard from "../../components/PlayerCard";
import { initAuctionSocket, disconnectAuctionSocket } from "../../sockets/auctionClient";

export default function AuctionArena() {
  const navigate = useNavigate();

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [displayPlayer, setDisplayPlayer] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState("IDLE");
  const [soldToTeam, setSoldToTeam] = useState(null);
  const [soldPrice, setSoldPrice] = useState(0);
  const [specialTokenUsed, setSpecialTokenUsed] = useState(false);


  // 1. Participant Setup
  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("currentParticipant"));
    if (!stored) navigate("/");
    else setParticipant(stored);
  }, [navigate]);

  // 2. Team Identification & Real-time Updates
  useEffect(() => {
    if (!participant?.phone) return;
    let unsubTeam = null;

    const initTeamListener = async () => {
      try {
        const q = query(collection(db, "teams"), where("members", "array-contains", participant.phone));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const tid = snap.docs[0].id;

          // Real-time listener for the team document (for purse & boughtPlayers)
          unsubTeam = onSnapshot(doc(db, "teams", tid), (d) => {
            if (d.exists()) {
              setMyTeam(d.data());
            }
          });
        }
      } catch (err) { console.error("Team Sync Error:", err); }
    };

    initTeamListener();
    return () => unsubTeam && unsubTeam();
  }, [participant]);

  // 3. SOCKET.IO AUCTION LISTENER
  useEffect(() => {
    initAuctionSocket({
      onSync: (data) => {
        if (data.player) setDisplayPlayer(data.player);
        setCurrentPlayer(data.player || null);
        setIsPaused(data.isPaused);
        setSoldToTeam(data.soldToTeam || null);
        setSoldPrice(data.soldPrice || 0);
        setSpecialTokenUsed(data.specialTokenUsed || false);

        let derivedStatus = "IDLE";
        if (data.isPaused) derivedStatus = "PAUSED";
        else if (data.player) {
          if (["SOLD", "UNSOLD", "ON_AUCTION"].includes(data.player.status)) {
            derivedStatus = data.player.status === "ON_AUCTION" ? "ACTIVE" : data.player.status;
          } else {
            derivedStatus = "ACTIVE";
          }
        }
        setAuctionStatus(derivedStatus);
      },
      onUpdate: (data) => {
        if (data.player) setDisplayPlayer(data.player);
        setCurrentPlayer(data.player || null);

        if (data.status) setAuctionStatus(data.status);
        if (data.soldToTeam) setSoldToTeam(data.soldToTeam);
        if (data.soldPrice !== undefined) setSoldPrice(data.soldPrice);
        if (data.specialTokenUsed !== undefined) setSpecialTokenUsed(data.specialTokenUsed);

        if (data.status === "PAUSED") setIsPaused(true);
        else setIsPaused(false);
      },
      onError: (msg) => {
        setFeedbackMsg(msg);
      },
      onResult: (result) => {
        if (result.specialToken !== undefined) {
          setSpecialTokenUsed(result.specialToken);
        }
      }
    });

    return () => disconnectAuctionSocket();
  }, []);

  // 4. Lobby Status Listener
  useEffect(() => {
    const lobbyRef = doc(db, "settings", "lobby");
    const unsubscribe = onSnapshot(lobbyRef, (docSnap) => {
      if (docSnap.exists()) {
        const status = docSnap.data().status;

        if (status === "PAUSED") setIsPaused(true);

        if (status === "RESULTS" || status === "ENDED") {
          navigate("/results", { replace: true });
        }
        else if (status === "OPEN") {
          navigate("/lobby", { replace: true });
        }
        else if (status === "LOCKED") {
          navigate("/team-card", { replace: true });
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden pb-10">
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 md:py-8 flex flex-col gap-6">
        {/* Header */}
        <nav className="flex flex-col md:flex-row justify-between items-center bg-[#0d0d0f] border border-white/10 p-3 md:p-6 rounded-2xl backdrop-blur-xl gap-3 md:gap-4">
          <h1 className="text-xl md:text-2xl font-[1000] italic">TECHNO-BID<span className="text-yellow-500">LIVE</span></h1>

          <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 w-full md:w-auto">
            {/* Participant & Team Info */}
            <div className="flex flex-col gap-1 flex-1 md:flex-initial">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center font-black text-black text-[10px]">
                  {participant?.name?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <p className="text-white font-[1000] text-[11px] md:text-sm uppercase italic tracking-tighter">
                  {participant?.name || "User"}
                </p>
              </div>
              <p className="text-[9px] md:text-[10px] text-yellow-500/80 font-bold uppercase tracking-tight pl-8 md:pl-0">
                {myTeam?.name ? (myTeam.name.toLowerCase().includes('team') ? myTeam.name : `Team ${myTeam.name}`) : "Unassigned"}
              </p>
            </div>

            {/* Budget & Special Token */}
            <div className="text-right border-l border-white/10 pl-3 md:pl-6">
              <p className="text-[7px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Wallet</p>
              <p className="text-lg md:text-2xl font-[1000] text-white italic leading-none">₹{myTeam?.purse?.toLocaleString() || 0}</p>
              {myTeam?.specialTokenUsed === false && (
                <p className="text-[7px] md:text-[8px] text-violet-400 font-bold uppercase mt-1">⭐ Token Available</p>
              )}
            </div>
          </div>
        </nav>

        {/* Auction Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          <section className="order-1 lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[480px] relative">
              <div className="absolute inset-[-6px] bg-yellow-500/5 rounded-[40px] border border-yellow-500/10 animate-pulse"></div>

              {displayPlayer ? (
                <div className="relative w-full h-full">
                  <PlayerCard
                    player={displayPlayer}
                    status={auctionStatus === "SOLD" ? "SOLD" : auctionStatus === "UNSOLD" ? "UNSOLD" : "ACTIVE"}
                    winningTeam={soldToTeam}
                    finalPrice={soldPrice}
                    className="w-full h-auto min-h-[600px] md:min-h-[720px] rounded-[35px] shadow-2xl"
                  />
                </div>
              ) : (
                <div className="w-full h-[600px] bg-[#0d0d0f] border-2 border-dashed border-white/10 rounded-[35px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">
                      Awaiting New Player For Auction ...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="order-2 lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0d0d0f] rounded-[2.5rem] p-8 md:p-12 border border-white/10">

              {/* Auction Status Info */}
              {currentPlayer && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-yellow-500 text-[9px] font-black tracking-[0.4em] uppercase mb-2">Status</p>
                  <h2 className="text-3xl md:text-5xl font-[1000] italic leading-tight text-white">
                    {auctionStatus === "SOLD" ? "SOLD!" : auctionStatus === "UNSOLD" ? "UNSOLD" : "ON AUCTION"}
                  </h2>

                  {auctionStatus === "SOLD" && soldToTeam && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-slate-500 font-bold uppercase text-xs mb-1">Player Sold to Team</p>
                      <p className="text-xl font-black italic text-yellow-500 uppercase">{soldToTeam}</p>

                      <p className="text-slate-500 font-bold uppercase text-xs mt-3 mb-1">Final Price</p>
                      <p className="text-2xl font-black text-white flex items-center gap-2">
                        ₹{soldPrice?.toLocaleString()}
                        {specialTokenUsed && <span className="text-lg text-violet-400" title="Special Token Used">⭐</span>}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!currentPlayer && (
                <div className="bg-white/5 p-8 rounded-2xl border border-white/5 text-center">
                  <p className="text-slate-500 font-bold uppercase text-sm">Waiting for next player...</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* TEAM SQUAD SECTION */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-[1000] italic uppercase tracking-tighter text-white">
              Your Squad <span className="text-yellow-500 text-lg not-italic font-bold">({
                (myTeam?.boughtPlayers?.filter(p => (Number(p.id) < 1000) && !p.role?.toLowerCase().includes('accessory')).length || 0)
              })</span>
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myTeam?.boughtPlayers?.length > 0 ? (
              myTeam.boughtPlayers.map((p, i) => (
                <div key={i} className="bg-[#0d0d0f] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-yellow-500/30 transition-all group animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest leading-none">{p.role}</span>
                    <h4 className="text-sm font-black text-white uppercase italic leading-none">
                      {p.name}
                      {p.overseas ? <span className="text-[10px] text-blue-400 ml-1 normal-case not-italic font-bold">(Overseas)</span> : null}
                      {p.acquiredViaSpecialToken && <span className="text-[10px] text-violet-400 ml-1">⭐</span>}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Value</p>
                    <p className="font-black text-white italic text-base">
                      ₹{p.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-[10px]">Waiting for First Purchase...</p>
              </div>
            )}
          </div>
        </section>


        {feedbackMsg && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm">
            <div className="bg-red-600 text-white px-8 py-4 rounded-2xl text-center font-black shadow-2xl">
              ⚠️ {feedbackMsg}
            </div>
          </div>
        )}

        {isPaused && (
          <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-6 text-center backdrop-blur-sm">
            <div>
              <h2 className="text-5xl font-[1000] text-yellow-500 uppercase italic mb-2">Paused</h2>
              <p className="text-slate-400 font-bold">Admin has paused the auction.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
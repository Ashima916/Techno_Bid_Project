import React from "react";

const PlayerCard = ({ player, status = "ACTIVE", className, winningTeam, finalPrice, showStamp = true, isAdmin = false }) => {
  // Fix for Image Accessibility: checking multiple possible field names
  const imageUrl = player?.imageURL || player?.imageUrl || player?.image || player?.photo || player?.img;

  // Extract base price from auction object or direct field
  const basePrice = player?.auction?.base || player?.basePrice || 0;

  // Extra Details
  const isOverseas = player?.overseas || player?.auction?.overseas || player?.country?.includes("✈️");
  const strengths = player?.strengths || [];
  const style = player?.battingStyle || player?.bowlingStyle || player?.style || "Standard";
  const leadership = player?.leadership || "Team Player";
  const fitness = player?.fitness || "Fit";
  const position = player?.position || player?.role || "Player";
  const score = player?.rank || player?.importanceScore || player?.score || "N/A";
  const formerTeams = player?.formerTeams || player?.teams || [];


  return (
    <div className={`relative overflow-hidden bg-[#0a0a0c] border border-white/10 ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={player?.name}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-opacity duration-500"
          onError={(e) => {
            e.target.src = "https://placehold.co/500x700/1e293b/FFF?text=Image+Not+Found";
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-slate-500">
          No Image Available
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>

      {/* TOP TAGS: Role & Score/Rating */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-yellow-500 text-black text-[9px] md:text-[10px] font-[1000] px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">
              {(player?.role || "Player")}
            </span>
            {isOverseas && (
              <span className="bg-blue-600 text-white text-[8px] md:text-[9px] font-black px-2 py-1 rounded-full uppercase">✈️ Overseas</span>
            )}
          </div>
          <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border-l-2 border-yellow-500 w-fit">
            <p className="text-white/80 text-[7px] md:text-[8px] font-bold uppercase tracking-tight italic">{style}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          {isAdmin && (
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center shadow-2xl">
              <p className="text-yellow-500/40 text-[7px] font-black uppercase leading-none mb-0.5">Rank Score</p>
              <p className="text-white font-[1000] text-xs md:text-sm italic">{score}</p>
            </div>
          )}
          <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 shadow-xl">
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase leading-none mb-1 tracking-tighter">Age</p>
            <p className="text-[10px] md:text-sm font-[1000] text-violet-400 capitalize">{player?.age || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* PLAYER INFO - BOTTOM SECTION */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-10 space-y-3 md:space-y-4">

        {/* Name & Leadership */}
        <div>
          <h2 className="text-3xl md:text-5xl font-[1000] italic uppercase leading-none tracking-tighter text-white drop-shadow-2xl">
            {player?.name || "Unknown Asset"}
          </h2>
          <div className="flex justify-between items-center mt-1">
            <p className="text-yellow-500/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">{leadership}</p>
            <p className="text-white/60 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Fitness: <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">{fitness}</span></p>
          </div>
        </div>

        {/* Strengths / Purpose */}
        {(strengths.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {strengths.map((str, idx) => (
              <span key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded-full text-[7px] md:text-[9px] text-slate-300 font-bold uppercase">
                {str}
              </span>
            ))}
          </div>
        )}

        {/* Core Stats / formerTeams / All Info */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {player?.stats && Object.entries(player.stats)
              .sort(([keyA], [keyB]) => {
                const priority = ["matches", "inn", "runs", "hs", "avg", "sr", "wickets", "eco", "best"];
                const idxA = priority.indexOf(keyA.toLowerCase());
                const idxB = priority.indexOf(keyB.toLowerCase());
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return keyA.localeCompare(keyB);
              })
              .map(([label, value], i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl p-2 rounded-xl border border-white/10 text-center">
                  <p className="text-yellow-500 font-black text-xs md:text-sm truncate leading-none mb-1">{value}</p>
                  <p className="text-[6px] text-white/50 uppercase font-bold tracking-tight leading-none truncate">{label}</p>
                </div>
              ))}
          </div>
          {formerTeams.length > 0 && (
            <p className="text-[7px] text-white/40 uppercase font-bold tracking-widest truncate">
              Professional Experience: <span className="text-white/70 italic">{formerTeams.join(", ")}</span>
            </p>
          )}
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1 tracking-widest">Role</p>
              <p className="text-xs font-black text-violet-400 italic leading-none uppercase">{position}</p>
            </div>
            <div className="text-right">
              <p className="text-[6px] font-black text-slate-500 uppercase leading-none mb-0.5">Country</p>
              <p className="text-[9px] font-black text-white italic leading-none">{player?.country || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-yellow-500/30 flex justify-between items-center shadow-2xl">
          <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Base Price</span>
          <span className="text-base md:text-xl font-[1000] text-white">₹{basePrice.toLocaleString()}</span>
        </div>
      </div>

      {/* SOLD STAMP */}
      {showStamp && status === "SOLD" && !isAdmin && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-500">
          <div className="bg-red-600 text-white font-[1000] italic text-6xl md:text-8xl px-12 py-6 -rotate-12 border-8 border-white shadow-[0_0_50px_rgba(220,38,38,0.5)] uppercase">
            SOLD
          </div>
          <div className="mt-10 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Bought By</p>
            <p className="text-3xl font-black text-white uppercase italic">{winningTeam}</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">₹{finalPrice?.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* UNSOLD STAMP */}
      {showStamp && status === "UNSOLD" && !isAdmin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-500">
          <div className="bg-gray-700 text-white font-[1000] italic text-5xl md:text-7xl px-12 py-6 -rotate-12 border-8 border-white/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] uppercase grayscale">
            UNSOLD
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;

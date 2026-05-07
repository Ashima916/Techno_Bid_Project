import React from "react";

export default function LobbyTeamCard({ team, onJoin, isMyTeam }) {
  const currentSize = team.members?.length || 0;
  const isFull = currentSize >= team.maxSize;

  return (
    <div className={`group relative rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-full shadow-2xl 
      ${isMyTeam
        ? 'bg-yellow-500/5 border border-yellow-500/80 shadow-[0_0_20px_rgba(234,179,8,0.1)] scale-[1.01] z-10'
        : 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-blue-500/40'
      }`}>

      {/* IS MY TEAM BADGE */}
      {isMyTeam && (
        <div className="absolute top-3 left-4 z-10">
          <span className="text-[9px] font-black text-black bg-yellow-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.6)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
            YOUR TEAM
          </span>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {isFull ? (
          <span className="text-[8px] font-black text-rose-500 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest bg-rose-500/10">
            Full
          </span>
        ) : (
          <span className="text-[8px] font-black text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full uppercase tracking-widest bg-emerald-400/10 animate-pulse">
            Available
          </span>
        )}
      </div>

      <div>
        {/* Team Identity */}
        <h3 className={`text-xl font-black text-white italic uppercase tracking-tighter mb-1 truncate pr-12 group-hover:text-blue-400 transition-colors ${isMyTeam ? 'mt-6' : ''}`}>
          {team.name}
        </h3>

        {/* Capacity Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-1.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Team Composition</p>
            <p className="text-xs font-mono font-bold text-slate-300">
              {currentSize} <span className="text-slate-600">/</span> {team.maxSize}
            </p>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out ${isFull ? 'bg-rose-500' : 'bg-blue-600'}`}
              style={{ width: `${(currentSize / team.maxSize) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Members</p>
          <div className="flex flex-wrap gap-2">
            {team.members && team.members.length > 0 ? (
              team.members.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-black/40 border border-white/5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-300 hover:border-blue-500/30 transition-all"
                >
                  <span className="text-blue-500 font-mono text-[9px]">{idx + 1}</span>
                  <span className="truncate max-w-[100px]">{member}</span>
                </div>
              ))
            ) : (
              <p className="text-[10px] italic text-slate-600 py-2 uppercase tracking-tighter font-bold">Waiting for deployment...</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onJoin}
        disabled={isFull || isMyTeam}
        className={`mt-8 w-full py-3.5 rounded-xl font-black uppercase italic tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 
          ${isMyTeam
            ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 cursor-default'
            : isFull
              ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95'
          }`}
      >
        {isMyTeam ? (
          "YOUR TEAM"
        ) : isFull ? (
          "Locked"
        ) : (
          <>
            Join Team
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </>
        )}
      </button>

      {/* Subtle Bottom Glow Effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/0 group-hover:via-blue-500/40 to-transparent transition-all"></div>
    </div>
  );
}
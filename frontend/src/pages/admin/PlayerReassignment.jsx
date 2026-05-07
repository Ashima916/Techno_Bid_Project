import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const API = window.location.hostname === "localhost"
    ? "http://localhost:5000/api/admin"
    : "https://technobid.onrender.com/api/admin";

export default function PlayerReassignment() {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [targetTeamId, setTargetTeamId] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTeam, setFilterTeam] = useState("all");

    // Fetch teams in real-time
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "teams"),
            (snapshot) => {
                const teamsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTeams(teamsData);
            },
            (error) => {
                console.error("Error fetching teams:", error);
            }
        );
        return () => unsubscribe();
    }, []);

    // Fetch sold players
    const fetchSoldPlayers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/sold-players`);
            const data = await response.json();

            if (data.success) {
                setPlayers(data.players);
            } else {
                setMessage({ type: "error", text: "Failed to load players" });
            }
        } catch (error) {
            console.error("Error fetching sold players:", error);
            setMessage({ type: "error", text: "Error loading players" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSoldPlayers();
    }, []);

    const handleReassign = async () => {
        if (!selectedPlayer || !targetTeamId) {
            setMessage({ type: "error", text: "Please select a player and target team" });
            return;
        }

        if (selectedPlayer.currentTeamId === targetTeamId) {
            setMessage({ type: "error", text: "Player is already in this team" });
            return;
        }

        try {
            setProcessing(true);
            setMessage({ type: "", text: "" });

            const payload = {
                playerId: selectedPlayer.id,
                fromTeamId: selectedPlayer.currentTeamId,
                toTeamId: targetTeamId,
            };

            if (newPrice && newPrice !== "") {
                payload.newPrice = Number(newPrice);
            }

            const response = await fetch(`${API}/reassign-player`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({
                    type: "success",
                    text: data.message || "Player reassigned successfully!",
                });

                // Reset form
                setSelectedPlayer(null);
                setTargetTeamId("");
                setNewPrice("");

                // Refresh player list
                await fetchSoldPlayers();
            } else {
                setMessage({ type: "error", text: data.message || "Reassignment failed" });
            }
        } catch (error) {
            console.error("Error reassigning player:", error);
            setMessage({ type: "error", text: "Network error occurred" });
        } finally {
            setProcessing(false);
        }
    };

    const filteredPlayers = players.filter((player) => {
        const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeam = filterTeam === "all" || player.currentTeamId === filterTeam;
        return matchesSearch && matchesTeam;
    });

    return (
        <div className="space-y-8 md:space-y-10">
            {/* Page Header */}
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-sky-200">
                    Player Reassignment
                </h1>
                <p className="text-sm text-slate-400 max-w-2xl">
                    Modify player assignments across teams. Changes will reflect in the database immediately.
                </p>
            </div>

            {/* Message Display */}
            {message.text && (
                <div
                    className={`rounded-xl p-4 border ${message.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                >
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {/* Reassignment Form */}
            {selectedPlayer && (
                <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-slate-900/40 p-6 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white mb-4">
                        Reassign Player
                    </h2>

                    <div className="space-y-4">
                        {/* Selected Player Info */}
                        <div className="rounded-xl bg-slate-950/50 p-4 border border-white/5">
                            <p className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-2">
                                Selected Player
                            </p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-bold">{selectedPlayer.name}</p>
                                    <p className="text-xs text-slate-400">{selectedPlayer.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Current Team</p>
                                    <p className="text-sm font-bold text-amber-400">
                                        {selectedPlayer.currentTeamName}
                                    </p>
                                    <p className="text-xs text-emerald-400">₹{selectedPlayer.price}</p>
                                </div>
                            </div>
                        </div>

                        {/* Target Team Selection */}
                        <div>
                            <label className="block text-xs uppercase text-slate-400 font-bold tracking-widest mb-2">
                                Move to Team
                            </label>
                            <select
                                value={targetTeamId}
                                onChange={(e) => setTargetTeamId(e.target.value)}
                                className="w-full rounded-xl bg-slate-950/50 border border-white/10 px-4 py-3 text-white focus:border-violet-500 focus:outline-none transition-colors"
                            >
                                <option value="">Select Team</option>
                                {teams
                                    .filter((t) => t.id !== selectedPlayer.currentTeamId)
                                    .map((team) => (
                                        <option key={team.id} value={team.id}>
                                            {team.name} (Purse: ₹{team.purse})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* New Price (Optional) */}
                        <div>
                            <label className="block text-xs uppercase text-slate-400 font-bold tracking-widest mb-2">
                                New Price (Optional)
                            </label>
                            <input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder={`Current: ₹${selectedPlayer.price}`}
                                className="w-full rounded-xl bg-slate-950/50 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none transition-colors"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Leave empty to keep current price
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleReassign}
                                disabled={processing || !targetTeamId}
                                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 font-bold text-white hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/20"
                            >
                                {processing ? "Processing..." : "Confirm Reassignment"}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedPlayer(null);
                                    setTargetTeamId("");
                                    setNewPrice("");
                                    setMessage({ type: "", text: "" });
                                }}
                                className="rounded-xl bg-slate-800 px-6 py-3 font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase text-slate-400 font-bold tracking-widest mb-2">
                        Search Player
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full rounded-xl bg-slate-900/70 border border-slate-800 px-4 py-3 text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-slate-400 font-bold tracking-widest mb-2">
                        Filter by Team
                    </label>
                    <select
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        className="w-full rounded-xl bg-slate-900/70 border border-slate-800 px-4 py-3 text-white focus:border-violet-500 focus:outline-none transition-colors"
                    >
                        <option value="all">All Teams</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Players List */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Sold Players
                    </h2>
                    <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                        {filteredPlayers.length} Players
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        <p className="text-sm">No players found</p>
                    </div>
                ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                        {filteredPlayers.map((player) => (
                            <div
                                key={`${player.id}-${player.currentTeamId}`}
                                className={`flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer ${selectedPlayer?.id === player.id &&
                                        selectedPlayer?.currentTeamId === player.currentTeamId
                                        ? "border-violet-500 bg-violet-500/10"
                                        : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60"
                                    }`}
                                onClick={() => {
                                    setSelectedPlayer(player);
                                    setTargetTeamId("");
                                    setNewPrice("");
                                    setMessage({ type: "", text: "" });
                                }}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        {player.image && (
                                            <img
                                                src={player.image}
                                                alt={player.name}
                                                className="w-12 h-12 rounded-lg object-cover border border-white/10"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-200">{player.name}</p>
                                            <p className="text-xs text-slate-500 uppercase">
                                                {player.role || "Player"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-xs text-slate-500">Team</p>
                                    <p className="font-bold text-amber-400 text-sm">
                                        {player.currentTeamName}
                                    </p>
                                    <p className="text-emerald-500 font-mono text-xs mt-1">
                                        ₹{player.price}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Team Overview */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 backdrop-blur-sm">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">
                    Team Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => {
                        const playerCount = team.boughtPlayers?.length || 0;
                        const totalSpent =
                            team.boughtPlayers?.reduce((acc, p) => acc + (Number(p.price) || 0), 0) || 0;
                        return (
                            <div
                                key={team.id}
                                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                            >
                                <h3 className="font-bold text-white mb-2">{team.name}</h3>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Players:</span>
                                        <span className="text-slate-300 font-medium">{playerCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Purse:</span>
                                        <span className="text-emerald-400 font-bold">₹{team.purse}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Spent:</span>
                                        <span className="text-slate-300 font-medium">₹{totalSpent}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

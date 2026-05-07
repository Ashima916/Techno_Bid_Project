import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useToast } from "../../context/ToastContext";

export default function Playing11Selection() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [participant, setParticipant] = useState(null);
    const [team, setTeam] = useState(null);
    const [isTeamLeader, setIsTeamLeader] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(sessionStorage.getItem("currentParticipant"));
        if (!stored) {
            navigate("/");
            return;
        }
        setParticipant(stored);
        loadTeamData(stored.phone);
    }, [navigate]);

    const loadTeamData = async (phone) => {
        try {
            // Find team
            const teamsRef = collection(db, "teams");
            const q = query(teamsRef, where("members", "array-contains", phone));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                showToast("You are not part of any team", 3000, "error");
                navigate("/results");
                return;
            }

            const teamDoc = snapshot.docs[0];
            const teamData = { id: teamDoc.id, ...teamDoc.data() };
            setTeam(teamData);

            // Check if team leader (creator)
            console.log("Team createdBy:", teamData.createdBy);
            console.log("Current participant phone:", phone);
            const isLeader = teamData.createdBy === phone;
            console.log("Is team leader:", isLeader);
            setIsTeamLeader(isLeader);


            // Load existing selection if any
            if (teamData.playing11 && Array.isArray(teamData.playing11) && teamData.playing11.length === 11) {
                // Already submitted - redirect to results
                showToast("Playing 11 already submitted! ✅", 3000, "info");
                setTimeout(() => {
                    navigate("/results");
                }, 2000);
                return;
            } else if (teamData.playing11 && Array.isArray(teamData.playing11)) {
                // Load partially selected players if any
                setSelectedPlayers(teamData.playing11.map(p => p.id));
            }

            setLoading(false);
        } catch (error) {
            console.error("Error loading team:", error);
            showToast("Failed to load team data", 3000, "error");
            setLoading(false);
        }
    };

    const togglePlayerSelection = (player) => {
        if (!isTeamLeader) return;

        const playerId = player.id;

        if (selectedPlayers.includes(playerId)) {
            setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
        } else {
            if (selectedPlayers.length >= 11) {
                showToast("You can only select 11 players", 2000, "warning");
                return;
            }
            setSelectedPlayers([...selectedPlayers, playerId]);
        }
    };

    const handleSubmit = async () => {
        if (!isTeamLeader) {
            showToast("Only team leader can submit", 3000, "error");
            return;
        }

        if (selectedPlayers.length !== 11) {
            showToast(`Please select exactly 11 players (${selectedPlayers.length}/11 selected)`, 3000, "warning");
            return;
        }

        setSubmitting(true);
        try {
            // Get full player details
            const playing11 = team.boughtPlayers
                .filter(p => selectedPlayers.includes(p.id))
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    rank: p.rank || 0,
                    price: p.price,
                    overseas: p.overseas || false
                }));

            // Calculate average rank
            const avgRank = playing11.reduce((sum, p) => sum + (p.rank || 0), 0) / 11;

            // Update team document
            const teamRef = doc(db, "teams", team.id);
            await updateDoc(teamRef, {
                playing11: playing11,
                playing11AvgRank: avgRank,
                playing11SubmittedAt: new Date().toISOString(),
                playing11SubmittedBy: participant.phone
            });

            showToast("Playing 11 submitted successfully! ✅", 3000, "success");

            // Navigate to results after short delay
            setTimeout(() => {
                navigate("/results");
            }, 2000);
        } catch (error) {
            console.error("Error submitting Playing 11:", error);
            showToast("Failed to submit Playing 11", 3000, "error");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading team data...</p>
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-slate-400">No team found</p>
            </div>
        );
    }

    // Filter only actual players (not accessories)
    const actualPlayers = team.boughtPlayers?.filter(p =>
        Number(p.id) < 1000 && !p.role?.toLowerCase().includes('accessory')
    ) || [];

    return (
        <div className="min-h-screen bg-black text-white font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">
                                Select Playing <span className="text-yellow-500">11</span>
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {team.name.toLowerCase().includes('team') ? team.name : `Team ${team.name}`}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
                                <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Selected</p>
                                <p className="text-2xl font-black text-yellow-500">{selectedPlayers.length}/11</p>
                            </div>

                            {isTeamLeader ? (
                                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">
                                    👑 Team Leader
                                </span>
                            ) : (
                                <span className="text-xs bg-slate-700 text-slate-400 px-3 py-1 rounded-full font-bold">
                                    👥 Team Member
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                {isTeamLeader && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
                        <p className="text-blue-300 text-sm">
                            ℹ️ Select exactly 11 players from your squad to form your Playing 11. Click on players to select/deselect them.
                        </p>
                    </div>
                )}

                {!isTeamLeader && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
                        <p className="text-amber-300 text-sm">
                            ⚠️ Only the team leader can select and submit the Playing 11. Please wait for your team leader to make the selection.
                        </p>
                    </div>
                )}

                {/* Players Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {actualPlayers.map((player) => {
                        const isSelected = selectedPlayers.includes(player.id);

                        return (
                            <div
                                key={player.id}
                                onClick={() => togglePlayerSelection(player)}
                                className={`
                  relative rounded-2xl p-4 border-2 transition-all cursor-pointer
                  ${isSelected
                                        ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20'
                                        : 'bg-slate-900/40 border-slate-700 hover:border-slate-600'
                                    }
                  ${!isTeamLeader ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}
                `}
                            >
                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <div>
                                        <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">
                                            {player.role}
                                        </span>
                                        <h3 className="text-base font-black text-white uppercase leading-tight mt-1">
                                            {player.name}
                                        </h3>
                                    </div>

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
                                        <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold w-fit">
                                            Overseas
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Submit Button */}
                {isTeamLeader && (
                    <div className="sticky bottom-4 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <button
                            onClick={handleSubmit}
                            disabled={selectedPlayers.length !== 11 || submitting}
                            className={`
                w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all
                ${selectedPlayers.length === 11 && !submitting
                                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black active:scale-95'
                                    : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                                }
              `}
                        >
                            {submitting ? "Submitting..." :
                                selectedPlayers.length === 11 ? "Submit Playing 11 ✅" :
                                    `Select ${11 - selectedPlayers.length} More Player${11 - selectedPlayers.length !== 1 ? 's' : ''}`
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

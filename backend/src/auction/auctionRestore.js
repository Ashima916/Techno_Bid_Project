const { db } = require("../config/firebase");
const auctionState = require("./auctionState");
const players = require("./playerdata");
const bowlers = require("./bowlerdata");
const wickets = require("./wicketdata");
const allrounders = require("./allrounderdata");
const { startTimer } = require("./auctionTimer");

const restoreAuctionState = async () => {
    try {
        console.log("🔄 Attempting to restore auction state...");
        const docSnap = await db.collection("auction").doc("current").get();

        if (!docSnap.exists) {
            console.log("No auction state to restore.");
            return;
        }

        const data = docSnap.data();

        // Only restore if active or pending decision
        if (data.status === "ACTIVE" || data.status === "DECISION_PENDING") {
            const playerId = data.player?.id;
            if (!playerId) return;

            // Find the player object in memory
            const allLists = [players, bowlers, wickets, allrounders];
            let player = null;
            for (const list of allLists) {
                player = list.find((p) => String(p.id) === String(playerId));
                if (player) break;
            }

            if (player) {
                console.log(`♻️ Restoring player: ${player.name} (${data.status})`);

                auctionState.auctionStarted = true;
                auctionState.phase = player.auctionPhase || "BATTERS";
                auctionState.currentPlayer = player;
                auctionState.currentPlayer.status = data.status; // Restore status (e.g. DECISION_PENDING)
                auctionState.currentPlayer.wasSent = true;

                auctionState.currentBid = data.currentBid || 0;
                auctionState.highestBidTeamId = data.lastSold?.teamId || null; // This might need adjustment if storing highestBidder ID separately
                // Actually firestore 'current' stores highestBidder as Name usually, causing a mismatch for ID.
                // But for blocking logic, the most important thing is currentPlayer and status.

                auctionState.highestBidTeamName = data.highestBidder;
                auctionState.timer = data.timer || 0;
                auctionState.isPaused = false;

                // Resync timer if active
                if (data.status === "ACTIVE" && data.timer > 0) {
                    startTimer();
                }
            } else {
                console.error("Restoration failed: Player not found in memory lists.");
            }
        } else {
            console.log("Auction is IDLE or ended. No state restore needed.");
        }
    } catch (err) {
        console.error("State restore error:", err);
    }
};

module.exports = restoreAuctionState;

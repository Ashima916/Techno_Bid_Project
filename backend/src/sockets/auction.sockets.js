const auctionState = require("../auction/auctionState");
const teamModel = require("../models/team.model");
const { db } = require("../config/firebase");

// Helper to broadcast full state
const broadcastState = (io) => {
    let status = "ACTIVE";
    if (auctionState.isPaused) {
        status = "PAUSED";
    } else if (auctionState.currentPlayer && auctionState.currentPlayer.status === "ON_AUCTION") {
        status = "ON_AUCTION"; // Explicitly broadcast ON_AUCTION status
    } else if (auctionState.currentPlayer && ["SOLD", "UNSOLD"].includes(auctionState.currentPlayer.status)) {
        status = auctionState.currentPlayer.status;
    }

    io.emit("auctionUpdate", {
        status: status,
        player: auctionState.currentPlayer,
        phase: auctionState.phase
    });
};

module.exports = (io, socket) => {
    // --- JOIN AUCTION ---
    socket.on("joinAuction", () => {
        // Calculate status for initial sync
        let status = "ACTIVE";
        if (auctionState.isPaused) {
            status = "PAUSED";
        } else if (auctionState.currentPlayer && auctionState.currentPlayer.status === "ON_AUCTION") {
            status = "ON_AUCTION"; // Include ON_AUCTION in sync
        } else if (auctionState.currentPlayer && ["SOLD", "UNSOLD"].includes(auctionState.currentPlayer.status)) {
            status = auctionState.currentPlayer.status;
        } else if (!auctionState.auctionStarted) {
            status = "IDLE";
        }

        // Send immediate state sync
        socket.emit("auctionSync", {
            status: status,
            auctionStarted: auctionState.auctionStarted,
            phase: auctionState.phase,
            isPaused: auctionState.isPaused,
            player: auctionState.currentPlayer,
            soldToTeam: auctionState.soldToTeam,
            soldPrice: auctionState.soldPrice,
            specialTokenUsed: auctionState.specialTokenUsed
        });
    });

    // --- ADMIN: SELECT PLAYER (PUSH TO ARENA) ---
    socket.on("adminSelectPlayer", async ({ playerId }) => {
        console.log("SOCKET: adminSelectPlayer", playerId);

        // Validation
        if (!auctionState.auctionStarted) return socket.emit("errorMessage", "Auction not started");
        if (auctionState.isPaused) return socket.emit("errorMessage", "Auction is paused");
        if (auctionState.currentPlayer && auctionState.currentPlayer.status === "ON_AUCTION") return socket.emit("errorMessage", "⚠️ Resolve player assignment first!");

        // Find Player
        const players = require("../auction/playerdata");
        const bowlers = require("../auction/bowlerdata");
        const wickets = require("../auction/wicketdata");
        const allrounders = require("../auction/allrounderdata");

        let player = null;
        const allLists = [players, bowlers, wickets, allrounders];
        for (const list of allLists) {
            player = list.find((p) => String(p.id) === String(playerId));
            if (player) break;
        }

        if (!player) return socket.emit("errorMessage", "Player not found");
        if (player.status === "SOLD") return socket.emit("errorMessage", "Player already sold");

        // Update State
        auctionState.currentPlayer = player;
        auctionState.currentPlayer.wasSent = true;
        auctionState.currentPlayer.status = "ON_AUCTION";

        // Broadcast immediately (no preview phase)
        broadcastState(io);

        // Persist Async - Store ON_AUCTION status
        db.collection("auction").doc("current").set({
            status: "ON_AUCTION", // Changed from "ACTIVE" to "ON_AUCTION"
            player: player,
            timestamp: Date.now()
        }).catch(e => console.error("Firestore persistence error:", e));
    });

    // --- ADMIN CONTROLS ---
    socket.on("adminPause", () => {
        auctionState.isPaused = true;
        broadcastState(io);
        db.collection("settings").doc("lobby").set({ status: "PAUSED" }, { merge: true });
    });

    socket.on("adminResume", () => {
        auctionState.isPaused = false;
        broadcastState(io);
        db.collection("settings").doc("lobby").set({ status: "STARTING" }, { merge: true });
    });
};

const auctionState = require("./auctionState");
const { assignPlayerToTeam, getTeamById } = require("../models/team.model");
const { db } = require("../config/firebase");

let io = null;
let intervalId = null;

const setIO = (socketIO) => {
  io = socketIO;
};

const startTimer = () => {
  if (intervalId) clearInterval(intervalId);

  // Start in preview phase
  auctionState.isPreviewPhase = true;
  auctionState.previewTimer = 10;
  auctionState.timer = 20;

  // Broadcast initial state
  if (io) {
    io.emit("timerUpdate", auctionState.timer);
    io.emit("previewUpdate", {
      isPreviewPhase: true,
      previewTimer: auctionState.previewTimer
    });
  }

  intervalId = setInterval(async () => {
    if (auctionState.isPaused) return;
    if (!auctionState.currentPlayer) return;

    // PREVIEW PHASE: Count down preview timer
    if (auctionState.isPreviewPhase) {
      if (auctionState.previewTimer > 0) {
        auctionState.previewTimer -= 1;
        if (io) {
          io.emit("previewUpdate", {
            isPreviewPhase: true,
            previewTimer: auctionState.previewTimer
          });
        }
      }

      // Preview phase ends
      if (auctionState.previewTimer === 0) {
        auctionState.isPreviewPhase = false;
        console.log("Preview phase ended, bidding now open");
        if (io) {
          io.emit("previewUpdate", {
            isPreviewPhase: false,
            previewTimer: 0
          });
        }
      }
      return; // Don't count down main timer during preview
    }

    // BIDDING PHASE: Count down main timer
    if (auctionState.timer > 0) {
      auctionState.timer -= 1;
      // 🔥 SOCKET EMIT ONLY (No DB Write)
      if (io) io.emit("timerUpdate", auctionState.timer);
    }

    if (auctionState.timer === 0) {
      clearInterval(intervalId);
      intervalId = null;

      // Special Token Rule
      if (auctionState.currentBid >= 2000) {
        console.log("Timer ended at 2000 (Special Decision)");
        auctionState.currentPlayer.status = "DECISION_PENDING";

        if (io) io.emit("auctionUpdate", {
          status: "DECISION_PENDING",
          player: auctionState.currentPlayer
        });

        // Persistent State
        db.collection("auction").doc("current").update({ status: "DECISION_PENDING" }).catch(console.error);
        return;
      }

      handleTimerEnd();
    }
  }, 1000);
};

const handleTimerEnd = async () => {
  const player = auctionState.currentPlayer;
  if (!player) return;

  const winningTeamId = auctionState.highestBidTeamId;
  const finalPrice = auctionState.currentBid;
  let winnerName = null;

  if (winningTeamId) {
    // Check if we have the name in memory, else fetch
    winnerName = auctionState.highestBidTeamName;
    if (!winnerName) {
      try {
        const t = await getTeamById(winningTeamId);
        winnerName = t ? t.name : "Unknown";
      } catch (e) { winnerName = "Team " + winningTeamId; }
    }

    auctionState.highestBidTeamName = winnerName;

    console.log(`✅ ${player.name} SOLD to ${winnerName} for ${finalPrice}`);

    // Update Memory
    player.status = "SOLD";
    player.soldToTeamId = winningTeamId;
    player.soldToTeamName = winnerName;
    player.soldPrice = finalPrice;

    // 🔥 EMIT RESULT INSTANTLY
    if (io) {
      io.emit("auctionResult", {
        playerId: player.id,
        status: "SOLD",
        soldTo: winnerName,
        price: finalPrice
      });
      io.emit("auctionUpdate", {
        status: "SOLD",
        player: player,
        currentBid: finalPrice,
        highestBidder: winnerName
      });
    }

    // 🛑 ASYNC PERSISTENCE (Does not block UI)
    assignPlayerToTeam(winningTeamId, player, finalPrice).catch(e => console.error("DB Assign Error", e));

    db.collection("auction").doc("current").update({
      status: "SOLD",
      highestBidder: winnerName,
      lastSold: {
        name: player.name,
        price: finalPrice,
        teamId: winningTeamId,
        teamName: winnerName
      },
      timer: 0
    }).catch(console.error);

    db.collection("players").doc(String(player.id)).update({
      status: "SOLD",
      soldToTeamId: winningTeamId,
      soldToTeamName: winnerName,
      soldPrice: finalPrice
    }).catch(console.error);

  } else {
    console.log(`❌ ${player.name} UNSOLD`);
    player.status = "UNSOLD";

    // 🔥 EMIT RESULT INSTANTLY
    if (io) {
      io.emit("auctionResult", { playerId: player.id, status: "UNSOLD" });
      io.emit("auctionUpdate", { status: "UNSOLD", player: player });
    }

    // 🛑 ASYNC PERSISTENCE
    db.collection("auction").doc("current").update({ status: "UNSOLD", timer: 0 }).catch(console.error);
    db.collection("players").doc(String(player.id)).update({ status: "UNSOLD" }).catch(console.error);
  }
};

module.exports = {
  startTimer,
  setIO
};

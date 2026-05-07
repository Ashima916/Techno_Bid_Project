const auctionState = require("../auction/auctionState");
const { db } = require("../config/firebase");
const teamController = require("../controllers/teamController");

module.exports = (io, socket) => {
  // Direct use of socket passed from server.js

  /* ---------------- admin.sockets.js ---------------- */
  socket.on("adminLockTeams", async () => {
    try {
      // Update Engine State
      auctionState.teamsLocked = true;

      // Update Firebase Source of Truth for Global Status
      await db.collection("settings").doc("lobby").set({
        status: "LOCKED"
      }, { merge: true });

      // 🔥 LOCK ALL INDIVIDUAL TEAMS & UPDATE INITIAL PURSE
      const teams = await teamController.lockAllTeams();

      // 🔥 BROADCAST TO ALL
      io.emit("teamsUpdated", {
        teams,
        locked: true
      });

    } catch (err) {
      console.error("Lock error:", err);
    }
  });

  socket.on("adminReopenTeams", async () => {
    console.log("🔓 Admin reopening teams...");
    try {
      auctionState.teamsLocked = false;

      // Reset Firebase status to OPEN to allow participants back into the lobby
      await db.collection("settings").doc("lobby").set({
        status: "OPEN"
      }, { merge: true });

      // 🔥 UNLOCK ALL INDIVIDUAL TEAMS
      const teams = await teamController.unlockAllTeams();

      io.emit("teamsUpdated", {
        teams,
        locked: false
      });
    } catch (err) {
      console.error("Error unlocking teams:", err);
    }
  });
  socket.on("adminRemoveMember", async ({ teamId, phone }) => {
    try {
      const allTeams = await teamController.removeMember({
        teamId,
        phone,
      });

      io.emit("teamsUpdated", {
        teams: allTeams,
        locked: auctionState.teamsLocked,
      });
    } catch (err) {
      socket.emit("errorMessage", { message: err.message });
    }
  });

  socket.on("adminUpdateTeam", async ({ teamId, name, maxSize }) => {
    console.log("Admin updating team:", teamId, name, maxSize);
    try {
      if (auctionState.teamsLocked) {
        throw new Error("Lobby is locked. Cannot update team.");
      }

      const allTeams = await teamController.updateTeam({
        teamId,
        name,
        maxSize
      });

      io.emit("teamsUpdated", {
        teams: allTeams,
        locked: auctionState.teamsLocked,
      });
    } catch (err) {
      socket.emit("errorMessage", { message: err.message });
    }
  });

  socket.on("adminDeleteTeam", async (teamId) => {
    console.log("Admin deleting team:", teamId);
    try {
      if (auctionState.teamsLocked) {
        throw new Error("Lobby is locked. Cannot delete team.");
      }

      const allTeams = await teamController.deleteTeam(teamId);

      io.emit("teamsUpdated", {
        teams: allTeams,
        locked: auctionState.teamsLocked,
      });
    } catch (err) {
      socket.emit("errorMessage", { message: err.message });
    }
  });
};
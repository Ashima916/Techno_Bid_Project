const teamController = require("../controllers/teamController");
const auctionState = require("../auction/auctionState");

module.exports = (io, socket) => {
  socket.on("requestTeams", async () => {
    try {
      // 🔄 FORCE SYNC: Check Firestore source of truth
      const { db } = require("../config/firebase");
      const lobbySnap = await db.collection("settings").doc("lobby").get();
      if (lobbySnap.exists) {
        const status = lobbySnap.data().status;
        // If DB says OPEN but memory says LOCKED -> fix memory
        if (status === "OPEN") {
          auctionState.teamsLocked = false;
        } else if (status === "LOCKED") {
          auctionState.teamsLocked = true;
        }
      }

      const teams = await teamController.getAllTeams();
      socket.emit("teamsUpdated", {
        teams,
        locked: auctionState.teamsLocked,
      });
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  });

  socket.on("createTeam", async (data) => {
    console.log("[BACKEND] createTeam event received");
    console.log("[BACKEND] Data:", data);

    // 🔄 FORCE SYNC (Fail-safe)
    const { db } = require("../config/firebase");
    const lobbySnap = await db.collection("settings").doc("lobby").get();
    if (lobbySnap.exists) {
      const status = lobbySnap.data().status;
      auctionState.teamsLocked = (status === "LOCKED");
      console.log("[BACKEND] Lobby status from DB:", status, "| teamsLocked:", auctionState.teamsLocked);
    }

    if (auctionState.teamsLocked) {
      console.log("[BACKEND] ERROR: Lobby is locked");
      return socket.emit("errorMessage", { message: "Lobby is locked" });
    }

    try {
      console.log("[BACKEND] Calling teamController.createTeam...");
      const allTeams = await teamController.createTeam(data);
      console.log("[BACKEND] Team created successfully! Total teams:", allTeams.length);
      io.emit("teamsUpdated", {
        teams: allTeams,
        locked: auctionState.teamsLocked,
      });
    } catch (err) {
      console.log("[BACKEND] ERROR creating team:", err.message);
      socket.emit("errorMessage", { message: err.message });
    }
  });

  socket.on("joinTeam", async ({ teamId, phone }) => {
    // 🔄 FORCE SYNC (Fail-safe)
    const { db } = require("../config/firebase");
    const lobbySnap = await db.collection("settings").doc("lobby").get();
    if (lobbySnap.exists) {
      const status = lobbySnap.data().status;
      auctionState.teamsLocked = (status === "LOCKED");
    }

    if (auctionState.teamsLocked) {
      return socket.emit("errorMessage", { message: "Lobby is locked" });
    }

    try {
      const allTeams = await teamController.joinTeam({
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
};

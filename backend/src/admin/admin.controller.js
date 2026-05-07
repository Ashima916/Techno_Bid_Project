const auctionState = require("../auction/auctionState");
const players = require("../auction/playerdata");
const bowlers = require("../auction/bowlerdata");
const wickets = require("../auction/wicketdata");
const allrounders = require("../auction/allrounderdata");

const getTeamModel = () => require("../models/team.model");

/* ===============================
   TEAM LOCK / UNLOCK (DB-based)
================================ */

exports.lockTeams = async (req, res) => {
  try {
    const teams = await getTeamModel().lockAllTeams();

    auctionState.teamsLocked = true; // keep engine in sync

    return res.status(200).json({
      message: "Teams locked successfully",
      teamsLocked: true,
      teams,
    });
  } catch (err) {
    console.error("lockTeams error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

exports.unlockTeams = async (req, res) => {
  try {
    const teams = await getTeamModel().unlockAllTeams();

    auctionState.teamsLocked = false; // keep engine in sync

    return res.status(200).json({
      message: "Teams unlocked successfully",
      teamsLocked: false,
      teams,
    });
  } catch (err) {
    console.error("unlockTeams error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ===============================
   AUCTION CONTROL
================================ */

exports.startAuction = async (req, res) => {
  try {
    // Ensure DB is locked before starting
    await getTeamModel().lockAllTeams();
    auctionState.teamsLocked = true;

    if (auctionState.auctionStarted) {
      return res.status(400).json({ message: "Auction already started" });
    }

    auctionState.auctionStarted = true;
    auctionState.phase = "BATTERS";
    auctionState.isPaused = false;

    return res.status(200).json({
      message: "Auction started successfully",
      auctionStarted: true,
      phase: auctionState.phase,
    });
  } catch (err) {
    console.error("startAuction error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

exports.changePhase = (req, res) => {
  const { phase } = req.body;

  if (!auctionState.auctionStarted) {
    return res.status(400).json({ message: "Auction has not started yet" });
  }

  const validPhases = ["BATTERS", "BOWLERS", "WICKET_KEEPER", "ALL_ROUNDER"];
  if (!validPhases.includes(phase)) {
    return res.status(400).json({ message: "Invalid phase" });
  }

  auctionState.phase = phase;
  auctionState.isPaused = false;

  return res.status(200).json({
    message: "Phase changed successfully",
    phase: auctionState.phase,
  });
};

exports.pauseAuction = async (req, res) => {
  if (!auctionState.auctionStarted) {
    return res.status(400).json({ message: "Auction has not started yet" });
  }

  if (auctionState.isPaused) {
    return res.status(400).json({ message: "Auction is already paused" });
  }

  try {
    const { db } = require("../config/firebase");
    await db.collection("settings").doc("lobby").set({ status: "PAUSED" }, { merge: true });

    auctionState.isPaused = true;

    return res.status(200).json({
      message: "Auction paused successfully",
      isPaused: true,
    });
  } catch (err) {
    console.error("Pause Error:", err);
    return res.status(500).json({ message: "Failed to pause auction" });
  }
};

exports.resumeAuction = async (req, res) => {
  if (!auctionState.auctionStarted) {
    return res.status(400).json({ message: "Auction has not started yet" });
  }

  if (!auctionState.isPaused) {
    return res.status(400).json({ message: "Auction is not paused" });
  }

  try {
    const { db } = require("../config/firebase");
    await db.collection("settings").doc("lobby").set({ status: "STARTING" }, { merge: true }); // "STARTING" maps to "LIVE" in frontend

    auctionState.isPaused = false;

    return res.status(200).json({
      message: "Auction resumed successfully",
      isPaused: false,
    });
  } catch (err) {
    console.error("Resume Error:", err);
    return res.status(500).json({ message: "Failed to resume auction" });
  }
};

exports.selectPlayer = (req, res) => {
  const { playerId } = req.body;
  console.log("Select player req body:", req.body);

  if (!auctionState.auctionStarted) {
    return res.status(400).json({ message: "Auction has not started" });
  }

  if (auctionState.isPaused) {
    return res.status(400).json({ message: "Auction is paused" });
  }

  if (!playerId) {
    return res.status(400).json({ message: "playerId is required" });
  }

  // Block if previous player assignment is pending
  if (auctionState.currentPlayer && auctionState.currentPlayer.status === "ON_AUCTION") {
    return res.status(400).json({ message: "⚠️ Must assign current player first!" });
  }

  // 1. Search in ALL lists to avoid "Item not found" due to wrong phase
  const allLists = [players, bowlers, wickets, allrounders];
  let player = null;

  for (const list of allLists) {
    player = list.find((p) => p.id == playerId);
    if (player) break;
  }

  if (!player) {
    console.log(`Item not found for ID: ${playerId}`);
    return res.status(404).json({ message: "Item not found in any category" });
  }

  // 2. Prevent sending if already auctioned/sold
  if (player.status === "SOLD" || player.wasSent) {
    return res.status(400).json({ message: "Item already queued or sold" });
  }

  // 3. Auto-Switch Phase if needed
  if (player.auctionPhase !== auctionState.phase) {
    console.log(`Auto-switching phase from ${auctionState.phase} to ${player.auctionPhase}`);
    auctionState.phase = player.auctionPhase;
  }

  auctionState.currentPlayer = player;

  // Clear previous sold player information when new player is selected
  auctionState.soldToTeam = null;
  auctionState.soldPrice = 0;
  auctionState.specialTokenUsed = false;

  // Mark as sent and on auction (waiting for admin assignment)
  player.wasSent = true;
  player.status = "ON_AUCTION";

  // Broadcast to Firestore immediately (no preview phase)
  const { db } = require("../config/firebase");
  db.collection("auction").doc("current").set({
    status: "ON_AUCTION", // Changed from "ACTIVE" to "ON_AUCTION"
    player: player,
    timestamp: Date.now()
  }).catch(err => console.error("Failed to broadcast player:", err));

  return res.status(200).json({
    message: "Player sent to auction",
    player
  });
};

exports.assignPlayer = async (req, res) => {
  const { playerId, teamId, soldPrice, useSpecialToken } = req.body;
  const { db } = require("../config/firebase");

  if (!auctionState.auctionStarted) return res.status(400).json({ message: "Auction not active" });

  // Always validate price - special token doesn't make it free
  if (!soldPrice || soldPrice <= 0) {
    return res.status(400).json({ message: "Valid sold price is required" });
  }

  let isCurrentAuction = false;
  let targetPlayer = null;

  // Check if it matches the current active player
  if (auctionState.currentPlayer && String(auctionState.currentPlayer.id) === String(playerId)) {
    isCurrentAuction = true;
    targetPlayer = auctionState.currentPlayer;
  } else {
    // Search in all memory lists for the player
    const allLists = [players, bowlers, wickets, allrounders];
    for (const list of allLists) {
      const p = list.find(x => String(x.id) === String(playerId));
      if (p) { targetPlayer = p; break; }
    }

    // Allow assignment only if found AND explicitly on auction
    if (!targetPlayer || targetPlayer.status !== "ON_AUCTION") {
      return res.status(400).json({ message: "Player not found or not currently on auction" });
    }
  }

  // Get Team
  const teamModel = getTeamModel();
  const team = await teamModel.getTeamById(teamId);
  if (!team) return res.status(404).json({ message: "Team not found" });

  let finalPrice = Number(soldPrice); // Always use the entered price
  let isSpecialTokenUsed = false;

  // Validate price against base price
  const basePrice = targetPlayer.auction?.base || 0;
  if (finalPrice < basePrice) {
    return res.status(400).json({
      message: `Price cannot be less than base price of ₹${basePrice}`
    });
  }

  // Handle Special Token - it's just a flag, not a discount
  if (useSpecialToken) {
    // Check if team has already used special token
    if (team.specialTokenUsed) {
      return res.status(400).json({ message: "Team has already used their special token!" });
    }
    isSpecialTokenUsed = true;
  }

  // Always check funds - special token doesn't make it free
  if (team.purse < finalPrice) {
    return res.status(400).json({ message: "Team has insufficient funds" });
  }

  // Check team player limit (max 15 players)
  const currentPlayerCount = (team.boughtPlayers || []).filter(p => Number(p.id) < 1000 && !p.role?.toLowerCase().includes('accessory')).length;
  if (currentPlayerCount >= 15) {
    return res.status(400).json({ message: "Team has reached maximum player limit of 15" });
  }

  // Check Overseas Limit
  const isOverseasPlayer = targetPlayer.auction?.overseas || targetPlayer.overseas;
  if (isOverseasPlayer) {
    const currentOverseasCount = (team.boughtPlayers || []).reduce((count, p) => {
      const pOverseas = p.auction?.overseas || p.overseas || (p.country && p.country.includes("Overseas"));
      return count + (pOverseas ? 1 : 0);
    }, 0);

    if (currentOverseasCount >= 8) {
      return res.status(400).json({ message: "Limit reached! Team has 8 overseas players." });
    }
  }

  // Update Player in Memory
  targetPlayer.status = "SOLD";
  targetPlayer.soldToTeamId = teamId;
  targetPlayer.soldToTeamName = team.name;
  targetPlayer.soldPrice = finalPrice;
  targetPlayer.acquiredViaSpecialToken = isSpecialTokenUsed;

  // Update auctionState for real-time sync (persists across refreshes)
  auctionState.soldToTeam = team.name;
  auctionState.soldPrice = finalPrice;
  auctionState.specialTokenUsed = isSpecialTokenUsed;

  // DB Updates - assign player and mark special token as used if applicable
  await teamModel.assignPlayerToTeam(teamId, targetPlayer, finalPrice, isSpecialTokenUsed);

  try {
    await db.collection("players").doc(String(targetPlayer.id)).update({
      status: "SOLD",
      soldToTeamId: teamId,
      soldToTeamName: team.name,
      soldPrice: finalPrice,
      acquiredViaSpecialToken: isSpecialTokenUsed
    });
  } catch (e) {
    console.error(e);
  }

  // If it was the current live auction, we need to close it out.
  if (isCurrentAuction) {
    // Update Live Doc
    await db.collection("auction").doc("current").update({
      status: "SOLD",
      soldToTeam: team.name,
      soldPrice: finalPrice,
      specialTokenUsed: isSpecialTokenUsed,
      lastSold: {
        name: targetPlayer.name,
        price: finalPrice,
        teamId: teamId,
        teamName: team.name,
        specialToken: isSpecialTokenUsed
      }
    });
  }

  // 🔥 BROADCAST UPDATE VIA SOCKET
  const io = req.app.get("io");
  if (io) {
    io.emit("auctionResult", {
      playerId: targetPlayer.id,
      status: "SOLD",
      soldTo: team.name,
      price: finalPrice,
      specialToken: isSpecialTokenUsed
    });

    // Update the main auction state for everyone
    io.emit("auctionUpdate", {
      status: "SOLD",
      player: targetPlayer,
      soldToTeam: team.name,
      soldPrice: finalPrice,
      specialTokenUsed: isSpecialTokenUsed
    });
  }

  return res.status(200).json({
    message: isSpecialTokenUsed ? "Player assigned via Special Token!" : "Player assigned successfully",
    specialTokenUsed: isSpecialTokenUsed
  });
};

exports.markAsUnsold = async (req, res) => {
  const { playerId } = req.body;
  const { db } = require("../config/firebase");

  if (!auctionState.auctionStarted) return res.status(400).json({ message: "Auction not active" });

  let isCurrentAuction = false;
  let targetPlayer = null;

  // Check if it matches the current active player
  if (auctionState.currentPlayer && String(auctionState.currentPlayer.id) === String(playerId)) {
    isCurrentAuction = true;
    targetPlayer = auctionState.currentPlayer;
  } else {
    // Search in all memory lists for the player
    const allLists = [players, bowlers, wickets, allrounders];
    for (const list of allLists) {
      const p = list.find(x => String(x.id) === String(playerId));
      if (p) { targetPlayer = p; break; }
    }

    // Allow marking only if found AND explicitly on auction
    if (!targetPlayer || targetPlayer.status !== "ON_AUCTION") {
      return res.status(400).json({ message: "Player not found or not currently on auction" });
    }
  }

  // Update Player in Memory
  targetPlayer.status = "UNSOLD";
  targetPlayer.soldToTeamId = null;
  targetPlayer.soldToTeamName = null;
  targetPlayer.soldPrice = 0;

  // Clear auctionState sold information
  auctionState.soldToTeam = null;
  auctionState.soldPrice = 0;
  auctionState.specialTokenUsed = false;

  // Update Firestore player doc
  try {
    await db.collection("players").doc(String(targetPlayer.id)).update({
      status: "UNSOLD",
      soldToTeamId: null,
      soldToTeamName: null,
      soldPrice: 0
    });
  } catch (e) {
    console.error("Firestore player update error:", e);
  }

  // If it was the current live auction, update the live doc
  if (isCurrentAuction) {
    await db.collection("auction").doc("current").update({
      status: "UNSOLD",
      lastUnsold: {
        name: targetPlayer.name,
        playerId: targetPlayer.id
      }
    });
  }

  // 🔥 BROADCAST UPDATE VIA SOCKET
  const io = req.app.get("io");
  if (io) {
    io.emit("auctionResult", {
      playerId: targetPlayer.id,
      status: "UNSOLD"
    });

    // Update the main auction state for everyone
    io.emit("auctionUpdate", {
      status: "UNSOLD",
      player: targetPlayer
    });
  }

  return res.status(200).json({
    message: "Player marked as unsold successfully"
  });
};
exports.getPlayersByPhase = (req, res) => {
  const { phase } = req.query;
  console.log("Get players phase:", phase);

  if (!phase) {
    return res.status(400).json({ message: "Phase is required" });
  }

  let sourceList = players;
  if (phase === "BOWLERS") {
    sourceList = bowlers;
  } else if (phase === "WICKET_KEEPER") {
    sourceList = wickets;
  } else if (phase === "ALL_ROUNDER") {
    sourceList = allrounders;
  }

  const filteredPlayers = sourceList.filter(
    (p) => p.auctionPhase === phase
  );

  console.log(`Filtered ${phase} count:`, filteredPlayers.length);

  return res.status(200).json({
    phase,
    count: filteredPlayers.length,
    players: filteredPlayers,
  });
};

exports.restartAuction = async (req, res) => {
  console.log("Restarting auction...");

  // 1. Reset Local State
  auctionState.teamsLocked = false;
  auctionState.auctionStarted = false;
  auctionState.phase = null;
  auctionState.isPaused = false;
  auctionState.currentPlayer = null;
  auctionState.isPreviewPhase = false;
  auctionState.previewTimer = 10;

  // 2. Reset In-Memory Players
  players.forEach((p) => {
    p.status = "UNSOLD";
    p.soldToTeamId = null;
    p.soldPrice = null;
    p.wasSent = false;
  });

  // 3. Reset In-Memory Bowlers
  bowlers.forEach((b) => {
    b.status = "UNSOLD";
    b.soldToTeamId = null;
    b.soldPrice = null;
    b.wasSent = false;
  });

  // 4. Reset In-Memory Wicket Keepers
  wickets.forEach((w) => {
    w.status = "UNSOLD";
    w.soldToTeamId = null;
    w.soldPrice = null;
    w.wasSent = false;
  });

  // 5. Reset In-Memory All Rounders
  allrounders.forEach((ar) => {
    ar.status = "UNSOLD";
    ar.soldToTeamId = null;
    ar.soldPrice = null;
    ar.wasSent = false;
  });

  // 6. Reset Database Teams
  await getTeamModel().resetAllTeams();

  // 7. Reset Firestore Live Doc
  const { db } = require("../config/firebase");
  await db.collection("auction").doc("current").set({
    status: "IDLE",
    player: null,
    isPreviewPhase: false,
    previewTimer: 10
  });

  return res.status(200).json({
    message: "Auction and Database completely reset.",
  });
};

/* ===============================
   DB MIGRATION
================================ */
exports.seedDatabase = async (req, res) => {
  const { db } = require("../config/firebase");
  console.log("Seeding database...");

  try {
    // 1. CLEAR EXISTING DATA
    console.log("Clearing existing players...");
    const snapshot = await db.collection("players").get();

    if (!snapshot.empty) {
      const deleteBatchSize = 400;
      let deleteBatch = db.batch();
      let deleteCount = 0;

      for (const doc of snapshot.docs) {
        deleteBatch.delete(doc.ref);
        deleteCount++;

        if (deleteCount >= deleteBatchSize) {
          await deleteBatch.commit();
          deleteBatch = db.batch(); // Reset batch
          deleteCount = 0;
        }
      }

      if (deleteCount > 0) {
        await deleteBatch.commit();
      }
      console.log("Existing players cleared.");
    }

    const batchSize = 400;
    const allItems = [
      ...players,
      ...bowlers,
      ...wickets,
      ...allrounders
    ];

    let batch = db.batch();
    let count = 0;
    let total = 0;

    for (const item of allItems) {
      const docRef = db.collection("players").doc(String(item.id));

      // Sanitizing and constructing the payload
      const payload = {
        id: item.id,
        name: item.name,
        role: item.role || "Accessory",
        auctionPhase: item.auctionPhase || "ACCESSORIES",
        basePrice: typeof item.auction?.base === 'number' ? item.auction.base :
          (Number(item.basePrice) || 0), // Handle different structures
        importanceScore: item.importanceScore || 0,
        image: item.image || "",

        // Default Status fields
        status: "UNSOLD",
        soldToTeamId: null,
        soldToTeamName: null,
        soldPrice: 0,

        // Retain original object for details if needed
        originalData: item
      };

      batch.set(docRef, payload, { merge: true });
      count++;
      total++;

      if (count >= batchSize) {
        await batch.commit();
        batch = db.batch();
        count = 0;
        console.log(`Committed ${total} items...`);
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    console.log("Seeding complete.");
    return res.status(200).json({ message: `Database seeded with ${total} items.` });

  } catch (err) {
    console.error("Seeding error:", err);
    return res.status(500).json({ message: "Seeding failed", error: err.message });
  }
};

/* ===============================
   PLAYER REASSIGNMENT (Admin2)
================================ */

// Get all sold players across all teams
exports.getAllSoldPlayers = async (req, res) => {
  try {
    const teamModel = getTeamModel();
    const teams = await teamModel.getAllTeams();

    const soldPlayers = [];

    teams.forEach(team => {
      if (team.boughtPlayers && team.boughtPlayers.length > 0) {
        team.boughtPlayers.forEach(player => {
          soldPlayers.push({
            ...player,
            currentTeamId: team.id,
            currentTeamName: team.name
          });
        });
      }
    });

    return res.status(200).json({
      success: true,
      players: soldPlayers,
      teams: teams
    });
  } catch (err) {
    console.error("getAllSoldPlayers error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Reassign a player from one team to another
exports.reassignPlayer = async (req, res) => {
  const { playerId, fromTeamId, toTeamId, newPrice } = req.body;
  const { db } = require("../config/firebase");

  try {
    if (!playerId || !fromTeamId || !toTeamId) {
      return res.status(400).json({ message: "playerId, fromTeamId, and toTeamId are required" });
    }

    const teamModel = getTeamModel();

    // Get both teams
    const fromTeam = await teamModel.getTeamById(fromTeamId);
    const toTeam = await teamModel.getTeamById(toTeamId);

    if (!fromTeam) return res.status(404).json({ message: "Source team not found" });
    if (!toTeam) return res.status(404).json({ message: "Destination team not found" });

    // Find the player in the source team
    const playerIndex = (fromTeam.boughtPlayers || []).findIndex(p => String(p.id) === String(playerId));

    if (playerIndex === -1) {
      return res.status(404).json({ message: "Player not found in source team" });
    }

    const player = fromTeam.boughtPlayers[playerIndex];
    const oldPrice = player.price || 0;
    const finalPrice = newPrice !== undefined ? Number(newPrice) : oldPrice;

    // Check if destination team has enough funds (if price increased)
    const priceDifference = finalPrice - oldPrice;
    if (priceDifference > 0 && toTeam.purse < priceDifference) {
      return res.status(400).json({ message: "Destination team has insufficient funds for price increase" });
    }

    // Check team player limit (max 15 players)
    const toTeamPlayerCount = (toTeam.boughtPlayers || []).filter(p => Number(p.id) < 1000 && !p.role?.toLowerCase().includes('accessory')).length;
    if (toTeamPlayerCount >= 15) {
      return res.status(400).json({ message: "Destination team has reached maximum player limit of 15" });
    }

    // Check Overseas Limit for destination team
    const isOverseasPlayer = player.overseas;
    if (isOverseasPlayer) {
      const toTeamOverseasCount = (toTeam.boughtPlayers || []).reduce((count, p) => {
        const pOverseas = p.overseas || (p.country && p.country.includes("Overseas"));
        return count + (pOverseas ? 1 : 0);
      }, 0);

      if (toTeamOverseasCount >= 8) {
        return res.status(400).json({ message: "Destination team has reached overseas player limit of 8" });
      }
    }

    // Perform the reassignment in a transaction
    const fromTeamRef = db.collection("teams").doc(fromTeamId);
    const toTeamRef = db.collection("teams").doc(toTeamId);

    await db.runTransaction(async (transaction) => {
      const fromDoc = await transaction.get(fromTeamRef);
      const toDoc = await transaction.get(toTeamRef);

      if (!fromDoc.exists || !toDoc.exists) {
        throw new Error("One or both teams not found");
      }

      const fromData = fromDoc.data();
      const toData = toDoc.data();

      // Remove player from source team
      const updatedFromPlayers = (fromData.boughtPlayers || []).filter((p, idx) => idx !== playerIndex);
      const fromPurseAdjustment = fromData.purse + oldPrice;

      // Add player to destination team with updated price
      const updatedPlayer = {
        ...player,
        price: finalPrice,
        reassignedAt: new Date().toISOString(),
        previousTeam: fromTeam.name
      };
      const updatedToPlayers = [...(toData.boughtPlayers || []), updatedPlayer];
      const toPurseAdjustment = toData.purse - finalPrice;

      // Update both teams
      transaction.update(fromTeamRef, {
        boughtPlayers: updatedFromPlayers,
        purse: fromPurseAdjustment
      });

      transaction.update(toTeamRef, {
        boughtPlayers: updatedToPlayers,
        purse: toPurseAdjustment
      });
    });

    // Update player document in Firestore if it exists
    try {
      await db.collection("players").doc(String(playerId)).update({
        soldToTeamId: toTeamId,
        soldToTeamName: toTeam.name,
        soldPrice: finalPrice,
        reassignedAt: new Date().toISOString()
      });
    } catch (e) {
      console.log("Player doc update skipped (may not exist):", e.message);
    }

    // Update in-memory player lists
    const allLists = [players, bowlers, wickets, allrounders];
    for (const list of allLists) {
      const memPlayer = list.find(p => String(p.id) === String(playerId));
      if (memPlayer) {
        memPlayer.soldToTeamId = toTeamId;
        memPlayer.soldToTeamName = toTeam.name;
        memPlayer.soldPrice = finalPrice;
        break;
      }
    }

    // Broadcast update via socket
    const io = req.app.get("io");
    if (io) {
      io.emit("playerReassigned", {
        playerId,
        fromTeam: fromTeam.name,
        toTeam: toTeam.name,
        price: finalPrice
      });
    }

    return res.status(200).json({
      success: true,
      message: `Player reassigned from ${fromTeam.name} to ${toTeam.name}`,
      player: {
        ...player,
        price: finalPrice,
        currentTeamId: toTeamId,
        currentTeamName: toTeam.name
      }
    });
  } catch (err) {
    console.error("reassignPlayer error:", err);
    return res.status(500).json({ message: err.message });
  }
};

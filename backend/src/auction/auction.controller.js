const { getAllTeams, getTeamById } = require("../models/team.model");
const auctionState = require("./auctionState");
const { db } = require("../config/firebase");

/* ================= GET TEAMS ================= */
exports.getTeams = async (req, res) => {
  try {
    const teams = await getAllTeams();
    return res.status(200).json({ count: teams.length, teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return res.status(500).json({ message: "Failed to fetch teams" });
  }
};

/* ================= PLACE BID ================= */
exports.placeBid = async (req, res) => {
  const { teamId } = req.body;

  if (!auctionState.auctionStarted || auctionState.isPaused) {
    return res.status(400).json({ message: "Auction not active" });
  }

  if (!auctionState.currentPlayer) {
    return res.status(400).json({ message: "No active player" });
  }

  // Prevent bidding if time is up
  if (auctionState.timer <= 0) {
    return res.status(400).json({ message: "Bidding is closed" });
  }

  // Fetch Team Name reliably
  const team = await getTeamById(teamId);
  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }
  const teamName = team.name;

  let current = auctionState.currentBid;

  // MAX BID LIMIT CHECK (Special Token Decision)
  if (current >= 2000) {
    return res.status(400).json({
      message: "Max bid limit reached (2000)! Special token decision required.",
      maxLimitReached: true
    });
  }

  // Dynamic Increment Logic
  let increment = 0;
  if (current < 500) {
    increment = 50;
  } else if (current >= 500 && current < 1200) {
    increment = 100;
  } else {
    increment = 200;
  }

  let newBid = current + increment;

  // Rule: Max 7 Overseas Players
  const isOverseasPlayer = auctionState.currentPlayer.auction?.overseas || auctionState.currentPlayer.overseas;
  if (isOverseasPlayer) {
    const currentOverseasCount = (team.boughtPlayers || []).reduce((count, p) => {
      // Check both nested auction object and top-level property for safety
      return count + ((p.auction?.overseas || p.overseas) ? 1 : 0);
    }, 0);

    if (currentOverseasCount >= 8) {
      return res.status(400).json({ message: "Limit reached! Cannot buy more than 8 overseas players." });
    }
  }

  // Check Funds
  if (team.purse < newBid) {
    return res.status(400).json({ message: "Insufficient funds! Cannot bid." });
  }

  // Update State
  auctionState.currentBid = newBid;
  auctionState.highestBidTeamId = teamId;
  // Increase timer by 10s, but cap at 30s max
  auctionState.timer = Math.min(auctionState.timer + 10, 30);

  // Update Firestore for Real-time Clients
  try {
    await db.collection("auction").doc("current").update({
      currentBid: newBid,
      highestBidder: teamName, // Store name for display
      timer: auctionState.timer,
      maxLimitReached: newBid >= 2000 // Flag for frontend to disable button
    });
  } catch (err) {
    console.error("Bid update error:", err);
    return res.status(500).json({ message: "Failed to broadcast bid" });
  }

  return res.status(200).json({
    message: "Bid placed successfully",
    currentBid: newBid,
    highestBidder: teamName
  });
};

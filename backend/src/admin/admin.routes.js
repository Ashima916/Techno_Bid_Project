const express = require("express");
const router = express.Router();

const {
  lockTeams,
  unlockTeams,
  startAuction,
  changePhase,
  pauseAuction,
  resumeAuction,
  selectPlayer,
  getPlayersByPhase,
  restartAuction,
  seedDatabase,
  assignPlayer,
  markAsUnsold,
  getAllSoldPlayers,
  reassignPlayer
} = require("./admin.controller");

// lock teams
router.post("/lock-teams", lockTeams);

// unlock teams
router.post("/unlock-teams", unlockTeams);

// start auction
router.post("/start-auction", startAuction);

// change phase
router.post("/change-phase", changePhase);

// pause auction
router.post("/pause-auction", pauseAuction);

// resume auction
router.post("/resume-auction", resumeAuction);

// select player
router.post("/select-player", selectPlayer);

// assign player (Special Token)
router.post("/assign-player", assignPlayer);

// mark player as unsold
router.post("/mark-unsold", markAsUnsold);

// get players by phase
router.get("/players", getPlayersByPhase);

// restart auction
router.post("/restart-auction", restartAuction);

// seed db
router.post("/seed", seedDatabase);

// get all sold players (for admin2)
router.get("/sold-players", getAllSoldPlayers);

// reassign player to different team (for admin2)
router.post("/reassign-player", reassignPlayer);

module.exports = router;

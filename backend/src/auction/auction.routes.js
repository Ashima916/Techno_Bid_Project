const express = require("express");
const router = express.Router();
const { getTeams, placeBid } = require("./auction.controller");

router.get("/teams", getTeams);
router.post("/bid", placeBid);

module.exports = router;

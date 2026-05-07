const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");

/* ================= CREATE TEAM ================= */
router.post("/create", async (req, res) => {
  try {
    const result = await teamController.createTeam(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ================= JOIN TEAM ================= */
router.post("/join", async (req, res) => {
  try {
    const result = await teamController.joinTeam(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ================= GET ALL TEAMS ================= */
router.get("/", async (req, res) => {
  try {
    const teams = await teamController.getAllTeams();
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

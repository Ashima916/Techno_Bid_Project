const admin = require("firebase-admin");
const db = admin.firestore();
const teamModel = require("../models/team.model");

/* ===================== CREATE TEAM ===================== */
/* ===================== CREATE TEAM ===================== */
async function createTeam({ name, maxSize, phone }) {
  console.log("[CONTROLLER] createTeam called");
  console.log("[CONTROLLER] Params:", { name, maxSize, phone });

  if (!name || !maxSize || !phone) {
    console.log("[CONTROLLER] ERROR: Missing fields");
    throw new Error("Missing fields");
  }

  const teamsRef = db.collection("teams");

  await db.runTransaction(async (tx) => {
    console.log("[CONTROLLER] Transaction started");

    // unique team name
    const nameQ = await tx.get(
      teamsRef.where("name", "==", name).limit(1)
    );
    if (!nameQ.empty) {
      console.log("[CONTROLLER] ERROR: Team name already exists");
      throw new Error("Team name must be unique");
    }

    // user already in a team
    const memberQ = await tx.get(
      teamsRef.where("members", "array-contains", phone).limit(1)
    );
    if (!memberQ.empty) {
      console.log("[CONTROLLER] ERROR: User already in a team");
      throw new Error("You are already in a team");
    }

    const newTeamRef = teamsRef.doc();
    console.log("[CONTROLLER] Creating new team with ID:", newTeamRef.id);

    tx.set(newTeamRef, {
      name,
      maxSize: Number(maxSize),
      members: [phone],
      createdBy: phone, // Store team leader/creator
      isLocked: false,
      purse: 0,
      boughtPlayers: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("[CONTROLLER] Team document set in transaction");
  });

  console.log("[CONTROLLER] Transaction completed successfully");
  return await teamModel.getAllTeams();
}

/* ===================== JOIN TEAM ===================== */
async function joinTeam({ teamId, phone }) {
  if (!teamId || !phone) {
    throw new Error("Missing fields");
  }

  const teamsRef = db.collection("teams");

  await db.runTransaction(async (tx) => {
    // already in any team
    const existingTeamSnap = await tx.get(
      teamsRef.where("members", "array-contains", phone).limit(1)
    );
    if (!existingTeamSnap.empty) {
      throw new Error("You are already in a team");
    }

    // target team
    const teamRef = teamsRef.doc(teamId);
    const teamSnap = await tx.get(teamRef);

    if (!teamSnap.exists) throw new Error("Team not found");

    const team = teamSnap.data();

    if (team.isLocked) throw new Error("Team is locked");

    if (team.members.length >= team.maxSize) {
      throw new Error("Team is full");
    }

    tx.update(teamRef, {
      members: admin.firestore.FieldValue.arrayUnion(phone),
    });
  });

  return await teamModel.getAllTeams();
}

/* ===================== GET ALL TEAMS ===================== */
async function getAllTeams() {
  return await teamModel.getAllTeams();
}

/* ===================== REMOVE MEMBER ===================== */
async function removeMember({ teamId, phone }) {
  if (!teamId || !phone) {
    throw new Error("Missing fields");
  }

  const teamRef = db.collection("teams").doc(teamId);

  await teamRef.update({
    members: admin.firestore.FieldValue.arrayRemove(phone),
  });

  return await teamModel.getAllTeams();
}

/* ===================== LOCK/UNLOCK ALL TEAMS ===================== */
async function lockAllTeams() {
  return await teamModel.lockAllTeams();
}

async function unlockAllTeams() {
  return await teamModel.unlockAllTeams();
}

/* ===================== UPDATE TEAM ===================== */
async function updateTeam({ teamId, name, maxSize }) {
  if (!teamId) throw new Error("Missing team ID");
  return await teamModel.updateTeam({ teamId, name, maxSize });
}

/* ===================== DELETE TEAM ===================== */
async function deleteTeam(teamId) {
  if (!teamId) throw new Error("Missing team ID");
  return await teamModel.deleteTeam(teamId);
}

module.exports = {
  createTeam,
  joinTeam,
  getAllTeams,
  removeMember,
  lockAllTeams,
  unlockAllTeams,
  updateTeam,
  deleteTeam,
};

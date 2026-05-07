const admin = require("firebase-admin");
const { db } = require("../config/firebase");

if (!admin.apps.length) { }
const TEAMS_COLLECTION = "teams";

async function getAllTeams() {
  const snap = await db
    .collection(TEAMS_COLLECTION)
    .orderBy("createdAt", "asc")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getTeamById(teamId) {
  const doc = await db.collection(TEAMS_COLLECTION).doc(teamId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getTeamByName(name) {
  const q = await db
    .collection(TEAMS_COLLECTION)
    .where("name", "==", name)
    .limit(1)
    .get();

  if (q.empty) return null;
  const d = q.docs[0];
  return { id: d.id, ...d.data() };
}

async function getTeamByMember(enrollmentNumber) {
  const q = await db
    .collection(TEAMS_COLLECTION)
    .where("members", "array-contains", enrollmentNumber)
    .limit(1)
    .get();

  if (q.empty) return null;
  const d = q.docs[0];
  return { id: d.id, ...d.data() };
}

async function isAnyTeamLocked() {
  const q = await db
    .collection(TEAMS_COLLECTION)
    .where("isLocked", "==", true)
    .limit(1)
    .get();

  return !q.empty;
}

async function createTeam({ name, maxSize, creatorEnrollment }) {
  const locked = await isAnyTeamLocked();
  if (locked) throw new Error("Lobby is locked");

  if (Number(maxSize) > 5) throw new Error("Team size cannot exceed 5");

  const ref = db.collection(TEAMS_COLLECTION).doc();

  const team = {
    name,
    maxSize: Number(maxSize),
    members: [creatorEnrollment],
    isLocked: false,
    purse: 100,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(team);
  const created = await ref.get();
  return { id: ref.id, ...created.data() };
}

async function addMemberToTeam(teamId, enrollmentNumber) {
  const locked = await isAnyTeamLocked();
  if (locked) throw new Error("Lobby is locked");

  const teamRef = db.collection(TEAMS_COLLECTION).doc(teamId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(teamRef);
    if (!snap.exists) throw new Error("Team not found");

    const team = snap.data();
    const members = team.members || [];

    if (members.includes(enrollmentNumber)) return;

    if (team.maxSize != null && members.length >= team.maxSize) {
      throw new Error("Team is full");
    }

    tx.update(teamRef, {
      members: admin.firestore.FieldValue.arrayUnion(enrollmentNumber),
    });
  });

  return getTeamById(teamId);
}
async function removeMemberFromTeam(teamId, enrollmentNumber) {
  const teamRef = db.collection(TEAMS_COLLECTION).doc(teamId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(teamRef);
    if (!snap.exists) throw new Error("Team not found");

    tx.update(teamRef, {
      members: admin.firestore.FieldValue.arrayRemove(enrollmentNumber),
    });
  });

  return getTeamById(teamId);
}

async function removeMemberFromAnyTeam(enrollmentNumber) {
  const team = await getTeamByMember(enrollmentNumber);
  if (!team) return null;

  await removeMemberFromTeam(team.id, enrollmentNumber);
  return getAllTeams();
}

async function lockAllTeams() {
  const snap = await db.collection(TEAMS_COLLECTION).get();
  const batch = db.batch();

  snap.docs.forEach((d) => {
    const ref = db.collection(TEAMS_COLLECTION).doc(d.id);
    // Initialize purse to 10000 when locking for auction
    batch.update(ref, {
      isLocked: true,
      purse: 10000
    });
  });

  await batch.commit();
  return getAllTeams();
}

async function unlockAllTeams() {
  const snap = await db.collection(TEAMS_COLLECTION).get();
  const batch = db.batch();

  snap.docs.forEach((d) => {
    const ref = db.collection(TEAMS_COLLECTION).doc(d.id);
    batch.update(ref, { isLocked: false });
  });

  await batch.commit();
  return getAllTeams();
}

async function updateTeam({ teamId, name, maxSize }) {
  const teamRef = db.collection(TEAMS_COLLECTION).doc(teamId);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(teamRef);
    if (!doc.exists) throw new Error("Team not found");

    const data = doc.data();
    if (data.isLocked) throw new Error("Lobby is locked");

    if (maxSize && Number(maxSize) > 5) {
      throw new Error("Team size cannot exceed 5");
    }

    // Check name uniqueness if changed
    if (name && name !== data.name) {
      const nameQ = await tx.get(
        db.collection(TEAMS_COLLECTION).where("name", "==", name).limit(1)
      );
      if (!nameQ.empty) throw new Error("Team name already exists");
    }

    const updates = {};
    if (name) updates.name = name;
    if (maxSize) updates.maxSize = Number(maxSize);

    if (Object.keys(updates).length > 0) {
      tx.update(teamRef, updates);
    }
  });

  return getAllTeams();
}

async function deleteTeam(teamId) {
  const teamRef = db.collection(TEAMS_COLLECTION).doc(teamId);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(teamRef);
    if (!doc.exists) throw new Error("Team not found");

    const data = doc.data();
    if (data.isLocked) throw new Error("Lobby is locked");

    tx.delete(teamRef);
  });

  return getAllTeams();
}

async function updateTeamPurse(teamId, amount) {
  const ref = db.collection(TEAMS_COLLECTION).doc(teamId);
  await ref.update({ purse: amount });
}

async function assignPlayerToTeam(teamId, playerObj, bidAmount, useSpecialToken = false) {
  const teamRef = db.collection(TEAMS_COLLECTION).doc(teamId);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(teamRef);
    if (!doc.exists) throw new Error("Team not found");

    const data = doc.data();
    const currentPurse = data.purse || 0;

    const newPurse = currentPurse - bidAmount;

    // Add to boughtPlayers
    const boughtPlayers = data.boughtPlayers || [];
    boughtPlayers.push({
      id: playerObj.id,
      name: playerObj.name,
      role: playerObj.role || playerObj.forUse || "Accessory",
      image: playerObj.image || playerObj.imageURL || playerObj.imageUrl || "",
      price: bidAmount,
      boughtAt: new Date().toISOString(),
      overseas: !!(playerObj.overseas || playerObj.auction?.overseas || (playerObj.country && playerObj.country.includes("Overseas"))),
      rank: playerObj.rank || 0,
      acquiredViaSpecialToken: useSpecialToken
    });

    const updates = {
      purse: newPurse,
      boughtPlayers: boughtPlayers
    };

    // Mark special token as used if applicable
    if (useSpecialToken) {
      updates.specialTokenUsed = true;
    }

    tx.update(teamRef, updates);
  });
}

async function resetAllTeams() {
  const snap = await db.collection(TEAMS_COLLECTION).get();
  const batch = db.batch();

  snap.docs.forEach((d) => {
    const ref = db.collection(TEAMS_COLLECTION).doc(d.id);
    batch.update(ref, {
      isLocked: false,
      purse: 10000, // Reset to auction default as requested
      boughtPlayers: [],
      specialTokenUsed: false, // Reset special token
      // Reset Playing 11 data
      playing11: [],
      playing11AvgRank: 0,
      playing11SubmittedAt: null,
      playing11SubmittedBy: null
    });
  });

  await batch.commit();
  return getAllTeams();
}

module.exports = {
  getAllTeams,
  getTeamById,
  getTeamByName,
  getTeamByMember,
  createTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  removeMemberFromAnyTeam,
  isAnyTeamLocked,
  lockAllTeams,
  unlockAllTeams,
  resetAllTeams,
  updateTeam,
  deleteTeam,
  updateTeamPurse,
  assignPlayerToTeam,
};

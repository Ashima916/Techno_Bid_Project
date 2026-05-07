const { db } = require("../config/firebase");
exports.getAllTeams = async () => {
  const snapshot = await db.collection("teams").get();

  const teams = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return teams;
};

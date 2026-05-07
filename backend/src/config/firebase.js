const admin = require("firebase-admin");
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require("../../serviceAccountKey.json");
  } catch (error) {
    console.error("❌ serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT not set.");
    process.exit(1);
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized");
}

const db = admin.firestore();
module.exports = { admin, db };
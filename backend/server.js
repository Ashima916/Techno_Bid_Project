const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");
require("dotenv").config();

// 🔥 Initialize Firebase Admin SDK (Global)
require("./src/config/firebase");




// Routes
const adminRoutes = require("./src/admin/admin.routes");
const auctionRoutes = require("./src/auction/auction.routes");

// Restore State
const restoreAuctionState = require("./src/auction/auctionRestore");
restoreAuctionState();

// Socket handlers
const registerLobbySockets = require("./src/sockets/lobby.sockets");
const registerAdminSockets = require("./src/sockets/admin.sockets");

const userSocketMap = new Map(); // enrollmentNumber -> socket.id

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://techno-bid.vercel.app",
  "https://praveengarg.codes"
];

// 🔹 Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// 🔹 REST Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auction", auctionRoutes);

// 🔹 Health/Test Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Backend connected successfully" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

// 🔹 Create HTTP server
const server = http.createServer(app);

// 🔹 Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

// 🔥 Expose io to Express app
app.set("io", io);

// 🔥 Register sockets
io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  // Register socket modules
  registerLobbySockets(io, socket);
  registerAdminSockets(io, socket);
  require("./src/sockets/auction.sockets")(io, socket);

  // Optional: user socket tracking
  socket.on("REGISTER_USER", ({ phone }) => {
    // OLD: userSocketMap.set(phone, socket.id);
    const auctionState = require("./src/auction/auctionState");
    auctionState.onlineUsers.add(phone);

    // Map socket ID to phone for disconnect handling
    userSocketMap.set(socket.id, phone);

    console.log(`User ${phone} registered. Online: ${auctionState.onlineUsers.size}`);
    io.emit("onlineParticipantsUpdate", Array.from(auctionState.onlineUsers));
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    const phone = userSocketMap.get(socket.id);
    if (phone) {
      const auctionState = require("./src/auction/auctionState");
      auctionState.onlineUsers.delete(phone);
      userSocketMap.delete(socket.id);
      console.log(`User ${phone} disconnected. Online: ${auctionState.onlineUsers.size}`);
      io.emit("onlineParticipantsUpdate", Array.from(auctionState.onlineUsers));
    }
  });
});

// 🔹 Start server
server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});

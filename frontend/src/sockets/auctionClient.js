import { io } from "socket.io-client";

const BACKEND_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://technobid.onrender.com";

let socket = null;

export const initAuctionSocket = (callbacks) => {
    if (socket) return socket;

    socket = io(BACKEND_URL, {
        transports: ["websocket"],
        reconnection: true,
    });

    socket.on("connect", () => {
        console.log("✅ Custom Auction Socket Connected:", socket.id);
        socket.emit("joinAuction");
    });

    socket.on("auctionSync", (data) => {
        if (callbacks.onSync) callbacks.onSync(data);
    });

    socket.on("auctionUpdate", (data) => {
        // data: { status, player, phase, isPreviewPhase, previewTimer, soldToTeam, soldPrice }
        if (callbacks.onUpdate) callbacks.onUpdate(data);
    });

    socket.on("auctionResult", (result) => {
        // result: { playerId, status, soldTo, price }
        if (callbacks.onResult) callbacks.onResult(result);
    });

    socket.on("errorMessage", (msg) => {
        if (callbacks.onError) callbacks.onError(msg);
    });

    socket.on("previewUpdate", (data) => {
        // data: { isPreviewPhase, previewTimer }
        if (callbacks.onPreviewUpdate) callbacks.onPreviewUpdate(data);
    });

    return socket;
};

export const adminSelectPlayer = (playerId) => {
    if (socket) socket.emit("adminSelectPlayer", { playerId });
};

export const adminPauseAuction = () => {
    if (socket) socket.emit("adminPause");
};

export const adminResumeAuction = () => {
    if (socket) socket.emit("adminResume");
};

export const disconnectAuctionSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

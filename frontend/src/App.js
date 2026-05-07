import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Admin Components
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AddParticipant from "./pages/admin/AddParticipant";

import LobbyManagement from "./pages/admin/LobbyManagement";
import AuctionControl from "./pages/admin/AuctionControl";
import ResultsAndLogs from "./pages/admin/ResultsAndLogs";
import AdminPlaying11 from "./pages/admin/AdminPlaying11";
import PlayerReassignment from "./pages/admin/PlayerReassignment";

// Participant Components
import LoginPage from "./pages/participant/loginPage";
import LobbyPage from "./pages/participant/lobbyPage";
import TeamCardPage from "./pages/participant/teamCardPage";
import AuctionCountdown from "./pages/participant/auctionCountdown";
import AuctionArena from "./pages/participant/mainAuctionPage";
import ResultPage from "./pages/participant/resultPage";
import Playing11Selection from "./pages/participant/Playing11Selection";
import SelfRegistration from "./pages/participant/SelfRegistration";

import { ToastProvider } from "./context/ToastContext";
import { TESTING_CONFIG } from "./config/testingConfig";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* ===== TESTING FEATURE: SELF-REGISTRATION ===== */}
          {/* To disable: Set ENABLE_SELF_REGISTRATION to false in src/config/testingConfig.js */}
          {TESTING_CONFIG.ENABLE_SELF_REGISTRATION && (
            <Route path="/register" element={<SelfRegistration />} />
          )}

          {/* Participant Login (First Screen) */}
          <Route path="/" element={<LoginPage />} />

          {/* Participant Lobby */}
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/team-card" element={<TeamCardPage />} />
          <Route path="/countdown" element={<AuctionCountdown />} />
          <Route path="/auction-arena" element={<AuctionArena />} />
          <Route path="/results" element={<ResultPage />} />
          <Route path="/playing11" element={<Playing11Selection />} />

          {/* Admin Login */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/add-participant" element={<AddParticipant />} />
            <Route path="/admin/lobby" element={<LobbyManagement />} />
            <Route path="/admin/auction" element={<AuctionControl />} />
            <Route path="/admin/results" element={<ResultsAndLogs />} />
            <Route path="/admin/playing11" element={<AdminPlaying11 />} />
            <Route path="/admin2" element={<PlayerReassignment />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

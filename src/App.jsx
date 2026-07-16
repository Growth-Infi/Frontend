import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import Home from "./pages/Home";
import Campaign from "./pages/Campaign";
import Settings from "./pages/Settings";
import CampaignDetail from "./pages/CampaignDetails";
import IceBreaker from "./pages/IceBreaker";
import AiEnrichment from "./pages/AiEnrichment";
import FindDomains from "./pages/FindDomains";
import SavedProjects from "./pages/SavedProjects";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
const EmailVerifier = () => <h1>Email Verifier</h1>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/campaign" element={<Campaign />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="/email-verifier" element={<EmailVerifier />} />
            <Route path="/ice-breaker" element={<IceBreaker />} />
            <Route path="/ai-enrichment" element={<AiEnrichment />} />
            <Route path="/find-domains" element={<FindDomains />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/saved" element={<SavedProjects />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

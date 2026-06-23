import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AppLayout from "./pages/AppLayout"

const Home = () => <h1>Home</h1>
const Campaign = () => <h1>Campaign</h1>
const EmailVerifier = () => <h1>Email Verifier</h1>
const IceBreaker = () => <h1>IceBreaker</h1>
const AiEnrichment = () => <h1>AI Enrichment</h1>
const FindDomains = () => <h1>Find Domains</h1>
const Settings = () => <h1>Settings</h1>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/campaign" element={<Campaign />} />
          <Route path="/email-verifier" element={<EmailVerifier />} />
          <Route path="/ice-breaker" element={<IceBreaker />} />
          <Route path="/ai-enrichment" element={<AiEnrichment />} />
          <Route path="/find-domains" element={<FindDomains />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { CampaignWizard } from './components/Campaign/CampaignWizard';
import { CampaignHome } from './components/Campaign/CampaignHome';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/new"
          element={
            <ProtectedRoute>
              <CampaignWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId"
          element={
            <ProtectedRoute>
              <CampaignHome />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

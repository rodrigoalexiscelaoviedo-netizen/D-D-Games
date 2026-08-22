import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { CampaignWizard } from './components/Campaign/CampaignWizard';
import { CampaignHome } from './components/Campaign/CampaignHome';
import { CharacterForm } from './components/Character/CharacterForm';
import { CharacterList } from './components/Character/CharacterList';
import { CombatSetup } from './components/Combat/CombatSetup';
import { CombatTurn } from './components/Combat/CombatTurn';
import { CampaignWiki } from './components/Campaign/CampaignWiki';

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
        <Route
          path="/campaign/:campaignId/characters"
          element={
            <ProtectedRoute>
              <CharacterList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId/characters/new"
          element={
            <ProtectedRoute>
              <CharacterForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId/characters/:characterId/edit"
          element={
            <ProtectedRoute>
              <CharacterForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId/combat/new"
          element={
            <ProtectedRoute>
              <CombatSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId/combat/:combatId"
          element={
            <ProtectedRoute>
              <CombatTurn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId/wiki"
          element={
            <ProtectedRoute>
              <CampaignWiki />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

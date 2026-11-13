import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';

// Cada pantalla se descarga recién cuando se entra a ella: la primera carga es mucho más liviana.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const CampaignWizard = lazy(() => import('./components/Campaign/CampaignWizard').then((m) => ({ default: m.CampaignWizard })));
const CampaignHome = lazy(() => import('./components/Campaign/CampaignHome').then((m) => ({ default: m.CampaignHome })));
const CharacterForm = lazy(() => import('./components/Character/CharacterForm').then((m) => ({ default: m.CharacterForm })));
const CharacterList = lazy(() => import('./components/Character/CharacterList').then((m) => ({ default: m.CharacterList })));
const CombatSetup = lazy(() => import('./components/Combat/CombatSetup').then((m) => ({ default: m.CombatSetup })));
const CombatScreen = lazy(() => import('./components/Combat/CombatScreen').then((m) => ({ default: m.CombatScreen })));
const CampaignWiki = lazy(() => import('./components/Campaign/CampaignWiki').then((m) => ({ default: m.CampaignWiki })));
const DMToolsPage = lazy(() => import('./components/Campaign/DMToolsPage').then((m) => ({ default: m.DMToolsPage })));
const PlaythroughScreen = lazy(() => import('./components/Adventure/PlaythroughScreen').then((m) => ({ default: m.PlaythroughScreen })));
const AdventureList = lazy(() => import('./components/Adventure/AdventureList').then((m) => ({ default: m.AdventureList })));
const ModuleLibrary = lazy(() => import('./components/Adventure/ModuleLibrary').then((m) => ({ default: m.ModuleLibrary })));
const ModulePreview = lazy(() => import('./components/Adventure/ModulePreview').then((m) => ({ default: m.ModulePreview })));
const AdventureEditor = lazy(() => import('./components/Adventure/AdventureEditor').then((m) => ({ default: m.AdventureEditor })));
const PlaythroughLobby = lazy(() => import('./components/Adventure/PlaythroughLobby').then((m) => ({ default: m.PlaythroughLobby })));
const BestiaryScreen = lazy(() => import('./components/Bestiario/BestiaryScreen').then((m) => ({ default: m.BestiaryScreen })));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));

const guard = (el: ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>;

const PageLoading = () => (
  <div className="app-loading" role="status">
    <span className="app-loading-mark" aria-hidden="true">◆</span>
    <span>Cargando…</span>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={guard(<Dashboard />)} />
            <Route path="/campaign/new" element={guard(<CampaignWizard />)} />
            <Route path="/campaign/:campaignId" element={guard(<CampaignHome />)} />
            <Route path="/campaign/:campaignId/characters" element={guard(<CharacterList />)} />
            <Route path="/campaign/:campaignId/characters/new" element={guard(<CharacterForm />)} />
            <Route path="/campaign/:campaignId/characters/:characterId/edit" element={guard(<CharacterForm />)} />
            <Route path="/campaign/:campaignId/combat/new" element={guard(<CombatSetup />)} />
            <Route path="/campaign/:campaignId/combat/:combatId" element={guard(<CombatScreen />)} />
            <Route path="/campaign/:campaignId/adventures" element={guard(<AdventureList />)} />
            <Route path="/campaign/:campaignId/modules" element={guard(<ModuleLibrary />)} />
            <Route path="/campaign/:campaignId/modules/:slug" element={guard(<ModulePreview />)} />
            {import.meta.env.DEV && <Route path="/dev/modules/:slug" element={<ModulePreview />} />}
            <Route path="/campaign/:campaignId/admin/adventures" element={guard(<AdventureEditor />)} />
            <Route path="/campaign/:campaignId/play/:playthroughId/lobby" element={guard(<PlaythroughLobby />)} />
            <Route path="/campaign/:campaignId/wiki" element={guard(<CampaignWiki />)} />
            <Route path="/campaign/:campaignId/dm-tools" element={guard(<DMToolsPage />)} />
            <Route path="/campaign/:campaignId/play/:playthroughId" element={guard(<PlaythroughScreen />)} />
            <Route path="/bestiary" element={guard(<BestiaryScreen />)} />
            <Route path="/admin" element={guard(<AdminDashboard />)} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

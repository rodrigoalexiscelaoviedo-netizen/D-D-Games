import { memo, useState } from 'react';
import { NPCManager } from './NPCManager';
import { DungeonPlanner } from './DungeonPlanner';

type Tab = 'npcs' | 'locations';

export const DMToolsPage = memo(() => {
  const [activeTab, setActiveTab] = useState<Tab>('npcs');

  return (
    <div className="page-pad">
      <h1>🛠️ DM Tools</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'npcs' ? 'active' : ''}`}
          onClick={() => setActiveTab('npcs')}
        >
          Personajes (NPCs)
        </button>
        <button
          className={`tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          Ubicaciones
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'npcs' && <NPCManager />}
        {activeTab === 'locations' && <DungeonPlanner />}
      </div>

      <style>{`
        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #111;
        }

        .tab-btn.active {
          color: #7c3aed;
          border-bottom-color: #7c3aed;
        }

        .tab-content {
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
});

DMToolsPage.displayName = 'DMToolsPage';

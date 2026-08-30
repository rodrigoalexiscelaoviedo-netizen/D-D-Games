import { memo, useState } from 'react';
import { NPCGallery } from './NPCGallery';
import { LocationGallery } from './LocationGallery';

type Tab = 'npcs' | 'locations';

export const DMToolsPage = memo(() => {
  const [activeTab, setActiveTab] = useState<Tab>('npcs');

  return (
    <div className="dm-tools-page">
      <header className="dm-tools-header">
        <h1>🛠️ DM Tools & Preparation</h1>
        <p>Manage NPCs, locations, encounters, and campaign preparation</p>
      </header>

      <nav className="dm-tools-tabs">
        <button
          className={`tab-btn ${activeTab === 'npcs' ? 'active' : ''}`}
          onClick={() => setActiveTab('npcs')}
          title="Manage NPCs and companions"
        >
          👥 NPCs & Companions
        </button>
        <button
          className={`tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
          title="Manage locations and places"
        >
          📍 Locations & Places
        </button>
      </nav>

      <div className="dm-tools-content">
        {activeTab === 'npcs' && <NPCGallery />}
        {activeTab === 'locations' && <LocationGallery />}
      </div>

      <style>{`
        .dm-tools-page {
          min-height: 100vh;
          background: #0d0d0d;
        }

        .dm-tools-header {
          background: #1a1a1a;
          border-bottom: 1px solid #333;
          padding: 24px 32px;
        }

        .dm-tools-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          color: #fff;
        }

        .dm-tools-header p {
          margin: 0;
          font-size: 14px;
          color: #999;
        }

        .dm-tools-tabs {
          display: flex;
          gap: 12px;
          padding: 16px 32px;
          background: #1a1a1a;
          border-bottom: 1px solid #333;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 10px 16px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #999;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 200ms;
        }

        .tab-btn:hover {
          border-color: #666;
          color: #ccc;
        }

        .tab-btn.active {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .dm-tools-content {
          padding: 0;
        }

        @media (max-width: 768px) {
          .dm-tools-header {
            padding: 16px;
          }

          .dm-tools-header h1 {
            font-size: 24px;
          }

          .dm-tools-tabs {
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  );
});

DMToolsPage.displayName = 'DMToolsPage';

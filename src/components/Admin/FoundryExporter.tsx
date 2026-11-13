import { useState } from 'react';
import { exportAdventureToFoundry, getExportStats } from '../../lib/foundry-export';

interface FoundryExporterProps {
  adventure?: any;
  characters?: any[];
  onExportComplete?: (data: any) => void;
}

export const FoundryExporter = ({
  adventure,
  characters = [],
  onExportComplete,
}: FoundryExporterProps) => {
  const [selectedItems, setSelectedItems] = useState({
    characters: true,
    scenes: true,
    items: true,
    journal: true,
  });
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleToggle = (key: keyof typeof selectedItems) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Build export data
      const exportData = adventure
        ? exportAdventureToFoundry(adventure)
        : {
            manifest: {
              name: 'dnd-vtt-export',
              title: 'D&D VTT Export',
              version: '1.0.0',
              description: 'Exported from D&D VTT',
              author: 'D&D VTT',
              packs: [],
            },
            actors: [],
            scenes: [],
            journal: [],
          };

      // Filter based on selections
      if (!selectedItems.characters) exportData.actors = [];
      if (!selectedItems.journal) exportData.journal = [];

      // Calculate stats
      const exportStats = getExportStats(exportData);
      setStats(exportStats);

      // Create download
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      onExportComplete?.(exportData);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error during export. Check console for details.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="foundry-exporter">
      <div className="exporter-header">
        <h2>📦 Foundry VTT Export</h2>
        <p>Export your adventure and characters to Foundry VTT compatible format</p>
      </div>

      <div className="export-sections">
        <div className="section">
          <h3>What to Export</h3>
          <div className="checkboxes">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.characters}
                onChange={() => handleToggle('characters')}
              />
              <span>Characters & Actors ({characters.length})</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.scenes}
                onChange={() => handleToggle('scenes')}
              />
              <span>Scenes & Maps</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.items}
                onChange={() => handleToggle('items')}
              />
              <span>Items & Equipment</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.journal}
                onChange={() => handleToggle('journal')}
              />
              <span>Journal Entries</span>
            </label>
          </div>
        </div>

        <div className="section">
          <h3>Export Information</h3>
          <div className="info-box">
            <p className="title">{adventure?.name || 'D&D VTT Export'}</p>
            <p className="description">
              Format: JSON-based Foundry module
            </p>
            <p className="description">
              Compatible: Foundry VTT 10.x, 11.x, 12.x
            </p>
          </div>
        </div>

        {stats && (
          <div className="section stats">
            <h3>Export Statistics</h3>
            <div className="stats-grid">
              <div className="stat">
                <label>Actors</label>
                <span>{stats.actors}</span>
              </div>
              <div className="stat">
                <label>Items</label>
                <span>{stats.items}</span>
              </div>
              <div className="stat">
                <label>Scenes</label>
                <span>{stats.scenes}</span>
              </div>
              <div className="stat">
                <label>Journal Entries</label>
                <span>{stats.journal}</span>
              </div>
              <div className="stat full">
                <label>File Size</label>
                <span>{(stats.totalSize / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="export-actions">
        <button
          className="btn-export"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? '⏳ Exporting...' : '📤 Export to Foundry'}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${adventure?.name || 'dnd-vtt'}-foundry.json`}
            className="btn-download"
          >
            💾 Download JSON
          </a>
        )}
      </div>

      <div className="export-instructions">
        <h4>📖 How to Import</h4>
        <ol>
          <li>Open Foundry VTT and go to the Modules tab</li>
          <li>Click "Install Module" and paste the module URL</li>
          <li>Or manually copy the JSON into a world import dialog</li>
          <li>Enable the module in your world</li>
          <li>Access the imported content from the Compendium</li>
        </ol>
      </div>

      <style>{`
        .foundry-exporter {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-height: 900px;
          overflow-y: auto;
        }

        .exporter-header {
          margin-bottom: 12px;
        }

        .exporter-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #fff;
        }

        .exporter-header p {
          margin: 0;
          font-size: 13px;
          color: #999;
        }

        .export-sections {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
        }

        .section h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 600;
        }

        .checkboxes {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          color: #ccc;
        }

        .checkbox-item input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #a855f7;
        }

        .checkbox-item span:hover {
          color: #a855f7;
        }

        .info-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-box .title {
          margin: 0;
          font-size: 14px;
          color: #fff;
          font-weight: 600;
        }

        .info-box .description {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .stats {
          background: rgba(168, 85, 247, 0.05);
          border-color: #a855f7;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .stat {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat.full {
          grid-column: 1 / -1;
        }

        .stat label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat span {
          font-size: 18px;
          color: #a855f7;
          font-weight: 700;
        }

        .export-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-export,
        .btn-download {
          flex: 1;
          min-width: 200px;
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          text-align: center;
          font-size: 13px;
        }

        .btn-export {
          background: #a855f7;
          color: #fff;
        }

        .btn-export:hover:not(:disabled) {
          background: #9333ea;
          transform: translateY(-2px);
        }

        .btn-export:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-download {
          background: #4ade80;
          color: #000;
        }

        .btn-download:hover {
          background: #22c55e;
          transform: translateY(-2px);
        }

        .export-instructions {
          background: rgba(74, 222, 128, 0.05);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 8px;
          padding: 16px;
        }

        .export-instructions h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #4ade80;
          text-transform: uppercase;
          font-weight: 600;
        }

        .export-instructions ol {
          margin: 0;
          padding-left: 20px;
          color: #ccc;
          font-size: 12px;
          line-height: 1.6;
        }

        .export-instructions li {
          margin-bottom: 6px;
        }

        .export-instructions li:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat.full {
            grid-column: 1;
          }
        }
      `}</style>
    </div>
  );
};

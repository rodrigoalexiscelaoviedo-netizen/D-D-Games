import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCreatures, getCreaturesByCR, importOpen5eMonstersToSupabase } from '../../lib/open5e-fetcher';
import type { Creature } from '../../lib/open5e-fetcher';

export const BestiaryPage = () => {
  const navigate = useNavigate();
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCR, setSelectedCR] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    const data = await searchCreatures('');
    setCreatures(data);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearching(true);

    if (query.trim()) {
      const results = await searchCreatures(query);
      setCreatures(results);
    } else {
      const data = await searchCreatures('');
      setCreatures(data);
    }

    setSearching(false);
  };

  const handleFilterByCR = async (cr: number) => {
    setSelectedCR(cr);
    const results = await getCreaturesByCR(cr);
    setCreatures(results);
  };

  const handleImportOpen5e = async () => {
    if (!window.confirm('Importar 500 monstruos de Open5e? (pueden tomar 2-3 minutos)')) return;

    setImporting(true);
    const result = await importOpen5eMonstersToSupabase(500, (current, total) => {
      setImportProgress(Math.round((current / total) * 100));
    });

    setImporting(false);
    alert(`Import completo:\n✓ ${result.success} exitosos\n✗ ${result.failed} fallidos`);
    if (result.errors.length > 0) {
      console.error('Import errors:', result.errors);
    }
    loadInitial();
  };

  const crOptions = [0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="bestiary-page page-pad">
      <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
        ← Volver
      </button>

      <h1>Bestiario</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Buscar criatura..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="btn-primary" disabled={searching}>
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="bestiary-controls">
        <div className="cr-filters">
          <button
            className={`btn-small ${selectedCR === null ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setSelectedCR(null);
              loadInitial();
            }}
          >
            Todos
          </button>
          {crOptions.map((cr) => (
            <button
              key={cr}
              className={`btn-small ${selectedCR === cr ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterByCR(cr)}
            >
              CR {cr}
            </button>
          ))}
        </div>

        <button
          className="btn-secondary"
          onClick={handleImportOpen5e}
          disabled={importing}
        >
          {importing ? `Importando... ${importProgress}%` : '⬇️ Importar de Open5e'}
        </button>
      </div>

      {loading ? (
        <p>Cargando bestiario...</p>
      ) : creatures.length === 0 ? (
        <p className="empty-state">No se encontraron criaturas.</p>
      ) : (
        <div className="creatures-grid">
          {creatures.map((creature) => (
            <div key={creature.id} className="creature-card">
              <div className="creature-header">
                <h3>{creature.name}</h3>
                <span className="creature-cr">CR {creature.cr}</span>
              </div>

              <div className="creature-meta">
                <p>
                  <strong>{creature.size}</strong> {creature.type}
                </p>
                <p className="creature-stats">
                  HP: <strong>{creature.hp}</strong> | AC: <strong>{creature.ac}</strong>
                </p>
              </div>

              <div className="creature-abilities">
                <div className="stat-block">
                  <span>STR</span> <strong>{creature.str}</strong>
                </div>
                <div className="stat-block">
                  <span>DEX</span> <strong>{creature.dex}</strong>
                </div>
                <div className="stat-block">
                  <span>CON</span> <strong>{creature.con}</strong>
                </div>
                <div className="stat-block">
                  <span>INT</span> <strong>{creature.int}</strong>
                </div>
                <div className="stat-block">
                  <span>WIS</span> <strong>{creature.wis}</strong>
                </div>
                <div className="stat-block">
                  <span>CHA</span> <strong>{creature.cha}</strong>
                </div>
              </div>

              {creature.speed && (
                <p className="creature-detail">
                  <strong>Velocidad:</strong> {creature.speed}
                </p>
              )}

              {creature.damage_resistances && (
                <p className="creature-detail">
                  <strong>Resistencias:</strong> {creature.damage_resistances}
                </p>
              )}

              {creature.damage_immunities && (
                <p className="creature-detail">
                  <strong>Inmunidades:</strong> {creature.damage_immunities}
                </p>
              )}

              {creature.languages && (
                <p className="creature-detail">
                  <strong>Idiomas:</strong> {creature.languages}
                </p>
              )}

              <span className={`source-badge ${creature.source}`}>{creature.source}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .bestiary-page {
          max-width: 1400px;
        }

        .search-form {
          display: flex;
          gap: 12px;
          margin: 24px 0;
        }

        .search-form input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #666;
          border-radius: 6px;
          background: #1a1a1a;
          color: #fff;
          font-size: 14px;
        }

        .bestiary-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
          flex-wrap: wrap;
        }

        .cr-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .creatures-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
          margin: 24px 0;
        }

        .creature-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.2s;
        }

        .creature-card:hover {
          border-color: #a855f7;
        }

        .creature-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .creature-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .creature-cr {
          background: #a855f7;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .creature-meta {
          border-bottom: 1px solid #333;
          padding-bottom: 8px;
        }

        .creature-meta p {
          margin: 4px 0;
          font-size: 14px;
          color: #ccc;
        }

        .creature-stats {
          color: #fff !important;
        }

        .creature-abilities {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .stat-block {
          background: #1a1a1a;
          padding: 8px 4px;
          border-radius: 4px;
          text-align: center;
          font-size: 12px;
        }

        .stat-block span {
          display: block;
          color: #999;
          font-weight: 600;
        }

        .stat-block strong {
          display: block;
          color: #fff;
          font-size: 14px;
          margin-top: 2px;
        }

        .creature-detail {
          font-size: 13px;
          color: #ccc;
          margin: 4px 0;
        }

        .source-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 8px;
        }

        .source-badge.open5e {
          background: #0d5a3d;
          color: #4ade80;
        }

        .source-badge.custom {
          background: #5a2d0d;
          color: #fb923c;
        }

        .empty-state {
          text-align: center;
          color: #999;
          padding: 40px 20px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

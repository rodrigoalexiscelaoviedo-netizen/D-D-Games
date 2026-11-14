import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCreatures, getCreaturesByCR, importOpen5eMonstersToSupabase } from '../../lib/open5e-fetcher';
import type { Creature } from '../../lib/open5e-fetcher';
import { creatureImage } from '../../lib/creature-images';
import './bestiary.css';

const CR_OPTIONS = [0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const crLabel = (cr: number) => (cr === 0.125 ? '1/8' : cr === 0.25 ? '1/4' : cr === 0.5 ? '1/2' : String(cr));

// Tamaños y tipos de criatura en español (los datos vienen de Open5e en inglés).
const SIZE_ES: Record<string, string> = {
  Tiny: 'Diminuto', Small: 'Pequeño', Medium: 'Mediano', Large: 'Grande', Huge: 'Enorme', Gargantuan: 'Gigantesco',
};
const TYPE_ES: Record<string, string> = {
  Aberration: 'Aberración', Beast: 'Bestia', Celestial: 'Celestial', Construct: 'Constructo', Dragon: 'Dragón',
  Elemental: 'Elemental', Fey: 'Feérico', Fiend: 'Infernal', Giant: 'Gigante', Humanoid: 'Humanoide',
  Monstrosity: 'Monstruo', Ooze: 'Cieno', Plant: 'Planta', Undead: 'No muerto',
};

export const BestiaryScreen = () => {
  const navigate = useNavigate();
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCR, setSelectedCR] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [detail, setDetail] = useState<Creature | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async (q = '') => {
    setLoading(true);
    setCreatures(await searchCreatures(q));
    setLoading(false);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCR(null);
    void load(query.trim());
  };

  const onCR = async (cr: number | null) => {
    setSelectedCR(cr);
    setQuery('');
    if (cr === null) return load('');
    setLoading(true);
    setCreatures(await getCreaturesByCR(cr));
    setLoading(false);
  };

  const onImport = async () => {
    setImporting(true);
    setProgress(0);
    setNotice('Importando monstruos del SRD desde Open5e… no cierres esta pestaña.');
    const r = await importOpen5eMonstersToSupabase(500, (cur, total) => setProgress(Math.round((cur / total) * 100)));
    setImporting(false);
    setNotice(`Listo: ${r.success} criaturas disponibles${r.failed ? `, ${r.failed} con error` : ''}.`);
    void load('');
  };

  return (
    <div className="bestiary">
      <header className="bestiary-hero">
        <button className="btn-ghost" onClick={() => navigate('/dashboard')}>← Volver</button>
        <div>
          <p className="eyebrow">Libro de criaturas</p>
          <h1>Bestiario</h1>
          <p className="lede">Monstruos del SRD con su ficha de combate, listos para usar en tus encuentros.</p>
        </div>
        <button className="btn-primary" onClick={onImport} disabled={importing}>
          {importing ? `Importando… ${progress}%` : 'Cargar monstruos (Open5e)'}
        </button>
      </header>

      {notice && <div className="notice" role="status">{notice}</div>}

      <form className="bestiary-search" onSubmit={onSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre: dragón, esqueleto, lobo…"
          aria-label="Buscar criatura"
        />
        <button className="btn-primary" type="submit">Buscar</button>
      </form>

      <div className="cr-chips" role="group" aria-label="Filtrar por desafío">
        <button className={selectedCR === null ? 'chip on' : 'chip'} onClick={() => onCR(null)}>Todos</button>
        {CR_OPTIONS.map((cr) => (
          <button key={cr} className={selectedCR === cr ? 'chip on' : 'chip'} onClick={() => onCR(cr)}>
            FP {crLabel(cr)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="state">Cargando bestiario…</p>
      ) : creatures.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Todavía no hay criaturas cargadas</p>
          <p>Tocá <strong>Cargar monstruos (Open5e)</strong> para traer el SRD completo, o buscá en las aventuras instaladas.</p>
        </div>
      ) : (
        <ul className="creature-grid">
          {creatures.map((c) => (
            <li key={c.id}>
              <button className="creature-card" onClick={() => setDetail(c)}>
                <img src={creatureImage(c.type)} alt="" loading="lazy" />
                <div className="creature-body">
                  <div className="creature-top">
                    <span className="creature-name">{c.name}</span>
                    <span className="cr-badge">FP {crLabel(Number(c.cr))}</span>
                  </div>
                  <p className="creature-kind">{[SIZE_ES[c.size] ?? c.size, TYPE_ES[c.type] ?? c.type].filter(Boolean).join(' · ')}</p>
                  <p className="creature-core"><span>PG {c.hp}</span><span>CA {c.ac}</span></p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {detail && (
        <div className="sheet-backdrop" onClick={() => setDetail(null)}>
          <article className="sheet" onClick={(e) => e.stopPropagation()} aria-label={detail.name}>
            <button className="sheet-close" onClick={() => setDetail(null)} aria-label="Cerrar">×</button>
            <img src={creatureImage(detail.type)} alt="" />
            <div className="sheet-body">
              <p className="eyebrow">{[SIZE_ES[detail.size] ?? detail.size, TYPE_ES[detail.type] ?? detail.type].filter(Boolean).join(' · ')}</p>
              <h2>{detail.name}</h2>
              <div className="sheet-core">
                <div><span>FP</span><strong>{crLabel(Number(detail.cr))}</strong></div>
                <div><span>PG</span><strong>{detail.hp}</strong></div>
                <div><span>CA</span><strong>{detail.ac}</strong></div>
              </div>
              <div className="abilities">
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((k) => (
                  <div key={k}>
                    <span>{k.toUpperCase()}</span>
                    <strong>{detail[k] ?? '—'}</strong>
                  </div>
                ))}
              </div>
              {detail.speed && <p><b>Velocidad:</b> {detail.speed}</p>}
              {detail.damage_resistances && <p><b>Resistencias:</b> {detail.damage_resistances}</p>}
              {detail.damage_immunities && <p><b>Inmunidades:</b> {detail.damage_immunities}</p>}
              {detail.languages && <p><b>Idiomas:</b> {detail.languages}</p>}
              {detail.abilities && <p className="sheet-text">{detail.abilities}</p>}
              {detail.actions && <p className="sheet-text"><b>Acciones:</b> {detail.actions}</p>}
            </div>
          </article>
        </div>
      )}
    </div>
  );
};

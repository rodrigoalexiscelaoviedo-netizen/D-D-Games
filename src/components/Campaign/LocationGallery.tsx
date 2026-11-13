import { useState } from 'react';
import { LOCATION_SEED_DATA } from '../../lib/seed-content';
import './dm-gallery.css';

type Location = (typeof LOCATION_SEED_DATA)[0];

const DANGER_LABEL: Record<string, string> = {
  Low: 'Bajo',
  Medium: 'Medio',
  High: 'Alto',
  'Very High': 'Muy alto',
  Extreme: 'Extremo',
};

const DANGER_TONE: Record<string, string> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  'Very High': 'very-high',
  Extreme: 'extreme',
};

const imageFor = (type: string, name: string) =>
  `https://source.unsplash.com/featured/800x600?${encodeURIComponent(`${type} ${name}`)}`;

export const LocationGallery = () => {
  const [selected, setSelected] = useState<Location | null>(LOCATION_SEED_DATA[0] ?? null);

  return (
    <section className="dg" aria-labelledby="dg-loc-title">
      <div className="dg-intro">
        <h2 id="dg-loc-title">Lugares de ejemplo</h2>
        <p>Tocá un lugar para ver cómo es, qué peligro tiene y qué se puede encontrar ahí.</p>
      </div>

      <ul className="dg-grid" aria-label="Lista de lugares">
        {LOCATION_SEED_DATA.map((loc) => {
          const on = selected?.name === loc.name;
          return (
            <li key={loc.name}>
              <button
                className={`dg-place ${on ? 'is-on' : ''}`}
                aria-pressed={on}
                onClick={() => setSelected(loc)}
              >
                <span className="dg-place-img">
                  <img
                    src={imageFor(loc.type, loc.name)}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      // Si la foto no carga, se muestra el fondo de degradado en lugar de un cuadro vacío.
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </span>
                <span className="dg-place-text">
                  <strong>{loc.name}</strong>
                  <span>{loc.type}</span>
                  <span className={`dg-danger dg-danger-${DANGER_TONE[loc.danger_level] ?? 'low'}`}>
                    Peligro: {DANGER_LABEL[loc.danger_level] ?? loc.danger_level}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <article className="dg-detail dg-place-detail" aria-live="polite">
          <div className="dg-place-hero">
            <img
              src={imageFor(selected.type, selected.name)}
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="dg-place-body">
            <header className="dg-detail-head">
              <div>
                <h3>{selected.name}</h3>
                <p className="dg-sub">{selected.type}</p>
              </div>
              <span className={`dg-danger dg-danger-${DANGER_TONE[selected.danger_level] ?? 'low'}`}>
                Peligro: {DANGER_LABEL[selected.danger_level] ?? selected.danger_level}
              </span>
            </header>

            <dl className="dg-facts">
              <div>
                <dt>Descripción</dt>
                <dd>{selected.description}</dd>
              </div>
              <div>
                <dt>Qué hay ahí</dt>
                <dd>
                  <ul className="dg-features">
                    {selected.features.split(', ').map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </article>
      )}
    </section>
  );
};

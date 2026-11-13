import { useState } from 'react';
import { NPC_SEED_DATA } from '../../lib/seed-content';
import './dm-gallery.css';

type Npc = (typeof NPC_SEED_DATA)[0];

const ROLE_LABEL: Record<string, string> = {
  Ally: 'Aliado',
  Enemy: 'Enemigo',
  Neutral: 'Neutral',
  Merchant: 'Comerciante',
};

const ROLE_TONE: Record<string, 'ally' | 'enemy' | 'neutral' | 'merchant'> = {
  Ally: 'ally',
  Enemy: 'enemy',
  Neutral: 'neutral',
  Merchant: 'merchant',
};

const avatarFor = (name: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&scale=80`;

export const NPCGallery = () => {
  const [selected, setSelected] = useState<Npc | null>(NPC_SEED_DATA[0] ?? null);

  return (
    <section className="dg" aria-labelledby="dg-npc-title">
      <div className="dg-intro">
        <h2 id="dg-npc-title">Personajes de ejemplo</h2>
        <p>Tocá uno para ver quién es, dónde está y qué papel cumple en la historia.</p>
      </div>

      <div className="dg-layout">
        <ul className="dg-list" aria-label="Lista de personajes">
          {NPC_SEED_DATA.map((npc) => {
            const on = selected?.name === npc.name;
            return (
              <li key={npc.name}>
                <button
                  className={`dg-item ${on ? 'is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => setSelected(npc)}
                >
                  <img src={avatarFor(npc.name)} alt="" className="dg-thumb" loading="lazy" />
                  <span className="dg-item-text">
                    <strong>{npc.name}</strong>
                    <span>{npc.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {selected && (
          <article className="dg-detail" aria-live="polite">
            <header className="dg-detail-head">
              <img src={avatarFor(selected.name)} alt="" className="dg-portrait" />
              <div>
                <h3>{selected.name}</h3>
                <p className="dg-sub">{selected.title}</p>
                <span className={`dg-role dg-role-${ROLE_TONE[selected.role] ?? 'neutral'}`}>
                  {ROLE_LABEL[selected.role] ?? selected.role}
                </span>
              </div>
            </header>

            <dl className="dg-facts">
              <div>
                <dt>Dónde está</dt>
                <dd>{selected.location}</dd>
              </div>
              <div>
                <dt>Quién es</dt>
                <dd>{selected.description}</dd>
              </div>
            </dl>
          </article>
        )}
      </div>
    </section>
  );
};

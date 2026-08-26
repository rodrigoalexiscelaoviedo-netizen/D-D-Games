import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Scene } from '../../lib/adventure-types';

interface Props {
  scene: Scene;
  onInitiateCombat?: () => Promise<void>;
  isLoading?: boolean;
}

interface MonsterStats {
  name: string;
  cr: number | null;
  count: number;
  note?: string;
}

export const EncounterPrepView = ({ scene, onInitiateCombat, isLoading }: Props) => {
  const [monsters, setMonsters] = useState<MonsterStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scene.encounter) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        if (!scene.encounter) return;

        const { bestiary_name, count, note } = scene.encounter;

        const { data: monster } = await supabase
          .from('bestiary')
          .select('name, challenge_rating')
          .eq('name', bestiary_name)
          .single();

        if (monster) {
          setMonsters([
            {
              name: monster.name,
              cr: monster.challenge_rating,
              count,
              note,
            },
          ]);
        } else {
          setMonsters([{ name: bestiary_name, cr: null, count, note }]);
        }
      } catch (error) {
        console.error('Error loading encounter:', error);
        if (scene.encounter) {
          setMonsters([
            {
              name: scene.encounter.bestiary_name,
              cr: null,
              count: scene.encounter.count,
              note: scene.encounter.note,
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [scene.encounter]);

  const crBalanceRef = (cr: number): string => {
    if (cr === 0) return 'Insignificante (más un relleno que un combate)';
    if (cr <= 3) return `Equilibrado para 4 personajes de nivel ${Math.ceil(cr)}`;
    if (cr <= 8) return `Desafiante para 4 personajes de nivel ${Math.ceil(cr)}`;
    if (cr <= 15) return `Peligroso para 4 personajes de nivel ${Math.ceil(cr)} (puede resultar en muerte)`;
    return `Mortal: considerar múltiples encuentros más pequeños`;
  };

  return (
    <div className="encounter-prep">
      <h3>Encuentro</h3>

      {loading ? (
        <p>Cargando encuentro...</p>
      ) : (
        <>
          <div className="encounter-list">
            {monsters.map((m, idx) => (
              <div key={idx} className="encounter-entry">
                <div className="encounter-name">
                  <strong>{m.count}×</strong> {m.name}
                </div>
                {m.cr !== null && (
                  <div className="encounter-cr">
                    <span className="cr-badge">CR {m.cr}</span>
                    <span className="cr-note">{crBalanceRef(m.cr)}</span>
                  </div>
                )}
                {m.note && <p className="encounter-note">Nota DM: {m.note}</p>}
              </div>
            ))}
          </div>

          <div className="encounter-reference">
            <p className="reference-label">Referencia de balance (4 personajes):</p>
            <ul className="reference-list">
              <li>CR = Nivel → Encuentro equilibrado</li>
              <li>CR = Nivel + 1 → Desafiante</li>
              <li>CR = Nivel + 2 → Peligroso</li>
              <li>CR ≥ Nivel + 3 → Mortal</li>
            </ul>
          </div>

          {onInitiateCombat && (
            <button
              className="btn-primary"
              onClick={onInitiateCombat}
              disabled={isLoading}
            >
              Iniciar combate
            </button>
          )}
        </>
      )}
    </div>
  );
};

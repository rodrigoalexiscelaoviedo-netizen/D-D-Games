import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Scene } from '../../lib/adventure-types';
import '../Adventure/playthrough-screen.css';
import '../Adventure/playthrough-end.css';

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

// Dificultad en palabras simples, para un DM que no es experto en balance.
const difficultyFor = (cr: number): { label: string; detail: string; tone: 'easy' | 'fair' | 'hard' | 'deadly' } => {
  if (cr === 0) return { label: 'Muy fácil', detail: 'Casi no amenaza al grupo.', tone: 'easy' };
  if (cr <= 3) return { label: 'Justo', detail: `Un desafío parejo para 4 personajes de nivel ${Math.ceil(cr)}.`, tone: 'fair' };
  if (cr <= 8) return { label: 'Difícil', detail: `Puede costar recursos a 4 personajes de nivel ${Math.ceil(cr)}.`, tone: 'hard' };
  if (cr <= 15) return { label: 'Muy peligroso', detail: `Puede costar la vida de algún personaje de nivel ${Math.ceil(cr)}.`, tone: 'deadly' };
  return { label: 'Mortal', detail: 'Conviene dividirlo en encuentros más pequeños.', tone: 'deadly' };
};

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

        setMonsters([
          {
            name: monster?.name ?? bestiary_name,
            cr: monster?.challenge_rating ?? null,
            count,
            note,
          },
        ]);
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

  return (
    <div className="pe-encounter">
      <div className="pe-encounter-head">
        <h2>Antes de empezar el combate</h2>
        <p className="pe-hint">Revisá quién enfrenta al grupo. Después podés iniciar el combate en pantalla.</p>
      </div>

      {loading ? (
        <p className="pe-hint">Cargando el encuentro…</p>
      ) : (
        <ul className="pe-enemies">
          {monsters.map((m, idx) => {
            const d = m.cr !== null ? difficultyFor(m.cr) : null;
            return (
              <li key={idx} className="pe-enemy">
                <div className="pe-enemy-main">
                  <span className="pe-enemy-count">{m.count}×</span>
                  <span className="pe-enemy-name">{m.name}</span>
                </div>
                {d ? (
                  <p className={`pe-difficulty pe-tone-${d.tone}`}>
                    <strong>Dificultad: {d.label}.</strong> {d.detail}
                  </p>
                ) : (
                  <p className="pe-hint">No encontramos la dificultad de este monstruo en el bestiario.</p>
                )}
                {m.note && <p className="pe-hint">Nota para vos: {m.note}</p>}
              </li>
            );
          })}
        </ul>
      )}

      <details className="pe-help">
        <summary>¿Cómo leo la dificultad?</summary>
        <ul>
          <li><strong>Justo:</strong> el grupo gana con esfuerzo normal.</li>
          <li><strong>Difícil:</strong> pueden perder pociones o conjuros.</li>
          <li><strong>Muy peligroso:</strong> alguien puede caer.</li>
          <li><strong>Mortal:</strong> mejor separar a los enemigos.</li>
        </ul>
      </details>

      {onInitiateCombat && (
        <button className="ps-btn ps-btn-primary pe-start" onClick={onInitiateCombat} disabled={isLoading}>
          Empezar el combate en pantalla
        </button>
      )}
    </div>
  );
};

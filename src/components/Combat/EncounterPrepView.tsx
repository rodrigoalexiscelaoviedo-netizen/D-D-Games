import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Scene } from '../../lib/adventure-types';
import '../Adventure/playthrough-screen.css';
import '../Adventure/playthrough-end.css';

interface Props {
  campaignId?: string;
  scene: Scene;
  onInitiateCombat?: () => Promise<void>;
  isLoading?: boolean;
}

interface MonsterStats {
  name: string;
  xp: number | null;
  count: number;
  note?: string;
}

// Umbrales de la guía del DM (5e): XP por personaje para cada nivel de grupo.
// [fácil, medio, difícil, mortal]
const THRESHOLDS: Record<number, [number, number, number, number]> = {
  1: [25, 50, 75, 100],
  2: [50, 100, 150, 200],
  3: [75, 150, 225, 400],
  4: [125, 250, 375, 500],
  5: [250, 500, 750, 1100],
  6: [300, 600, 900, 1400],
  7: [350, 750, 1100, 1700],
  8: [450, 900, 1400, 2100],
  9: [550, 1100, 1600, 2400],
  10: [600, 1200, 1900, 2800],
};

// Multiplicador por cantidad de enemigos (la guía del DM lo aplica al XP total).
// Con menos de 3 personajes, el grupo sube un escalón (la guía lo pide para grupos chicos).
const groupMultiplier = (enemies: number, partySize: number): number => {
  const tiers = [1, 1.5, 2, 2.5, 3, 4];
  let idx = enemies <= 1 ? 0 : enemies === 2 ? 1 : enemies <= 6 ? 2 : enemies <= 10 ? 3 : enemies <= 14 ? 4 : 5;
  if (partySize < 3) idx = Math.min(tiers.length - 1, idx + 1);
  return tiers[idx];
};

const DIFFICULTY = [
  { tone: 'easy', label: 'Muy fácil', text: 'El grupo lo gana casi sin gastar recursos.' },
  { tone: 'fair', label: 'Fácil', text: 'Un trámite. Puede gastar algún conjuro o poción.' },
  { tone: 'hard', label: 'Medio', text: 'Un desafío parejo. Es probable que alguien quede bajo de vida.' },
  { tone: 'hard', label: 'Difícil', text: 'Puede costar recursos importantes y dejar a alguien inconsciente.' },
  { tone: 'deadly', label: 'Mortal', text: 'Puede matar a algún personaje. Considerá dividirlo en dos encuentros.' },
] as const;

const levelOf = (raw: unknown): number => {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.min(10, Math.floor(n)) : 1;
};

export const EncounterPrepView = ({ campaignId, scene, onInitiateCombat, isLoading }: Props) => {
  const [monsters, setMonsters] = useState<MonsterStats[]>([]);
  const [partyLevels, setPartyLevels] = useState<number[] | null>(null);
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
          .select('name, xp_value')
          .eq('name', bestiary_name)
          .single();

        setMonsters([
          {
            name: monster?.name ?? bestiary_name,
            xp: monster?.xp_value ?? null,
            count,
            note,
          },
        ]);

        if (campaignId) {
          const { data: chars } = await supabase
            .from('characters')
            .select('level')
            .eq('campaign_id', campaignId);
          setPartyLevels((chars ?? []).map((c) => levelOf(c.level)));
        }
      } catch (error) {
        console.error('Error loading encounter:', error);
        if (scene.encounter) {
          setMonsters([{ name: scene.encounter.bestiary_name, xp: null, count: scene.encounter.count, note: scene.encounter.note }]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [scene.encounter, campaignId]);

  // Calcula la dificultad del encuentro completo para el grupo.
  const assess = (m: MonsterStats) => {
    if (m.xp == null || !partyLevels || partyLevels.length === 0) return null;
    const totals = partyLevels.reduce(
      (acc, lvl) => {
        const t = THRESHOLDS[lvl];
        return [acc[0] + t[0], acc[1] + t[1], acc[2] + t[2], acc[3] + t[3]];
      },
      [0, 0, 0, 0]
    );
    const rawXp = m.xp * m.count;
    const adjusted = rawXp * groupMultiplier(m.count, partyLevels.length);
    let level = 0;
    if (adjusted >= totals[0]) level = 1;
    if (adjusted >= totals[1]) level = 2;
    if (adjusted >= totals[2]) level = 3;
    if (adjusted >= totals[3]) level = 4;
    return { rawXp, adjusted, level, totals, difficulty: DIFFICULTY[level] };
  };

  return (
    <div className="pe-encounter">
      <div className="pe-encounter-head">
        <h2>Antes de empezar el combate</h2>
        <p className="pe-hint">Revisá cuánto desafío es este encuentro para tu grupo. Después podés iniciar el combate en pantalla.</p>
      </div>

      {loading ? (
        <p className="pe-hint">Cargando el encuentro…</p>
      ) : (
        <ul className="pe-enemies">
          {monsters.map((m, idx) => {
            const a = assess(m);
            return (
              <li key={idx} className="pe-enemy">
                <div className="pe-enemy-main">
                  <span className="pe-enemy-count">{m.count}×</span>
                  <span className="pe-enemy-name">{m.name}</span>
                </div>
                {a ? (
                  <p className={`pe-difficulty pe-tone-${a.difficulty.tone}`}>
                    <strong>Dificultad para tu grupo: {a.difficulty.label}.</strong> {a.difficulty.text}
                  </p>
                ) : (
                  <p className="pe-hint">
                    {!campaignId || !partyLevels
                      ? 'Cargando el grupo…'
                      : partyLevels.length === 0
                        ? 'Todavía no hay personajes en la campaña. Creá el grupo para ver la dificultad.'
                        : 'No tenemos el XP de este monstruo en el bestiario, así que no podemos calcular la dificultad.'}
                  </p>
                )}
                {a && (
                  <p className="pe-hint">
                    XP total: {a.rawXp} · con el ajuste por cantidad: {a.adjusted} (grupo: {partyLevels?.length}{' '}
                    {partyLevels?.length === 1 ? 'personaje' : 'personajes'})
                  </p>
                )}
                {m.note && <p className="pe-hint">Nota para vos: {m.note}</p>}
              </li>
            );
          })}
        </ul>
      )}

      <details className="pe-help">
        <summary>¿Cómo se calcula la dificultad?</summary>
        <p>
          Se suma el XP de todos los enemigos y se multiplica según cuántos sean (dos enemigos ×1,5; de tres a seis ×2).
          Después se compara con el presupuesto de XP de tu grupo (la guía del DM).
        </p>
        <ul>
          <li><strong>Muy fácil / Fácil:</strong> el grupo gana con poco esfuerzo.</li>
          <li><strong>Medio:</strong> un desafío parejo.</li>
          <li><strong>Difícil:</strong> puede costar recursos importantes.</li>
          <li><strong>Mortal:</strong> alguien puede morir.</li>
        </ul>
      </details>

      {onInitiateCombat && (
        <button className="ps-btn ps-btn-primary pe-start" onClick={onInitiateCombat} disabled={isLoading}>
          Empezar o retomar el combate
        </button>
      )}
    </div>
  );
};

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Playthrough } from '../../lib/adventure-types';
import type { AdventureModule, ModuleScene } from '../../content/modules/types';
import { MODULES } from '../../content/modules';
import { SceneIllustration, ReadAloud } from './SceneVisuals';
import './playthrough-screen.css';
import './playthrough-end.css';

interface Props {
  playthrough: Playthrough;
  onGoToPreviousScene?: () => Promise<void>;
  isLoading?: boolean;
  module?: AdventureModule;
  moduleScene?: ModuleScene;
  isDM?: boolean;
}

const ENDING_TITLE = {
  victory: 'La mesa ganó',
  defeat: 'La mesa cayó',
  neutral: 'La aventura terminó',
} as const;

const ENDING_TEXT = {
  victory: 'Lo lograron. Repasen cómo llegaron al final.',
  defeat: 'No salió como esperaban. Pueden volver atrás y probar otra decisión.',
  neutral: 'Llegaron al final de esta historia.',
} as const;

const ENTRY_LABEL: Record<string, string> = {
  scene_entered: 'Escena',
  decision: 'Decisión',
  roll: 'Tirada',
  combat: 'Combate',
  loot: 'Botín',
  note: 'Nota',
};

interface LogEntry {
  id: string;
  scene_id: string;
  entry_type: 'scene_entered' | 'decision' | 'roll' | 'combat' | 'loot' | 'note';
  content: any;
  created_at: string;
}

export const FinalAdventureScreen = ({
  playthrough,
  onGoToPreviousScene,
  isLoading,
  module,
  moduleScene,
  isDM,
}: Props) => {
  const ending = moduleScene?.ending ?? 'neutral';
  const nextModule = module ? MODULES[MODULES.findIndex((m) => m.slug === module.slug) + 1] : undefined;
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (logLoading) {
    (async () => {
      const { data: logData } = await supabase
        .from('playthrough_log')
        .select('*')
        .eq('playthrough_id', playthrough.id)
        .order('created_at', { ascending: true });

      setLog(logData || []);
      setLogLoading(false);
    })();
  }

  const handleUndo = async () => {
    if (!onGoToPreviousScene) return;

    try {
      const { data: updatedRows, error: updateError } = await supabase
        .from('playthroughs')
        .update({ status: 'active' })
        .eq('id', playthrough.id)
        .select();

      if (updateError) throw updateError;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('No se pudo reactivar la partida.');
      }

      setShowConfirm(false);
      await onGoToPreviousScene();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setShowConfirm(false);
      setError(`No se pudo volver atrás. ${message}`);
    }
  };

  const describe = (entry: LogEntry): string => {
    switch (entry.entry_type) {
      case 'scene_entered':
        return entry.content.scene_name || 'Escena sin nombre';
      case 'decision':
        return entry.content.option_label ?? 'Decisión sin texto';
      case 'combat':
        return (entry.content.result ?? entry.content.resultado) === 'victory' ? 'Ganaron el combate' : 'Perdieron el combate';
      case 'roll':
        return `${entry.content.roll_type}: sacaron ${entry.content.result}`;
      case 'loot':
        return entry.content.items?.join(', ') || 'Botín sin detalles';
      case 'note':
        return entry.content.text ?? '';
      default:
        return 'Evento sin descripción';
    }
  };

  const isEnded = playthrough.status === 'completed';

  return (
    <div className="pe">
      <section className={`pe-hero pe-${ending}`} aria-labelledby="pe-title">
        <p className="pe-eyebrow">{isEnded ? 'Aventura terminada' : 'Aventura en curso'}</p>
        <h1 id="pe-title">{moduleScene ? ENDING_TITLE[ending] : 'Aventura completada'}</h1>
        <p className="pe-lede">{moduleScene ? ENDING_TEXT[ending] : 'Gracias por jugar.'}</p>
      </section>

      {error && (
        <div className="pe-notice" role="alert">
          {error}
        </div>
      )}

      {module && moduleScene && (
        <section className="pe-story" aria-label="Final de la historia">
          <SceneIllustration key={moduleScene.key} module={module} scene={moduleScene} />
          <ReadAloud text={moduleScene.readAloud} label="Epílogo (para leer en voz alta)" />

          {isDM && (
            <div className="pe-dm-note">
              <span className="ps-tag ps-tag-secret">Solo para vos</span>
              {moduleScene.dmText.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}

          {moduleScene.treasure && moduleScene.treasure.length > 0 && (
            <div className="pe-rewards">
              <h2>Recompensas</h2>
              <ul>
                {moduleScene.treasure.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          )}

          {nextModule && ending !== 'defeat' && (
            <p className="pe-next">
              Siguiente paso de la campaña: <strong>{nextModule.title}</strong> (nivel {nextModule.level}).
            </p>
          )}
        </section>
      )}

      <section className="pe-log" aria-labelledby="pe-log-title">
        <h2 id="pe-log-title">Lo que pasó en la aventura</h2>
        <p className="pe-hint">Cada decisión y resultado, en orden.</p>

        {logLoading ? (
          <p className="pe-hint">Cargando el registro…</p>
        ) : log.length === 0 ? (
          <p className="pe-hint">Todavía no hay nada registrado.</p>
        ) : (
          <ol className="pe-log-list">
            {log.map((entry) => (
              <li key={entry.id} className="pe-log-item">
                <span className="pe-log-type">{ENTRY_LABEL[entry.entry_type] ?? 'Evento'}</span>
                <span className="pe-log-text">{describe(entry)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {onGoToPreviousScene && (
        <section className="pe-actions">
          <div>
            <p className="pe-action-title">¿Se equivocaron o quieren probar otra cosa?</p>
            <p className="pe-hint">Vuelven a la escena anterior y la partida queda activa de nuevo.</p>
          </div>
          <button
            className="ps-btn ps-btn-ghost"
            onClick={() => setShowConfirm(true)}
            disabled={isLoading || log.length === 0}
          >
            ← Volver a la escena anterior
          </button>
        </section>
      )}

      {showConfirm && (
        <div className="ps-modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div
            className="ps-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pe-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="pe-confirm-title">¿Volver a la escena anterior?</h2>
            <p>La partida vuelve a estar activa. El final queda sin efecto y pueden seguir desde ahí.</p>
            <div className="ps-modal-buttons">
              <button className="ps-btn ps-btn-ghost" onClick={() => setShowConfirm(false)}>
                No, quedarnos acá
              </button>
              <button className="ps-btn ps-btn-primary" onClick={handleUndo}>
                Sí, volver atrás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

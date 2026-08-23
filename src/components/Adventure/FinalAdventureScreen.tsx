import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Playthrough } from '../../lib/adventure-types';

interface Props {
  playthrough: Playthrough;
  onGoToPreviousScene?: () => Promise<void>;
  isLoading?: boolean;
}

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
}: Props) => {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);

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
      // Revert status to active
      await supabase
        .from('playthroughs')
        .update({ status: 'active' })
        .eq('id', playthrough.id)
        .select();

      // Call the undo handler
      await onGoToPreviousScene();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al revertir: ${message}`);
    }
  };

  const formatLogEntry = (entry: LogEntry) => {
    switch (entry.entry_type) {
      case 'scene_entered':
        return `Escena: ${entry.content.scene_name || 'Sin nombre'}`;
      case 'decision':
        return `Decisión: ${entry.content.option_label}`;
      case 'combat':
        return `Combate: ${entry.content.result === 'victory' ? 'Victoria' : 'Derrota'}`;
      case 'roll':
        return `Tirada: ${entry.content.roll_type} - Resultado ${entry.content.result}`;
      case 'loot':
        return `Botín: ${entry.content.items?.join(', ') || 'Sin detalles'}`;
      case 'note':
        return `Nota: ${entry.content.text}`;
      default:
        return 'Evento desconocido';
    }
  };

  return (
    <div className="final-adventure-screen">
      <div className="final-header">
        <h1>Aventura Completada</h1>
        <p className="final-status">
          {playthrough.status === 'completed' ? '✓ Finalizada' : 'En proceso'}
        </p>
      </div>

      <div className="final-content">
        <div className="log-summary">
          <h2>Registro de la Aventura</h2>
          {logLoading ? (
            <p>Cargando registro...</p>
          ) : log.length === 0 ? (
            <p className="empty-log">Sin eventos registrados</p>
          ) : (
            <div className="log-entries">
              {log.map((entry) => (
                <div key={entry.id} className="log-entry">
                  <span className="entry-type">{entry.entry_type}</span>
                  <span className="entry-text">{formatLogEntry(entry)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="final-actions">
        {onGoToPreviousScene && (
          <button
            className="btn-secondary"
            onClick={handleUndo}
            disabled={isLoading || log.length === 0}
          >
            ← Revertir al anterior evento
          </button>
        )}
      </div>
    </div>
  );
};

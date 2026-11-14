import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LogRow {
  id: string;
  entry_type: string;
  content: Record<string, any> | null;
  created_at: string;
}

const describe = (row: LogRow): string => {
  const c = row.content ?? {};
  switch (row.entry_type) {
    case 'decision':
      return `Decisión del grupo: ${c.option_label ?? 'sin texto'}`;
    case 'combat':
      return (c.resultado ?? c.result) === 'victory' ? 'El grupo ganó el combate' : 'El grupo perdió el combate';
    case 'scene_entered':
      return `Entraron en: ${c.scene_name ?? 'una escena nueva'}`;
    case 'note':
      return c.text ?? 'Nota';
    default:
      return 'Algo pasó en la partida';
  }
};

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

/** Lo último que pasó en la partida, para que todos vean lo mismo. Se actualiza solo. */
export const RecentEvents = ({ playthroughId }: { playthroughId: string }) => {
  const [rows, setRows] = useState<LogRow[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase
        .from('playthrough_log')
        .select('id, entry_type, content, created_at')
        .eq('playthrough_id', playthroughId)
        .order('created_at', { ascending: false })
        .limit(6);
      if (alive) setRows((data ?? []) as LogRow[]);
    };
    void load();
    const id = window.setInterval(load, 4000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [playthroughId]);

  if (rows.length === 0) return null;

  return (
    <section className="re" aria-labelledby="re-title">
      <h2 id="re-title">Lo último que pasó</h2>
      <ol>
        {rows.map((r) => (
          <li key={r.id}>
            <span className="re-time">{timeOf(r.created_at)}</span>
            <span>{describe(r)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

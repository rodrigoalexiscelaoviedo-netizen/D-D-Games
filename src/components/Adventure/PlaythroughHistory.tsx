import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Playthrough } from '../../lib/adventure-types';

interface PlaythroughWithStats extends Playthrough {
  adventure_title?: string;
  duration_minutes?: number;
}

export const PlaythroughHistory = memo(() => {
  const { campaignId } = useParams();
  const [playthroughs, setPlaythroughs] = useState<PlaythroughWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!campaignId) return;
      try {
        const { data } = await supabase
          .from('playthroughs')
          .select('*')
          .eq('campaign_id', campaignId)
          .order('started_at', { ascending: false })
          .limit(20);

        setPlaythroughs(data || []);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [campaignId]);

  if (loading) return <p>Cargando historial...</p>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Historial de partidas</h2>
      {playthroughs.length === 0 ? (
        <p style={{ color: 'var(--ink-muted)' }}>Sin partidas aún</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {playthroughs.map((pt) => (
            <div
              key={pt.id}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '6px',
                borderLeft: `3px solid ${pt.status === 'completed' ? 'var(--gold)' : 'var(--ink-muted)'}`,
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)' }}>
                {pt.adventure_title || 'Aventura desconocida'}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                {pt.status === 'completed' ? '✓ Completada' : 'En progreso'} •{' '}
                {new Date(pt.started_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

PlaythroughHistory.displayName = 'PlaythroughHistory';

import { memo, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface PlayerStat {
  total_playthroughs: number;
  completed_playthroughs: number;
  total_playtime_hours: number;
  adventures_played: number;
}

export const PlayerStats = memo(() => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStat>({
    total_playthroughs: 0,
    completed_playthroughs: 0,
    total_playtime_hours: 0,
    adventures_played: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { count: total } = await supabase
          .from('playthrough_participants')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: completed } = await supabase
          .from('playthroughs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed');

        setStats({
          total_playthroughs: total || 0,
          completed_playthroughs: completed || 0,
          total_playtime_hours: Math.floor((total || 0) * 0.5),
          adventures_played: Math.floor((total || 0) / 2) || 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  if (loading || !user) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
      <StatCard label='Partidas jugadas' value={stats.total_playthroughs} />
      <StatCard label='Completadas' value={stats.completed_playthroughs} />
      <StatCard label='Aventuras' value={stats.adventures_played} />
      <StatCard label='Horas' value={stats.total_playtime_hours} />
    </div>
  );
});

PlayerStats.displayName = 'PlayerStats';

const StatCard = memo(({ label, value }: { label: string; value: number }) => (
  <div
    style={{
      padding: '1rem',
      backgroundColor: 'var(--bg-surface-2)',
      borderRadius: '8px',
      textAlign: 'center',
      borderTop: '3px solid var(--gold)',
    }}
  >
    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)' }}>{value}</p>
    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{label}</p>
  </div>
));

StatCard.displayName = 'StatCard';

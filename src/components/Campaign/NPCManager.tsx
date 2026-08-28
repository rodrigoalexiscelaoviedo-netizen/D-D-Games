import { memo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface NPC {
  id: string;
  name: string;
  role: string;
  notes?: string;
  created_at?: string;
}

export const NPCManager = memo(() => {
  const { campaignId } = useParams();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [newNpc, setNewNpc] = useState({ name: '', role: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNpcs();
  }, [campaignId]);

  const loadNpcs = async () => {
    if (!campaignId) return;
    try {
      const { data } = await supabase
        .from('campaign_npcs')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      setNpcs(data || []);
    } catch (error) {
      console.error('Error loading NPCs:', error);
    }
  };

  const addNpc = async () => {
    if (!campaignId || !newNpc.name.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_npcs')
        .insert({
          campaign_id: campaignId,
          name: newNpc.name,
          role: newNpc.role,
        })
        .select();

      if (!error && data) {
        setNpcs([...npcs, data[0]]);
        setNewNpc({ name: '', role: '' });
      }
    } catch (error) {
      console.error('Error adding NPC:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNpc = async (id: string) => {
    try {
      await supabase.from('campaign_npcs').delete().eq('id', id);
      setNpcs(npcs.filter((npc) => npc.id !== id));
    } catch (error) {
      console.error('Error deleting NPC:', error);
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
      <h3 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>PNJs</h3>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type='text'
          placeholder='Nombre del PNJ'
          value={newNpc.name}
          onChange={(e) => setNewNpc({ ...newNpc, name: e.target.value })}
          className='input-field'
          style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}
        />
        <input
          type='text'
          placeholder='Rol/Clase'
          value={newNpc.role}
          onChange={(e) => setNewNpc({ ...newNpc, role: e.target.value })}
          className='input-field'
          style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}
        />
        <button className='btn-primary' onClick={addNpc} disabled={loading}>
          Agregar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {npcs.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)' }}>Sin PNJs aún</p>
        ) : (
          npcs.map((npc) => (
            <div
              key={npc.id}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: 'var(--ink)' }}>{npc.name}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--gold)' }}>{npc.role}</p>
              </div>
              <button className='btn-danger' onClick={() => deleteNpc(npc.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

NPCManager.displayName = 'NPCManager';

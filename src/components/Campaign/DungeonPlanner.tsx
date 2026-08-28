import { memo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Location {
  id: string;
  name: string;
  description?: string;
  threats?: string;
  treasure?: string;
  created_at?: string;
}

export const DungeonPlanner = memo(() => {
  const { campaignId } = useParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocation, setNewLocation] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadLocations();
  }, [campaignId]);

  const loadLocations = async () => {
    if (!campaignId) return;
    try {
      const { data } = await supabase
        .from('dungeon_locations')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const addLocation = async () => {
    if (!campaignId || !newLocation.name.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dungeon_locations')
        .insert({
          campaign_id: campaignId,
          name: newLocation.name,
          description: newLocation.description,
        })
        .select();

      if (!error && data) {
        setLocations([...locations, data[0]]);
        setNewLocation({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Error adding location:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      const { data, error } = await supabase
        .from('dungeon_locations')
        .update(updates)
        .eq('id', id)
        .select();

      if (!error && data) {
        setLocations(locations.map((l) => (l.id === id ? data[0] : l)));
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      await supabase.from('dungeon_locations').delete().eq('id', id);
      setLocations(locations.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
      <h3 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Planificador de Dungeons</h3>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type='text'
          placeholder='Nombre de la ubicación'
          value={newLocation.name}
          onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
          className='input-field'
          style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}
        />
        <input
          type='text'
          placeholder='Descripción breve'
          value={newLocation.description}
          onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
          className='input-field'
          style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}
        />
        <button className='btn-primary' onClick={addLocation} disabled={loading}>
          +
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {locations.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)' }}>Sin ubicaciones aún</p>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => setExpandedId(expandedId === loc.id ? null : loc.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: '600', color: 'var(--ink)' }}>
                  {expandedId === loc.id ? '▼' : '▶'} {loc.name}
                </p>
                <button
                  className='btn-danger'
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLocation(loc.id);
                  }}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  ✕
                </button>
              </div>

              {expandedId === loc.id && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <textarea
                    placeholder='Descripción detallada'
                    value={loc.description || ''}
                    onChange={(e) => updateLocation(loc.id, { description: e.target.value })}
                    className='input-field'
                    style={{ width: '100%', minHeight: '60px', marginBottom: '0.5rem' }}
                  />
                  <textarea
                    placeholder='Amenazas presentes'
                    value={loc.threats || ''}
                    onChange={(e) => updateLocation(loc.id, { threats: e.target.value })}
                    className='input-field'
                    style={{ width: '100%', minHeight: '40px', marginBottom: '0.5rem', fontSize: '0.9rem' }}
                  />
                  <textarea
                    placeholder='Tesoro/Recompensas'
                    value={loc.treasure || ''}
                    onChange={(e) => updateLocation(loc.id, { treasure: e.target.value })}
                    className='input-field'
                    style={{ width: '100%', minHeight: '40px', fontSize: '0.9rem' }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

DungeonPlanner.displayName = 'DungeonPlanner';

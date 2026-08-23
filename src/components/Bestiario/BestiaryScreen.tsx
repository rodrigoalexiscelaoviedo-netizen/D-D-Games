import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { getPortraitUrl } from '../../lib/portrait-utils';
import type { Database } from '../../lib/database.types';

type Bestiary = Database['public']['Tables']['bestiary']['Row'];

export const BestiaryScreen = () => {
  const { user } = useAuth();
  const [monsters, setMonsters] = useState<Bestiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [crMin, setCrMin] = useState(0);
  const [crMax, setCrMax] = useState(5);
  const [filterSrd, setFilterSrd] = useState<'all' | 'srd' | 'personal'>('all');

  useEffect(() => {
    (async () => {
      setLoading(true);

      let query = supabase
        .from('bestiary')
        .select('*');

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (filterSrd === 'srd') {
        query = query.is('user_id', true);
      } else if (filterSrd === 'personal') {
        query = query.eq('user_id', user?.id || '');
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        console.error('Bestiary load error:', error);
      }

      const filtered = (data || []).filter((m) => {
        const cr = m.challenge_rating ?? 0;
        return cr >= crMin && cr <= crMax;
      });

      setMonsters(filtered);
      setLoading(false);
    })();
  }, [searchTerm, crMin, crMax, filterSrd, user?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar este monstruo?')) return;

    try {
      const { error } = await supabase
        .from('bestiary')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;

      setMonsters((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al borrar: ${message}`);
    }
  };

  const isSrd = (m: Bestiary) => m.user_id === null;

  return (
    <div className="bestiario-screen page-pad">
      <h1>Bestiario</h1>

      <div className="bestiario-controls">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-group">
          <label>Rango CR:</label>
          <div className="cr-inputs">
            <input
              type="number"
              min="0"
              max="30"
              value={crMin}
              onChange={(e) => setCrMin(parseInt(e.target.value) || 0)}
              placeholder="Mín"
            />
            <span>—</span>
            <input
              type="number"
              min="0"
              max="30"
              value={crMax}
              onChange={(e) => setCrMax(parseInt(e.target.value) || 30)}
              placeholder="Máx"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Fuente:</label>
          <select value={filterSrd} onChange={(e) => setFilterSrd(e.target.value as any)}>
            <option value="all">Todos</option>
            <option value="srd">SRD</option>
            <option value="personal">Propios</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Cargando bestiario...</p>
      ) : monsters.length === 0 ? (
        <p className="empty-state">No hay monstruos con esos criterios.</p>
      ) : (
        <div className="bestiario-grid">
          {monsters.map((monster) => (
            <div key={monster.id} className={`monster-card ${isSrd(monster) ? 'srd' : 'personal'}`}>
              <img
                src={getPortraitUrl(monster.portrait_seed, monster.name)}
                alt={monster.name}
                className="monster-portrait"
              />
              <div className="monster-info">
                <h3>{monster.name}</h3>
                <p className="monster-cr">CR {monster.challenge_rating ?? '—'}</p>
                <p className="monster-source">{isSrd(monster) ? 'SRD' : 'Propio'}</p>
                <div className="monster-stats">
                  <span>PV: {monster.hp}</span>
                  <span>CA: {monster.armor_class}</span>
                  <span>Dex: {monster.dexterity ?? '—'}</span>
                </div>
                {monster.description && (
                  <p className="monster-description">{monster.description}</p>
                )}
                {!isSrd(monster) && (
                  <div className="monster-actions">
                    <button
                      className="btn-secondary btn-small"
                      onClick={() => alert('Editar: no implementado aún')}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleDelete(monster.id)}
                    >
                      Borrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

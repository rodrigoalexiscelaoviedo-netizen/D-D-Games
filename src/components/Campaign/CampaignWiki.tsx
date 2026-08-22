import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const CampaignWiki = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [lore, setLore] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tab, setTab] = useState<'npcs' | 'inventory' | 'notes'>('npcs');
  const [newNpc, setNewNpc] = useState({ name: '', description: '', type: 'npc' });

  useEffect(() => {
    (async () => {
      const { data: loreData } = await supabase
        .from('campaign_lore')
        .select('*')
        .eq('campaign_id', campaignId);

      const { data: invData } = await supabase
        .from('campaign_inventory')
        .select('*')
        .eq('campaign_id', campaignId);

      const { data: noteData } = await supabase
        .from('campaign_notes')
        .select('*')
        .eq('campaign_id', campaignId);

      setLore(loreData || []);
      setInventory(invData || []);
      setNotes(noteData || []);
    })();
  }, [campaignId]);

  const addNpc = async () => {
    if (!newNpc.name.trim()) return;
    await supabase.from('campaign_lore').insert({
      campaign_id: campaignId,
      ...newNpc,
    });
    setNewNpc({ name: '', description: '', type: 'npc' });
    const { data } = await supabase.from('campaign_lore').select('*').eq('campaign_id', campaignId);
    setLore(data || []);
  };

  return (
    <div className="wiki-container">
      <header className="wiki-header">
        <button onClick={() => navigate(`/campaign/${campaignId}`)} className="btn-secondary">
          ← Campaña
        </button>
        <h1>📖 Wiki de Campaña</h1>
      </header>

      <div className="wiki-tabs">
        <button
          className={`tab ${tab === 'npcs' ? 'active' : ''}`}
          onClick={() => setTab('npcs')}
        >
          👥 NPCs & Lore
        </button>
        <button
          className={`tab ${tab === 'inventory' ? 'active' : ''}`}
          onClick={() => setTab('inventory')}
        >
          🎁 Inventario
        </button>
        <button
          className={`tab ${tab === 'notes' ? 'active' : ''}`}
          onClick={() => setTab('notes')}
        >
          📝 Notas
        </button>
      </div>

      <div className="wiki-content">
        {tab === 'npcs' && (
          <>
            <div className="add-form">
              <input
                type="text"
                placeholder="Nombre del NPC"
                value={newNpc.name}
                onChange={(e) => setNewNpc({ ...newNpc, name: e.target.value })}
                className="input-field"
              />
              <textarea
                placeholder="Descripción"
                value={newNpc.description}
                onChange={(e) => setNewNpc({ ...newNpc, description: e.target.value })}
                className="input-field"
                rows={3}
              />
              <button onClick={addNpc} className="btn-primary">
                + Agregar NPC
              </button>
            </div>
            <div className="lore-list">
              {lore.map((item) => (
                <div key={item.id} className="lore-card">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="lore-type">{item.type}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'inventory' && (
          <div className="inventory-list">
            {inventory.length === 0 ? (
              <p style={{ color: 'var(--ink-muted)' }}>Sin objetos aún.</p>
            ) : (
              inventory.map((item) => (
                <div key={item.id} className="inventory-item">
                  <span className="item-name">{item.item_name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                  <span className="item-rarity">{item.rarity}</span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'notes' && (
          <div className="notes-list">
            {notes.length === 0 ? (
              <p style={{ color: 'var(--ink-muted)' }}>Sin notas aún.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="note-card">
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './campaign-wiki.css';

type Tab = 'lore' | 'inventory' | 'notes';

const TAB_INFO: Record<Tab, { title: string; hint: string }> = {
  lore: { title: 'Personajes y lore', hint: 'Lo que el grupo sabe de la gente y la historia del mundo.' },
  inventory: { title: 'Objetos del grupo', hint: 'Lo que el grupo tiene en común: cofres, botines y objetos mágicos.' },
  notes: { title: 'Notas', hint: 'Apuntes libres de la campaña.' },
};

export const CampaignWiki = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [lore, setLore] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>('lore');
  const [newNpc, setNewNpc] = useState({ name: '', description: '', type: 'npc' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data: loreData } = await supabase.from('campaign_lore').select('*').eq('campaign_id', campaignId);
      const { data: invData } = await supabase.from('campaign_inventory').select('*').eq('campaign_id', campaignId);
      const { data: noteData } = await supabase.from('campaign_notes').select('*').eq('campaign_id', campaignId);

      setLore(loreData || []);
      setInventory(invData || []);
      setNotes(noteData || []);
    })();
  }, [campaignId]);

  const addNpc = async () => {
    if (!newNpc.name.trim()) {
      setError('Ponele un nombre antes de guardar.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('campaign_lore').insert({
        campaign_id: campaignId,
        ...newNpc,
        name: newNpc.name.trim(),
      });
      if (insertError) throw insertError;

      setNewNpc({ name: '', description: '', type: 'npc' });
      const { data } = await supabase.from('campaign_lore').select('*').eq('campaign_id', campaignId);
      setLore(data || []);
    } catch (err) {
      setError(`No se pudo guardar. ${err instanceof Error ? err.message : 'Probá de nuevo.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cw">
      <header className="cw-top">
        <button className="cw-back" onClick={() => navigate(`/campaign/${campaignId}`)}>
          ← Volver a la campaña
        </button>
        <p className="cw-eyebrow">Notas de la campaña</p>
        <h1>Lo que tu mesa sabe</h1>
      </header>

      <nav className="cw-tabs" aria-label="Secciones de notas">
        {(Object.keys(TAB_INFO) as Tab[]).map((key) => (
          <button
            key={key}
            className={`cw-tab ${tab === key ? 'is-active' : ''}`}
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
          >
            <span className="cw-tab-title">{TAB_INFO[key].title}</span>
            <span className="cw-tab-hint">{TAB_INFO[key].hint}</span>
          </button>
        ))}
      </nav>

      <div className="cw-content">
        {tab === 'lore' && (
          <>
            <section className="cw-form" aria-labelledby="cw-add-lore">
              <h2 id="cw-add-lore">Agregar un personaje o lugar</h2>
              <label className="cw-field">
                <span className="cw-label">Nombre</span>
                <input
                  className="cw-input"
                  placeholder="Ej: Tobías, el campanero"
                  value={newNpc.name}
                  onChange={(e) => setNewNpc({ ...newNpc, name: e.target.value })}
                />
              </label>
              <label className="cw-field">
                <span className="cw-label">Qué sabe el grupo de esta persona o lugar</span>
                <textarea
                  className="cw-input cw-textarea"
                  placeholder="Lo que ya descubrieron o lo que les contaron."
                  value={newNpc.description}
                  onChange={(e) => setNewNpc({ ...newNpc, description: e.target.value })}
                  rows={3}
                />
              </label>
              {error && <p className="cw-error" role="alert">{error}</p>}
              <button className="cw-btn cw-btn-primary" onClick={addNpc} disabled={saving}>
                {saving ? 'Guardando…' : 'Agregar a la wiki'}
              </button>
            </section>

            {lore.length === 0 ? (
              <p className="cw-empty">Todavía no hay personajes ni lugares. Agregá el primero arriba.</p>
            ) : (
              <ul className="cw-cards">
                {lore.map((item) => (
                  <li key={item.id} className="cw-card">
                    <h3>{item.name}</h3>
                    <p>{item.description || 'Sin descripción todavía.'}</p>
                    <span className="cw-tag">{item.type === 'npc' ? 'Personaje' : item.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === 'inventory' && (
          inventory.length === 0 ? (
            <p className="cw-empty">Todavía no hay objetos compartidos por el grupo.</p>
          ) : (
            <ul className="cw-list">
              {inventory.map((item) => (
                <li key={item.id} className="cw-row">
                  <span className="cw-row-name">{item.item_name}</span>
                  <span className="cw-row-qty">×{item.quantity}</span>
                  <span className="cw-tag">{item.rarity}</span>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === 'notes' && (
          notes.length === 0 ? (
            <p className="cw-empty">Todavía no hay notas. Las notas se escriben desde la sesión.</p>
          ) : (
            <ul className="cw-cards">
              {notes.map((note) => (
                <li key={note.id} className="cw-card">
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};

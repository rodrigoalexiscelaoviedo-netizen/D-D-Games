import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { AdventureGeneratorForm } from './AdventureGeneratorForm';
import type { Adventure, Scene } from '../../lib/adventure-types';
import './adventure-editor.css';

type View = 'list' | 'create' | 'edit';

const SCENE_TYPES: Array<{ value: string; label: string; hint: string }> = [
  { value: 'narracion', label: 'Narración', hint: 'Se describe algo y el grupo sigue.' },
  { value: 'exploration', label: 'Exploración', hint: 'El grupo recorre un lugar y busca cosas.' },
  { value: 'social', label: 'Escena social', hint: 'Conversación, negociación o engaño.' },
  { value: 'combate', label: 'Combate', hint: 'Necesita un encuentro configurado y dos opciones: victoria y derrota.' },
];

const typeLabel = (value: string) => SCENE_TYPES.find((t) => t.value === value)?.label ?? value;

export const AdventureEditor = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState<View>('list');
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [sceneCounts, setSceneCounts] = useState<Record<string, number>>({});
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [sceneForm, setSceneForm] = useState({ title: '', scene_type: 'narracion', dm_text: '', player_text: '' });

  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    suggested_level: 1,
  });

  // Solo el dueño de la campaña puede editar sus aventuras.
  useEffect(() => {
    const checkCampaign = async () => {
      if (!campaignId) return;
      const { data } = await supabase
        .from('campaigns')
        .select('id, user_id, name')
        .eq('id', campaignId)
        .single();

      if (!data || data.user_id !== user?.id) {
        navigate(`/campaign/${campaignId}`);
        return;
      }
      loadAdventures();
    };

    checkCampaign();
  }, [campaignId, user?.id]);

  const loadAdventures = async () => {
    setLoading(true);
    try {
      const { data: scenesData } = await supabase.from('scenes').select('adventure_id').limit(1000);

      const counts: Record<string, number> = {};
      (scenesData ?? []).forEach((s) => {
        counts[s.adventure_id] = (counts[s.adventure_id] ?? 0) + 1;
      });
      setSceneCounts(counts);

      const ids = Object.keys(counts);
      if (ids.length > 0) {
        const { data: advs } = await supabase.from('adventures').select('*').in('id', ids);
        setAdventures(advs || []);
      } else {
        setAdventures([]);
      }
    } catch {
      setError('No pudimos cargar las aventuras. Probá recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  const loadScenes = async (adventureId: string) => {
    try {
      const { data: scns } = await supabase
        .from('scenes')
        .select('*')
        .eq('adventure_id', adventureId)
        .order('scene_order', { ascending: true });
      setScenes(scns || []);
    } catch {
      setError('No pudimos cargar las escenas.');
    }
  };

  const openAdventure = (adv: Adventure) => {
    setSelectedAdventure(adv);
    setFormData({ title: adv.title, synopsis: adv.synopsis || '', suggested_level: adv.suggested_level || 1 });
    setEditingSceneId(null);
    setShowGenerator(false);
    setError('');
    setNotice('');
    loadScenes(adv.id);
    setView('edit');
  };

  const handleCreateAdventure = async () => {
    if (!formData.title.trim()) {
      setError('Ponele un título a la aventura.');
      return;
    }

    try {
      const { data: newAdv, error: insertError } = await supabase
        .from('adventures')
        .insert({
          title: formData.title.trim(),
          synopsis: formData.synopsis,
          suggested_level: formData.suggested_level,
          author: user?.email || 'Anónimo',
          user_id: user?.id,
        })
        .select();

      if (insertError || !newAdv || newAdv.length === 0) {
        throw insertError ?? new Error('No se devolvió la aventura creada.');
      }

      setAdventures([...adventures, newAdv[0]]);
      setSceneCounts({ ...sceneCounts, [newAdv[0].id]: 0 });
      setFormData({ title: '', synopsis: '', suggested_level: 1 });
      setNotice('Aventura creada. Ahora agregá la primera escena.');
      openAdventure(newAdv[0]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo crear la aventura. ${message}`);
    }
  };

  const handleUpdateAdventure = async () => {
    if (!selectedAdventure) return;
    if (!formData.title.trim()) {
      setError('El título no puede quedar vacío.');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('adventures')
        .update({
          title: formData.title.trim(),
          synopsis: formData.synopsis,
          suggested_level: formData.suggested_level || selectedAdventure.suggested_level,
        })
        .eq('id', selectedAdventure.id)
        .select();

      if (updateError) throw updateError;

      const updated = { ...selectedAdventure, ...formData, title: formData.title.trim() };
      setSelectedAdventure(updated);
      setAdventures(adventures.map((a) => (a.id === selectedAdventure.id ? updated : a)));
      setError('');
      setNotice('Cambios guardados.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudieron guardar los cambios. ${message}`);
    }
  };

  const handleAddScene = async () => {
    if (!selectedAdventure) return;

    try {
      const maxOrder = scenes.length > 0 ? Math.max(...scenes.map((s) => s.scene_order)) : 0;

      const { data: newScene, error: insertError } = await supabase
        .from('scenes')
        .insert({
          adventure_id: selectedAdventure.id,
          scene_order: maxOrder + 1,
          scene_type: 'narracion',
          title: 'Nueva escena',
          dm_text: '',
        })
        .select();

      if (insertError || !newScene || newScene.length === 0) {
        throw insertError ?? new Error('No se devolvió la escena creada.');
      }

      setScenes([...scenes, newScene[0]]);
      setSceneCounts({ ...sceneCounts, [selectedAdventure.id]: (sceneCounts[selectedAdventure.id] ?? 0) + 1 });
      startEditScene(newScene[0] as Scene);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo agregar la escena. ${message}`);
    }
  };

  const startEditScene = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setSceneForm({
      title: scene.title ?? '',
      scene_type: scene.scene_type ?? 'narracion',
      dm_text: scene.dm_text ?? '',
      player_text: scene.player_text ?? '',
    });
    setError('');
    setNotice('');
  };

  const handleSaveScene = async () => {
    if (!editingSceneId) return;

    // Una escena de combate necesita un encuentro y dos opciones (victoria y derrota).
    if (sceneForm.scene_type === 'combate') {
      const current = scenes.find((s) => s.id === editingSceneId);
      if (!current?.encounter) {
        setError('Una escena de combate necesita un encuentro configurado (monstruo y cantidad). Esa parte se carga desde la aventura original o un módulo.');
        return;
      }
      const { data: opts } = await supabase.from('scene_options').select('id').eq('scene_id', editingSceneId);
      if ((opts ?? []).length < 2) {
        setError('Una escena de combate necesita dos opciones: una para la victoria y otra para la derrota.');
        return;
      }
    }

    try {
      const { data: rows, error: updError } = await supabase
        .from('scenes')
        .update({
          title: sceneForm.title.trim() || 'Sin título',
          scene_type: sceneForm.scene_type,
          dm_text: sceneForm.dm_text,
          player_text: sceneForm.player_text,
        })
        .eq('id', editingSceneId)
        .select();

      if (updError) throw updError;
      if (!rows || rows.length === 0) throw new Error('La escena no se pudo guardar (revisá los permisos).');

      setScenes(scenes.map((s) => (s.id === editingSceneId ? { ...s, ...rows[0] } : s)));
      setEditingSceneId(null);
      setError('');
      setNotice('Escena guardada.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo guardar la escena. ${message}`);
    }
  };

  const handleSaveGeneratedAdventure = async (generatedScenes: Scene[], sceneOptions: any[]) => {
    if (!selectedAdventure) return;

    setLoading(true);
    try {
      const scenesToInsert = generatedScenes.map((scene, idx) => ({
        adventure_id: selectedAdventure.id,
        scene_order: idx + 1,
        scene_type: scene.scene_type,
        title: scene.title,
        dm_text: scene.dm_text,
        player_text: scene.player_text,
        encounter: scene.encounter,
      }));

      const { data: insertedScenes, error: sceneError } = await supabase
        .from('scenes')
        .insert(scenesToInsert)
        .select();

      if (sceneError || !insertedScenes) {
        throw sceneError ?? new Error('No se pudieron guardar las escenas.');
      }

      const tempToReal = new Map();
      generatedScenes.forEach((scene, idx) => {
        tempToReal.set(scene.id, insertedScenes[idx].id);
      });

      const optionsToInsert = sceneOptions.map((opt) => ({
        scene_id: tempToReal.get(opt.scene_id),
        option_order: opt.option_order,
        player_label: opt.player_label,
        dm_note: opt.dm_note,
        leads_to_scene_id: opt.leads_to_scene_id ? tempToReal.get(opt.leads_to_scene_id) : null,
        sets_flag: opt.sets_flag,
        requires_flag: opt.requires_flag,
      }));

      if (optionsToInsert.length > 0) {
        const { error: optError } = await supabase.from('scene_options').insert(optionsToInsert);
        if (optError) {
          setNotice('Se guardaron las escenas, pero algunas opciones no. Revisalas antes de jugar.');
        }
      }

      await loadScenes(selectedAdventure.id);
      setSceneCounts({ ...sceneCounts, [selectedAdventure.id]: insertedScenes.length });
      setShowGenerator(false);
      setError('');
      if (!notice) setNotice(`Se agregaron ${insertedScenes.length} escenas generadas con IA.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudieron guardar las escenas generadas. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const editingScene = scenes.find((s) => s.id === editingSceneId) ?? null;

  return (
    <div className="ae">
      <header className="ae-top">
        <button className="ae-back" onClick={() => (view === 'list' ? navigate(`/campaign/${campaignId}`) : setView('list'))}>
          {view === 'list' ? '← Volver a la campaña' : '← Volver a mis aventuras'}
        </button>
        <p className="ae-eyebrow">Editar aventuras</p>
        <h1>
          {view === 'list' && 'Tus aventuras'}
          {view === 'create' && 'Nueva aventura'}
          {view === 'edit' && (selectedAdventure?.title || 'Aventura')}
        </h1>
      </header>

      <main className="ae-main">
        {error && (
          <div className="ae-notice ae-notice-error" role="alert">
            <p>{error}</p>
            <button className="ae-btn ae-btn-ghost" onClick={() => setError('')}>Entendido</button>
          </div>
        )}
        {notice && !error && (
          <div className="ae-notice ae-notice-ok" role="status">
            <p>{notice}</p>
            <button className="ae-btn ae-btn-ghost" onClick={() => setNotice('')}>Cerrar</button>
          </div>
        )}

        {view === 'list' && (
          <section className="ae-card">
            <div className="ae-row">
              <p className="ae-hint">Una aventura tiene escenas. Cada escena puede tener decisiones que llevan a la siguiente.</p>
              <button className="ae-btn ae-btn-primary" onClick={() => setView('create')}>
                Crear aventura
              </button>
            </div>

            {loading ? (
              <p className="ae-hint">Cargando aventuras…</p>
            ) : adventures.length === 0 ? (
              <p className="ae-empty">Todavía no tenés aventuras. Creá una para empezar.</p>
            ) : (
              <ul className="ae-list">
                {adventures.map((adv) => (
                  <li key={adv.id} className="ae-item">
                    <div>
                      <h3>{adv.title}</h3>
                      <p className="ae-meta">
                        Nivel sugerido {adv.suggested_level || '—'} · {sceneCounts[adv.id] ?? 0} escenas
                      </p>
                    </div>
                    <button className="ae-btn ae-btn-ghost" onClick={() => openAdventure(adv)}>
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {view === 'create' && (
          <section className="ae-card" aria-labelledby="ae-create-title">
            <h2 id="ae-create-title">Datos de la aventura</h2>
            <AdventureFields formData={formData} setFormData={setFormData} />
            <div className="ae-row">
              <button className="ae-btn ae-btn-primary" onClick={handleCreateAdventure}>Crear aventura</button>
              <button className="ae-btn ae-btn-ghost" onClick={() => setView('list')}>Cancelar</button>
            </div>
          </section>
        )}

        {view === 'edit' && selectedAdventure && (
          <>
            <section className="ae-card" aria-labelledby="ae-details-title">
              <h2 id="ae-details-title">Datos de la aventura</h2>
              <AdventureFields formData={formData} setFormData={setFormData} />
              <div>
                <button className="ae-btn ae-btn-primary" onClick={handleUpdateAdventure}>Guardar cambios</button>
              </div>
            </section>

            <section className="ae-card" aria-labelledby="ae-scenes-title">
              <h2 id="ae-scenes-title">Escenas ({scenes.length})</h2>

              {showGenerator ? (
                <AdventureGeneratorForm
                  onGenerated={handleSaveGeneratedAdventure}
                  onCancel={() => setShowGenerator(false)}
                />
              ) : (
                <>
                  {scenes.length === 0 ? (
                    <p className="ae-empty">Todavía no hay escenas. Agregá una o generá algunas con IA.</p>
                  ) : (
                    <ol className="ae-scenes">
                      {scenes.map((scene, idx) => (
                        <li key={scene.id} className={`ae-scene ${editingSceneId === scene.id ? 'is-open' : ''}`}>
                          <div className="ae-scene-row">
                            <span>
                              <strong>{idx + 1}. {scene.title || 'Sin título'}</strong>
                              <span className="ae-tag">{typeLabel(scene.scene_type)}</span>
                            </span>
                            <button
                              className="ae-btn ae-btn-ghost"
                              onClick={() => (editingSceneId === scene.id ? setEditingSceneId(null) : startEditScene(scene))}
                              aria-expanded={editingSceneId === scene.id}
                            >
                              {editingSceneId === scene.id ? 'Cerrar' : 'Editar escena'}
                            </button>
                          </div>

                          {editingScene && editingScene.id === scene.id && (
                            <div className="ae-scene-form">
                              <label className="ae-field">
                                <span className="ae-label">Título de la escena</span>
                                <input
                                  className="ae-input"
                                  value={sceneForm.title}
                                  onChange={(e) => setSceneForm({ ...sceneForm, title: e.target.value })}
                                />
                              </label>

                              <label className="ae-field">
                                <span className="ae-label">Tipo de escena</span>
                                <select
                                  className="ae-input"
                                  value={sceneForm.scene_type}
                                  onChange={(e) => setSceneForm({ ...sceneForm, scene_type: e.target.value })}
                                >
                                  {SCENE_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                                <span className="ae-hint">
                                  {SCENE_TYPES.find((t) => t.value === sceneForm.scene_type)?.hint}
                                </span>
                              </label>

                              <label className="ae-field">
                                <span className="ae-label">Lo que ven los jugadores</span>
                                <textarea
                                  className="ae-input ae-textarea"
                                  rows={4}
                                  value={sceneForm.player_text}
                                  onChange={(e) => setSceneForm({ ...sceneForm, player_text: e.target.value })}
                                />
                                <span className="ae-hint">Lo que el DM lee en voz alta o describe.</span>
                              </label>

                              <label className="ae-field">
                                <span className="ae-label">Notas secretas del DM</span>
                                <textarea
                                  className="ae-input ae-textarea"
                                  rows={4}
                                  value={sceneForm.dm_text}
                                  onChange={(e) => setSceneForm({ ...sceneForm, dm_text: e.target.value })}
                                />
                                <span className="ae-hint">Solo las ve el DM.</span>
                              </label>

                              <div className="ae-row">
                                <button className="ae-btn ae-btn-primary" onClick={handleSaveScene}>Guardar escena</button>
                                <button className="ae-btn ae-btn-ghost" onClick={() => setEditingSceneId(null)}>Cancelar</button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="ae-row">
                    <button className="ae-btn ae-btn-primary" onClick={handleAddScene}>Agregar escena</button>
                    <button className="ae-btn ae-btn-ghost" onClick={() => setShowGenerator(true)}>Generar escenas con IA</button>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

const AdventureFields = ({
  formData,
  setFormData,
}: {
  formData: { title: string; synopsis: string; suggested_level: number };
  setFormData: (d: { title: string; synopsis: string; suggested_level: number }) => void;
}) => (
  <div className="ae-fields">
    <label className="ae-field">
      <span className="ae-label">Título</span>
      <input className="ae-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
    </label>
    <label className="ae-field">
      <span className="ae-label">Resumen <span className="ae-optional">(opcional)</span></span>
      <textarea
        className="ae-input ae-textarea"
        rows={3}
        value={formData.synopsis}
        onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
      />
    </label>
    <label className="ae-field">
      <span className="ae-label">Nivel sugerido</span>
      <input
        type="number"
        min={1}
        max={20}
        className="ae-input"
        value={formData.suggested_level}
        onChange={(e) => setFormData({ ...formData, suggested_level: parseInt(e.target.value) || 1 })}
      />
      <span className="ae-hint">Para qué nivel de personajes está pensada la aventura.</span>
    </label>
  </div>
);

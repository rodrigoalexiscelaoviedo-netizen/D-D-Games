import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { AdventureGeneratorForm } from './AdventureGeneratorForm';
import type { Adventure, Scene } from '../../lib/adventure-types';

interface EditorState {
  mode: 'list' | 'create' | 'edit';
  selectedAdventureId?: string;
  selectedSceneId?: string;
}

export const AdventureEditor = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [state, setState] = useState<EditorState>({ mode: 'list' });
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    suggested_level: 1,
  });

  // Check ownership
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
    if (!campaignId) return;
    setLoading(true);
    try {
      // Adventures that belong to this campaign's scenes
      const { data: scenes_data } = await supabase
        .from('scenes')
        .select('adventure_id')
        .limit(1000);

      const adventureIds = [...new Set(scenes_data?.map((s) => s.adventure_id) || [])];

      if (adventureIds.length > 0) {
        const { data: advs } = await supabase
          .from('adventures')
          .select('*')
          .in('id', adventureIds);
        setAdventures(advs || []);
      }
    } catch (err) {
      setError('Error al cargar aventuras');
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
    } catch (err) {
      setError('Error al cargar escenas');
    }
  };

  const handleCreateAdventure = async () => {
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    try {
      const { data: newAdv, error: insertError } = await supabase
        .from('adventures')
        .insert({
          title: formData.title,
          synopsis: formData.synopsis,
          suggested_level: formData.suggested_level,
          author: user?.email || 'Anonymous',
        })
        .select();

      if (insertError || !newAdv || newAdv.length === 0) {
        throw new Error('No se pudo crear la aventura');
      }

      setAdventures([...adventures, newAdv[0]]);
      setState({ mode: 'edit', selectedAdventureId: newAdv[0].id });
      setSelectedAdventure(newAdv[0]);
      loadScenes(newAdv[0].id);
      setFormData({ title: '', synopsis: '', suggested_level: 1 });
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
    }
  };

  const handleUpdateAdventure = async () => {
    if (!selectedAdventure) return;

    try {
      const { error: updateError } = await supabase
        .from('adventures')
        .update({
          title: formData.title || selectedAdventure.title,
          synopsis: formData.synopsis || selectedAdventure.synopsis,
          suggested_level: formData.suggested_level || selectedAdventure.suggested_level,
        })
        .eq('id', selectedAdventure.id)
        .select();

      if (updateError) throw updateError;

      const updated = { ...selectedAdventure, ...formData };
      setSelectedAdventure(updated);
      setAdventures(
        adventures.map((a) => (a.id === selectedAdventure.id ? updated : a))
      );
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
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
        throw new Error('No se pudo crear la escena');
      }

      setScenes([...scenes, newScene[0]]);
      setState({ mode: 'edit', selectedAdventureId: selectedAdventure.id, selectedSceneId: newScene[0].id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
    }
  };

  const handleSaveGeneratedAdventure = async (generatedScenes: Scene[], sceneOptions: any[]) => {
    if (!selectedAdventure) return;

    setLoading(true);
    try {
      // Save scenes
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
        throw new Error('Error al guardar escenas');
      }

      // Save scene options (map temp IDs to real ones)
      const tempToReal = new Map();
      generatedScenes.forEach((scene, idx) => {
        tempToReal.set(scene.id, insertedScenes[idx].id);
      });

      const optionsToInsert = sceneOptions.map((opt) => {
        const realSceneId = tempToReal.get(opt.scene_id);
        const realLeadsTo = opt.leads_to_scene_id ? tempToReal.get(opt.leads_to_scene_id) : null;

        return {
          scene_id: realSceneId,
          option_order: opt.option_order,
          player_label: opt.player_label,
          dm_note: opt.dm_note,
          leads_to_scene_id: realLeadsTo,
          sets_flag: opt.sets_flag,
          requires_flag: opt.requires_flag,
        };
      });

      if (optionsToInsert.length > 0) {
        const { error: optError } = await supabase
          .from('scene_options')
          .insert(optionsToInsert);

        if (optError) {
          console.warn('Warning: Could not save all scene options:', optError);
        }
      }

      // Reload scenes
      await loadScenes(selectedAdventure.id);
      setShowGenerator(false);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adventure-editor page-pad">
      <button className="btn-secondary" onClick={() => navigate(`/campaign/${campaignId}`)}>
        ← Campaña
      </button>

      <h1>Editor de Aventuras</h1>

      {error && <div className="error-message">{error}</div>}

      {state.mode === 'list' && (
        <div className="editor-list">
          <button className="btn-primary" onClick={() => setState({ mode: 'create' })}>
            + Crear aventura
          </button>

          {loading ? (
            <p>Cargando aventuras...</p>
          ) : adventures.length === 0 ? (
            <p className="empty-state">No hay aventuras aún. Crea una para empezar.</p>
          ) : (
            <div className="adventures-table">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Escenas</th>
                    <th>Nivel sugerido</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {adventures.map((adv) => (
                    <tr key={adv.id}>
                      <td>{adv.title}</td>
                      <td>{scenes.filter((s) => s.adventure_id === adv.id).length}</td>
                      <td>{adv.suggested_level || '—'}</td>
                      <td>
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => {
                            setSelectedAdventure(adv);
                            setFormData({
                              title: adv.title,
                              synopsis: adv.synopsis || '',
                              suggested_level: adv.suggested_level || 1,
                            });
                            loadScenes(adv.id);
                            setState({ mode: 'edit', selectedAdventureId: adv.id });
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {state.mode === 'create' && (
        <div className="editor-form">
          <h2>Crear nueva aventura</h2>
          <input
            type="text"
            placeholder="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="form-input"
          />
          <textarea
            placeholder="Synopsis (opcional)"
            value={formData.synopsis}
            onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
            className="form-textarea"
            rows={4}
          />
          <input
            type="number"
            min="1"
            max="20"
            placeholder="Nivel sugerido"
            value={formData.suggested_level}
            onChange={(e) => setFormData({ ...formData, suggested_level: parseInt(e.target.value) || 1 })}
            className="form-input"
          />
          <div className="form-buttons">
            <button className="btn-primary" onClick={handleCreateAdventure}>
              Crear
            </button>
            <button className="btn-secondary" onClick={() => setState({ mode: 'list' })}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {state.mode === 'edit' && selectedAdventure && (
        <div className="editor-edit">
          <h2>Editar: {selectedAdventure.title}</h2>

          <fieldset>
            <legend>Detalles de la aventura</legend>
            <input
              type="text"
              placeholder="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="Synopsis"
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="form-textarea"
              rows={3}
            />
            <input
              type="number"
              min="1"
              max="20"
              placeholder="Nivel sugerido"
              value={formData.suggested_level}
              onChange={(e) => setFormData({ ...formData, suggested_level: parseInt(e.target.value) || 1 })}
              className="form-input"
            />
            <button className="btn-primary" onClick={handleUpdateAdventure}>
              Guardar cambios
            </button>
          </fieldset>

          <fieldset>
            <legend>Escenas ({scenes.length})</legend>

            {showGenerator && (
              <AdventureGeneratorForm
                onGenerated={handleSaveGeneratedAdventure}
                onCancel={() => setShowGenerator(false)}
              />
            )}

            {!showGenerator && (
              <>
                {scenes.length === 0 ? (
                  <p className="empty-state">No hay escenas. Agrega una para empezar.</p>
                ) : (
                  <div className="scenes-list">
                    {scenes.map((scene, idx) => (
                      <div key={scene.id} className="scene-item">
                        <span>
                          {idx + 1}. {scene.title} ({scene.scene_type})
                        </span>
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => {
                            setState({
                              mode: 'edit',
                              selectedAdventureId: selectedAdventure.id,
                              selectedSceneId: scene.id,
                            });
                          }}
                        >
                          Editar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" onClick={handleAddScene}>
                    + Agregar escena
                  </button>
                  <button className="btn-primary" onClick={() => setShowGenerator(true)}>
                    ✨ Generar con IA
                  </button>
                </div>
              </>
            )}
          </fieldset>

          <button className="btn-secondary" onClick={() => setState({ mode: 'list' })}>
            Volver a lista
          </button>
        </div>
      )}
    </div>
  );
};

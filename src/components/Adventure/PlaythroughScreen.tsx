import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Playthrough, Scene, SceneOption } from '../../lib/adventure-types';
import { toPlayerScene, toPlayerOption } from '../../lib/adventure-types';
import { ScenePlayerView } from './ScenePlayerView';
import { SceneDMView } from './SceneDMView';

export const PlaythroughScreen = () => {
  const { campaignId, playthroughId } = useParams();
  const navigate = useNavigate();

  const [playthrough, setPlaythrough] = useState<Playthrough | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [options, setOptions] = useState<SceneOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlayerView, setIsPlayerView] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const viewStorageKey = `dnd_view_${playthroughId}`;

  useEffect(() => {
    const stored = localStorage.getItem(viewStorageKey);
    if (stored === 'player') {
      setIsPlayerView(true);
    }
  }, [viewStorageKey]);

  useEffect(() => {
    (async () => {
      const { data: pt } = await supabase
        .from('playthroughs')
        .select('*')
        .eq('id', playthroughId)
        .single();

      if (!pt) {
        setLoading(false);
        return;
      }

      setPlaythrough(pt);

      if (pt.current_scene_id) {
        const { data: sceneData } = await supabase
          .from('scenes')
          .select('*')
          .eq('id', pt.current_scene_id)
          .single();

        if (sceneData) {
          setScene(sceneData);

          const { data: optionsData } = await supabase
            .from('scene_options')
            .select('*')
            .eq('scene_id', sceneData.id)
            .order('option_order', { ascending: true });

          setOptions(optionsData || []);
        }
      } else {
        const { data: firstScene } = await supabase
          .from('scenes')
          .select('*')
          .eq('adventure_id', pt.adventure_id)
          .order('scene_order', { ascending: true })
          .limit(1)
          .single();

        if (firstScene) {
          setScene(firstScene);
          await supabase
            .from('playthroughs')
            .update({ current_scene_id: firstScene.id })
            .eq('id', playthroughId);

          const { data: optionsData } = await supabase
            .from('scene_options')
            .select('*')
            .eq('scene_id', firstScene.id)
            .order('option_order', { ascending: true });

          setOptions(optionsData || []);
        }
      }

      setLoading(false);
    })();
  }, [playthroughId]);

  const toggleView = () => {
    const newView = !isPlayerView;
    setIsPlayerView(newView);
    localStorage.setItem(viewStorageKey, newView ? 'player' : 'dm');
    setShowConfirm(false);
  };

  const handleShowToPlayers = () => {
    if (!isPlayerView) {
      toggleView();
    }
  };

  const handleSelectOption = async (optionId: string) => {
    if (!playthrough || !scene) return;

    const selectedOption = options.find((opt) => opt.id === optionId);
    if (!selectedOption || !selectedOption.leads_to_scene_id) return;

    try {
      setLoading(true);

      const newFlags = selectedOption.sets_flag
        ? { ...playthrough.flags, [selectedOption.sets_flag]: true }
        : playthrough.flags;

      const { error: updateError } = await supabase
        .from('playthroughs')
        .update({
          flags: newFlags,
          current_scene_id: selectedOption.leads_to_scene_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', playthroughId);

      if (updateError) throw updateError;

      await supabase.from('playthrough_log').insert({
        playthrough_id: playthroughId,
        event_type: 'option_selected',
        event_data: {
          option_id: optionId,
          option_label: selectedOption.player_label,
          scene_id: scene.id,
          sets_flag: selectedOption.sets_flag,
        },
      });

      const { data: nextScene } = await supabase
        .from('scenes')
        .select('*')
        .eq('id', selectedOption.leads_to_scene_id)
        .single();

      if (nextScene) {
        setScene(nextScene);
        setPlaythrough({ ...playthrough, flags: newFlags, current_scene_id: nextScene.id });

        const { data: nextOptions } = await supabase
          .from('scene_options')
          .select('*')
          .eq('scene_id', nextScene.id)
          .order('option_order', { ascending: true });

        setOptions(nextOptions || []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !playthrough || !scene) {
    return <div className="page-pad">Cargando aventura...</div>;
  }

  const visibleOptions = options.filter((opt) => {
    if (!opt.requires_flag) return true;
    return playthrough.flags[opt.requires_flag] === true;
  });

  const hiddenOptions = options.filter((opt) => {
    if (!opt.requires_flag) return false;
    return playthrough.flags[opt.requires_flag] !== true;
  });

  return (
    <div className={`playthrough ${isPlayerView ? 'player-view' : 'dm-view'}`}>
      <header className="playthrough-header">
        <button className="btn-secondary" onClick={() => navigate(`/campaign/${campaignId}`)}>
          ← Campaña
        </button>
        <h1>{scene.title || `Escena ${scene.scene_order}`}</h1>
        {!isPlayerView && (
          <button className="btn-primary" onClick={handleShowToPlayers}>
            Mostrar a los jugadores
          </button>
        )}
        {isPlayerView && (
          <button className="btn-secondary" onClick={() => setShowConfirm(true)}>
            Volver a DM
          </button>
        )}
      </header>

      {showConfirm && (
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>¿Volver a vista DM? Los jugadores verían información oculta.</p>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={toggleView}>
                Volver a DM
              </button>
            </div>
          </div>
        </div>
      )}

      {isPlayerView ? (
        <ScenePlayerView
          scene={toPlayerScene(scene)}
          options={visibleOptions.map(toPlayerOption)}
          onSelectOption={handleSelectOption}
          isLoading={loading}
        />
      ) : (
        <SceneDMView scene={scene} options={visibleOptions} hiddenOptions={hiddenOptions} />
      )}
    </div>
  );
};

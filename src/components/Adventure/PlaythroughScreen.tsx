import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { cerrarCombate } from '../../lib/combat-return';
import type { Playthrough, Scene, SceneOption } from '../../lib/adventure-types';
import { toPlayerScene, toPlayerOption } from '../../lib/adventure-types';
import { ScenePlayerView } from './ScenePlayerView';
import { SceneDMView } from './SceneDMView';

export const PlaythroughScreen = () => {
  const { campaignId, playthroughId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playthrough, setPlaythrough] = useState<Playthrough | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [options, setOptions] = useState<SceneOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlayerView, setIsPlayerView] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasPreviousScene, setHasPreviousScene] = useState(false);
  const [sceneCount, setSceneCount] = useState(0);

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

      const { count: logCount } = await supabase
        .from('playthrough_log')
        .select('*', { count: 'exact', head: true })
        .eq('playthrough_id', playthroughId);

      setHasPreviousScene((logCount ?? 0) > 0);

      const { count: totalScenes } = await supabase
        .from('scenes')
        .select('*', { count: 'exact', head: true })
        .eq('adventure_id', pt.adventure_id);

      setSceneCount(totalScenes || 0);

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

      const { data: updatedRows, error: updateError } = await supabase
        .from('playthroughs')
        .update({
          flags: newFlags,
          current_scene_id: selectedOption.leads_to_scene_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', playthroughId)
        .select();

      if (updateError) throw updateError;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('UPDATE no afectó ninguna fila — verificar sesión o RLS');
      }

      const { data: logRows, error: logError } = await supabase
        .from('playthrough_log')
        .insert({
          playthrough_id: playthroughId,
          scene_id: scene.id,
          entry_type: 'decision',
          content: {
            option_id: optionId,
            option_label: selectedOption.player_label,
            sets_flag: selectedOption.sets_flag,
            leads_to_scene_id: selectedOption.leads_to_scene_id,
          },
        })
        .select();

      if (logError) throw logError;
      if (!logRows || logRows.length === 0) {
        throw new Error('INSERT a playthrough_log no afectó filas');
      }

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

  const handleInitiateCombat = async () => {
    if (!playthrough || !scene || !scene.encounter) return;

    try {
      setLoading(true);

      const bestiary_name = scene.encounter.bestiary_name;
      const count = scene.encounter.count;

      const { data: enemy, error: besteryError } = await supabase
        .from('bestiary')
        .select('*')
        .ilike('name', bestiary_name)
        .single();

      if (besteryError || !enemy) {
        throw new Error(`Enemigo no encontrado en el bestiario: ${bestiary_name}`);
      }

      const { data: characters } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', playthrough.campaign_id);

      if (!characters || characters.length === 0) {
        throw new Error('La campaña no tiene personajes. Crea personajes antes de iniciar combate.');
      }

      const { data: combat, error: combatError } = await supabase
        .from('combats')
        .insert({
          campaign_id: playthrough.campaign_id,
          playthrough_id: playthroughId,
          scene_id: scene.id,
        })
        .select()
        .single();

      if (combatError || !combat) {
        throw new Error('No se pudo crear el combate');
      }

      const participants = [
        ...Array.from({ length: count }).map(() => ({
          combat_id: combat.id,
          entity_type: 'enemy',
          entity_id: enemy.id,
          name: enemy.name,
          hp: enemy.hp || 10,
          ac: enemy.ac || 12,
        })),
        ...characters.map((char) => ({
          combat_id: combat.id,
          entity_type: 'character',
          entity_id: char.id,
          name: char.name,
          hp: char.hit_points || 10,
          ac: char.armor_class || 10,
        })),
      ];

      const { error: participantsError } = await supabase
        .from('combat_participants')
        .insert(participants)
        .select();

      if (participantsError) {
        throw new Error('No se pudieron crear los participantes del combate');
      }

      navigate(`/campaign/${campaignId}/combat/${combat.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al iniciar combate: ${message}`);
      setLoading(false);
    }
  };

  const handleResolveCombatManually = async (resultado: 'victoria' | 'derrota') => {
    if (!playthrough || !scene || !playthroughId) return;

    try {
      setLoading(true);

      const { data: combats } = await supabase
        .from('combats')
        .select('id')
        .eq('playthrough_id', playthroughId)
        .eq('scene_id', scene.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!combats || combats.length === 0) {
        throw new Error('No hay combate activo en esta escena');
      }

      const combatId = combats[0].id;
      const result = await cerrarCombate(playthroughId, scene.id, resultado, combatId);

      if (!result.leads_to_scene_id) {
        throw new Error('Combate cerrado pero sin destino de escena');
      }

      const { data: nextScene } = await supabase
        .from('scenes')
        .select('*')
        .eq('id', result.leads_to_scene_id)
        .single();

      if (nextScene) {
        setScene(nextScene);
        setPlaythrough({
          ...playthrough,
          current_scene_id: result.leads_to_scene_id,
        });

        const { data: nextOptions } = await supabase
          .from('scene_options')
          .select('*')
          .eq('scene_id', nextScene.id)
          .order('option_order', { ascending: true });

        setOptions(nextOptions || []);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al resolver combate: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPreviousScene = async () => {
    if (!playthrough) return;

    try {
      setLoading(true);

      const { data: lastLog, error: logReadError } = await supabase
        .from('playthrough_log')
        .select('*')
        .eq('playthrough_id', playthroughId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (logReadError) throw logReadError;
      if (!lastLog || lastLog.length === 0) {
        throw new Error('No hay escenas anteriores');
      }

      const previousSceneId = lastLog[0].scene_id;
      if (!previousSceneId) {
        throw new Error('Entrada de log sin scene_id');
      }

      const { data: deletedRows, error: deleteError } = await supabase
        .from('playthrough_log')
        .delete()
        .eq('id', lastLog[0].id)
        .select();

      if (deleteError) throw deleteError;
      if (!deletedRows || deletedRows.length === 0) {
        throw new Error('No se pudo borrar la entrada del log');
      }

      const { data: previousScene } = await supabase
        .from('scenes')
        .select('*')
        .eq('id', previousSceneId)
        .single();

      if (previousScene) {
        await supabase
          .from('playthroughs')
          .update({ current_scene_id: previousSceneId })
          .eq('id', playthroughId)
          .select();

        setScene(previousScene);
        setPlaythrough({ ...playthrough, current_scene_id: previousSceneId });

        const { data: prevOptions } = await supabase
          .from('scene_options')
          .select('*')
          .eq('scene_id', previousSceneId)
          .order('option_order', { ascending: true });

        setOptions(prevOptions || []);
      }
    } finally {
      setLoading(false);
    }
  };

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
        <div className="header-right">
          {!isPlayerView && user && (
            <span className="session-email">{user.email}</span>
          )}
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
        </div>
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
        <SceneDMView
          scene={scene}
          options={visibleOptions}
          hiddenOptions={hiddenOptions}
          onGoToPreviousScene={handleGoToPreviousScene}
          canGoToPreviousScene={hasPreviousScene}
          onInitiateCombat={scene.scene_type === 'combate' ? handleInitiateCombat : undefined}
          onResolveCombatVictory={
            scene.scene_type === 'combate' ? () => handleResolveCombatManually('victoria') : undefined
          }
          onResolveCombatDefeat={
            scene.scene_type === 'combate' ? () => handleResolveCombatManually('derrota') : undefined
          }
          isLoading={loading}
          sceneCount={sceneCount}
        />
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { cerrarCombate, cancelarCombate, resolverCombateSinCombate } from '../../lib/combat-return';
import type { Playthrough, Scene, SceneOption } from '../../lib/adventure-types';
import { toPlayerScene, toPlayerOption } from '../../lib/adventure-types';
import { ScenePlayerView } from './ScenePlayerView';
import { SceneDMView } from './SceneDMView';
import { FinalAdventureScreen } from './FinalAdventureScreen';
import { audioManager } from '../../lib/audio';
import { CombatAnimation } from '../Combat/CombatAnimations';

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
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [isDM, setIsDM] = useState(false);
  const [userRole, setUserRole] = useState<'dm' | 'player'>('player');
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [combatAnimations] = useState<Array<{ id: string; type: 'attack' | 'heal' | 'damage' | 'miss'; value?: number; x: number; y: number }>>([]);

  const viewStorageKey = `dnd_view_${playthroughId}`;

  useEffect(() => {
    const stored = localStorage.getItem(viewStorageKey);
    if (stored === 'player') {
      setIsPlayerView(true);
    }
  }, [viewStorageKey]);

  useEffect(() => {
    if (!playthrough || !scene || playthrough.status !== 'active' || !optionsLoaded) return;

    const visibleOptions = options.filter((opt) => {
      if (!opt.requires_flag) return true;
      return playthrough.flags[opt.requires_flag] === true;
    });

    const isFinalScene = visibleOptions.length === 0 && scene.scene_type !== 'combate';

    if (isFinalScene) {
      (async () => {
        try {
          const { data: updatedRows, error: updateError } = await supabase
            .from('playthroughs')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', playthroughId)
            .select();

          if (updateError || !updatedRows || updatedRows.length === 0) {
            console.error('Error al auto-completar:', updateError);
          }

          if (updatedRows && updatedRows.length > 0) {
            setPlaythrough({
              ...playthrough,
              status: 'completed',
            });
          }
        } catch (error) {
          console.error('Error en auto-completación:', error);
        }
      })();
    }
  }, [playthrough?.id, scene?.id, options.length]);

  // Polling: sincroniza cambios de escena cada 2 segundos
  useEffect(() => {
    if (!playthrough) return;

    const pollInterval = setInterval(async () => {
      const { data: pt } = await supabase
        .from('playthroughs')
        .select('current_scene_id')
        .eq('id', playthroughId)
        .single();

      if (pt && pt.current_scene_id && pt.current_scene_id !== currentSceneId) {
        // Escena cambió, actualizar
        setCurrentSceneId(pt.current_scene_id);
        const { data: newScene } = await supabase
          .from('scenes')
          .select('*')
          .eq('id', pt.current_scene_id)
          .single();

        if (newScene) {
          setScene(newScene);

          // Reproducir audio ambiental según tipo de escena
          if (newScene.scene_type === 'combate') {
            audioManager.playAmbient('dungeon');
          } else if (newScene.scene_type === 'social') {
            audioManager.playAmbient('tavern');
          } else if (newScene.scene_type === 'exploration') {
            audioManager.playAmbient('forest');
          }

          const { data: newOptions } = await supabase
            .from('scene_options')
            .select('*')
            .eq('scene_id', newScene.id)
            .order('option_order', { ascending: true });

          setOptions(newOptions || []);
          setOptionsLoaded(true);

          // Actualizar playthrough con nuevos flags si cambió
          const { data: updatedPt } = await supabase
            .from('playthroughs')
            .select('*')
            .eq('id', playthroughId)
            .single();

          if (updatedPt) {
            setPlaythrough(updatedPt);
          }
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [playthroughId, currentSceneId, playthrough]);

  useEffect(() => {
    (async () => {
      const { data: pt, error: ptError } = await supabase
        .from('playthroughs')
        .select('*')
        .eq('id', playthroughId)
        .single();

      if (ptError) {
        console.error('Playthrough query error:', ptError);
        setLoading(false);
        return;
      }
      if (!pt) {
        console.warn('Playthrough not found for id:', playthroughId);
        setLoading(false);
        return;
      }

      setPlaythrough(pt);
      setCurrentSceneId(pt.current_scene_id || null);
      setOptionsLoaded(false);

      // Cargar rol del usuario en este playthrough
      if (pt.user_id === user?.id) {
        setIsDM(true);
        setUserRole('dm');
      } else {
        // Buscar en participantes
        const { data: participant } = await supabase
          .from('playthrough_participants')
          .select('role')
          .eq('playthrough_id', playthroughId)
          .eq('user_id', user?.id)
          .single();

        if (participant) {
          setUserRole(participant.role === 'dm' ? 'dm' : 'player');
          setIsDM(participant.role === 'dm');
        }
      }

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
          setOptionsLoaded(true);
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

          // Reproducir audio ambiental para la escena inicial
          if (firstScene.scene_type === 'combate') {
            audioManager.playAmbient('dungeon');
          } else if (firstScene.scene_type === 'social') {
            audioManager.playAmbient('tavern');
          } else if (firstScene.scene_type === 'exploration') {
            audioManager.playAmbient('forest');
          }

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
          setOptionsLoaded(true);
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
    // Solo DM puede cambiar vista
    if (!isDM) return;
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
        setOptionsLoaded(false);

        const { data: nextOptions } = await supabase
          .from('scene_options')
          .select('*')
          .eq('scene_id', nextScene.id)
          .order('option_order', { ascending: true });

        setOptions(nextOptions || []);
        setOptionsLoaded(true);
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

      const { data: enemies, error: besteryError } = await supabase
        .from('bestiary')
        .select('*')
        .eq('name', bestiary_name);

      if (besteryError) {
        console.error('Bestiary query error:', besteryError);
        throw new Error(`Error al buscar enemigo: ${besteryError.message}`);
      }
      if (!enemies || enemies.length === 0) {
        throw new Error(`Enemigo no encontrado en el bestiario: ${bestiary_name}`);
      }
      if (enemies.length > 1) {
        throw new Error(`Múltiples monstruos con nombre "${bestiary_name}" — especificar en la aventura`);
      }

      const enemy = enemies[0];

      const { data: characters, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', playthrough.campaign_id);

      if (charError) {
        console.error('Characters query error:', charError);
        throw new Error(`Error al buscar personajes: ${charError.message}`);
      }
      if (!characters || characters.length === 0) {
        console.warn('No characters found for campaign_id:', playthrough.campaign_id);
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
        ...Array.from({ length: count }).map((_, i) => ({
          combat_id: combat.id,
          character_id: null,
          name: count > 1 ? `${enemy.name} ${i + 1}` : enemy.name,
          is_player: false,
          hp_current: enemy.hp,
          hp_max: enemy.hp,
          armor_class: enemy.armor_class,
          dexterity: enemy.dexterity,
          damage_dice: enemy.damage_dice,
          attack_bonus: enemy.attack_bonus,
        })),
        ...characters.map((char) => ({
          combat_id: combat.id,
          character_id: char.id,
          name: char.character_name,
          is_player: true,
          hp_current: char.hp_current,
          hp_max: char.hp_max,
          armor_class: char.armor_class,
          dexterity: char.dex,
        })),
      ];

      const { data: participantsData, error: participantsError } = await supabase
        .from('combat_participants')
        .insert(participants)
        .select();

      if (participantsError) {
        console.error('Combat participants insert error:', participantsError);
        // Delete the combat row if participants insert fails
        await supabase.from('combats').delete().eq('id', combat.id);
        throw new Error(`Error al crear participantes del combate: ${participantsError.message}`);
      }
      if (!participantsData || participantsData.length === 0) {
        console.warn('Combat participants insert returned empty');
        // Delete the combat row if no participants were created
        await supabase.from('combats').delete().eq('id', combat.id);
        throw new Error('No se pudieron crear los participantes del combate');
      }

      // Play combat initiation sound
      audioManager.playEffect('attack');

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

      const { data: combats, error: combatError } = await supabase
        .from('combats')
        .select('id')
        .eq('playthrough_id', playthroughId)
        .eq('scene_id', scene.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (combatError) {
        console.error('Combat query error:', combatError);
        throw new Error(`Error al buscar combate: ${combatError.message}`);
      }

      let result;
      const resultadoEnglish = resultado === 'victoria' ? 'victory' : 'defeat';

      if (combats && combats.length > 0) {
        const combatId = combats[0].id;
        result = await cerrarCombate(playthroughId, scene.id, resultadoEnglish, combatId);
      } else {
        result = await resolverCombateSinCombate(playthroughId, scene.id, resultadoEnglish);
      }

      if (!result.leads_to_scene_id) {
        throw new Error('Error al resolver combate: sin destino de escena');
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
        setOptionsLoaded(false);

        const { data: nextOptions } = await supabase
          .from('scene_options')
          .select('*')
          .eq('scene_id', nextScene.id)
          .order('option_order', { ascending: true });

        setOptions(nextOptions || []);
        setOptionsLoaded(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al resolver combate: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCombat = async () => {
    if (!playthrough || !scene || !playthroughId) return;

    if (!window.confirm('¿Seguro que quieres cancelar el combate? No se registrará como un evento.')) {
      return;
    }

    try {
      setLoading(true);

      const { data: combats, error: combatError } = await supabase
        .from('combats')
        .select('id')
        .eq('playthrough_id', playthroughId)
        .eq('scene_id', scene.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (combatError) {
        console.error('Combat query error:', combatError);
        throw new Error(`Error al buscar combate: ${combatError.message}`);
      }
      if (!combats || combats.length === 0) {
        throw new Error('No hay combate activo en esta escena');
      }

      const combatId = combats[0].id;
      await cancelarCombate(playthroughId, scene.id, combatId);

      setPlaythrough({
        ...playthrough,
        current_scene_id: scene.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al cancelar combate: ${message}`);
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
        setOptionsLoaded(false);

        const { data: prevOptions } = await supabase
          .from('scene_options')
          .select('*')
          .eq('scene_id', previousSceneId)
          .order('option_order', { ascending: true });

        setOptions(prevOptions || []);
        setOptionsLoaded(true);
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
          {isDM && !isPlayerView && user && (
            <span className="session-email">{user.email}</span>
          )}
          {isDM && !isPlayerView && (
            <button className="btn-primary" onClick={handleShowToPlayers}>
              Mostrar a los jugadores
            </button>
          )}
          {isDM && isPlayerView && (
            <button className="btn-secondary" onClick={() => setShowConfirm(true)}>
              Volver a DM
            </button>
          )}
        </div>
      </header>

      {/* Render combat animations overlay */}
      {combatAnimations.map((anim) => (
        <CombatAnimation key={anim.id} type={anim.type} value={anim.value} x={anim.x} y={anim.y} />
      ))}

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

      {(playthrough.status === 'completed' || (visibleOptions.length === 0 && scene.scene_type !== 'combate')) ? (
        <FinalAdventureScreen
          playthrough={playthrough}
          onGoToPreviousScene={hasPreviousScene ? handleGoToPreviousScene : undefined}
          isLoading={loading}
        />
      ) : userRole === 'player' ? (
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
          onSelectOption={handleSelectOption}
          onGoToPreviousScene={handleGoToPreviousScene}
          canGoToPreviousScene={hasPreviousScene}
          onInitiateCombat={scene.scene_type === 'combate' ? handleInitiateCombat : undefined}
          onResolveCombatVictory={
            scene.scene_type === 'combate' ? () => handleResolveCombatManually('victoria') : undefined
          }
          onResolveCombatDefeat={
            scene.scene_type === 'combate' ? () => handleResolveCombatManually('derrota') : undefined
          }
          onCancelCombat={scene.scene_type === 'combate' ? handleCancelCombat : undefined}
          isLoading={loading}
          sceneCount={sceneCount}
        />
      )}
    </div>
  );
};

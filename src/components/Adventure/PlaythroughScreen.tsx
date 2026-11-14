import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { cerrarCombate, cancelarCombate, resolverCombateSinCombate, type Aftermath } from '../../lib/combat-return';
import { abilityMod, rollInitiative, attackAbilityFor } from '../../lib/combat-engine';
import type { Playthrough, Scene, SceneOption } from '../../lib/adventure-types';
import { toPlayerScene, toPlayerOption } from '../../lib/adventure-types';
import { ScenePlayerView } from './ScenePlayerView';
import { SceneDMView } from './SceneDMView';
import { FinalAdventureScreen } from './FinalAdventureScreen';
import { audioManager } from '../../lib/audio';
import { CombatAnimation } from '../Combat/CombatAnimations';
import { findModuleByOrigin } from '../../content/modules';
import './playthrough-screen.css';
import { SoundToggle } from '../UI/SoundToggle';
import { RecentEvents } from './RecentEvents';
import { PlayerSheet } from './PlayerSheet';

// Resumen en una línea de lo que dejó el combate (XP, niveles, personajes estabilizados).
const describeAftermath = (a: Aftermath): string => {
  const parts: string[] = [
    a.resultado === 'victory'
      ? `Victoria: cada personaje gana ${a.xpEach} XP.`
      : 'Derrota: la historia sigue por otro camino.',
  ];
  a.levelUps.forEach((l) => parts.push(`¡${l.name} sube a nivel ${l.level}!`));
  if (a.stabilized.length) parts.push(`${a.stabilized.join(', ')} ${a.stabilized.length === 1 ? 'queda' : 'quedan'} con 1 PV.`);
  if (a.warning) parts.push(a.warning);
  return parts.join(' ');
};

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
  const [adventureOrigin, setAdventureOrigin] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [okNotice, setOkNotice] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const module = findModuleByOrigin(adventureOrigin);
  const moduleScene = module && scene ? module.scenes.find((s) => s.order === scene.scene_order) : undefined;

  // Ambiente sonoro definido por el módulo (prevalece sobre el genérico por tipo de escena)
  useEffect(() => {
    if (moduleScene?.ambient) audioManager.playAmbient(moduleScene.ambient);
  }, [moduleScene?.key]);

  // Carga el origin de la aventura para enlazar con su módulo de ayudas visuales
  useEffect(() => {
    if (!playthrough?.adventure_id) return;
    (async () => {
      const { data } = await supabase
        .from('adventures')
        .select('origin')
        .eq('id', playthrough.adventure_id)
        .single();
      setAdventureOrigin(data?.origin ?? null);
    })();
  }, [playthrough?.adventure_id]);

  const viewStorageKey = `dnd_view_${playthroughId}`;

  useEffect(() => {
    const stored = localStorage.getItem(viewStorageKey);
    if (stored === 'player') {
      setIsPlayerView(true);
    }
  }, [viewStorageKey]);

  useEffect(() => {
    return () => {
      audioManager.stopAmbient();
    };
  }, []);

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
        .select('current_scene_id, flags')
        .eq('id', playthroughId)
        .single();

      // Sincroniza lo que el DM comparte (mapas, niebla, documentos) sin cambiar de escena
      if (pt && pt.current_scene_id === currentSceneId && JSON.stringify(pt.flags ?? {}) !== JSON.stringify(playthrough.flags ?? {})) {
        setPlaythrough({ ...playthrough, flags: pt.flags ?? {} });
      }

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
      // El rol sale del participante (lo decidió el director en el lobby).
      // Solo si la persona no tiene fila, se usa el creador de la partida como respaldo.
      const { data: participant } = await supabase
        .from('playthrough_participants')
        .select('role')
        .eq('playthrough_id', playthroughId)
        .eq('user_id', user?.id)
        .maybeSingle();

      const asDm = participant ? participant.role === 'dm' : pt.user_id === user?.id;
      setIsDM(asDm);
      setUserRole(asDm ? 'dm' : 'player');

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

      // El registro y la escena siguiente (con sus opciones) no dependen entre sí: van en paralelo.
      const nextSceneId = selectedOption.leads_to_scene_id;
      const [logResult, sceneResult, optionsResult] = await Promise.all([
        supabase
          .from('playthrough_log')
          .insert({
            playthrough_id: playthroughId,
            scene_id: scene.id,
            entry_type: 'decision',
            content: {
              option_id: optionId,
              option_label: selectedOption.player_label,
              sets_flag: selectedOption.sets_flag,
              leads_to_scene_id: nextSceneId,
            },
          })
          .select(),
        supabase.from('scenes').select('*').eq('id', nextSceneId).single(),
        supabase
          .from('scene_options')
          .select('*')
          .eq('scene_id', nextSceneId)
          .order('option_order', { ascending: true }),
      ]);

      const { data: logRows, error: logError } = logResult;
      if (logError) throw logError;
      if (!logRows || logRows.length === 0) {
        throw new Error('INSERT a playthrough_log no afectó filas');
      }

      const nextScene = sceneResult.data;
      const nextOptions = optionsResult.data;

      if (nextScene) {
        setScene(nextScene);
        setPlaythrough({ ...playthrough, flags: newFlags, current_scene_id: nextScene.id });
        setOptionsLoaded(false);

        // Reproducir audio ambiental según tipo de escena
        try {
          if (nextScene.scene_type === 'combate') {
            audioManager.playAmbient('dungeon');
          } else if (nextScene.scene_type === 'social') {
            audioManager.playAmbient('tavern');
          } else if (nextScene.scene_type === 'exploration') {
            audioManager.playAmbient('forest');
          }
        } catch (e) {
          console.warn('Audio not available:', e);
        }

        setOptions(nextOptions || []);
        setOptionsLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Solo la carga inicial reemplaza la pantalla. Durante una acción, los botones se deshabilitan
  // y la vista se mantiene para no perder el contexto.
  if (!playthrough || !scene) {
    return loading ? (
      <div className="ps-state" role="status">
        <p>Cargando la partida…</p>
      </div>
    ) : (
      <div className="ps-state">
        <p>No pudimos abrir esta partida. Puede que haya sido borrada o que no tengas acceso.</p>
        <button className="ps-btn ps-btn-ghost" onClick={() => navigate(`/campaign/${campaignId}`)}>
          Volver a la campaña
        </button>
      </div>
    );
  }

  const handleInitiateCombat = async () => {
    if (!playthrough || !scene || !scene.encounter) return;

    try {
      setLoading(true);

      // Si hay un combate sin terminar en esta escena, se retoma en lugar de crear otro.
      const { data: openCombats } = await supabase
        .from('combats')
        .select('id, status')
        .eq('playthrough_id', playthroughId)
        .eq('scene_id', scene.id)
        .order('created_at', { ascending: false })
        .limit(1);
      const lastCombat = openCombats?.[0];
      if (lastCombat && !['finished', 'defeat', 'cancelled'].includes(lastCombat.status ?? '')) {
        navigate(`/campaign/${campaignId}/combat/${lastCombat.id}`);
        return;
      }

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
          round: 1,
        })
        .select()
        .single();

      if (combatError || !combat) {
        throw new Error('No se pudo crear el combate');
      }

      // Iniciativa (regla de 5e): d20 + DES para cada participante; juega primero quien saca más.
      const entries = [
        ...Array.from({ length: count }).map((_, i) => ({
          init: rollInitiative(enemy.dexterity ?? 10).total,
          row: {
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
            // Los enemigos empiezan a la derecha del mapa (sql/015).
            pos_x: 7,
            pos_y: i % 6,
          },
        })),
        ...characters.map((char, ci) => ({
          init: rollInitiative(char.dex ?? 10).total,
          row: {
            combat_id: combat.id,
            character_id: char.id,
            name: char.character_name,
            is_player: true,
            hp_current: char.hp_current,
            hp_max: char.hp_max,
            armor_class: char.armor_class,
            dexterity: char.dex,
            // Bono de ataque: modificador de FUE + bonificador de competencia.
            // Atributo de ataque según la clase (ver attackAbilityFor).
            attack_bonus: abilityMod((char as any)[attackAbilityFor(char.character_class)]) + (char.proficiency_bonus ?? 2),
            // Los personajes empiezan a la izquierda del mapa (sql/015).
            pos_x: 0,
            pos_y: ci % 6,
          },
        })),
      ];
      const participants = entries
        .map((e) => ({ ...e, tie: Math.random() }))
        .sort((a, b) => b.init - a.init || b.tie - a.tie)
        .map((e, i) => ({ ...e.row, turn_order: i }));

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
      setNotice(`No se pudo iniciar el combate. ${message}`);
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
      setOkNotice(describeAftermath(result.aftermath));

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
      setNotice(`No se pudo cerrar el combate. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCombat = async () => {
    if (!playthrough || !scene || !playthroughId) return;

    if (!window.confirm('¿Cancelar el combate? No queda registrado en la aventura.')) {
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
      setNotice(`No se pudo cancelar el combate. ${message}`);
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

  // El DM comparte/oculta mapa, zonas de niebla y documentos (se guardan en flags)
  const handleToggleFlag = async (flag: string) => {
    if (!isDM || !playthrough) return;
    const newFlags = { ...playthrough.flags, [flag]: !playthrough.flags?.[flag] };
    const { error } = await supabase
      .from('playthroughs')
      .update({ flags: newFlags, updated_at: new Date().toISOString() })
      .eq('id', playthroughId);
    if (error) {
      setNotice(`No se pudo compartir con los jugadores. ${error.message}`);
      return;
    }
    setPlaythrough({ ...playthrough, flags: newFlags });
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
    <div className={`ps ${isPlayerView ? 'ps-players' : 'ps-dm'}`}>
      <header className="ps-top">
        <button className="ps-back" onClick={() => navigate(`/campaign/${campaignId}`)}>
          ← Volver a la campaña
        </button>

        <div className="ps-title">
          <p className="ps-eyebrow">
            {isDM ? (isPlayerView ? 'Estás mostrando la pantalla a los jugadores' : 'Vista del director') : 'Vista de jugadores'}
          </p>
          <h1>{scene.title || `Escena ${scene.scene_order}`}</h1>
        </div>

        <SoundToggle />

        {isDM && (
          <div className="ps-mode" role="group" aria-label="Elegí qué pantalla ves">
            <button
              className={`ps-mode-btn ${!isPlayerView ? 'is-active' : ''}`}
              aria-pressed={!isPlayerView}
              onClick={() => isPlayerView && setShowConfirm(true)}
            >
              Mi vista (DM)
            </button>
            <button
              className={`ps-mode-btn ${isPlayerView ? 'is-active' : ''}`}
              aria-pressed={isPlayerView}
              onClick={handleShowToPlayers}
            >
              Vista de jugadores
            </button>
          </div>
        )}
      </header>

      {isDM && (
        <p className="ps-hint-bar">
          {isPlayerView
            ? 'Los jugadores ven solo lo que les corresponde. Tus notas secretas están ocultas.'
            : 'Vos ves todo: notas secretas, opciones y controles. Usá “Vista de jugadores” cuando tengas que mostrar la pantalla a la mesa.'}
        </p>
      )}

      {notice && (
        <div className="ps-notice" role="alert">
          <p>{notice}</p>
          <button className="ps-btn ps-btn-ghost" onClick={() => setNotice(null)}>
            Entendido
          </button>
        </div>
      )}

      {okNotice && (
        <div className="ps-notice ps-notice-ok" role="status">
          <p>{okNotice}</p>
          <button className="ps-btn ps-btn-ghost" onClick={() => setOkNotice(null)}>
            Cerrar
          </button>
        </div>
      )}

      {!isDM && playthrough?.campaign_id && (
        <div className="ps-hint-bar">
          <button className="ps-btn ps-btn-ghost" aria-expanded={showSheet} onClick={() => setShowSheet((v) => !v)}>
            {showSheet ? 'Ocultar mi personaje' : 'Ver mi personaje'}
          </button>
        </div>
      )}
      {showSheet && playthroughId && <PlayerSheet playthroughId={playthroughId} />}

      {playthroughId && <RecentEvents playthroughId={playthroughId} />}

      {/* Render combat animations overlay */}
      {combatAnimations.map((anim) => (
        <CombatAnimation key={anim.id} type={anim.type} value={anim.value} x={anim.x} y={anim.y} />
      ))}

      {showConfirm && (
        <div className="ps-modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div
            className="ps-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ps-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="ps-confirm-title">¿Volver a tu vista de DM?</h2>
            <p>Tus notas secretas volverán a verse en esta pantalla. Si la estás mostrando a la mesa, dejará de hacerlo.</p>
            <div className="ps-modal-buttons">
              <button className="ps-btn ps-btn-ghost" onClick={() => setShowConfirm(false)}>
                Seguir mostrando a jugadores
              </button>
              <button className="ps-btn ps-btn-primary" onClick={toggleView}>
                Volver a mi vista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* key por escena: al cambiar de escena el contenido entra con una transición suave. */}
      <div key={scene.id} className="ps-scene">
      {(playthrough.status === 'completed' || (visibleOptions.length === 0 && scene.scene_type !== 'combate')) ? (
        <FinalAdventureScreen
          playthrough={playthrough}
          onGoToPreviousScene={hasPreviousScene ? handleGoToPreviousScene : undefined}
          isLoading={loading}
          module={module}
          moduleScene={moduleScene}
          isDM={isDM}
        />
      ) : userRole === 'player' || isPlayerView ? (
        // Un DM en "Vista de jugadores" ve exactamente lo que ven los jugadores (sin notas secretas).
        <ScenePlayerView
          playthroughId={playthroughId}
          sceneId={scene.id}
          scene={toPlayerScene(scene)}
          options={visibleOptions.map(toPlayerOption)}
          onSelectOption={handleSelectOption}
          isLoading={loading}
          module={module}
          moduleScene={moduleScene}
          flags={playthrough.flags}
        />
      ) : (
        <SceneDMView
          campaignId={playthrough.campaign_id}
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
          module={module}
          moduleScene={moduleScene}
          flags={playthrough.flags}
          onToggleFlag={handleToggleFlag}
        />
      )}
      </div>
    </div>
  );
};

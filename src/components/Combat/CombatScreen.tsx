import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { cerrarCombate, treasureForScene, type Aftermath } from '../../lib/combat-return';
import {
  resolveAttack, nextAliveIndex, isCombatOver, abilityMod, roll, skillCheck, getAbility,
  parseDying, canAct, targetOutcome, deathSave, attackAbilityFor,
} from '../../lib/combat-engine';
import { CombatAnimation } from './CombatAnimations';
import type { RollResult } from '../../lib/combat-engine';
import './combat-screen.css';
import { audioManager } from '../../lib/audio';
import { SoundToggle } from '../UI/SoundToggle';
import { useAuth } from '../../hooks/useAuth';
import { SPELL_CATALOG, SLOT_CASTER_CLASSES, spellCombatProfile, type CatalogSpell } from '../../lib/spell-catalog';
import type { SpellEntry } from '../../lib/types';

type Phase = 'awaiting_player' | 'awaiting_dm_continue' | 'showing_roll' | 'finished';

// --- Mapa del combate (sql/015). Cuadrícula de 8 × 6. Distancia en casillas, diagonal = 1 (como en 5e). ---
const BOARD_W = 8;
const BOARD_H = 6;
const MOVE_SPEED = 6; // casillas por turno
const MELEE_REACH = 1; // cuerpo a cuerpo: estar al lado

type Pos = { id?: string; pos_x?: number | null; pos_y?: number | null };

const distance = (a: Pos, b: Pos): number =>
  a.pos_x == null || a.pos_y == null || b.pos_x == null || b.pos_y == null
    ? 99
    : Math.max(Math.abs(a.pos_x - b.pos_x), Math.abs(a.pos_y - b.pos_y));

const occupiedAt = (list: Array<Pos & { hp_current?: number; status?: string | null }>, x: number, y: number, exceptId?: string) =>
  list.some(
    (p) => p.id !== exceptId && p.pos_x === x && p.pos_y === y && ((p.hp_current ?? 0) > 0 || parseDyingLoose(p.status))
  );

const parseDyingLoose = (status?: string | null) => /^dying:/.test(status ?? '');

const inBoard = (x: number, y: number) => x >= 0 && y >= 0 && x < BOARD_W && y < BOARD_H;

// Da hasta MOVE_SPEED pasos hacia el objetivo, sin pisar a nadie, hasta quedar al alcance.
const stepToward = (
  from: Pos & { id: string },
  to: Pos,
  all: Array<Pos & { hp_current?: number; status?: string | null }>
): { x: number; y: number } => {
  let x = from.pos_x ?? 0;
  let y = from.pos_y ?? 0;
  for (let s = 0; s < MOVE_SPEED && distance({ pos_x: x, pos_y: y }, to) > MELEE_REACH; s++) {
    const dx = Math.sign((to.pos_x ?? 0) - x);
    const dy = Math.sign((to.pos_y ?? 0) - y);
    const options: Array<[number, number]> = [
      [x + dx, y + dy],
      [x + dx, y],
      [x, y + dy],
    ];
    const next = options.find(
      ([cx, cy]) =>
        (cx !== x || cy !== y) &&
        inBoard(cx, cy) &&
        !occupiedAt(all, cx, cy, from.id) &&
        !(cx === to.pos_x && cy === to.pos_y)
    );
    if (!next) break;
    [x, y] = next;
  }
  return { x, y };
};

// Ficha de cada participante: retrato si lo tiene; si no, inicial (y número del enemigo: "K2").
const Token = ({
  name,
  src,
  enemy,
  size = 'sm',
  highlight = '',
}: {
  name: string;
  src?: string | null;
  enemy?: boolean;
  size?: 'sm' | 'lg';
  /** Resalta a quien ataca o recibe el golpe: 'is-acting', 'is-hit' o 'is-missed'. */
  highlight?: string;
}) => {
  if (src) return <img className={`cs-token cs-token-${size} ${highlight}`} src={src} alt="" />;
  const num = /(\d+)$/.exec(name.trim())?.[1] ?? '';
  return (
    <span className={`cs-token cs-token-${size} ${enemy ? 'is-enemy' : ''} ${highlight}`} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
      {num}
    </span>
  );
};

// Una frase legible para el registro del combate (lo leen DM y jugadores).
const describeAttack = (
  actor: string,
  target: string,
  ac: number,
  result: RollResult,
  newHp: number,
  abilityName?: string
): string => {
  const numbers = `(${result.total} contra CA ${ac})`;
  if (!result.hit) {
    return abilityName
      ? `${actor} usa ${abilityName} contra ${target} y falla ${numbers}.`
      : `${actor} ataca a ${target} y falla ${numbers}.`;
  }
  const how = abilityName ? `${actor} usa ${abilityName} y golpea a ${target}` : `${actor} golpea a ${target}`;
  const crit = result.critical ? ' con un crítico' : '';
  const down = newHp <= 0 ? ` ${target} cae.` : '';
  return `${how}${crit}: ${result.damage} de daño ${numbers}.${down}`;
};

// Dado que gira unos instantes antes de caer en el resultado real.
// Con "reducir movimiento" activado muestra el número directamente.
const RollingDie = ({ value }: { value: number }) => {
  const reduce =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = useState(reduce ? value : 1 + Math.floor(Math.random() * 20));
  const [settled, setSettled] = useState(Boolean(reduce));

  useEffect(() => {
    if (reduce) return;
    let ticks = 0;
    const id = window.setInterval(() => {
      ticks += 1;
      if (ticks >= 10) {
        window.clearInterval(id);
        setShown(value);
        setSettled(true);
        return;
      }
      setShown(1 + Math.floor(Math.random() * 20));
    }, 50);
    return () => window.clearInterval(id);
  }, [value, reduce]);

  return (
    <div className={`cs-die ${settled ? 'is-settled' : 'is-rolling'}`} aria-label={`Dado: ${value}`}>
      {shown}
    </div>
  );
};
type PickingFor = 'attack' | 'ability' | 'spell' | null;

export const CombatScreen = () => {
  const { campaignId, combatId } = useParams();
  const navigate = useNavigate();

  const [combat, setCombat] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [lastRoll, setLastRoll] = useState<(RollResult & { actorName: string; targetName: string; dice?: string }) | null>(null);
  const [phase, setPhase] = useState<Phase>('awaiting_player');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pickingTarget, setPickingTarget] = useState<PickingFor>(null);
  const [classMap, setClassMap] = useState<Record<string, string>>({});
  const [strMap, setStrMap] = useState<Record<string, number>>({});
  const [inventoryMap, setInventoryMap] = useState<Record<string, any[]>>({});
  const [spellSlotsMap, setSpellSlotsMap] = useState<Record<string, Record<string, number>>>({});
  const [spellsMap, setSpellsMap] = useState<Record<string, SpellEntry[]>>({});
  const [pickedSpell, setPickedSpell] = useState<string | null>(null);
  const [spellMenu, setSpellMenu] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [beam, setBeam] = useState<{
    x1: number; y1: number; x2: number; y2: number; w: number; h: number; kind: 'hit' | 'miss';
  } | null>(null);

  // Mientras se muestra la tirada, dibuja una línea desde quien ataca hasta el objetivo.
  // Las posiciones se miden en pantalla, así que no dependen del espaciado del tablero.
  useEffect(() => {
    if (!lastRoll || phase !== 'showing_roll' || !boardRef.current) {
      setBeam(null);
      return;
    }
    const actor = participants.find(
      (p) => lastRoll.actorName === p.name || lastRoll.actorName.startsWith(`${p.name} ·`),
    );
    const target = participants.find((p) => p.name === lastRoll.targetName);
    if (!actor || !target || actor.pos_x == null || actor.pos_y == null || target.pos_x == null || target.pos_y == null) {
      setBeam(null);
      return;
    }
    const board = boardRef.current.getBoundingClientRect();
    const center = (x: number, y: number) => {
      const el = boardRef.current?.querySelector(`[data-cell="${x}-${y}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left - board.left + r.width / 2, y: r.top - board.top + r.height / 2 };
    };
    const a = center(actor.pos_x, actor.pos_y);
    const b = center(target.pos_x, target.pos_y);
    if (!a || !b) {
      setBeam(null);
      return;
    }
    setBeam({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, w: board.width, h: board.height, kind: lastRoll.hit ? 'hit' : 'miss' });
  }, [lastRoll, phase, participants]);
  // Rol en esta partida y personaje propio. Define qué botones ve cada persona.
  const { user } = useAuth();
  const [myRole, setMyRole] = useState<'dm' | 'player' | null>(null);
  const [myCharacterId, setMyCharacterId] = useState<string | null>(null);
  // Un movimiento por turno: se guarda la clave del turno en que ya se movió.
  const [movedKey, setMovedKey] = useState<string | null>(null);
  const turnKey = `${combat?.turn_index ?? 0}-${combat?.round ?? 1}`;
  const hasMovedThisTurn = movedKey === turnKey;
  // Clases que gastan espacios de conjuro al usar su habilidad (5e: lanzadores de conjuros).
  const SPELLCASTERS = SLOT_CASTER_CLASSES;
  const [portraitMap, setPortraitMap] = useState<Record<string, string | null>>({});
  const [aftermath, setAftermath] = useState<(Aftermath & { playthroughId: string; treasure: string[] }) | null>(null);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState('');
  const [animationQueue, setAnimationQueue] = useState<Array<{ id: string; type: 'attack' | 'damage' | 'heal' | 'miss'; value?: number; x: number; y: number }>>([]);

  // Sonido de cada tirada: el dado al tirarse y el resultado cuando cae (≈520 ms).
  useEffect(() => {
    if (!lastRoll) return;
    audioManager.playEffect('dice');
    const id = window.setTimeout(() => {
      audioManager.playEffect(lastRoll.critical ? 'crit' : lastRoll.hit ? 'hit' : 'miss');
    }, 520);
    return () => window.clearTimeout(id);
  }, [lastRoll]);

  const refetch = useCallback(async () => {
    const { data: c } = await supabase
      .from('combats')
      .select('*')
      .eq('id', combatId)
      .single();
    const { data: p } = await supabase
      .from('combat_participants')
      .select('*')
      .eq('combat_id', combatId)
      .order('turn_order', { ascending: true });

    // Combates anteriores al mapa: si no tienen posiciones, se ubican como al empezar.
    if ((p || []).length > 0 && (p || []).every((row) => row.pos_x == null)) {
      let pi = 0;
      let ei = 0;
      for (const row of p || []) {
        const pos = row.is_player ? { pos_x: 0, pos_y: pi++ % BOARD_H } : { pos_x: BOARD_W - 1, pos_y: ei++ % BOARD_H };
        row.pos_x = pos.pos_x;
        row.pos_y = pos.pos_y;
        await supabase.from('combat_participants').update(pos).eq('id', row.id);
      }
    }

    setCombat(c);
    setParticipants(p || []);

    // Mi rol en la partida (el director decide quién es, en el lobby).
    if (c?.playthrough_id && user?.id) {
      const { data: me } = await supabase
        .from('playthrough_participants')
        .select('role')
        .eq('playthrough_id', c.playthrough_id)
        .eq('user_id', user.id)
        .maybeSingle();
      setMyRole(me?.role === 'dm' ? 'dm' : 'player');
    }
    try {
      setLog(JSON.parse(c?.log || '[]'));
    } catch {
      setLog([]);
    }

    const charIds = (p || []).map((x) => x.character_id).filter(Boolean);
    if (charIds.length > 0) {
      const { data: chars } = await supabase
        .from('characters')
        .select('id, character_class, str, dex, int, wis, cha, portrait_url, inventory, spell_slots, spells, player_user_id')
        .in('id', charIds);
      setMyCharacterId((chars || []).find((ch) => ch.player_user_id === user?.id)?.id ?? null);
      const inv: Record<string, any[]> = {};
      const slots: Record<string, Record<string, number>> = {};
      (chars || []).forEach((c) => {
        inv[c.id] = Array.isArray(c.inventory) ? c.inventory : [];
        slots[c.id] = c.spell_slots ?? {};
      });
      setInventoryMap(inv);
      setSpellSlotsMap(slots);
      setSpellsMap(
        Object.fromEntries((chars || []).map((c) => [c.id, Array.isArray(c.spells) ? (c.spells as SpellEntry[]) : []])),
      );
      const map: Record<string, string> = {};
      const strengths: Record<string, number> = {};
      const portraits: Record<string, string | null> = {};
      (chars || []).forEach((c) => {
        map[c.id] = c.character_class;
        // El daño suma el modificador del atributo de ataque de la clase (ver attackAbilityFor).
        strengths[c.id] = (c as any)[attackAbilityFor(c.character_class)];
        portraits[c.id] = c.portrait_url ?? null;
      });
      setClassMap(map);
      setStrMap(strengths);
      setPortraitMap(portraits);
    }

    const over = isCombatOver(p || []);
    if (over) {
      setPhase('finished');
      return { c, p: p || [], over };
    }

    const actor = (p || [])[c?.turn_index ?? 0];
    setPhase(actor?.is_player ? 'awaiting_player' : 'awaiting_dm_continue');
    return { c, p: p || [], over: null };
  }, [combatId]);

  useEffect(() => {
    (async () => {
      await refetch();
      setLoading(false);
    })();
  }, [refetch]);

  const current = participants[combat?.turn_index ?? 0];
  const enemies = participants.filter((p) => !p.is_player);
  const allies = participants.filter((p) => p.is_player);
  const aliveEnemies = enemies.filter((e) => e.hp_current > 0 && !e.has_fled);
  // Los que caen también son blanco: un golpe más los acerca a la muerte.
  const aliveAllies = allies.filter((a) => canAct(a));

  const effectiveAC = (p: any) => (p?.armor_class ?? 10) + (p?.temp_ac_bonus ?? 0);

  // Daño del arma: si el inventario tiene un objeto con dados (por ejemplo "Espada larga (1d8 cortante)"),
  // el ataque usa ese dado. Las pociones se ignoran. Sin arma con dados, vale el dado de la clase.
  const weaponDiceOf = (charId?: string | null): { count: number; sides: number } | null => {
    if (!charId) return null;
    const item = (inventoryMap[charId] ?? []).find((it: any) => {
      const name = String(it?.name ?? '');
      return /(\d+)d(\d+)/i.test(name) && !/poci[oó]n/i.test(name);
    });
    const m = item ? /(\d+)d(\d+)/i.exec(String(item.name)) : null;
    return m ? { count: Number(m[1]), sides: Number(m[2]) } : null;
  };
  const weaponLabel = (p: any): string => {
    const w = p?.is_player ? weaponDiceOf(p.character_id) : null;
    return w ? `${w.count}d${w.sides}` : `d${p?.damage_dice ?? 8}`;
  };

  // Resalta en el tablero a quien ataca y a quien recibe el golpe mientras se muestra la tirada.
  const tokenHighlight = (name: string): string => {
    if (!lastRoll || phase !== 'showing_roll') return '';
    if (lastRoll.targetName === name) return lastRoll.hit ? 'is-hit' : 'is-missed';
    if (lastRoll.actorName === name || lastRoll.actorName.startsWith(`${name} ·`)) return 'is-acting';
    return '';
  };

  // Conjuros de un personaje según la ficha (solo los que están en el catálogo SRD).
  const spellsOf = (charId?: string | null): CatalogSpell[] =>
    (charId ? spellsMap[charId] ?? [] : [])
      .map((e) => SPELL_CATALOG.find((s) => s.slug === e.slug))
      .filter((s): s is CatalogSpell => Boolean(s));

  const addAnimation = (type: 'attack' | 'damage' | 'heal' | 'miss', value: number | undefined, x: number, y: number) => {
    const animId = `${Date.now()}-${Math.random()}`;
    setAnimationQueue(prev => [...prev, { id: animId, type, value, x, y }]);
    setTimeout(() => {
      setAnimationQueue(prev => prev.filter(a => a.id !== animId));
    }, 1800);
  };

  const commitTurn = async (opts: { newLog: string[]; targetId?: string; newTargetHp?: number; targetStatus?: string }) => {
    if (opts.targetId != null && opts.newTargetHp != null) {
      // Solo cambia el estado si corresponde (caer, morir, esquivar): no se pierde una esquiva activa.
      const patch: { hp_current: number; status?: string } = { hp_current: opts.newTargetHp };
      if (opts.targetStatus !== undefined) patch.status = opts.targetStatus;
      await supabase.from('combat_participants').update(patch).eq('id', opts.targetId);
    }

    const { data: fresh } = await supabase
      .from('combat_participants')
      .select('*')
      .eq('combat_id', combatId)
      .order('turn_order', { ascending: true });
    const list = fresh || [];

    const over = isCombatOver(list);
    if (over) {
      await supabase
        .from('combats')
        .update({ log: JSON.stringify(opts.newLog) })
        .eq('id', combatId);
      await refetch();
      await closeCombat(over);
      return;
    }

    const idx = combat?.turn_index ?? 0;
    const nextIdx = nextAliveIndex(list, idx);

    // La esquiva dura hasta el inicio del próximo turno de quien esquivó.
    if (list[nextIdx]?.status === 'dodging') {
      await supabase.from('combat_participants').update({ status: 'ready' }).eq('id', list[nextIdx].id);
    }

    if (list[nextIdx]?.temp_ac_bonus > 0) {
      await supabase.from('combat_participants').update({ temp_ac_bonus: 0 }).eq('id', list[nextIdx].id);
    }

    const newRound = nextIdx <= idx ? (combat?.round ?? 1) + 1 : combat?.round ?? 1;

    // Avanza el turno con validación en la base (sql/014): solo el director o el dueño del personaje que juega.
    const { error: advanceError } = await supabase.rpc('combat_advance', {
      p_combat_id: combatId,
      p_expected_turn: idx,
      p_new_turn: nextIdx,
      p_new_round: newRound,
      p_log: JSON.stringify(opts.newLog),
    });
    if (advanceError) {
      setCloseError(
        advanceError.message.includes('ya cambió')
          ? 'El turno ya cambió. Refrescamos la pantalla.'
          : 'No se pudo avanzar el turno. Revisá que la función esté instalada (sql/014).'
      );
    }

    await refetch();
  };

  // Moverse: hasta MOVE_SPEED casillas, una vez por turno, a una casilla libre.
  const moveTo = async (x: number, y: number) => {
    if (busy || !current || hasMovedThisTurn) return;
    const d = distance(current, { pos_x: x, pos_y: y });
    if (d === 0 || d > MOVE_SPEED || occupiedAt(participants, x, y, current.id)) return;
    setBusy(true);
    await supabase.from('combat_participants').update({ pos_x: x, pos_y: y }).eq('id', current.id);
    setMovedKey(turnKey);
    await refetch();
    setBusy(false);
  };

  const doAttack = async (target: any) => {
    if (busy || !current) return;
    if (distance(current, target) > MELEE_REACH) {
      setPickingTarget(null); // cierra el selector para que vuelvan las acciones
      setCloseError('Está lejos. Movete al lado del enemigo (una casilla) antes de atacar cuerpo a cuerpo.');
      return;
    }
    setBusy(true);
    setPickingTarget(null);

    const weapon = current.is_player ? weaponDiceOf(current.character_id) : null;
    const dmgBonus = current.is_player ? abilityMod(strMap[current.character_id]) : 0;
    const result = resolveAttack(
      current.attack_bonus ?? 2,
      effectiveAC(target),
      weapon?.sides ?? current.damage_dice ?? 8,
      dmgBonus,
      target.status === 'dodging' ? 'disadvantage' : 'normal'
    );
    if (weapon && weapon.count > 1 && result.hit) {
      // Varias tiradas de daño: se tiran todas (en crítico, el doble) y se suma el modificador.
      const dice = weapon.count * (result.critical ? 2 : 1);
      let dmg = 0;
      for (let i = 0; i < dice; i++) dmg += roll(weapon.sides);
      result.damage = Math.max(1, dmg + dmgBonus);
    }
    setLastRoll({
      ...result,
      actorName: current.name,
      targetName: target.name,
      dice: weapon ? `${weapon.count}d${weapon.sides}` : `d${current.damage_dice ?? 8}`,
    });
    setPhase('showing_roll');

    const outcome = targetOutcome(target, result);
    const newHp = outcome.hp;
    const line = describeAttack(current.name, target.name, effectiveAC(target), result, newHp);

    if (result.hit) {
      addAnimation('damage', result.damage, window.innerWidth / 2, window.innerHeight / 2);
    } else {
      addAnimation('miss', undefined, window.innerWidth / 2, window.innerHeight / 2);
    }

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp, targetStatus: outcome.status });
      setBusy(false);
    }, 2200);
  };

  const doDefend = async () => {
    if (busy || !current) return;
    setBusy(true);
    setLastRoll(null);
    // Esquivar (regla de 5e): los ataques contra este personaje tienen desventaja hasta su próximo turno.
    await supabase.from('combat_participants').update({ status: 'dodging' }).eq('id', current.id);
    await commitTurn({
      newLog: [...log, `${current.name} esquiva: los ataques contra él tienen desventaja hasta su próximo turno`],
    });
    setBusy(false);
  };

  const doAbility = async (target?: any) => {
    if (busy || !current) return;
    const ability = getAbility(classMap[current.character_id]);
    if (target && ability.kind === 'attack' && distance(current, target) > MELEE_REACH) {
      setPickingTarget(null);
      setCloseError('Está lejos. Movete al lado del enemigo antes de usar esta habilidad.');
      return;
    }
    setBusy(true);
    setPickingTarget(null);

    // Lanzadores: gastan un espacio de nivel 1 si la ficha lo tiene cargado.
    const slotsNow = spellSlotsMap[current.character_id] ?? {};
    if (SPELLCASTERS.has(classMap[current.character_id]) && typeof slotsNow['1'] === 'number') {
      // El máximo se guarda la primera vez que se gasta, para que el descanso largo lo restaure.
      const max1 = typeof slotsNow['max1'] === 'number' ? slotsNow['max1'] : slotsNow['1'];
      const next = { ...slotsNow, '1': Math.max(0, slotsNow['1'] - 1), max1 };
      await supabase.from('characters').update({ spell_slots: next }).eq('id', current.character_id);
      setSpellSlotsMap((m) => ({ ...m, [current.character_id]: next }));
    }

    if (ability.kind === 'heal') {
      const healed = roll(ability.healDice ?? 8) + 2;
      audioManager.playEffect('heal');
      const newHp = Math.min(current.hp_max, current.hp_current + healed);
      addAnimation('heal', healed, window.innerWidth / 2, window.innerHeight / 2);
      await supabase
        .from('combat_participants')
        .update({ hp_current: newHp, ability_used: true })
        .eq('id', current.id);
      await commitTurn({
        newLog: [...log, `${current.name} usa ${ability.name} · recupera ${healed} PV (${newHp}/${current.hp_max})`],
      });
      setBusy(false);
      return;
    }

    if (ability.kind === 'buff') {
      await supabase
        .from('combat_participants')
        .update({ temp_ac_bonus: ability.acBonus ?? 3, ability_used: true })
        .eq('id', current.id);
      await commitTurn({
        newLog: [...log, `${current.name} usa ${ability.name} · +${ability.acBonus} CA hasta su próximo turno`],
      });
      setBusy(false);
      return;
    }

    if (!target) {
      setBusy(false);
      return;
    }
    const result = resolveAttack(
      (current.attack_bonus ?? 2) + (ability.bonusToHit ?? 0),
      effectiveAC(target),
      ability.damageDice ?? 10,
      abilityMod(strMap[current.character_id]),
      target.status === 'dodging' ? 'disadvantage' : 'normal'
    );
    setLastRoll({
      ...result,
      actorName: `${current.name} · ${ability.name}`,
      targetName: target.name,
      dice: `d${ability.damageDice ?? 10}`,
    });
    setPhase('showing_roll');

    const outcome = targetOutcome(target, result);
    const newHp = outcome.hp;
    const line = describeAttack(current.name, target.name, effectiveAC(target), result, newHp, ability.name);

    if (result.hit) {
      addAnimation('damage', result.damage, window.innerWidth / 2, window.innerHeight / 2);
    } else {
      addAnimation('miss', undefined, window.innerWidth / 2, window.innerHeight / 2);
    }

    await supabase.from('combat_participants').update({ ability_used: true }).eq('id', current.id);

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp, targetStatus: outcome.status });
      setBusy(false);
    }, 2200);
  };

  // Lanzar un conjuro elegido en la ficha. Es la acción del turno (no usa la habilidad de clase).
  // Los trucos no gastan espacio; los conjuros de nivel sí gastan un espacio de ese nivel.
  const doSpell = async (slug: string, target?: any) => {
    const spell = SPELL_CATALOG.find((s) => s.slug === slug);
    if (busy || !current || !current.character_id || !spell) return;
    const profile = spellCombatProfile(spell);
    if (profile.mode === 'attack' && !target) return;
    if (profile.mode === 'attack' && profile.ranged === false && distance(current, target) > MELEE_REACH) {
      setPickingTarget(null);
      setCloseError('Está lejos. Este conjuro necesita que estés al lado del enemigo.');
      return;
    }

    const key = String(spell.level);
    const slotsNow = spellSlotsMap[current.character_id] ?? {};
    if (spell.level > 0) {
      const left = slotsNow[key];
      if (typeof left !== 'number' || left <= 0) {
        setPickingTarget(null);
        setCloseError(`No te quedan espacios de nivel ${spell.level} para ${spell.name}.`);
        return;
      }
    }

    setBusy(true);
    setPickingTarget(null);
    setPickedSpell(null);
    setSpellMenu(false);

    if (spell.level > 0) {
      // El máximo de nivel 1 se guarda la primera vez que se gasta (lo usa el descanso largo).
      const max1 = typeof slotsNow['max1'] === 'number' ? slotsNow['max1'] : slotsNow['1'];
      const next = { ...slotsNow, [key]: Math.max(0, (slotsNow[key] ?? 0) - 1), max1 };
      await supabase.from('characters').update({ spell_slots: next }).eq('id', current.character_id);
      setSpellSlotsMap((m) => ({ ...m, [current.character_id]: next }));
    }

    const castLine = `${current.name} lanza ${spell.name}`;

    if (profile.mode === 'heal') {
      let healed = 0;
      for (let i = 0; i < profile.count; i++) healed += roll(profile.sides);
      healed = Math.max(1, healed + abilityMod(strMap[current.character_id]));
      const newHp = Math.min(current.hp_max, current.hp_current + healed);
      audioManager.playEffect('heal');
      addAnimation('heal', healed, window.innerWidth / 2, window.innerHeight / 2);
      await supabase.from('combat_participants').update({ hp_current: newHp }).eq('id', current.id);
      await commitTurn({
        newLog: [...log, `${castLine} · recupera ${healed} PV (${newHp}/${current.hp_max})`],
      });
      setBusy(false);
      return;
    }

    if (profile.mode === 'narrative' || !target) {
      await commitTurn({
        newLog: [...log, `${castLine}. Su efecto lo narra el DM (no tiene cálculo automático).`],
      });
      setBusy(false);
      return;
    }

    // Ataque de conjuro: la tirada usa el bono de ataque de la ficha (mismo atributo que el conjuro).
    const result = resolveAttack(
      current.attack_bonus ?? 2,
      effectiveAC(target),
      profile.sides,
      0,
      target.status === 'dodging' ? 'disadvantage' : 'normal',
    );
    if (result.hit && profile.count > 1) {
      // Varios dados de daño: se tiran todos (en un crítico, el doble, como en 5e).
      const dice = profile.count * (result.critical ? 2 : 1);
      let dmg = 0;
      for (let i = 0; i < dice; i++) dmg += roll(profile.sides);
      result.damage = Math.max(1, dmg);
    }
    setLastRoll({
      ...result,
      actorName: `${current.name} · ${spell.name}`,
      targetName: target.name,
      dice: `${profile.count}d${profile.sides}`,
    });
    setPhase('showing_roll');

    const outcome = targetOutcome(target, result);
    const newHp = outcome.hp;
    const line = describeAttack(current.name, target.name, effectiveAC(target), result, newHp, spell.name);

    if (result.hit) {
      addAnimation('damage', result.damage, window.innerWidth / 2, window.innerHeight / 2);
    } else {
      addAnimation('miss', undefined, window.innerWidth / 2, window.innerHeight / 2);
    }

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp, targetStatus: outcome.status });
      setBusy(false);
    }, 2200);
  };

  // Al elegir un conjuro de ataque se pregunta a quién apuntar (si hay un solo enemigo, va directo).
  const castSpell = (spell: CatalogSpell) => {
    if (spellCombatProfile(spell).mode === 'attack') {
      if (aliveEnemies.length === 1) return doSpell(spell.slug, aliveEnemies[0]);
      setPickedSpell(spell.slug);
      setSpellMenu(false);
      return setPickingTarget('spell');
    }
    return doSpell(spell.slug);
  };

  const doFlee = async () => {
    if (busy || !current) return;
    setBusy(true);
    const check = skillCheck(abilityMod(current.dexterity), 12);
    setLastRoll({
      d20: check.d20,
      bonus: check.bonus,
      total: check.total,
      targetAC: check.dc,
      hit: check.success,
      critical: false,
      fumble: false,
      damage: 0,
      explanation: check.explanation,
      actorName: `${current.name} intenta huir`,
      targetName: '',
    } as any);
    setPhase('showing_roll');

    const line = check.success
      ? `${current.name} escapa del combate (${check.total} vs 12)`
      : `${current.name} intenta huir y no lo logra (${check.total} vs 12)`;

    if (check.success) {
      await supabase.from('combat_participants').update({ has_fled: true, hp_current: 0 }).eq('id', current.id);
    }

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line] });
      setBusy(false);
    }, 2200);
  };

  // Poción de curación (5e): recupera 2d4 + 2 PV y gasta una del inventario. Usa el turno.
  const POTION = /poci[oó]n de curaci[oó]n/i;
  const potionIndex = (inv: any[]) => inv.findIndex((it) => POTION.test(String(it?.name ?? '')));
  const doPotion = async () => {
    if (busy || !current || !current.character_id) return;
    const inv = [...(inventoryMap[current.character_id] ?? [])];
    const idx = potionIndex(inv);
    if (idx < 0) return;
    setBusy(true);

    const healed = roll(4) + roll(4) + 2;
    const newHp = Math.min(current.hp_max, current.hp_current + healed);
    const name = String(inv[idx].name);
    const qty = Number(/x(\d+)\s*$/i.exec(name)?.[1] ?? 1);
    const base = name.replace(/\s*x\d+\s*$/i, '');
    if (qty > 1) inv[idx] = { ...inv[idx], name: `${base} x${qty - 1}` };
    else inv.splice(idx, 1);

    await supabase.from('characters').update({ inventory: inv }).eq('id', current.character_id);
    await supabase
      .from('combat_participants')
      .update({ hp_current: newHp, status: 'ready' })
      .eq('id', current.id);
    setInventoryMap((m) => ({ ...m, [current.character_id]: inv }));

    const line = `${current.name} bebe una poción de curación y recupera ${newHp - current.hp_current} PV (${newHp}/${current.hp_max}).`;
    setLastRoll(null);
    setPhase('showing_roll');
    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line] });
      setBusy(false);
    }, 1400);
  };

  // Al empezar su turno, quien cae tira la salvación contra la muerte (5e): d20 de 10 o más es un éxito.
  const doDeathSave = async () => {
    if (busy || !current) return;
    setBusy(true);
    const save = deathSave(current);
    const who = current.name;
    setLastRoll({
      d20: save.d20,
      bonus: 0,
      total: save.d20,
      targetAC: 10,
      hit: save.d20 >= 10,
      critical: save.d20 === 20,
      fumble: save.d20 === 1,
      damage: 0,
      explanation: `${who} ${save.text}.`,
      actorName: `${who} · salvación contra la muerte`,
      targetName: '',
    } as any);
    setPhase('showing_roll');

    const line = `${who} tira contra la muerte: ${save.text}.`;
    await supabase
      .from('combat_participants')
      .update({ hp_current: save.hp, status: save.status })
      .eq('id', current.id);
    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line] });
      setBusy(false);
    }, 2200);
  };

  const runEnemyTurn = async () => {
    if (busy || !current || current.is_player) return;
    setBusy(true);

    const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
    if (!target) {
      setBusy(false);
      return;
    }

    // El enemigo se acerca primero. Si no llega al alcance, el turno termina sin atacar.
    if (distance(current, target) > MELEE_REACH) {
      const to = stepToward(current, target, participants);
      await supabase.from('combat_participants').update({ pos_x: to.x, pos_y: to.y }).eq('id', current.id);
      if (distance({ pos_x: to.x, pos_y: to.y }, target) > MELEE_REACH) {
        await commitTurn({ newLog: [...log, `${current.name} se acerca a ${target.name}.`] });
        setBusy(false);
        return;
      }
    }

    const result = resolveAttack(
      current.attack_bonus ?? 3,
      effectiveAC(target),
      current.damage_dice ?? 6,
      0,
      target.status === 'dodging' ? 'disadvantage' : 'normal'
    );
    setLastRoll({ ...result, actorName: current.name, targetName: target.name, dice: `d${current.damage_dice ?? 6}` });
    setPhase('showing_roll');

    const outcome = targetOutcome(target, result);
    const newHp = outcome.hp;
    const line = describeAttack(current.name, target.name, effectiveAC(target), result, newHp);

    if (result.hit) {
      addAnimation('damage', result.damage, window.innerWidth / 2, window.innerHeight / 2);
    } else {
      addAnimation('miss', undefined, window.innerWidth / 2, window.innerHeight / 2);
    }

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp, targetStatus: outcome.status });
      setBusy(false);
    }, 2200);
  };

  // Cierra el combate: guarda vida, reparte XP y sube de nivel. Muestra el resumen
  // antes de volver a la aventura (antes saltaba directo y no se veía nada).
  const closeCombat = async (resultado: 'victory' | 'defeat') => {
    if (!combat || !combatId || closing || aftermath) return;
    setClosing(true);
    setCloseError('');

    try {
      if (combat.playthrough_id && combat.scene_id) {
        const res = await cerrarCombate(combat.playthrough_id, combat.scene_id, resultado, combatId);
        const treasure = resultado === 'victory' ? await treasureForScene(combat.playthrough_id, combat.scene_id) : [];
        setAftermath({ ...res.aftermath, playthroughId: combat.playthrough_id, treasure });
      } else {
        await supabase
          .from('combats')
          .update({ status: resultado === 'victory' ? 'finished' : 'defeat' })
          .eq('id', combatId);
        navigate(`/campaign/${campaignId}`);
      }
    } catch (err) {
      setCloseError(err instanceof Error ? err.message : 'No se pudo cerrar el combate.');
    } finally {
      setClosing(false);
    }
  };

  // Salir sin terminar: el combate queda guardado y se puede retomar desde la escena.
  const leave = () => {
    if (combat?.playthrough_id) navigate(`/campaign/${campaignId}/play/${combat.playthrough_id}`);
    else navigate(`/campaign/${campaignId}`);
  };

  const finish = async () => {
    const outcome = isCombatOver(participants);
    if (outcome) await closeCombat(outcome);
  };

  if (loading) {
    return (
      <div className="cs-state" role="status">
        <p>Preparando el combate…</p>
      </div>
    );
  }

  const outcome = isCombatOver(participants);
  const foes = enemies;
  // El director controla todo (turnos enemigos y cualquier personaje). Un jugador actúa solo con su personaje, cuando le toca.
  const isDirector = myRole === 'dm';
  const canActNow = isDirector || (!!current?.character_id && current.character_id === myCharacterId);

  const rowStatus = (p: any) => {
    if (p.has_fled) return 'Huyó';
    if (p.status === 'dead') return 'Muerto';
    const dy = parseDying(p.status);
    if (dy.dying) return `Cayendo · ${dy.successes}✓ ${dy.failures}✗`;
    if (p.status === 'stable') return 'Inconsciente, estable';
    if (p.hp_current <= 0) return p.is_player ? 'Caído' : 'Derrotado';
    return `${p.hp_current}/${p.hp_max} PV`;
  };

  const renderRoster = (list: any[]) =>
    list.map((p) => {
      const pct = Math.max(0, Math.min(100, (p.hp_current / (p.hp_max || 1)) * 100));
      const isCurrent = p.id === current?.id;
      const down = p.hp_current <= 0 || p.has_fled;
      return (
        <li key={p.id} className={`cs-row ${isCurrent ? 'is-now' : ''} ${down ? 'is-down' : ''}`}>
          <div className="cs-row-head">
            <span className="cs-row-name">
              <Token name={p.name} src={p.is_player ? portraitMap[p.character_id] : null} enemy={!p.is_player} size="sm" />
              <span>
                {isCurrent && <span className="cs-row-turn">Juega ahora · </span>}
                {p.name}
              </span>
            </span>
            <span className="cs-row-status">
              {rowStatus(p)}
              {p.status === 'dodging' && <em className="cs-row-buff"> · esquivando</em>}
            </span>
          </div>
          <div
            className="cs-bar"
            role="progressbar"
            aria-label={`Vida de ${p.name}`}
            aria-valuemin={0}
            aria-valuemax={p.hp_max}
            aria-valuenow={Math.max(0, p.hp_current)}
          >
            <div className="cs-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </li>
      );
    });

  // Mapa: las casillas a las que el personaje que juega puede moverse se marcan en dorado.
  const canMoveNow = canActNow && phase === 'awaiting_player' && !hasMovedThisTurn && !!current && !pickingTarget;
  const renderBoard = () => (
    <div className="cs-board" role="grid" aria-label="Mapa del combate" ref={boardRef}>
      {beam && (
        <svg className="cs-beam" width={beam.w} height={beam.h} aria-hidden="true">
          <line
            className={`cs-beam-line is-${beam.kind}`}
            x1={beam.x1}
            y1={beam.y1}
            x2={beam.x2}
            y2={beam.y2}
          />
        </svg>
      )}
      {Array.from({ length: BOARD_H }).map((_, y) => (
        <div key={y} className="cs-board-row" role="row">
          {Array.from({ length: BOARD_W }).map((_, x) => {
            const occ = participants.find(
              (p) => p.pos_x === x && p.pos_y === y && ((p.hp_current ?? 0) > 0 || parseDying(p.status).dying)
            );
            const reachable =
              canMoveNow && !occ && current != null && distance(current, { pos_x: x, pos_y: y }) <= MOVE_SPEED;
            const isCurrent = occ != null && occ.id === current?.id;
            return (
              <button
                key={x}
                role="gridcell"
                data-cell={`${x}-${y}`}
                className={`cs-cell ${reachable ? 'is-reach' : ''} ${occ ? 'has-token' : ''} ${isCurrent ? 'is-current' : ''}`}
                disabled={!reachable}
                onClick={() => moveTo(x, y)}
                aria-label={
                  occ ? `${occ.name}, casilla ${x + 1}, ${y + 1}` : reachable ? `Moverse a la casilla ${x + 1}, ${y + 1}` : `Casilla ${x + 1}, ${y + 1}`
                }
              >
                {occ && (
                  <Token
                    name={occ.name}
                    src={occ.is_player ? portraitMap[occ.character_id] : null}
                    enemy={!occ.is_player}
                    size="sm"
                    highlight={tokenHighlight(occ.name)}
                  />
                )}
              </button>
            );
          })}
        </div>
      ))}
      <p className="cs-hint cs-board-legend">
        {canMoveNow
          ? `Tocá una casilla dorada para moverte (hasta ${MOVE_SPEED} casillas). Después podés atacar si el enemigo está al lado.`
          : phase === 'awaiting_player' && !canActNow
            ? `Mapa: esperá tu turno. Hoy juega ${current?.name}.`
            : 'Mapa del combate. Los enemigos se acercan solos.'}
      </p>
    </div>
  );

  return (
    <div className="cs">
      <header className="cs-top">
        <div className="cs-top-title">
          <p className="cs-eyebrow">Combate en curso</p>
          <h1>Ronda {Math.max(1, combat?.round ?? 1)}</h1>
        </div>
        <div className="cs-top-actions">
          <SoundToggle />
          <button className="cs-btn cs-btn-ghost" onClick={leave} title="El combate queda guardado y lo podés retomar desde la escena">
            Pausar y volver
          </button>
        </div>
      </header>

      <p className="cs-hint-bar">
        Cada personaje juega en orden. Cuando juega un enemigo, el director narra lo que hace y toca “Continuar”.
      </p>

      {closeError && !outcome && (
        <p className="cs-error-bar" role="alert">
          {closeError}
        </p>
      )}

      <div className="cs-body">
        <section className="cs-stage" aria-live="polite">
          {!outcome && !aftermath && renderBoard()}

          {aftermath && (
            <div className={`cs-outcome ${aftermath.resultado === 'victory' ? 'cs-win' : 'cs-lose'}`}>
              <h2>{aftermath.resultado === 'victory' ? '¡Victoria!' : 'Derrota'}</h2>
              {aftermath.resultado === 'victory' ? (
                <p className="cs-reward">
                  Cada personaje gana <strong>{aftermath.xpEach} XP</strong>
                  {aftermath.xpTotal > 0 && <span> ({aftermath.xpTotal} XP en total)</span>}.
                </p>
              ) : (
                <p>El grupo cae ante sus enemigos. La historia sigue por otro camino.</p>
              )}
              {aftermath.resultado === 'victory' && aftermath.treasure.length > 0 && (
                <div className="cs-loot">
                  <h3>Botín de la escena</h3>
                  <p className="cs-hint">Repártanlo como quieran. Lo anotamos acá para que no se olvide.</p>
                  <ul>
                    {aftermath.treasure.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aftermath.levelUps.length > 0 && (
                <ul className="cs-levelups">
                  {aftermath.levelUps.map((l) => (
                    <li key={l.name}>
                      ¡<strong>{l.name}</strong> sube a nivel {l.level}! <span>+{l.hpGain} PV máximos</span>
                    </li>
                  ))}
                </ul>
              )}
              {aftermath.stabilized.length > 0 && (
                <p className="cs-hint">
                  {aftermath.stabilized.join(', ')} {aftermath.stabilized.length === 1 ? 'queda' : 'quedan'} con 1 PV: se estabiliza
                  {aftermath.stabilized.length === 1 ? '' : 'n'} después del golpe.
                </p>
              )}
              {aftermath.dead.length > 0 && (
                <p className="cs-dead" role="status">
                  Murió: <strong>{aftermath.dead.join(', ')}</strong>. Sin revivir, no vuelve a jugar esta campaña.
                </p>
              )}
              <p className="cs-hint">La vida de cada personaje quedó guardada. Pueden descansar desde la escena.</p>
              {aftermath.warning && <p className="cs-hint">{aftermath.warning}</p>}
              <button
                className="cs-btn cs-btn-primary"
                onClick={() => navigate(`/campaign/${campaignId}/play/${aftermath.playthroughId}`)}
              >
                Continuar la aventura →
              </button>
            </div>
          )}

          {!aftermath && outcome && (
            <div className={`cs-outcome ${outcome === 'victory' ? 'cs-win' : 'cs-lose'}`}>
              <h2>{outcome === 'victory' ? '¡Ganaron!' : 'El grupo cayó'}</h2>
              <p>
                {outcome === 'victory'
                  ? 'Ya no queda ningún enemigo en pie.'
                  : 'Todos los personajes están inconscientes.'}
              </p>
              {closeError && <p className="cs-hint" role="alert">{closeError}</p>}
              {isDirector ? (
                <button className="cs-btn cs-btn-primary" onClick={finish} disabled={closing}>
                  {closing ? 'Guardando…' : outcome === 'victory' ? 'Repartir recompensas' : 'Ver qué pasa'}
                </button>
              ) : (
                <p className="cs-hint cs-waiting">Esperá a que el director cierre el combate.</p>
              )}
            </div>
          )}

          {!outcome && lastRoll && phase === 'showing_roll' && (
            <div
              className={`cs-roll cs-roll-${
                lastRoll.critical ? 'crit' : lastRoll.fumble ? 'fumble' : lastRoll.hit ? 'hit' : 'miss'
              }`}
            >
              <p className="cs-roll-who">{lastRoll.actorName}</p>
              <RollingDie key={`${lastRoll.actorName}-${log.length}`} value={lastRoll.d20} />
              <p className="cs-roll-math">
                {lastRoll.d20} {lastRoll.bonus >= 0 ? '+' : '−'} {Math.abs(lastRoll.bonus)} ={' '}
                <strong>{lastRoll.total}</strong> contra la CA {lastRoll.targetAC}
              </p>
              <p className="cs-roll-verdict">
                {lastRoll.critical ? '¡Golpe crítico!' : lastRoll.fumble ? 'Pifia' : lastRoll.hit ? 'Acierta' : 'Falla'}
                {lastRoll.hit && ` · ${lastRoll.damage} de daño${lastRoll.dice ? ` (tirada de ${lastRoll.dice})` : ''}`}
              </p>
              <p className="cs-hint">{lastRoll.explanation}</p>
            </div>
          )}

          {!outcome && phase === 'awaiting_player' && (
            <div className="cs-turn">
              {current && (
                <Token name={current.name} src={portraitMap[current.character_id]} size="lg" />
              )}
              <p className="cs-eyebrow">Le toca a</p>
              <h2>{current?.name}</h2>
              <p className="cs-hint">
                {aliveEnemies.length === 1
                  ? `Queda 1 enemigo en pie: ${aliveEnemies[0].name}.`
                  : `Quedan ${aliveEnemies.length} enemigos en pie.`}
              </p>
            </div>
          )}

          {!outcome && phase === 'awaiting_dm_continue' && (
            <div className="cs-turn cs-turn-enemy">
              {current && <Token name={current.name} enemy size="lg" />}
              <p className="cs-eyebrow">Le toca al enemigo</p>
              <h2>{current?.name}</h2>
              <p className="cs-hint">Contá qué hace y después tocá “Continuar”.</p>
            </div>
          )}
        </section>

        <section className="cs-actions" aria-label="Qué puede hacer el personaje">
          {phase === 'awaiting_dm_continue' && !isDirector && (
            <p className="cs-hint cs-waiting">El director narra el turno del enemigo. Esperá a que avance.</p>
          )}

          {phase === 'awaiting_dm_continue' && isDirector && (
            <button className="cs-action cs-action-main" disabled={busy} onClick={runEnemyTurn}>
              <span className="cs-action-title">Continuar</span>
              <span className="cs-action-sub">El enemigo ataca a uno de los personajes</span>
            </button>
          )}

          {phase === 'showing_roll' && <p className="cs-hint">Resolviendo el turno…</p>}

          {phase === 'awaiting_player' && !canActNow && (
            <p className="cs-hint cs-waiting">
              Le toca a <strong>{current?.name}</strong>. Cuando sea tu turno, acá vas a ver lo que podés hacer.
            </p>
          )}

          {phase === 'awaiting_player' && canActNow && current && parseDying(current.status).dying && (
            <button className="cs-action cs-action-main cs-action-danger" disabled={busy} onClick={doDeathSave}>
              <span className="cs-action-title">Tirar contra la muerte</span>
              <span className="cs-action-sub">
                Está cayendo: {parseDying(current.status).successes} éxitos y {parseDying(current.status).failures} fallos.
                Con un 10 o más suma un éxito; tres éxitos lo estabilizan, tres fallos lo matan.
              </span>
            </button>
          )}

          {phase === 'awaiting_player' &&
            canActNow &&
            !pickingTarget &&
            !(current && parseDying(current.status).dying) &&
            (() => {
              const ability = getAbility(classMap[current?.character_id]);
              const abilitySpent = current?.ability_used;
              const noSpellSlots =
                SPELLCASTERS.has(classMap[current?.character_id]) &&
                spellSlotsMap[current?.character_id]?.['1'] === 0;
              return (
                <>
                  <button
                    className="cs-action cs-action-main"
                    disabled={busy}
                    onClick={() => (aliveEnemies.length === 1 ? doAttack(aliveEnemies[0]) : setPickingTarget('attack'))}
                  >
                    <span className="cs-action-title">Atacar</span>
                    <span className="cs-action-sub">
                      Tirá un d20 y sumá {current?.attack_bonus ?? 2}. Si acierta, hace {weaponLabel(current)} de daño.
                    </span>
                  </button>

                  <button className="cs-action" disabled={busy} onClick={doDefend}>
                    <span className="cs-action-title">Defenderse</span>
                    <span className="cs-action-sub">Hasta tu próximo turno, los ataques contra vos tienen desventaja.</span>
                  </button>

                  <button
                    className="cs-action"
                    disabled={busy || abilitySpent || noSpellSlots}
                    onClick={() => {
                      if (ability.kind !== 'attack') return doAbility();
                      return aliveEnemies.length === 1 ? doAbility(aliveEnemies[0]) : setPickingTarget('ability');
                    }}
                  >
                    <span className="cs-action-title">{ability.name}</span>
                    <span className="cs-action-sub">
                      {abilitySpent
                        ? 'Ya la usaste en este combate.'
                        : noSpellSlots
                          ? 'Sin espacios de conjuro de nivel 1 para usarla.'
                          : `Regla casera: ${ability.description}${SPELLCASTERS.has(classMap[current?.character_id]) && typeof spellSlotsMap[current?.character_id]?.['1'] === 'number' ? ` · gasta un espacio (quedan ${spellSlotsMap[current?.character_id]['1']})` : ''}`}
                    </span>
                  </button>

                  {current?.character_id && spellsOf(current.character_id).length > 0 && (
                    <button className="cs-action" disabled={busy} onClick={() => setSpellMenu((v) => !v)}>
                      <span className="cs-action-title">Lanzar conjuro</span>
                      <span className="cs-action-sub">
                        {spellMenu
                          ? 'Cerrá la lista.'
                          : `Tenés ${spellsOf(current.character_id).length} conjuros elegidos en la ficha.`}
                      </span>
                    </button>
                  )}

                  {current?.character_id && spellMenu && (
                    <ul className="cs-spell-list" aria-label="Conjuros">
                      {spellsOf(current.character_id).map((s) => {
                        const left = s.level > 0 ? spellSlotsMap[current.character_id]?.[String(s.level)] ?? 0 : null;
                        const noSlot = left !== null && left <= 0;
                        const mode = spellCombatProfile(s).mode;
                        const effect = mode === 'attack' ? 'ataque' : mode === 'heal' ? 'cura' : 'narrado';
                        return (
                          <li key={s.slug}>
                            <button className="cs-action" disabled={busy || noSlot} onClick={() => castSpell(s)}>
                              <span className="cs-action-title">{s.name}</span>
                              <span className="cs-action-sub">
                                {s.level === 0
                                  ? `Truco · ${effect}`
                                  : `Nivel ${s.level} · ${noSlot ? 'sin espacios' : `quedan ${left}`} · ${effect}`}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <button className="cs-action" disabled={busy} onClick={doFlee}>
                    <span className="cs-action-title">Huir</span>
                    <span className="cs-action-sub">Regla casera: tirá Destreza. Con 12 o más, escapa del combate.</span>
                  </button>

                  {current?.character_id && potionIndex(inventoryMap[current.character_id] ?? []) >= 0 && (
                    <button className="cs-action" disabled={busy || current.hp_current >= current.hp_max} onClick={doPotion}>
                      <span className="cs-action-title">Usar poción de curación</span>
                      <span className="cs-action-sub">
                        {current.hp_current >= current.hp_max
                          ? 'Ya tiene la vida completa.'
                          : 'Recupera 2d4 + 2 PV y gasta una del inventario.'}
                      </span>
                    </button>
                  )}
                </>
              );
            })()}

          {phase === 'awaiting_player' && pickingTarget && (
            <div className="cs-pick">
              <p className="cs-pick-title">¿A quién apuntás?</p>
              {aliveEnemies.map((e) => (
                <button
                  key={e.id}
                  className="cs-action cs-action-main"
                  onClick={() =>
                    pickingTarget === 'attack'
                      ? doAttack(e)
                      : pickingTarget === 'spell' && pickedSpell
                        ? doSpell(pickedSpell, e)
                        : doAbility(e)
                  }
                >
                  <span className="cs-action-title">{e.name}</span>
                  <span className="cs-action-sub">
                    {e.hp_current}/{e.hp_max} PV · CA {effectiveAC(e)}
                  </span>
                </button>
              ))}
              <button className="cs-btn cs-btn-ghost" onClick={() => setPickingTarget(null)}>
                Volver
              </button>
            </div>
          )}
        </section>

        <aside className="cs-side" aria-label="Estado del combate">
          <details className="cs-help">
            <summary>¿Qué significa cada dado?</summary>
            <ul>
              <li>
                <strong>d20</strong>: se tira para atacar, hacer pruebas, salvarse, la iniciativa y las tiradas de muerte.
                Le sumás tu bonificador. Si llega a la CA del enemigo (su defensa), acertás.
              </li>
              <li>
                <strong>Dados de daño</strong> (d8, d10…): salen del arma o conjuro. Solo se tiran si acertás.
              </li>
              <li>
                <strong>Ventaja / desventaja</strong>: tirás dos d20 y te quedás con el mayor (ventaja) o el menor (desventaja).
              </li>
              <li>
                <strong>Dados de golpe</strong>: en un descanso corto, cada uno cura tu tirada + Constitución.
              </li>
              <li>
                <strong>2d4 + 2</strong>: lo que cura una poción de curación.
              </li>
            </ul>
            <a href="/manual" target="_blank" rel="noreferrer">Ver el manual completo</a>
          </details>
          <section className="cs-panel">
            <h2>Tu grupo</h2>
            <ul className="cs-roster">{renderRoster(allies)}</ul>
          </section>
          <section className="cs-panel">
            <h2>Enemigos</h2>
            <ul className="cs-roster">{renderRoster(foes)}</ul>
          </section>
        </aside>
      </div>

      {log.length > 0 && (
        <details className="cs-log">
          <summary>Qué pasó en el combate ({log.length})</summary>
          <ol>
            {log
              .slice()
              .reverse()
              .map((l, i) => (
                <li key={i}>{l}</li>
              ))}
          </ol>
        </details>
      )}

      {animationQueue.map((anim) => (
        <CombatAnimation key={anim.id} type={anim.type} value={anim.value} x={anim.x} y={anim.y} />
      ))}
    </div>
  );
};
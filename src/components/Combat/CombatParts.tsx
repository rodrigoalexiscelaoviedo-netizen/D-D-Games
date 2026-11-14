// Piezas visuales y de texto del combate que no dependen del estado de la pelea.
import { useEffect, useState } from 'react';
import type { RollResult } from '../../lib/combat-engine';

/** Ficha de un personaje o enemigo: retrato si hay, si no, inicial y número. */
export const Token = ({
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
export const describeAttack = (
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
export const RollingDie = ({ value }: { value: number }) => {
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

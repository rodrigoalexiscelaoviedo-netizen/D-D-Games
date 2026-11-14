// Íconos propios de la app (trazo simple, color heredado con currentColor).
// Reemplazan a los emojis en las pantallas del juego para que se vean iguales en todos los sistemas.

import type { ReactElement } from 'react';

export type GameIconName = 'map' | 'shield' | 'paw' | 'scroll' | 'compass' | 'book' | 'pencil' | 'sword' | 'potion';

const PATHS: Record<GameIconName, ReactElement> = {
  map: (
    <>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  shield: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />,
  paw: (
    <>
      <circle cx="6.5" cy="10" r="1.8" />
      <circle cx="10" cy="6.5" r="1.8" />
      <circle cx="14" cy="6.5" r="1.8" />
      <circle cx="17.5" cy="10" r="1.8" />
      <path d="M8 17c0-2.6 1.8-4.6 4-4.6s4 2 4 4.6c0 1.6-1.4 2.4-4 2.4s-4-.8-4-2.4z" />
    </>
  ),
  scroll: (
    <>
      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M9 9h6M9 12h6M9 15h4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
      <path d="M6 19h13" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </>
  ),
  sword: (
    <>
      <path d="M14 4l6 6-8 8-6-6 8-8z" />
      <path d="M4 20l3-3M9 15l-3 3" />
    </>
  ),
  potion: (
    <>
      <path d="M9 3h6M10 3v4l-4 6v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5l-4-6V3" />
      <path d="M8 14h8" />
    </>
  ),
};

export const GameIcon = ({ name, size = 28 }: { name: GameIconName; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name]}
  </svg>
);

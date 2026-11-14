// Qué significa cada tipo de escena, en dos versiones: para quien dirige y para el jugador.

/** Para el DM: qué tiene que hacer en esta escena. */
export const SCENE_TYPE_HELP: Record<string, string> = {
  narracion: 'Narrás y se sigue a la siguiente escena. No hay elección ni dados.',
  decision: 'El grupo elige una de las opciones. Cada una lleva a una escena distinta.',
  tirada: 'Se resuelve con una prueba de dados. Marcá si lo lograron o no: cambia por cuál opción sigue la historia.',
  combate: 'Hay una pelea. Preparala, empezá el combate y, al final, elegí si el grupo ganó o perdió.',
  descanso: 'El grupo puede recuperarse con descanso corto o largo desde el panel del grupo.',
};

/** Para el jugador: qué le toca hacer. */
export const PLAYER_SCENE_HELP: Record<string, string> = {
  narracion: 'Leé lo que pasa. Después la historia sigue sola.',
  decision: 'Elijan entre las opciones. Cada una lleva a algo distinto.',
  tirada: 'Se resuelve con una tirada de dados. El DM dice si lo lograron.',
  combate: 'Hay una pelea. Cuando te toque, elegí una acción en el tablero.',
  descanso: 'El grupo puede recuperarse. El DM decide cuándo y cómo.',
};

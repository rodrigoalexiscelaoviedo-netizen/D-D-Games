// Subclases de 5e por clase, con el nivel en que se eligen.
// Fuente: Manual del Jugador (PHB) y Tasha's Cauldron of Everything (TCoE) para el Artificiero.
// Las descripciones son resúmenes propios para la app. Revisar contra los libros antes de publicar.

export interface SubclassOption {
  name: string;
  summary: string;
}

export interface SubclassSet {
  /** Nivel de personaje en que se elige la subclase (5e). */
  level: number;
  /** Nombre que usa 5e para esta elección (por ejemplo "Arquetipo marcial"). */
  label: string;
  options: SubclassOption[];
}

export const SUBCLASSES: Record<string, SubclassSet> = {
  Guerrero: {
    level: 3,
    label: 'Arquetipo marcial',
    options: [
      { name: 'Campeón', summary: 'Crítico más frecuente y resistencia física que mejora con el nivel.' },
      { name: 'Maestro de batalla', summary: 'Usa maniobras con dados de superioridad para controlar el combate.' },
      { name: 'Caballero místico', summary: 'Combina el combate con conjuros de abjuración y evocación.' },
    ],
  },
  Bárbaro: {
    level: 3,
    label: 'Senda primaria',
    options: [
      { name: 'Senda del Berserker', summary: 'Furia salvaje: ataques extra mientras dura la furia.' },
      { name: 'Senda del Guerrero Totémico', summary: 'Gana resistencias y poderes de animales totémicos.' },
    ],
  },
  Pícaro: {
    level: 3,
    label: 'Arquetipo de pícaro',
    options: [
      { name: 'Ladrón', summary: 'Mejora la agilidad: usa la acción adicional para esconderse o correr.' },
      { name: 'Asesino', summary: 'Especialista en emboscadas: daño extra contra criaturas que no actuaron.' },
      { name: 'Embaucador arcano', summary: 'Suma conjuros de ilusión y encantamiento al sigilo.' },
    ],
  },
  Explorador: {
    level: 3,
    label: 'Arquetipo de explorador',
    options: [
      { name: 'Cazador', summary: 'Elige una táctica para cazar enemigos poderosos.' },
      { name: 'Señor de las bestias', summary: 'Un compañero animal que pelea con vos.' },
    ],
  },
  Monje: {
    level: 3,
    label: 'Tradición monástica',
    options: [
      { name: 'Camino de la Mano Abierta', summary: 'Maniobras de combate sin armas que empujan o derriban.' },
      { name: 'Camino de la Sombra', summary: 'Magia de sombras y movimiento entre penumbras.' },
      { name: 'Camino de los Cuatro Elementos', summary: 'Conjuros de elementos usando el ki.' },
    ],
  },
  Paladín: {
    level: 3,
    label: 'Juramento sagrado',
    options: [
      { name: 'Juramento de Devoción', summary: 'Defiende la justicia y la honra con magia sagrada.' },
      { name: 'Juramento de los Antiguos', summary: 'Protege la luz y la vida contra la oscuridad.' },
      { name: 'Juramento de Venganza', summary: 'Persigue a quien ha hecho daño con implacable castigo.' },
    ],
  },
  Mago: {
    level: 2,
    label: 'Escuela de magia',
    options: [
      { name: 'Abjuración', summary: 'Protecciones y barreras mágicas.' },
      { name: 'Adivinación', summary: 'Ver el futuro y prever el peligro.' },
      { name: 'Conjuración', summary: 'Invocar criaturas y transportar cosas.' },
      { name: 'Encantamiento', summary: 'Influir en la mente de otros.' },
      { name: 'Evocación', summary: 'Daño mágico poderoso y controlado.' },
      { name: 'Ilusionismo', summary: 'Crear imágenes y engañar los sentidos.' },
      { name: 'Nigromancia', summary: 'Manipular la vida y la muerte.' },
      { name: 'Transmutación', summary: 'Cambiar la forma y las propiedades de las cosas.' },
    ],
  },
  Hechicero: {
    level: 1,
    label: 'Origen de hechicería',
    options: [
      { name: 'Linaje dracónico', summary: 'Sangre de dragón: más puntos de vida y resistencia a un elemento.' },
      { name: 'Magia salvaje', summary: 'Efectos impredecibles que a veces ayudan y a veces no.' },
    ],
  },
  Brujo: {
    level: 1,
    label: 'Patrón',
    options: [
      { name: 'Patrón feérico', summary: 'Pacto con seres feéricos: engaño y movimiento.' },
      { name: 'Patrón infernal', summary: 'Pacto con diablos: fuego y resistencia al daño.' },
      { name: 'Patrón del Gran Antiguo', summary: 'Pacto con seres cósmicos: poderes de mente.' },
    ],
  },
  Bardo: {
    level: 3,
    label: 'Colegio',
    options: [
      { name: 'Colegio del Conocimiento', summary: 'Acumula saberes y habilidades de todo tipo.' },
      { name: 'Colegio del Valor', summary: 'Inspira a los aliados y los protege en combate.' },
    ],
  },
  Clérigo: {
    level: 1,
    label: 'Dominio divino',
    options: [
      { name: 'Dominio del Conocimiento', summary: 'Sabiduría divina y conjuros de adivinación.' },
      { name: 'Dominio de la Vida', summary: 'Curación poderosa y protección de los aliados.' },
      { name: 'Dominio de la Luz', summary: 'Luz que daña a los enemigos y sana a los aliados.' },
      { name: 'Dominio de la Naturaleza', summary: 'Poder sobre animales y plantas.' },
      { name: 'Dominio de la Tempestad', summary: 'Rayos, truenos y viento.' },
      { name: 'Dominio del Engaño', summary: 'Ilusiones y engaños sobre los enemigos.' },
      { name: 'Dominio de la Guerra', summary: 'Ataques potenciados y prioridad en la pelea.' },
    ],
  },
  Druida: {
    level: 2,
    label: 'Círculo druídico',
    options: [
      { name: 'Círculo de la Tierra', summary: 'Conjuros según el terreno donde está el druida.' },
      { name: 'Círculo de la Luna', summary: 'Se transforma en bestias más fuertes en combate.' },
    ],
  },
  Artificiero: {
    level: 3,
    label: 'Especialista',
    options: [
      { name: 'Alquimista', summary: 'Pociones y efectos químicos que curan o dañan.' },
      { name: 'Artillero', summary: 'Cañones de energía y daño a distancia.' },
      { name: 'Armero', summary: 'Armaduras que se transforman en armas.' },
      { name: 'Autómata de batalla', summary: 'Un autómata que acompaña y protege.' },
    ],
  },
};

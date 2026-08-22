interface GuidelineStep {
  title: string;
  description: string;
  tips: string[];
  nextStep?: string;
}

const GUIDANCE_MAP: Record<string, Record<number, GuidelineStep>> = {
  campaign_setup: {
    1: {
      title: "Sistema de reglas",
      description: "¿A qué van a jugar? Si el grupo es nuevo, D&D 5e es la mejor entrada.",
      tips: [
        "D&D 5e: el más popular, reglas claras, ideal para nuevos",
        "Pathfinder 2e: más profundo y táctico, curva más alta",
        "Fate: narrativo, sin grid ni tácticas de mapa",
      ],
      nextStep: "Info básica de la campaña",
    },
    2: {
      title: "Info de la campaña",
      description: "Ponele nombre y elegí el estilo de juego que querés.",
      tips: [
        "Nombre corto y memorable funciona mejor",
        "Táctico: más combate y mapa",
        "Narrativo: más interpretación y menos dados",
        "Equilibrado: lo mejor de ambos (recomendado)",
      ],
      nextStep: "Tono de la partida",
    },
    3: {
      title: "Tono de la partida",
      description: "¿Qué clima querés en la mesa? Esto ayuda a setear expectativas.",
      tips: [
        "Heroico: aventura clásica, los PJs son héroes",
        "Oscuro: decisiones difíciles, mundo hostil",
        "Cómico: liviano, para reírse en la mesa",
      ],
      nextStep: "Confirmar y crear",
    },
    4: {
      title: "Todo listo",
      description: "Revisá que esté todo bien y creá la campaña.",
      tips: [
        "Podés cambiar todo esto después desde la campaña",
        "El siguiente paso será crear personajes",
      ],
      nextStep: "¡A crear personajes!",
    },
  },
  character_creation: {
    1: {
      title: "Lo esencial",
      description: "Con un nombre alcanza para empezar. El resto lo podés completar cuando quieras.",
      tips: [
        "Solo el nombre es obligatorio — todo lo demás es opcional",
        "Podés guardar ahora y seguir editando después",
        "¿Quién juega este personaje? Elegí 'Yo' si lo llevás vos",
      ],
      nextStep: "Atributos y combate",
    },
    2: {
      title: "Atributos",
      description: "Cargá el número (ej. 16) y la app calcula el modificador (+3) sola.",
      tips: [
        "Los 6 atributos van de 1 a 20 normalmente",
        "El modificador se calcula solo: (score - 10) / 2",
        "Si no los sabés, dejalos en 10 (modificador +0) y seguí",
      ],
      nextStep: "Competencias y detalles",
    },
    3: {
      title: "Competencias y magia",
      description: "Todo opcional. Cuanto más completes, mejores consejos vas a tener en combate.",
      tips: [
        "Marcá las habilidades en las que el personaje es competente",
        "Si es lanzador, cargá sus hechizos y espacios",
        "El inventario te ayuda a no olvidarte objetos en la partida",
      ],
      nextStep: "Revisar y guardar",
    },
    4: {
      title: "Listo para la aventura",
      description: "Revisá y guardá. Podés volver a editar todo cuando quieras.",
      tips: [
        "Nada es definitivo: editás la ficha desde la lista de personajes",
        "El personaje ya queda disponible para las sesiones",
      ],
      nextStep: "¡A jugar!",
    },
  },
};

export const Guidebook = ({
  context,
  step,
}: {
  context: string;
  step: number;
}) => {
  const guidance = GUIDANCE_MAP[context]?.[step];
  if (!guidance) return null;

  return (
    <aside className="guidebook">
      <div className="step-counter">Paso {step} de 4</div>
      <h2>{guidance.title}</h2>
      <p className="guidebook-description">{guidance.description}</p>

      <div className="guidebook-tips">
        {guidance.tips.map((tip, i) => (
          <div key={i} className="guidebook-tip">💡 {tip}</div>
        ))}
      </div>

      {guidance.nextStep && (
        <div className="guidebook-next">Próximo: {guidance.nextStep}</div>
      )}
    </aside>
  );
};

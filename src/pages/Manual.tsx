import { Link } from 'react-router-dom';
import './manual.css';

// Manual de la app: explica cómo se juega, qué significa cada dado y cada pantalla.
// Las reglas siguen 5e (SRD). Donde la app usa una regla casera, se aclara.

export const Manual = () => (
  <div className="manual">
    <header className="manual-head">
      <Link to="/dashboard" className="manual-back">← Volver al inicio</Link>
      <h1>Manual del juego</h1>
      <p className="manual-lead">
        Todo lo que necesitás para jugar: cómo armar un personaje, qué hace cada dado y cómo se resuelve un combate.
        Si algo no está claro, este es el lugar para buscarlo.
      </p>
      <nav className="manual-index" aria-label="Contenido">
        <a href="#roles">Roles</a>
        <a href="#dados">Los dados</a>
        <a href="#personaje">Crear personaje</a>
        <a href="#combate">Combate</a>
        <a href="#conjuros">Conjuros</a>
        <a href="#descanso">Descanso y vida</a>
        <a href="#aventuras">Aventuras y escenas</a>
      </nav>
    </header>

    <section id="roles" className="manual-section">
      <h2>Roles: DM y jugador</h2>
      <ul>
        <li>
          <strong>DM (director de juego):</strong> narra, controla al mundo y a los enemigos, y decide qué pasa
          cuando el grupo elige una opción. Ve las notas secretas de la escena.
        </li>
        <li>
          <strong>Jugador:</strong> controla un personaje. En combate, cuando le toca, elige una acción. Ve la
          "Vista de jugadores" y su ficha.
        </li>
      </ul>
    </section>

    <section id="dados" className="manual-section">
      <h2>Los dados</h2>
      <p>
        Casi todo se resuelve con <strong>un d20</strong> (dado de 20 caras) más un bonificador. Los demás dados
        sirven para medir cuánto daño hace o cuánta vida recupera algo.
      </p>
      <dl className="manual-dl">
        <dt>d20 (la tirada principal)</dt>
        <dd>
          Se tira para atacar, hacer pruebas de habilidad, salvarse, la iniciativa y las tiradas de muerte.
          Se suma el bonificador de la acción. Para atacar: si el total llega a la <strong>CA</strong> del enemigo
          (su defensa), acierta. Un 20 natural siempre acierta y es crítico; un 1 natural siempre falla.
        </dd>
        <dt>Dados de daño (d4, d6, d8, d10, d12)</dt>
        <dd>
          Salen del arma o del conjuro. Solo se tiran cuando un ataque acierta. Un crítico tira el doble de dados.
          Un golpe que acierta hace al menos 1 de daño.
        </dd>
        <dt>Ventaja y desventaja</dt>
        <dd>
          Con <strong>ventaja</strong> tirás dos d20 y te quedás con el mayor. Con <strong>desventaja</strong>, con el
          menor. No se suman.
        </dd>
        <dt>Dados de golpe (d6 a d12, según la clase)</dt>
        <dd>
          Se gastan en un <strong>descanso corto</strong> para curarse. Cada dado da lo que sale más tu Constitución.
          En un descanso largo vuelve la mitad.
        </dd>
        <dt>2d4 + 2 (poción de curación)</dt>
        <dd>Lo que recupera una poción de curación. Se tiran dos d4 y se suman 2.</dd>
        <dt>Tiradas de muerte (d20)</dt>
        <dd>
          Cuando un personaje cae a 0 PV, en cada turno tira un d20: 10 o más es un éxito, 9 o menos un fallo. Tres
          éxitos lo estabilizan; tres fallos lo matan.
        </dd>
      </dl>
    </section>

    <section id="personaje" className="manual-section">
      <h2>Crear un personaje</h2>
      <ol>
        <li>
          <strong>Identidad:</strong> nombre, quién lo juega, clase (define cómo pelea) y raza (da bonificadores a los
          atributos). Podés guardar ahora y completar después.
        </li>
        <li>
          <strong>Atributos y combate:</strong> Fuerza, Destreza, Constitución, Inteligencia, Sabiduría y Carisma.
          El modificador es (valor − 10) ÷ 2, redondeado hacia abajo: 10 da +0, 14 da +2, 8 da −1. Se suma en las
          tiradas de esa característica. También cargás nivel, CA (qué tan difícil es acertarle), PV y velocidad.
        </li>
        <li>
          <strong>Habilidades, equipo y conjuros:</strong> marcá en qué es bueno (suma el bonificador de competencia),
          escribí los objetos (una poción de curación se puede usar en combate) y elegí los conjuros si tu clase
          los tiene.
        </li>
        <li>
          <strong>Revisar:</strong> mirá el resumen y guardá. Los cambios se pueden editar más tarde.
        </li>
      </ol>
      <p className="manual-note">
        El <strong>bonificador de competencia</strong> sube con el nivel (+2 al principio, +3 en el nivel 5, +4 en el 9…).
      </p>
    </section>

    <section id="combate" className="manual-section">
      <h2>Combate</h2>
      <p>
        El combate tiene rondas. Cada personaje juega en orden de iniciativa (d20 + Destreza). Cuando te toca, podés
        moverte hasta 6 casillas y después elegir <strong>una acción</strong>:
      </p>
      <ul className="manual-actions">
        <li><strong>Atacar:</strong> tirás d20 + bonificador. Si acierta, tirás el dado de daño del arma. Cuerpo a cuerpo necesitás estar al lado.</li>
        <li><strong>Defenderse:</strong> hasta tu próximo turno, los ataques contra vos tienen desventaja.</li>
        <li><strong>Lanzar conjuro:</strong> usa un conjuro que elegiste en la ficha. Ver la sección de conjuros.</li>
        <li><strong>Habilidad de clase:</strong> la acción especial de tu clase (regla de la casa). Se usa una vez por combate.</li>
        <li><strong>Usar poción de curación:</strong> recupera 2d4 + 2 PV y gasta una del inventario.</li>
        <li><strong>Huir:</strong> tirás Destreza contra 12. Si lo lográs, escapás del combate.</li>
      </ul>
      <p className="manual-note">
        En el panel del combate hay una guía con los dados. Los enemigos se acercan solos y actúan cuando el DM toca
        "Continuar".
      </p>
    </section>

    <section id="conjuros" className="manual-section">
      <h2>Conjuros</h2>
      <p>
        Los conjuros vienen del SRD (la lista abierta de 5e). Sus nombres y descripciones están en inglés por ahora.
      </p>
      <ul>
        <li><strong>Trucos (Truco):</strong> no gastan espacios.</li>
        <li><strong>Conjuros de nivel 1 o más:</strong> gastan un espacio de su nivel cada vez que se lanzan. Los espacios
          dependen del nivel del personaje y se recuperan con un descanso largo.</li>
        <li><strong>Ataque:</strong> tira ataque de conjuro y daño.</li>
        <li><strong>Curación:</strong> recupera PV a quien lo lanza.</li>
        <li><strong>Narrado:</strong> el efecto lo narra el DM. Es el caso de conjuros que piden tirada de salvación.</li>
      </ul>
    </section>

    <section id="descanso" className="manual-section">
      <h2>Descanso y vida</h2>
      <ul>
        <li><strong>Descanso corto (una hora):</strong> cada personaje gasta dados de golpe para curarse.</li>
        <li><strong>Descanso largo (una noche):</strong> recupera toda la vida, todos los espacios de conjuro y la mitad de los dados de golpe.</li>
        <li><strong>Experiencia:</strong> al ganar un combate, el grupo reparte la XP del enemigo. Al llegar al umbral sube de nivel: gana vida y espacios de conjuro.</li>
      </ul>
    </section>

    <section id="aventuras" className="manual-section">
      <h2>Aventuras y escenas</h2>
      <p>Una aventura es una serie de escenas. Cada escena es de uno de estos tipos:</p>
      <dl className="manual-dl">
        <dt>Narración</dt><dd>El DM lee o cuenta algo y se sigue.</dd>
        <dt>Decisión</dt><dd>El grupo elige entre opciones; cada una lleva a una escena distinta.</dd>
        <dt>Tirada</dt><dd>Una prueba de habilidad. Si sale bien o mal, la historia cambia.</dd>
        <dt>Combate</dt><dd>Una pelea. Si el grupo gana o pierde, la historia sigue por la opción que corresponda.</dd>
        <dt>Descanso</dt><dd>El grupo descansa y puede recuperarse.</dd>
      </dl>
    </section>

    <footer className="manual-foot">
      <p>Las reglas siguen 5e (SRD). Donde la app tiene una regla propia, está marcada como "regla de la casa".</p>
    </footer>
  </div>
);

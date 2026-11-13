import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Guidebook } from '../Layout/Guidebook';
import { fmtMod, applyRacialBonuses, getRacialBonuses } from '../../lib/dnd';
import { CLASS_STAT_ARRAYS, SKILLS_5E } from '../../lib/d5e-data';
import { AVATAR_STYLES, getAvatarUrl } from '../../lib/avatar-styles';
import type { Character } from '../../lib/types';
import './character-form.css';

const EMPTY: Partial<Character> = {
  character_name: '', player_name: '', appearance: 'human-warrior', race: '', character_class: '', subclass: '',
  background: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  level: 1, xp: 0, armor_class: 10, hp_current: 10, hp_max: 10, speed: 30,
  initiative_bonus: 0, proficiency_bonus: 2, inspiration: false,
  skill_proficiencies: [], conditions: [], inventory: [], spells: [],
  spell_slots: {}, languages: [], notes: '',
};

const STEPS = [
  { title: 'Identidad', hint: 'Nombre, aspecto y origen.' },
  { title: 'Atributos', hint: 'Fuerza, velocidad, vida y armadura.' },
  { title: 'Equipo', hint: 'Habilidades, objetos y hechizos.' },
  { title: 'Revisar', hint: 'Confirmá antes de guardar.' },
];

const STAT_FIELDS: Array<{ key: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'; name: string; abbr: string }> = [
  { key: 'str', name: 'Fuerza', abbr: 'FUE' },
  { key: 'dex', name: 'Destreza', abbr: 'DES' },
  { key: 'con', name: 'Constitución', abbr: 'CON' },
  { key: 'int', name: 'Inteligencia', abbr: 'INT' },
  { key: 'wis', name: 'Sabiduría', abbr: 'SAB' },
  { key: 'cha', name: 'Carisma', abbr: 'CAR' },
];

const RACES = ['Humano', 'Elfo', 'Enano', 'Halfling', 'Tiefling', 'Orco', 'Dracónido', 'Gnomo', 'Semiélfico'];
const CLASSES = ['Guerrero', 'Mago', 'Clérigo', 'Pícaro', 'Brujo', 'Bárbaro', 'Paladín', 'Artificiero', 'Bardo', 'Explorador', 'Monje', 'Hechicero'];

export const CharacterForm = () => {
  const navigate = useNavigate();
  const { campaignId, characterId } = useParams();
  const isEdit = !!characterId;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [whoPlays, setWhoPlays] = useState<'me' | 'other'>('me');
  const [d, setD] = useState<Partial<Character>>(EMPTY);
  const [campaignSystem, setCampaignSystem] = useState<string>('dnd5e');

  useEffect(() => {
    (async () => {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('system')
        .eq('id', campaignId)
        .single();
      if (campaign?.system) {
        setCampaignSystem(campaign.system);
      }

      if (!isEdit) return;
      const { data, error: err } = await supabase
        .from('characters').select('*').eq('id', characterId).single();
      if (!err && data) {
        setD(data);
        setWhoPlays(data.player_user_id ? 'me' : 'other');
      }
    })();
  }, [campaignId, characterId, isEdit]);

  const set = (patch: Partial<Character>) => setD((p) => ({ ...p, ...patch }));

  const handleRaceChange = (newRace: string) => {
    const oldStats = { str: d.str, dex: d.dex, con: d.con, int: d.int, wis: d.wis, cha: d.cha };
    const newStats = applyRacialBonuses(newRace, oldStats);
    set({ race: newRace, ...newStats });
  };

  const handleSuggestStats = (className: string) => {
    const suggestion = CLASS_STAT_ARRAYS.find(c => c.class === className);
    if (!suggestion) return;
    const baseFromSuggestion = {
      str: suggestion.str, dex: suggestion.dex, con: suggestion.con,
      int: suggestion.int, wis: suggestion.wis, cha: suggestion.cha,
    };
    const withRacialBonus = d.race ? applyRacialBonuses(d.race, baseFromSuggestion) : baseFromSuggestion;
    set(withRacialBonus);
  };

  const toggleInArray = (key: keyof Character, value: string) => {
    const arr = (d[key] as string[]) || [];
    set({ [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] } as Partial<Character>);
  };

  const handleSave = async () => {
    setError('');
    if (!d.character_name?.trim()) {
      setError('Falta el nombre del personaje. Ponelo en el paso 1.');
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const payload: Record<string, any> = {
        campaign_id: campaignId,
        character_name: d.character_name.trim(),
        system: campaignSystem,
      };
      if (whoPlays === 'me' && userData.user?.id) {
        payload.player_user_id = userData.user.id;
      }
      if (d.player_name) payload.player_name = d.player_name;
      if (d.appearance) payload.appearance = d.appearance;
      if (d.race) payload.race = d.race;
      if (d.character_class) payload.character_class = d.character_class;
      if (d.subclass) payload.subclass = d.subclass;
      if (d.background) payload.background = d.background;
      if (d.str != null) payload.str = d.str;
      if (d.dex != null) payload.dex = d.dex;
      if (d.con != null) payload.con = d.con;
      if (d.int != null) payload.int = d.int;
      if (d.wis != null) payload.wis = d.wis;
      if (d.cha != null) payload.cha = d.cha;
      if (d.proficiency_bonus != null) payload.proficiency_bonus = d.proficiency_bonus;
      if (d.armor_class != null) payload.armor_class = d.armor_class;
      if (d.initiative_bonus != null) payload.initiative_bonus = d.initiative_bonus;
      if (d.speed != null) payload.speed = d.speed;
      if (d.level != null) payload.level = d.level;
      if (d.xp != null) payload.xp = d.xp;
      if (d.hp_current != null) payload.hp_current = d.hp_current;
      if (d.hp_max != null) payload.hp_max = d.hp_max;
      if (d.spell_slots) payload.spell_slots = d.spell_slots;
      if (d.skill_proficiencies?.length) payload.skill_proficiencies = d.skill_proficiencies;
      if (d.resistances?.length) payload.resistances = d.resistances;
      if (d.immunities?.length) payload.immunities = d.immunities;
      if (d.vulnerabilities?.length) payload.vulnerabilities = d.vulnerabilities;
      if (d.languages?.length) payload.languages = d.languages;
      if (d.tools_proficiency?.length) payload.tools_proficiency = d.tools_proficiency;
      if (d.senses?.length) payload.senses = d.senses;
      if (d.personality_traits) payload.personality_traits = d.personality_traits;
      if (d.inventory?.length) payload.inventory = d.inventory;
      if (d.spells?.length) payload.spells = d.spells;
      if (d.conditions?.length) payload.conditions = d.conditions;
      if (d.inspiration != null) payload.inspiration = d.inspiration;
      if (d.notes) payload.notes = d.notes;
      if (d.milestone) payload.milestone = d.milestone;

      let resErr;
      if (isEdit) {
        const { error } = await supabase.from('characters').update(payload).eq('id', characterId);
        resErr = error;
      } else {
        const { error } = await supabase.from('characters').insert(payload);
        resErr = error;
      }
      if (resErr) {
        throw resErr;
      }
      navigate(`/campaign/${campaignId}/characters`);
    } catch (err) {
      setError(err instanceof Error ? `No se pudo guardar. ${err.message}` : 'No se pudo guardar. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Funciones que devuelven JSX (no componentes): así el input no se desmonta al escribir.
  const renderNumber = (label: string, hint: string | undefined, k: keyof Character) => (
    <label className="cf-field" key={k as string}>
      <span className="cf-label">{label}</span>
      <input
        type="number"
        className="cf-input"
        value={(d[k] as number | undefined) ?? ''}
        onChange={(e) => set({ [k]: e.target.value === '' ? undefined : Number(e.target.value) } as Partial<Character>)}
      />
      {hint && <span className="cf-hint">{hint}</span>}
    </label>
  );

  const renderStat = (name: string, abbr: string, k: keyof Character) => {
    const value = d[k] as number | undefined;
    return (
      <div className="cf-stat" key={k as string}>
        <label className="cf-stat-name" htmlFor={`stat-${k}`}>
          {name} <span className="cf-abbr">({abbr})</span>
        </label>
        <input
          id={`stat-${k}`}
          type="number"
          className="cf-input cf-stat-input"
          min={1}
          max={30}
          value={value ?? ''}
          onChange={(e) => set({ [k]: e.target.value === '' ? undefined : Number(e.target.value) } as Partial<Character>)}
        />
        <span className="cf-mod">Modificador {fmtMod(value as number)}</span>
      </div>
    );
  };

  const canSave = !!d.character_name?.trim() && !saving;
  const isLast = step === STEPS.length;

  return (
    <div className="cf">
      <header className="cf-top">
        <button className="cf-back" onClick={() => navigate(`/campaign/${campaignId}/characters`)} disabled={saving}>
          ← Volver a personajes
        </button>
        <div>
          <p className="cf-eyebrow">{isEdit ? 'Editar personaje' : 'Nuevo personaje'}</p>
          <h1>{d.character_name?.trim() || 'Sin nombre todavía'}</h1>
        </div>
      </header>

      <nav className="cf-steps" aria-label="Pasos para crear el personaje">
        <ol>
          {STEPS.map((s, i) => {
            const n = i + 1;
            const active = n === step;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  className={`cf-step ${active ? 'is-active' : ''} ${n < step ? 'is-done' : ''}`}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => setStep(n)}
                >
                  <span className="cf-step-num">{n < step ? '✓' : n}</span>
                  <span className="cf-step-text">
                    <strong>{s.title}</strong>
                    <span>{s.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="cf-body">
        <main className="cf-main">
          {step === 1 && (
            <section className="cf-card" aria-labelledby="cf-s1">
              <h2 id="cf-s1">Identidad del personaje</h2>

              <label className="cf-field">
                <span className="cf-label">Nombre del personaje <span className="cf-required">(obligatorio)</span></span>
                <input
                  className="cf-input"
                  placeholder="Ej: Lyra Vance"
                  value={d.character_name || ''}
                  onChange={(e) => set({ character_name: e.target.value })}
                />
              </label>

              <fieldset className="cf-fieldset">
                <legend className="cf-label">¿Quién juega este personaje?</legend>
                <div className="cf-choice-row">
                  <label className={`cf-choice ${whoPlays === 'me' ? 'is-on' : ''}`}>
                    <input type="radio" name="who" checked={whoPlays === 'me'} onChange={() => setWhoPlays('me')} />
                    <span>
                      <strong>Lo juego yo</strong>
                      <span className="cf-hint">Aparece como tuyo en la campaña.</span>
                    </span>
                  </label>
                  <label className={`cf-choice ${whoPlays === 'other' ? 'is-on' : ''}`}>
                    <input type="radio" name="who" checked={whoPlays === 'other'} onChange={() => setWhoPlays('other')} />
                    <span>
                      <strong>Lo juega otra persona</strong>
                      <span className="cf-hint">Podés anotar su nombre.</span>
                    </span>
                  </label>
                </div>
                {whoPlays === 'other' && (
                  <input
                    className="cf-input"
                    placeholder="Nombre de quien lo juega (opcional)"
                    value={d.player_name || ''}
                    onChange={(e) => set({ player_name: e.target.value })}
                  />
                )}
              </fieldset>

              <fieldset className="cf-fieldset">
                <legend className="cf-label">¿Cómo se ve?</legend>
                <div className="cf-avatars">
                  {AVATAR_STYLES.map((style) => {
                    const on = d.appearance === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        className={`cf-avatar ${on ? 'is-on' : ''}`}
                        aria-pressed={on}
                        onClick={() => set({ appearance: style.id })}
                      >
                        <img src={getAvatarUrl(style.seed)} alt="" className="cf-avatar-img" />
                        <span>{style.name}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="cf-grid">
                <label className="cf-field">
                  <span className="cf-label">Raza <span className="cf-optional">(opcional)</span></span>
                  <select className="cf-input" value={d.race || ''} onChange={(e) => handleRaceChange(e.target.value)}>
                    <option value="">Elegir raza</option>
                    {RACES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <span className="cf-hint">Le da bonificadores a sus atributos.</span>
                </label>

                <label className="cf-field">
                  <span className="cf-label">Clase <span className="cf-optional">(opcional)</span></span>
                  <select className="cf-input" value={d.character_class || ''} onChange={(e) => set({ character_class: e.target.value })}>
                    <option value="">Elegir clase</option>
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="cf-hint">Define cómo pelea y qué sabe hacer.</span>
                </label>

                <label className="cf-field">
                  <span className="cf-label">Subclase <span className="cf-optional">(opcional)</span></span>
                  <input className="cf-input" value={d.subclass || ''} onChange={(e) => set({ subclass: e.target.value })} />
                </label>

                <label className="cf-field">
                  <span className="cf-label">Trasfondo <span className="cf-optional">(opcional)</span></span>
                  <input className="cf-input" placeholder="Ej: Soldado, Erudito" value={d.background || ''} onChange={(e) => set({ background: e.target.value })} />
                </label>
              </div>

              {d.race && (
                <p className="cf-note">
                  <strong>Bonificadores de {d.race}:</strong> {getRacialBonuses(d.race)?.description}
                </p>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="cf-card" aria-labelledby="cf-s2">
              <h2 id="cf-s2">Atributos y combate</h2>

              {d.character_class && (
                <div className="cf-suggest">
                  <p className="cf-hint">Si no sabés qué valores poner, te sugerimos valores típicos para {d.character_class}. Después podés cambiarlos.</p>
                  <button type="button" className="cf-btn cf-btn-ghost" onClick={() => handleSuggestStats(d.character_class!)}>
                    Usar valores sugeridos para {d.character_class}
                  </button>
                </div>
              )}

              <p className="cf-note">
                Cada atributo va de 1 a 20 (o más). El <strong>modificador</strong> es lo que se suma en las tiradas:
                se calcula restando 10, dividiendo por 2 y redondeando hacia abajo.
              </p>

              <div className="cf-stats">
                {STAT_FIELDS.map((s) => renderStat(s.name, s.abbr, s.key))}
              </div>

              <div className="cf-grid">
                {renderNumber('Nivel', 'Sube al ganar experiencia.', 'level')}
                {renderNumber('Armadura (CA)', 'Cuánto cuesta acertarle al personaje.', 'armor_class')}
                {renderNumber('Vida actual', 'Puntos de golpe (PG) ahora mismo.', 'hp_current')}
                {renderNumber('Vida máxima', 'El tope de puntos de golpe.', 'hp_max')}
                {renderNumber('Velocidad (en pies)', 'Cuánto se mueve por turno.', 'speed')}
                {renderNumber('Bonificador de competencia', 'Sube con el nivel. Se suma a lo que sabe hacer.', 'proficiency_bonus')}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="cf-card" aria-labelledby="cf-s3">
              <h2 id="cf-s3">Habilidades, equipo y magia</h2>

              <fieldset className="cf-fieldset">
                <legend className="cf-label">¿En qué es bueno?</legend>
                <p className="cf-hint">Tocá las habilidades en las que el personaje está entrenado.</p>
                <div className="cf-chips">
                  {SKILLS_5E.map((s) => {
                    const on = (d.skill_proficiencies || []).includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`cf-chip ${on ? 'is-on' : ''}`}
                        aria-pressed={on}
                        onClick={() => toggleInArray('skill_proficiencies', s)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="cf-field">
                <span className="cf-label">Idiomas</span>
                <input
                  className="cf-input"
                  placeholder="Ej: Común, Élfico"
                  value={(d.languages || []).join(', ')}
                  onChange={(e) => set({ languages: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })}
                />
                <span className="cf-hint">Separalos con coma.</span>
              </label>

              <label className="cf-field">
                <span className="cf-label">Equipo</span>
                <textarea
                  className="cf-input cf-textarea"
                  rows={4}
                  placeholder={'Espada larga\nPoción de curación x2\nCuerda (15 m)'}
                  value={(d.inventory || []).map(i => i.name).join('\n')}
                  onChange={(e) => set({ inventory: e.target.value.split('\n').map(x => x.trim()).filter(Boolean).map(name => ({ name })) })}
                />
                <span className="cf-hint">Un objeto por línea.</span>
              </label>

              <label className="cf-field">
                <span className="cf-label">Hechizos</span>
                <textarea
                  className="cf-input cf-textarea"
                  rows={4}
                  placeholder={'Proyectil mágico\nCurar heridas\nEscudo'}
                  value={(d.spells || []).map(s => s.name).join('\n')}
                  onChange={(e) => set({ spells: e.target.value.split('\n').map(x => x.trim()).filter(Boolean).map(name => ({ name })) })}
                />
                <span className="cf-hint">Uno por línea. Dejalo vacío si no lanza hechizos.</span>
              </label>

              <label className="cf-field">
                <span className="cf-label">Personalidad y notas</span>
                <textarea
                  className="cf-input cf-textarea"
                  rows={3}
                  placeholder="Cómo habla, qué le importa, qué le da miedo..."
                  value={d.notes || ''}
                  onChange={(e) => set({ notes: e.target.value })}
                />
              </label>
            </section>
          )}

          {step === 4 && (
            <section className="cf-card" aria-labelledby="cf-s4">
              <h2 id="cf-s4">Revisá antes de guardar</h2>
              <div className="cf-review">
                {d.appearance && (
                  <img
                    src={getAvatarUrl(AVATAR_STYLES.find(s => s.id === d.appearance)?.seed || 'default')}
                    alt=""
                    className="cf-review-img"
                  />
                )}
                <div>
                  <p className="cf-review-name">{d.character_name?.trim() || '(sin nombre)'}</p>
                  <p className="cf-hint">
                    {[d.race, d.character_class, d.subclass].filter(Boolean).join(' · ') || 'Sin raza ni clase todavía'}
                  </p>
                </div>
              </div>
              <ul className="cf-review-list">
                <li>Nivel {d.level ?? '—'}</li>
                <li>Armadura (CA) {d.armor_class ?? '—'}</li>
                <li>Vida {d.hp_current ?? '—'} de {d.hp_max ?? '—'}</li>
                <li>Velocidad {d.speed ?? '—'} pies</li>
                <li>{(d.skill_proficiencies || []).length} habilidades · {(d.inventory || []).length} objetos · {(d.spells || []).length} hechizos</li>
              </ul>
              <p className="cf-note">
                Fuerza {fmtMod(d.str)} · Destreza {fmtMod(d.dex)} · Constitución {fmtMod(d.con)} · Inteligencia {fmtMod(d.int)} · Sabiduría {fmtMod(d.wis)} · Carisma {fmtMod(d.cha)}
              </p>
            </section>
          )}

          {error && <p className="cf-error" role="alert">{error}</p>}

          <footer className="cf-footer">
            <button
              type="button"
              className="cf-btn cf-btn-ghost"
              onClick={() => (step > 1 ? setStep(step - 1) : navigate(`/campaign/${campaignId}/characters`))}
              disabled={saving}
            >
              {step > 1 ? '← Anterior' : 'Cancelar'}
            </button>

            {isLast ? (
              <button type="button" className="cf-btn cf-btn-primary" onClick={handleSave} disabled={!canSave}>
                {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear personaje'}
              </button>
            ) : (
              <button type="button" className="cf-btn cf-btn-primary" onClick={() => setStep(step + 1)}>
                Siguiente →
              </button>
            )}
          </footer>
        </main>

        <Guidebook context="character_creation" step={step} />
      </div>
    </div>
  );
};

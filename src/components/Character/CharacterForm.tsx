import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Guidebook } from '../Layout/Guidebook';
import { Step } from '../Shared/Step';
import { fmtMod, applyRacialBonuses, getRacialBonuses } from '../../lib/dnd';
import { CLASS_STAT_ARRAYS, SKILLS_5E } from '../../lib/d5e-data';
import { AVATAR_STYLES, getAvatarUrl } from '../../lib/avatar-styles';
import type { Character } from '../../lib/types';

const EMPTY: Partial<Character> = {
  character_name: '', player_name: '', appearance: 'human-warrior', race: '', character_class: '', subclass: '',
  background: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  level: 1, xp: 0, armor_class: 10, hp_current: 10, hp_max: 10, speed: 30,
  initiative_bonus: 0, proficiency_bonus: 2, inspiration: false,
  skill_proficiencies: [], conditions: [], inventory: [], spells: [],
  spell_slots: {}, languages: [], notes: '',
};

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
    console.log('handleSave called, character_name:', d.character_name);
    setError('');
    if (!d.character_name?.trim()) {
      setError('El personaje necesita al menos un nombre');
      setStep(1);
      return;
    }
    setSaving(true);
    console.log('About to insert character:', d.character_name);
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

      console.log('Payload:', payload);

      let resErr;
      if (isEdit) {
        const { error } = await supabase.from('characters').update(payload).eq('id', characterId);
        resErr = error;
      } else {
        const { error } = await supabase.from('characters').insert(payload);
        resErr = error;
      }
      if (resErr) {
        console.log('Error detail:', resErr);
        throw resErr;
      }
      navigate(`/campaign/${campaignId}/characters`);
    } catch (err) {
      console.log('Catch error:', err);
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const StatInput = ({ label, k }: { label: string; k: keyof Character }) => (
    <div className="stat-box">
      <label>{label}</label>
      <input type="number" className="stat-input" min="1" max="20"
        value={(d[k] as number) ?? ''}
        onChange={(e) => set({ [k]: e.target.value === '' ? undefined : Number(e.target.value) } as Partial<Character>)} />
      <span className="stat-mod">{fmtMod(d[k] as number)}</span>
    </div>
  );

  const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <span title={text} className="tooltip">{children}</span>
  );


  return (
    <div className="wizard-container">
      <div className="wizard-main">
        {step === 1 && (
          <Step title={isEdit ? "Editar: Lo esencial" : "Paso 1: Lo esencial"}>
            <input className="input-field" placeholder="Nombre del personaje *"
              value={d.character_name || ''} onChange={(e) => set({ character_name: e.target.value })} />

            <label className="field-label">¿Quién juega este personaje?</label>
            <label className="radio-row">
              <input type="radio" checked={whoPlays === 'me'} onChange={() => setWhoPlays('me')} />
              Yo lo juego
            </label>
            <label className="radio-row">
              <input type="radio" checked={whoPlays === 'other'} onChange={() => setWhoPlays('other')} />
              Otro jugador
            </label>
            {whoPlays === 'other' && (
              <input className="input-field" placeholder="Nombre del jugador (opcional)"
                value={d.player_name || ''} onChange={(e) => set({ player_name: e.target.value })} />
            )}

            <label className="field-label">¿Cómo querés que se vea?</label>
            <div className="avatar-grid">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  className={`avatar-btn ${d.appearance === style.id ? 'avatar-selected' : ''}`}
                  onClick={() => set({ appearance: style.id })}
                >
                  <img
                    src={getAvatarUrl(style.seed)}
                    alt={style.name}
                    className="avatar-img"
                  />
                  <span className="avatar-label">{style.name}</span>
                </button>
              ))}
            </div>

            <div className="grid-2">
              <label className="field-label">
                <Tooltip text="Tu origen. Otorga bonificadores. Ej: Elfo +2 DES">
                  Raza (opcional)
                </Tooltip>
                <select className="input-field"
                  value={d.race || ''} onChange={(e) => handleRaceChange(e.target.value)}>
                  <option value="">Elegir raza</option>
                  {['Humano', 'Elfo', 'Enano', 'Halfling', 'Tiefling', 'Orco', 'Dracónido', 'Gnomo', 'Semiélfico'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                <Tooltip text="Tu rol en combate. Ej: Mago lanza hechizos, Guerrero ataca">
                  Clase (opcional)
                </Tooltip>
                <select className="input-field"
                  value={d.character_class || ''} onChange={(e) => set({ character_class: e.target.value })}>
                  <option value="">Elegir clase</option>
                  {['Guerrero', 'Mago', 'Clérigo', 'Pícaro', 'Brujo', 'Bárbaro', 'Paladín', 'Artificiero', 'Bardo', 'Explorador', 'Monje', 'Hechicero'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <input className="input-field" placeholder="Subclase (opcional)"
                value={d.subclass || ''} onChange={(e) => set({ subclass: e.target.value })} />
              <input className="input-field" placeholder="Trasfondo (opcional)"
                value={d.background || ''} onChange={(e) => set({ background: e.target.value })} />
            </div>

            {d.race && (
              <p className="bonus-info">
                <strong>Bonificadores de {d.race}:</strong> {getRacialBonuses(d.race)?.description}
              </p>
            )}
          </Step>
        )}

        {step === 2 && (
          <Step title="Paso 2: Atributos y combate">
            {d.character_class && (
              <button type="button" className="btn-secondary" style={{ marginBottom: '1rem' }}
                onClick={() => handleSuggestStats(d.character_class!)}>
                💡 Sugerir stats para {d.character_class}
              </button>
            )}

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#b3a488' }}>
              Atributos (modif. racial ya aplicado)
            </label>
            <div className="stats-row">
              <StatInput label="FUE" k="str" /><StatInput label="DES" k="dex" />
              <StatInput label="CON" k="con" /><StatInput label="INT" k="int" />
              <StatInput label="SAB" k="wis" /><StatInput label="CAR" k="cha" />
            </div>

            <div className="grid-2">
              <label className="field-label">Nivel
                <input type="number" className="input-field" value={d.level ?? ''} onChange={(e) => set({ level: Number(e.target.value) })} /></label>
              <label className="field-label">CA (Clase de Armadura)
                <input type="number" className="input-field" value={d.armor_class ?? ''} onChange={(e) => set({ armor_class: Number(e.target.value) })} /></label>
              <label className="field-label">PV actuales
                <input type="number" className="input-field" value={d.hp_current ?? ''} onChange={(e) => set({ hp_current: Number(e.target.value) })} /></label>
              <label className="field-label">PV máximos
                <input type="number" className="input-field" value={d.hp_max ?? ''} onChange={(e) => set({ hp_max: Number(e.target.value) })} /></label>
              <label className="field-label">Velocidad (pies)
                <input type="number" className="input-field" value={d.speed ?? ''} onChange={(e) => set({ speed: Number(e.target.value) })} /></label>
              <label className="field-label">Bonif. competencia
                <input type="number" className="input-field" value={d.proficiency_bonus ?? ''} onChange={(e) => set({ proficiency_bonus: Number(e.target.value) })} /></label>
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title="Paso 3: Competencias, magia e inventario">
            <label className="field-label">Habilidades competentes</label>
            <div className="chip-grid">
              {SKILLS_5E.map((s) => (
                <button key={s} type="button"
                  className={`chip ${(d.skill_proficiencies || []).includes(s) ? 'chip-on' : ''}`}
                  onClick={() => toggleInArray('skill_proficiencies', s)}>{s}</button>
              ))}
            </div>

            <label className="field-label">Idiomas (separados por coma)</label>
            <input className="input-field" placeholder="Común, Élfico, Enano..."
              value={(d.languages || []).join(', ')}
              onChange={(e) => set({ languages: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} />

            <label className="field-label">Inventario (un objeto por línea)</label>
            <textarea className="input-field" rows={4} placeholder="Espada larga&#10;Poción de curación x2&#10;Cuerda (50 pies)"
              value={(d.inventory || []).map(i => i.name).join('\n')}
              onChange={(e) => set({ inventory: e.target.value.split('\n').map(x => x.trim()).filter(Boolean).map(name => ({ name })) })} />

            <label className="field-label">Hechizos (uno por línea)</label>
            <textarea className="input-field" rows={4} placeholder="Proyectil mágico&#10;Curar heridas&#10;Escudo"
              value={(d.spells || []).map(s => s.name).join('\n')}
              onChange={(e) => set({ spells: e.target.value.split('\n').map(x => x.trim()).filter(Boolean).map(name => ({ name })) })} />

            <label className="field-label">Rasgos de personalidad / notas</label>
            <textarea className="input-field" rows={3} placeholder="Personalidad, ideales, vínculos, defectos..."
              value={d.notes || ''} onChange={(e) => set({ notes: e.target.value })} />
          </Step>
        )}

        {step === 4 && (
          <Step title="Paso 4: Revisar y guardar">
            <div className="summary">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                {d.appearance && (
                  <img
                    src={getAvatarUrl(AVATAR_STYLES.find(s => s.id === d.appearance)?.seed || 'default')}
                    alt="Tu personaje"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      border: '2px solid var(--gold)',
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '1.25rem' }}><strong>{d.character_name || '(sin nombre)'}</strong></p>
                  <p style={{ margin: '0.25rem 0', color: '#b3a488' }}>
                    {[d.race, d.character_class, d.subclass].filter(Boolean).join(' · ') || 'Sin clase/raza'}
                  </p>
                </div>
              </div>
              <p>Nivel {d.level ?? '—'} · CA {d.armor_class ?? '—'} · PV {d.hp_current ?? '—'}/{d.hp_max ?? '—'}</p>
              <p>FUE {fmtMod(d.str)} DES {fmtMod(d.dex)} CON {fmtMod(d.con)} INT {fmtMod(d.int)} SAB {fmtMod(d.wis)} CAR {fmtMod(d.cha)}</p>
              <p>{(d.skill_proficiencies || []).length} competencias · {(d.inventory || []).length} objetos · {(d.spells || []).length} hechizos</p>
            </div>
          </Step>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="wizard-buttons">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(`/campaign/${campaignId}/characters`)} disabled={saving} className="btn-secondary">
            {step > 1 ? '← Atrás' : 'Cancelar'}
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={handleSave} disabled={saving || !d.character_name?.trim()}>
              {saving ? 'Guardando...' : 'Guardar ya'}
            </button>
            {step < 4
              ? <button className="btn-primary" onClick={() => setStep(step + 1)}>Siguiente →</button>
              : <button className="btn-primary" onClick={handleSave} disabled={saving || !d.character_name?.trim()}>
                  {saving ? 'Guardando...' : (isEdit ? 'Guardar cambios' : '¡Crear!')}
                </button>}
          </div>
        </div>
      </div>

      <Guidebook context="character_creation" step={step} />
    </div>
  );
};

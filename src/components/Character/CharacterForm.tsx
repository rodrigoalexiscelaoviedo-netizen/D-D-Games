import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Guidebook } from '../Layout/Guidebook';
import { Step } from '../Shared/Step';
import { fmtMod, SKILLS_5E } from '../../lib/dnd';
import type { Character } from '../../lib/types';

const EMPTY: Partial<Character> = {
  character_name: '',
  player_name: '',
  race: '',
  class: '',
  subclass: '',
  background: '',
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
  level: 1,
  xp: 0,
  armor_class: 10,
  hp_current: 10,
  hp_max: 10,
  speed: 30,
  initiative_bonus: 0,
  proficiency_bonus: 2,
  inspiration: false,
  skill_proficiencies: [],
  conditions: [],
  inventory: [],
  spells: [],
  spell_slots: {},
  languages: [],
  notes: '',
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

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single();
      if (data) {
        setD(data);
        setWhoPlays(data.player_user_id ? 'me' : 'other');
      }
    })();
  }, [characterId, isEdit]);

  const set = (patch: Partial<Character>) =>
    setD((p) => ({ ...p, ...patch }));

  const toggleInArray = (key: keyof Character, value: string) => {
    const arr = (d[key] as string[]) || [];
    set({
      [key]: arr.includes(value)
        ? arr.filter((x) => x !== value)
        : [...arr, value],
    } as Partial<Character>);
  };

  const handleSave = async () => {
    setError('');
    if (!d.character_name?.trim()) {
      setError('El personaje necesita al menos un nombre');
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const payload: any = {
        ...d,
        campaign_id: campaignId,
        character_name: d.character_name.trim(),
        player_user_id: whoPlays === 'me' ? userData.user?.id : null,
      };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.system;

      if (isEdit) {
        const { error: err } = await supabase
          .from('characters')
          .update(payload)
          .eq('id', characterId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('characters')
          .insert(payload);
        if (err) throw err;
      }
      navigate(`/campaign/${campaignId}/characters`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const StatInput = ({ label, k }: { label: string; k: keyof Character }) => (
    <div className="stat-box">
      <label>{label}</label>
      <input
        type="number"
        className="stat-input"
        value={(d[k] as number) ?? ''}
        onChange={(e) =>
          set({
            [k]:
              e.target.value === '' ? undefined : Number(e.target.value),
          } as Partial<Character>)
        }
      />
      <span className="stat-mod">{fmtMod(d[k] as number)}</span>
    </div>
  );

  return (
    <div className="wizard-container">
      <div className="wizard-main">
        {step === 1 && (
          <Step title={isEdit ? 'Editar: lo esencial' : 'Paso 1: Lo esencial'}>
            <input
              className="input-field"
              placeholder="Nombre del personaje *"
              value={d.character_name || ''}
              onChange={(e) => set({ character_name: e.target.value })}
            />

            <label className="field-label">¿Quién juega este personaje?</label>
            <label className="radio-row">
              <input
                type="radio"
                checked={whoPlays === 'me'}
                onChange={() => setWhoPlays('me')}
              />
              Yo lo juego
            </label>
            <label className="radio-row">
              <input
                type="radio"
                checked={whoPlays === 'other'}
                onChange={() => setWhoPlays('other')}
              />
              Otro jugador
            </label>
            {whoPlays === 'other' && (
              <input
                className="input-field"
                placeholder="Nombre del jugador (opcional)"
                value={d.player_name || ''}
                onChange={(e) => set({ player_name: e.target.value })}
              />
            )}

            <div className="grid-2">
              <input
                className="input-field"
                placeholder="Raza (opcional)"
                value={d.race || ''}
                onChange={(e) => set({ race: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Clase (opcional)"
                value={d.class || ''}
                onChange={(e) => set({ class: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Subclase (opcional)"
                value={d.subclass || ''}
                onChange={(e) => set({ subclass: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Trasfondo (opcional)"
                value={d.background || ''}
                onChange={(e) => set({ background: e.target.value })}
              />
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title="Paso 2: Atributos y combate">
            <div className="stats-row">
              <StatInput label="FUE" k="str" />
              <StatInput label="DES" k="dex" />
              <StatInput label="CON" k="con" />
              <StatInput label="INT" k="int" />
              <StatInput label="SAB" k="wis" />
              <StatInput label="CAR" k="cha" />
            </div>
            <div className="grid-2">
              <label className="field-label">
                Nivel
                <input
                  type="number"
                  className="input-field"
                  value={d.level ?? ''}
                  onChange={(e) => set({ level: Number(e.target.value) })}
                />
              </label>
              <label className="field-label">
                CA (Clase de Armadura)
                <input
                  type="number"
                  className="input-field"
                  value={d.armor_class ?? ''}
                  onChange={(e) => set({ armor_class: Number(e.target.value) })}
                />
              </label>
              <label className="field-label">
                PV actuales
                <input
                  type="number"
                  className="input-field"
                  value={d.hp_current ?? ''}
                  onChange={(e) => set({ hp_current: Number(e.target.value) })}
                />
              </label>
              <label className="field-label">
                PV máximos
                <input
                  type="number"
                  className="input-field"
                  value={d.hp_max ?? ''}
                  onChange={(e) => set({ hp_max: Number(e.target.value) })}
                />
              </label>
              <label className="field-label">
                Velocidad (pies)
                <input
                  type="number"
                  className="input-field"
                  value={d.speed ?? ''}
                  onChange={(e) => set({ speed: Number(e.target.value) })}
                />
              </label>
              <label className="field-label">
                Bonif. competencia
                <input
                  type="number"
                  className="input-field"
                  value={d.proficiency_bonus ?? ''}
                  onChange={(e) =>
                    set({ proficiency_bonus: Number(e.target.value) })
                  }
                />
              </label>
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title="Paso 3: Competencias, magia e inventario">
            <label className="field-label">Habilidades competentes</label>
            <div className="chip-grid">
              {SKILLS_5E.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${
                    (d.skill_proficiencies || []).includes(s) ? 'chip-on' : ''
                  }`}
                  onClick={() => toggleInArray('skill_proficiencies', s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <label className="field-label">
              Idiomas (separados por coma)
            </label>
            <input
              className="input-field"
              placeholder="Común, Élfico, Enano..."
              value={(d.languages || []).join(', ')}
              onChange={(e) =>
                set({
                  languages: e.target.value
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            />

            <label className="field-label">Inventario (un objeto por línea)</label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Espada larga&#10;Poción de curación x2&#10;Cuerda (50 pies)"
              value={(d.inventory || []).map((i) => i.name).join('\n')}
              onChange={(e) =>
                set({
                  inventory: e.target.value
                    .split('\n')
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .map((name) => ({ name })),
                })
              }
            />

            <label className="field-label">Hechizos (uno por línea)</label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Proyectil mágico&#10;Curar heridas&#10;Escudo"
              value={(d.spells || []).map((s) => s.name).join('\n')}
              onChange={(e) =>
                set({
                  spells: e.target.value
                    .split('\n')
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .map((name) => ({ name })),
                })
              }
            />

            <label className="field-label">Rasgos de personalidad / notas</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Personalidad, ideales, vínculos, defectos..."
              value={d.notes || ''}
              onChange={(e) => set({ notes: e.target.value })}
            />
          </Step>
        )}

        {step === 4 && (
          <Step title="Paso 4: Revisar y guardar">
            <div className="summary">
              <p>
                <strong>{d.character_name || '(sin nombre)'}</strong>
              </p>
              <p>
                {[d.race, d.class, d.subclass]
                  .filter(Boolean)
                  .join(' · ') || 'Sin clase/raza'}
              </p>
              <p>
                Nivel {d.level ?? '—'} · CA {d.armor_class ?? '—'} · PV{' '}
                {d.hp_current ?? '—'}/{d.hp_max ?? '—'}
              </p>
              <p>
                FUE {fmtMod(d.str)} DES {fmtMod(d.dex)} CON {fmtMod(d.con)} INT{' '}
                {fmtMod(d.int)} SAB {fmtMod(d.wis)} CAR {fmtMod(d.cha)}
              </p>
              <p>
                {(d.skill_proficiencies || []).length} competencias ·{' '}
                {(d.inventory || []).length} objetos ·{' '}
                {(d.spells || []).length} hechizos
              </p>
            </div>
          </Step>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="wizard-buttons">
          <button
            className="btn-secondary"
            onClick={() =>
              step > 1
                ? setStep(step - 1)
                : navigate(`/campaign/${campaignId}/characters`)
            }
            disabled={saving}
          >
            {step > 1 ? '← Atrás' : 'Cancelar'}
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-secondary"
              onClick={handleSave}
              disabled={saving || !d.character_name?.trim()}
            >
              {saving ? 'Guardando...' : 'Guardar ya'}
            </button>
            {step < 4 ? (
              <button
                className="btn-primary"
                onClick={() => setStep(step + 1)}
              >
                Siguiente →
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? 'Guardando...'
                  : isEdit
                    ? 'Guardar cambios'
                    : '¡Crear!'}
              </button>
            )}
          </div>
        </div>
      </div>

      <Guidebook context="character_creation" step={step} />
    </div>
  );
};

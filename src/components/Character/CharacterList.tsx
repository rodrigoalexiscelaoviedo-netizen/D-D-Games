import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fmtMod } from '../../lib/dnd';
import { AVATAR_STYLES, getAvatarUrl } from '../../lib/avatar-styles';
import { PREMADE_HEROES, type PremadeHero } from '../../content/premade-heroes';
import './characters.css';

const mod = (score: number) => fmtMod(score);

// Abreviaturas de atributos en español (como en 5e en castellano).
const ABILITY_ABBR: Record<string, string> = { str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };

export const CharacterList = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [chars, setChars] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data: campData } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();
    setCampaign(campData);
    const { data: charData } = await supabase.from('characters')
      .select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true });
    setChars(charData || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [campaignId]);

  const doDelete = async (id: string) => {
    const { error: err } = await supabase.from('characters').delete().eq('id', id);
    if (err) return setError(`No se pudo borrar: ${err.message}`);
    setConfirmDelete(null);
    setChars((prev) => prev.filter((c) => c.id !== id));
  };

  const addHero = async (hero: PremadeHero) => {
    setAdding(hero.id);
    setError(null);
    const { error: err } = await supabase.from('characters').insert({
      campaign_id: campaignId,
      system: campaign?.system ?? 'dnd5e',
      character_name: hero.name,
      race: hero.race,
      character_class: hero.class,
      background: hero.background,
      level: 1,
      str: hero.str, dex: hero.dex, con: hero.con, int: hero.int, wis: hero.wis, cha: hero.cha,
      armor_class: hero.armor_class,
      hp_max: hero.hp,
      hp_current: hero.hp,
      speed: hero.speed,
      portrait_url: hero.portrait,
    });
    setAdding(null);
    if (err) return setError(`No se pudo añadir a ${hero.name}: ${err.message}`);
    setPicking(false);
    void load();
  };

  const avatarFor = (appearanceId?: string): string | null => {
    const style = AVATAR_STYLES.find((s) => s.id === appearanceId);
    return style ? getAvatarUrl(style.seed) : null;
  };

  if (loading) return <div className="page-pad">Cargando personajes…</div>;

  return (
    <div className="characters">
      <header className="characters-hero">
        <button className="btn-ghost" onClick={() => navigate(`/campaign/${campaignId}`)}>
          ← {campaign?.name || 'Campaña'}
        </button>
        <div>
          <p className="eyebrow">Tu grupo</p>
          <h1>Personajes</h1>
        </div>
        <div className="characters-actions">
          <button className="btn-ghost" onClick={() => setPicking(true)}>Elegir héroe precargado</button>
          <button className="btn-primary" onClick={() => navigate(`/campaign/${campaignId}/characters/new`)}>
            + Crear personaje
          </button>
        </div>
      </header>

      {error && <div className="notice-error" role="alert">{error}</div>}

      {chars.length === 0 ? (
        <section className="characters-empty">
          <p className="empty-title">Todavía no hay personajes en la campaña</p>
          <p>Podés crear el tuyo desde cero o empezar con uno de los héroes listos para jugar.</p>
          <button className="btn-primary" onClick={() => setPicking(true)}>Ver héroes precargados</button>
        </section>
      ) : (
        <ul className="char-grid">
          {chars.map((c) => {
            const portrait = c.portrait_url || avatarFor(c.appearance);
            return (
              <li key={c.id} className="char-card">
                <div className="char-portrait">
                  {portrait ? <img src={portrait} alt="" /> : <span className="char-initial">{c.character_name?.[0] ?? '?'}</span>}
                </div>
                <div className="char-body" onClick={() => navigate(`/campaign/${campaignId}/characters/${c.id}/edit`)}>
                  <h3>{c.character_name}</h3>
                  <p className="char-kind">
                    {[c.race, c.character_class].filter(Boolean).join(' · ') || 'Sin clase'} · Nivel {c.level ?? 1}
                  </p>
                  <div className="char-core">
                    <span>CA <strong>{c.armor_class ?? '—'}</strong></span>
                    <span>PV <strong>{c.hp_current ?? '—'}/{c.hp_max ?? '—'}</strong></span>
                  </div>
                  <div className="char-abilities">
                    {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((k) => (
                      <span key={k}><small>{ABILITY_ABBR[k] ?? k.toUpperCase()}</small>{mod(c[k])}</span>
                    ))}
                  </div>
                </div>
                <div className="char-actions">
                  <button className="btn-ghost" onClick={() => navigate(`/campaign/${campaignId}/characters/${c.id}/edit`)}>Editar</button>
                  {confirmDelete === c.id ? (
                    <>
                      <button className="btn-danger" onClick={() => doDelete(c.id)}>Confirmar</button>
                      <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>No</button>
                    </>
                  ) : (
                    <button className="btn-ghost danger" onClick={() => setConfirmDelete(c.id)}>Borrar</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {picking && (
        <div className="sheet-backdrop" onClick={() => setPicking(false)}>
          <section className="picker" onClick={(e) => e.stopPropagation()} aria-label="Héroes precargados">
            <header className="picker-head">
              <div>
                <p className="eyebrow">Listos para jugar</p>
                <h2>Elegí un héroe</h2>
              </div>
              <button className="btn-ghost" onClick={() => setPicking(false)}>Cerrar</button>
            </header>
            <ul className="hero-grid">
              {PREMADE_HEROES.map((h) => (
                <li key={h.id} className="hero-card">
                  <img src={h.portrait} alt="" />
                  <div className="hero-body">
                    <h3>{h.name}</h3>
                    <p className="char-kind">{h.race} · {h.class} · {h.background}</p>
                    <p className="hero-blurb">{h.blurb}</p>
                    <p className="char-core">
                      <span>CA <strong>{h.armor_class}</strong></span>
                      <span>PV <strong>{h.hp}</strong></span>
                      <span>Vel. <strong>{h.speed}</strong></span>
                    </p>
                    <button className="btn-primary" disabled={adding !== null} onClick={() => addHero(h)}>
                      {adding === h.id ? 'Añadiendo…' : 'Añadir a la campaña'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

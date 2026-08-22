import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Guidebook } from '../Layout/Guidebook';
import { Step } from '../Shared/Step';

export const CampaignWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    name: '',
    system: 'dnd5e',
    playstyle: 'balanced',
    tone: 'heroic',
  });

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleFinish = async () => {
    setError('');
    if (!data.name.trim()) {
      setError('Ponele un nombre a la campaña');
      setStep(2);
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No hay sesión activa');

      const { data: campaign, error: dbError } = await supabase
        .from('campaigns')
        .insert({
          user_id: userData.user.id,
          name: data.name.trim(),
          system: data.system,
          playstyle: data.playstyle,
          tone: data.tone,
          status: 'active',
        })
        .select()
        .single();

      if (dbError) throw dbError;
      navigate(`/campaign/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la campaña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wizard-container">
      <div className="wizard-main">
        {step === 1 && (
          <Step title="Paso 1: ¿A qué juegan?">
            {[
              { v: 'dnd5e', label: 'D&D 5e (recomendado)' },
              { v: 'pathfinder2e', label: 'Pathfinder 2e' },
              { v: 'fate', label: 'Fate' },
              { v: 'other', label: 'Otro' },
            ].map((opt) => (
              <label key={opt.v} className="radio-row">
                <input
                  type="radio"
                  value={opt.v}
                  checked={data.system === opt.v}
                  onChange={(e) => setData({ ...data, system: e.target.value })}
                />
                {opt.label}
              </label>
            ))}
          </Step>
        )}

        {step === 2 && (
          <Step title="Paso 2: Info de la campaña">
            <input
              type="text"
              placeholder="Nombre de la campaña"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="input-field"
            />
            <label className="field-label">Estilo de juego</label>
            <select
              value={data.playstyle}
              onChange={(e) => setData({ ...data, playstyle: e.target.value })}
              className="input-field"
            >
              <option value="tactical">Táctico (más combate)</option>
              <option value="narrative">Narrativo (más interpretación)</option>
              <option value="balanced">Equilibrado (recomendado)</option>
            </select>
          </Step>
        )}

        {step === 3 && (
          <Step title="Paso 3: Tono de la partida">
            {[
              { v: 'heroic', label: 'Heroico' },
              { v: 'dark', label: 'Oscuro' },
              { v: 'comedic', label: 'Cómico' },
            ].map((opt) => (
              <label key={opt.v} className="radio-row">
                <input
                  type="radio"
                  value={opt.v}
                  checked={data.tone === opt.v}
                  onChange={(e) => setData({ ...data, tone: e.target.value })}
                />
                {opt.label}
              </label>
            ))}
          </Step>
        )}

        {step === 4 && (
          <Step title="Paso 4: Confirmación">
            <div className="summary">
              <p><strong>Campaña:</strong> {data.name || '(sin nombre)'}</p>
              <p><strong>Sistema:</strong> {data.system}</p>
              <p><strong>Estilo:</strong> {data.playstyle}</p>
              <p><strong>Tono:</strong> {data.tone}</p>
            </div>
          </Step>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="wizard-buttons">
          <button onClick={handleBack} disabled={step === 1 || saving} className="btn-secondary">
            ← Atrás
          </button>
          {step < 4 ? (
            <button onClick={handleNext} className="btn-primary">Siguiente →</button>
          ) : (
            <button onClick={handleFinish} disabled={saving} className="btn-primary">
              {saving ? 'Creando...' : '¡Empezar!'}
            </button>
          )}
        </div>
      </div>

      <Guidebook context="campaign_setup" step={step} />
    </div>
  );
};

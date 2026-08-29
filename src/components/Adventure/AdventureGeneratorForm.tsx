import { memo, useState } from 'react';
import { generateAdventureWithGemini } from '../../lib/adventure-generator';
import type { Scene, SceneOption } from '../../lib/adventure-types';

interface Props {
  onGenerated: (scenes: Scene[], options: SceneOption[]) => void;
  onCancel: () => void;
}

export const AdventureGeneratorForm = memo(({ onGenerated, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    level: 1,
    numScenes: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { scenes, sceneOptions } = await generateAdventureWithGemini(
        formData.title,
        formData.synopsis,
        formData.level,
        formData.numScenes
      );
      onGenerated(scenes, sceneOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate adventure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>✨ Generar Aventura con IA</h2>
      <p className="form-help">Describe tu aventura y Gemini generará escenas y opciones</p>

      <form onSubmit={handleGenerate}>
        <div className="form-group">
          <label>Título de la Aventura</label>
          <input
            type="text"
            placeholder="ej: The Lost Temple"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Sinopsis</label>
          <textarea
            placeholder="Describe la trama, objetivos y contexto..."
            value={formData.synopsis}
            onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
            rows={4}
            maxLength={500}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nivel sugerido</label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Número de escenas</label>
            <input
              type="number"
              min="3"
              max="15"
              value={formData.numScenes}
              onChange={(e) => setFormData({ ...formData, numScenes: parseInt(e.target.value) })}
            />
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Generando...' : '✨ Generar Aventura'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>

      <style>{`
        .form-container {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .form-container h2 {
          margin-bottom: 0.5rem;
          color: #111;
        }

        .form-help {
          color: #6b7280;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .error-msg {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .form-actions button {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #7c3aed;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #6d28d9;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #d1d5db;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
});

AdventureGeneratorForm.displayName = 'AdventureGeneratorForm';

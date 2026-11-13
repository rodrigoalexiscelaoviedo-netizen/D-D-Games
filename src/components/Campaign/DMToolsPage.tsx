import { memo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NPCGallery } from './NPCGallery';
import { LocationGallery } from './LocationGallery';
import './dm-tools.css';

type Tab = 'npcs' | 'locations';

export const DMToolsPage = memo(() => {
  const [activeTab, setActiveTab] = useState<Tab>('npcs');
  const navigate = useNavigate();
  const { campaignId } = useParams();

  return (
    <div className="dmt">
      <header className="dmt-top">
        <button className="dmt-back" onClick={() => navigate(`/campaign/${campaignId}`)}>
          ← Volver a la campaña
        </button>
        <p className="dmt-eyebrow">Preparar la sesión</p>
        <h1>Personajes y lugares de tu mundo</h1>
        <p className="dmt-lede">
          Acá guardás a los personajes secundarios (los que maneja el DM) y los lugares donde pasa la historia.
          Preparar esto antes de cada sesión hace que sea más fácil improvisar durante el juego.
        </p>
      </header>

      <nav className="dmt-tabs" aria-label="Qué querés preparar">
        <button
          className={`dmt-tab ${activeTab === 'npcs' ? 'is-active' : ''}`}
          aria-pressed={activeTab === 'npcs'}
          onClick={() => setActiveTab('npcs')}
        >
          <span className="dmt-tab-title">Personajes</span>
          <span className="dmt-tab-hint">Aliados, enemigos y gente del pueblo</span>
        </button>
        <button
          className={`dmt-tab ${activeTab === 'locations' ? 'is-active' : ''}`}
          aria-pressed={activeTab === 'locations'}
          onClick={() => setActiveTab('locations')}
        >
          <span className="dmt-tab-title">Lugares</span>
          <span className="dmt-tab-hint">Ciudades, mazmorras y puntos de interés</span>
        </button>
      </nav>

      <div className="dmt-content">
        {activeTab === 'npcs' && <NPCGallery />}
        {activeTab === 'locations' && <LocationGallery />}
      </div>
    </div>
  );
});

DMToolsPage.displayName = 'DMToolsPage';

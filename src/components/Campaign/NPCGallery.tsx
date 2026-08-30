import { useEffect, useState } from 'react';
import { NPC_SEED_DATA } from '../../lib/seed-content';

export const NPCGallery = () => {
  const [selectedNPC, setSelectedNPC] = useState<(typeof NPC_SEED_DATA)[0] | null>(null);

  useEffect(() => {
    if (NPC_SEED_DATA.length > 0) {
      setSelectedNPC(NPC_SEED_DATA[0]);
    }
  }, []);

  const getAvatarUrl = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&scale=80`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Ally':
        return '#4ade80';
      case 'Enemy':
        return '#ef4444';
      case 'Neutral':
        return '#fbbf24';
      case 'Merchant':
        return '#0ea5e9';
      default:
        return '#999';
    }
  };

  return (
    <div className="npc-gallery">
      <h2>NPCs & Companions</h2>

      <div className="npc-layout">
        <div className="npc-list">
          <div className="npc-grid">
            {NPC_SEED_DATA.map((npc, idx) => (
              <button
                key={idx}
                className={`npc-card ${selectedNPC?.name === npc.name ? 'active' : ''}`}
                onClick={() => setSelectedNPC(npc)}
                title={npc.name}
              >
                <img
                  src={getAvatarUrl(npc.name)}
                  alt={npc.name}
                  className="npc-avatar"
                  loading="lazy"
                />
                <div className="npc-card-info">
                  <h4>{npc.name}</h4>
                  <p className="npc-title">{npc.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedNPC && (
          <div className="npc-details">
            <div className="npc-header">
              <img
                src={getAvatarUrl(selectedNPC.name)}
                alt={selectedNPC.name}
                className="npc-avatar-large"
              />
              <div className="npc-header-info">
                <h3>{selectedNPC.name}</h3>
                <p className="npc-title">{selectedNPC.title}</p>
                <span
                  className="npc-role"
                  style={{ backgroundColor: getRoleColor(selectedNPC.role) + '30', color: getRoleColor(selectedNPC.role) }}
                >
                  {selectedNPC.role}
                </span>
              </div>
            </div>

            <div className="npc-info">
              <div className="info-item">
                <label>Location</label>
                <p>{selectedNPC.location}</p>
              </div>
              <div className="info-item">
                <label>Description</label>
                <p>{selectedNPC.description}</p>
              </div>
            </div>

            <button className="btn-primary">Talk to NPC</button>
          </div>
        )}
      </div>

      <style>{`
        .npc-gallery {
          padding: 24px;
        }

        .npc-gallery h2 {
          margin: 0 0 24px 0;
          font-size: 24px;
          color: #fff;
        }

        .npc-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .npc-list {
          min-height: 600px;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          background: #1a1a1a;
          overflow-y: auto;
        }

        .npc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .npc-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 200ms;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .npc-card:hover {
          border-color: #a855f7;
          background: #1a1a1a;
        }

        .npc-card.active {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
        }

        .npc-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid #333;
          object-fit: cover;
        }

        .npc-card.active .npc-avatar {
          border-color: #a855f7;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
        }

        .npc-card-info h4 {
          margin: 0;
          font-size: 13px;
          color: #fff;
        }

        .npc-title {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .npc-details {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .npc-header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .npc-avatar-large {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px solid #a855f7;
          object-fit: cover;
        }

        .npc-header-info h3 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #fff;
        }

        .npc-header-info .npc-title {
          display: block;
          margin-bottom: 8px;
        }

        .npc-role {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .npc-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item label {
          display: block;
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .info-item p {
          margin: 0;
          color: #ccc;
          font-size: 14px;
          line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .npc-layout {
            grid-template-columns: 1fr;
          }

          .npc-list {
            min-height: auto;
          }

          .npc-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 768px) {
          .npc-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { LOCATION_SEED_DATA } from '../../lib/seed-content';

export const LocationGallery = () => {
  const [selectedLocation, setSelectedLocation] = useState<(typeof LOCATION_SEED_DATA)[0] | null>(null);

  useEffect(() => {
    if (LOCATION_SEED_DATA.length > 0) {
      setSelectedLocation(LOCATION_SEED_DATA[0]);
    }
  }, []);

  const getLocationImage = (type: string, name: string) => {
    return `https://source.unsplash.com/featured/800x600?${encodeURIComponent(type + ' ' + name)}`;
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case 'Low':
        return '#4ade80';
      case 'Medium':
        return '#fbbf24';
      case 'High':
        return '#f97316';
      case 'Very High':
        return '#ef4444';
      case 'Extreme':
        return '#a82c2c';
      default:
        return '#999';
    }
  };

  return (
    <div className="location-gallery">
      <h2>Locations & Places</h2>

      <div className="location-layout">
        <div className="location-grid">
          {LOCATION_SEED_DATA.map((location, idx) => (
            <button
              key={idx}
              className={`location-card ${selectedLocation?.name === location.name ? 'active' : ''}`}
              onClick={() => {
                setSelectedLocation(location);
              }}
              title={location.name}
            >
              <div className="location-image-small">
                <img
                  src={getLocationImage(location.type, location.name)}
                  alt={location.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(location.name)}`;
                  }}
                />
              </div>
              <div className="location-card-info">
                <h4>{location.name}</h4>
                <p className="location-type">{location.type}</p>
                <span
                  className="danger-badge"
                  style={{ backgroundColor: getDangerColor(location.danger_level) + '30', color: getDangerColor(location.danger_level) }}
                >
                  {location.danger_level}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedLocation && (
        <div className="location-details">
          <div className="location-image-large">
            <img
              src={getLocationImage(selectedLocation.type, selectedLocation.name)}
              alt={selectedLocation.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(selectedLocation.name)}`;
              }}
            />
          </div>

          <div className="location-info">
            <div className="location-header">
              <h3>{selectedLocation.name}</h3>
              <span
                className="danger-badge-large"
                style={{ backgroundColor: getDangerColor(selectedLocation.danger_level) + '30', color: getDangerColor(selectedLocation.danger_level) }}
              >
                Danger: {selectedLocation.danger_level}
              </span>
            </div>

            <div className="info-section">
              <label>Type</label>
              <p>{selectedLocation.type}</p>
            </div>

            <div className="info-section">
              <label>Description</label>
              <p>{selectedLocation.description}</p>
            </div>

            <div className="info-section">
              <label>Features & Points of Interest</label>
              <div className="features-list">
                {selectedLocation.features.split(', ').map((feature, idx) => (
                  <span key={idx} className="feature-tag">
                    📍 {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="location-actions">
              <button className="btn-primary">Explore This Location</button>
              <button className="btn-secondary">Add to Campaign</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .location-gallery {
          padding: 24px;
        }

        .location-gallery h2 {
          margin: 0 0 24px 0;
          font-size: 24px;
          color: #fff;
        }

        .location-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .location-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .location-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 200ms;
          display: flex;
          flex-direction: column;
          height: 180px;
        }

        .location-card:hover {
          border-color: #a855f7;
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(168, 85, 247, 0.2);
        }

        .location-card.active {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
        }

        .location-image-small {
          width: 100%;
          height: 100px;
          overflow: hidden;
          background: #0d0d0d;
        }

        .location-image-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .location-card-info {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .location-card-info h4 {
          margin: 0;
          font-size: 13px;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .location-type {
          margin: 0;
          font-size: 11px;
          color: #999;
        }

        .danger-badge,
        .danger-badge-large {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .danger-badge-large {
          padding: 8px 12px;
          font-size: 13px;
          margin: 0;
        }

        .location-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
        }

        .location-image-large {
          width: 100%;
          height: 400px;
          overflow: hidden;
          background: #0d0d0d;
        }

        .location-image-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .location-info {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: space-between;
        }

        .location-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .location-header h3 {
          margin: 0;
          font-size: 28px;
          color: #fff;
          flex: 1;
        }

        .info-section label {
          display: block;
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .info-section p {
          margin: 0;
          color: #ccc;
          font-size: 14px;
          line-height: 1.6;
        }

        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .feature-tag {
          background: rgba(168, 85, 247, 0.2);
          color: #a855f7;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .location-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .location-actions button {
          flex: 1;
        }

        @media (max-width: 1024px) {
          .location-details {
            grid-template-columns: 1fr;
          }

          .location-image-large {
            height: 300px;
          }
        }

        @media (max-width: 768px) {
          .location-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }

          .location-gallery {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

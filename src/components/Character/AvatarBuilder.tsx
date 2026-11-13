import { useState } from 'react';
import type { AvatarCustomization, Species, Gender, SkinTone, HairColor, HairStyle, EyeColor, FacialHair, Accessory } from '../../lib/avatar-builder';
import { SPECIES_TRAITS, SKIN_TONES, HAIR_COLORS, EYE_COLORS, randomizeAvatar, addAccessory, removeAccessory, generateAvatarURL, getAvatarDescription } from '../../lib/avatar-builder';

interface AvatarBuilderProps {
  avatar: AvatarCustomization;
  onAvatarChange?: (avatar: AvatarCustomization) => void;
  onClose?: () => void;
}

export const AvatarBuilder = ({
  avatar,
  onAvatarChange,
  onClose,
}: AvatarBuilderProps) => {
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  const [previewStyle, setPreviewStyle] = useState('avataaars');

  const handleChange = (newAvatar: AvatarCustomization) => {
    setCurrentAvatar(newAvatar);
    onAvatarChange?.(newAvatar);
  };

  const handleRandomize = () => {
    handleChange(randomizeAvatar(currentAvatar));
  };

  const handleAccessoryToggle = (accessory: Accessory) => {
    if (currentAvatar.accessories.includes(accessory)) {
      handleChange(removeAccessory(currentAvatar, accessory));
    } else {
      handleChange(addAccessory(currentAvatar, accessory));
    }
  };

  const avatarURL = generateAvatarURL(currentAvatar, previewStyle);
  const description = getAvatarDescription(currentAvatar);
  const speciesInfo = SPECIES_TRAITS[currentAvatar.species];

  return (
    <div className="avatar-builder">
      <div className="builder-header">
        <h2>👤 Avatar Builder</h2>
        <p>{currentAvatar.name}</p>
      </div>

      <div className="builder-layout">
        <div className="preview-section">
          <div className="avatar-preview">
            <img src={avatarURL} alt={currentAvatar.name} />
          </div>

          <div className="preview-info">
            <h3>{currentAvatar.name}</h3>
            <p className="species">{speciesInfo.displayName}</p>
            <p className="description">{description}</p>

            <div className="species-traits">
              <div className="trait">
                <label>Lifespan</label>
                <span>{speciesInfo.lifespan}</span>
              </div>
              <div className="trait">
                <label>Height</label>
                <span>{speciesInfo.height}</span>
              </div>
            </div>
          </div>

          <button className="btn-randomize" onClick={handleRandomize}>
            🎲 Randomize
          </button>
        </div>

        <div className="customization-section">
          <div className="customization-group">
            <label>Species</label>
            <select
              value={currentAvatar.species}
              onChange={(e) =>
                handleChange({
                  ...currentAvatar,
                  species: e.target.value as Species,
                })
              }
              className="select-input"
            >
              {Object.entries(SPECIES_TRAITS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="customization-group">
            <label>Gender</label>
            <div className="gender-buttons">
              {(['male', 'female', 'non-binary'] as Gender[]).map((gender) => (
                <button
                  key={gender}
                  className={`gender-btn ${currentAvatar.gender === gender ? 'active' : ''}`}
                  onClick={() =>
                    handleChange({ ...currentAvatar, gender })
                  }
                >
                  {gender === 'male' ? '♂️ Male' : gender === 'female' ? '♀️ Female' : '⚧️ Non-binary'}
                </button>
              ))}
            </div>
          </div>

          <div className="customization-group">
            <label>Skin Tone</label>
            <div className="color-palette">
              {(Object.entries(SKIN_TONES) as [SkinTone, string][]).map(([tone, color]) => (
                <button
                  key={tone}
                  className={`color-swatch ${currentAvatar.skinTone === tone ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    handleChange({ ...currentAvatar, skinTone: tone })
                  }
                  title={tone}
                />
              ))}
            </div>
          </div>

          <div className="customization-group">
            <label>Hair Color</label>
            <div className="color-palette">
              {(Object.entries(HAIR_COLORS) as [HairColor, string][]).map(([color, hex]) => (
                <button
                  key={color}
                  className={`color-swatch ${currentAvatar.hairColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: hex }}
                  onClick={() =>
                    handleChange({ ...currentAvatar, hairColor: color })
                  }
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="customization-group">
            <label>Hair Style</label>
            <select
              value={currentAvatar.hairStyle}
              onChange={(e) =>
                handleChange({
                  ...currentAvatar,
                  hairStyle: e.target.value as HairStyle,
                })
              }
              className="select-input"
            >
              {(['short', 'medium', 'long', 'bald', 'ponytail', 'braids', 'curly', 'straight'] as HairStyle[]).map(
                (style) => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="customization-group">
            <label>Eye Color</label>
            <div className="color-palette">
              {(Object.entries(EYE_COLORS) as [EyeColor, string][]).map(([color, hex]) => (
                <button
                  key={color}
                  className={`color-swatch ${currentAvatar.eyeColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: hex }}
                  onClick={() =>
                    handleChange({ ...currentAvatar, eyeColor: color })
                  }
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="customization-group">
            <label>Facial Hair</label>
            <select
              value={currentAvatar.facialHair}
              onChange={(e) =>
                handleChange({
                  ...currentAvatar,
                  facialHair: e.target.value as FacialHair,
                })
              }
              className="select-input"
            >
              {(['none', 'stubble', 'beard', 'goatee', 'moustache', 'sideburns'] as FacialHair[]).map(
                (style) => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="customization-group">
            <label>Accessories</label>
            <div className="accessories-grid">
              {(['glasses', 'eyepatch', 'scar', 'tattoo', 'jewelry', 'hat', 'circlet'] as Accessory[]).map(
                (accessory) => (
                  <button
                    key={accessory}
                    className={`accessory-btn ${currentAvatar.accessories.includes(accessory) ? 'active' : ''}`}
                    onClick={() => handleAccessoryToggle(accessory)}
                  >
                    {accessory === 'glasses' && '👓'}
                    {accessory === 'eyepatch' && '🏴‍☠️'}
                    {accessory === 'scar' && '⚔️'}
                    {accessory === 'tattoo' && '🖍️'}
                    {accessory === 'jewelry' && '✨'}
                    {accessory === 'hat' && '🎩'}
                    {accessory === 'circlet' && '👑'}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="preview-style">
            <label>Avatar Style</label>
            <div className="style-buttons">
              {(['avataaars', 'lorelei', 'pixel-art'] as const).map((style) => (
                <button
                  key={style}
                  className={`style-btn ${previewStyle === style ? 'active' : ''}`}
                  onClick={() => setPreviewStyle(style)}
                >
                  {style.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {onClose && (
        <button className="btn-done" onClick={onClose}>
          ✓ Done
        </button>
      )}

      <style>{`
        .avatar-builder {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-height: 900px;
          overflow-y: auto;
        }

        .builder-header {
          margin-bottom: 12px;
        }

        .builder-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #fff;
        }

        .builder-header p {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .builder-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .preview-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }

        .avatar-preview {
          width: 200px;
          height: 200px;
          background: #0d0d0d;
          border: 2px solid #a855f7;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-info {
          text-align: center;
          width: 100%;
        }

        .preview-info h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          color: #fff;
        }

        .species {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #a855f7;
          font-weight: 600;
        }

        .description {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #ccc;
          line-height: 1.5;
        }

        .species-traits {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .trait {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 8px;
        }

        .trait label {
          display: block;
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .trait span {
          font-size: 12px;
          color: #ccc;
        }

        .btn-randomize {
          padding: 10px 16px;
          background: #a855f7;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-randomize:hover {
          background: #9333ea;
        }

        .customization-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .customization-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .customization-group label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .select-input {
          padding: 8px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #ccc;
          font-size: 12px;
          cursor: pointer;
        }

        .select-input:focus {
          outline: none;
          border-color: #a855f7;
        }

        .gender-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .gender-btn {
          padding: 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          color: #999;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gender-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .gender-btn.active {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .color-palette {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .color-swatch {
          width: 40px;
          height: 40px;
          border: 2px solid #333;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .color-swatch:hover {
          transform: scale(1.1);
        }

        .color-swatch.active {
          border-color: #fff;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
        }

        .accessories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }

        .accessory-btn {
          padding: 12px;
          background: #0d0d0d;
          border: 2px solid #333;
          border-radius: 6px;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .accessory-btn:hover {
          border-color: #a855f7;
          transform: scale(1.05);
        }

        .accessory-btn.active {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
        }

        .preview-style {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preview-style label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .style-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .style-btn {
          padding: 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          color: #999;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: capitalize;
        }

        .style-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .style-btn.active {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .btn-done {
          padding: 12px 16px;
          background: #4ade80;
          color: #000;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-done:hover {
          background: #22c55e;
        }

        @media (max-width: 1024px) {
          .builder-layout {
            grid-template-columns: 1fr;
          }

          .color-palette {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

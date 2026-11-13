import { useState, useRef, useEffect } from 'react';
import type { DungeonMap, TileType } from '../../lib/dungeon-map';
import { setTile, TILE_COLORS } from '../../lib/dungeon-map';

interface DungeonMapEditorProps {
  map: DungeonMap;
  onMapChange?: (map: DungeonMap) => void;
  readOnly?: boolean;
}

export const DungeonMapEditor = ({
  map,
  onMapChange,
  readOnly = false,
}: DungeonMapEditorProps) => {
  const [selectedTile, setSelectedTile] = useState<TileType>('empty');
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const squareSize = 32;

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;

    for (let x = 0; x <= map.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * squareSize, 0);
      ctx.lineTo(x * squareSize, map.height * squareSize);
      ctx.stroke();
    }

    for (let y = 0; y <= map.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * squareSize);
      ctx.lineTo(map.width * squareSize, y * squareSize);
      ctx.stroke();
    }
  };

  // Draw tiles
  const drawTiles = (ctx: CanvasRenderingContext2D) => {
    map.tiles.forEach((tile) => {
      const x = tile.x * squareSize;
      const y = tile.y * squareSize;

      // Fill color
      ctx.fillStyle = TILE_COLORS[tile.type];
      ctx.fillRect(x, y, squareSize, squareSize);

      // Add pattern or icon based on type
      ctx.fillStyle = '#666';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const icons: Record<TileType, string> = {
        empty: '',
        wall: '█',
        door: '🚪',
        trap: '⚠',
        treasure: '💎',
        water: '🌊',
        lava: '🔥',
        difficult: '🪨',
      };

      if (icons[tile.type]) {
        ctx.fillStyle = '#fff';
        ctx.fillText(icons[tile.type], x + squareSize / 2, y + squareSize / 2);
      }

      // Revealed indicator
      if (tile.isRevealed) {
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, squareSize - 4, squareSize - 4);
      }
    });
  };

  // Draw hover highlight
  const drawHover = (ctx: CanvasRenderingContext2D) => {
    if (hoveredTile && !readOnly) {
      const x = hoveredTile.x * squareSize;
      const y = hoveredTile.y * squareSize;

      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.fillRect(x, y, squareSize, squareSize);
    }
  };

  // Redraw canvas
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
    drawTiles(ctx);
    drawHover(ctx);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || readOnly) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / squareSize);
    const y = Math.floor((e.clientY - rect.top) / squareSize);

    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
      setHoveredTile({ x, y });
    } else {
      setHoveredTile(null);
    }

    redraw();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / squareSize);
    const y = Math.floor((e.clientY - rect.top) / squareSize);

    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
      const updated = setTile(map, x, y, selectedTile);
      onMapChange?.(updated);
    }
  };

  // Redraw on changes
  useEffect(() => {
    redraw();
  }, [map, hoveredTile, selectedTile]);

  return (
    <div className="dungeon-map-editor">
      <div className="editor-header">
        <h3>🗺️ Dungeon Map Editor</h3>
        <p>{map.width}×{map.height}</p>
      </div>

      <div className="editor-tools">
        <div className="tool-selector">
          <label>Paint Tile</label>
          <div className="tile-buttons">
            {(['empty', 'wall', 'door', 'trap', 'treasure', 'water', 'lava', 'difficult'] as TileType[]).map(
              (type) => (
                <button
                  key={type}
                  className={`tile-btn ${selectedTile === type ? 'active' : ''}`}
                  onClick={() => setSelectedTile(type)}
                  style={{
                    backgroundColor: TILE_COLORS[type],
                    borderColor: selectedTile === type ? '#fff' : '#333',
                  }}
                  title={type}
                >
                  {type.charAt(0).toUpperCase()}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="map-container">
        <canvas
          ref={canvasRef}
          width={map.width * squareSize}
          height={map.height * squareSize}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="map-canvas"
        />
      </div>

      <div className="editor-info">
        <div className="legend">
          <h4>Legend</h4>
          <div className="legend-items">
            {(['empty', 'wall', 'door', 'trap', 'treasure', 'water', 'lava', 'difficult'] as TileType[]).map(
              (type) => (
                <div key={type} className="legend-item">
                  <span
                    className="color-box"
                    style={{ backgroundColor: TILE_COLORS[type] }}
                  ></span>
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="tools-info">
          <h4>Tools</h4>
          <p>Click tiles to paint with selected type</p>
          <p>Right-click tiles to clear (make empty)</p>
        </div>
      </div>

      <style>{`
        .dungeon-map-editor {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .editor-header h3 {
          margin: 0;
          font-size: 18px;
          color: #fff;
        }

        .editor-header p {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #999;
        }

        .editor-tools {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .tool-selector label {
          display: block;
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .tile-buttons {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
        }

        .tile-btn {
          width: 40px;
          height: 40px;
          border: 2px solid;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          color: #fff;
          transition: all 0.2s;
        }

        .tile-btn:hover {
          transform: scale(1.1);
        }

        .tile-btn.active {
          border-color: #fff !important;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
        }

        .map-container {
          display: flex;
          justify-content: center;
          overflow: auto;
          background: #0d0d0d;
          border-radius: 6px;
          padding: 8px;
          border: 1px solid #333;
        }

        .map-canvas {
          border: 1px solid #333;
          border-radius: 4px;
          cursor: crosshair;
        }

        .editor-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .legend,
        .tools-info {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .legend h4,
        .tools-info h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 700;
        }

        .legend-items {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #ccc;
        }

        .color-box {
          width: 16px;
          height: 16px;
          border-radius: 2px;
          border: 1px solid #333;
        }

        .tools-info p {
          margin: 0 0 6px 0;
          font-size: 11px;
          color: #999;
        }

        .tools-info p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .editor-info {
            grid-template-columns: 1fr;
          }

          .tile-buttons {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

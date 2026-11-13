import { useState, useRef, useEffect } from 'react';
import type { Token, GridPosition } from '../../lib/grid-combat';
import { calculateDistance } from '../../lib/grid-combat';

interface TacticalMapProps {
  tokens: Token[];
  gridWidth?: number;
  gridHeight?: number;
  gridSize?: number;
  onTokenMove?: (tokenId: string, newPosition: GridPosition) => void;
  selectedTokenId?: string;
  onSelectToken?: (tokenId: string) => void;
  readOnly?: boolean;
}

export const TacticalMap = ({
  tokens,
  gridWidth = 20,
  gridHeight = 20,
  onTokenMove,
  selectedTokenId,
  onSelectToken,
  readOnly = false,
}: TacticalMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPos, setHoveredPos] = useState<GridPosition | null>(null);

  const squareSize = 40; // pixels per square

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * squareSize, 0);
      ctx.lineTo(x * squareSize, gridHeight * squareSize);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * squareSize);
      ctx.lineTo(gridWidth * squareSize, y * squareSize);
      ctx.stroke();
    }
  };

  // Draw tokens
  const drawTokens = (ctx: CanvasRenderingContext2D) => {
    tokens.forEach((token) => {
      const x = token.position.x * squareSize + squareSize / 2;
      const y = token.position.y * squareSize + squareSize / 2;
      const size = (squareSize * 0.8) / 2;

      // Token circle
      ctx.fillStyle = token.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Border (highlight if selected)
      ctx.strokeStyle = selectedTokenId === token.id ? '#a855f7' : '#999';
      ctx.lineWidth = selectedTokenId === token.id ? 3 : 2;
      ctx.stroke();

      // HP indicator
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const hpPercent = token.hp_current / token.hp_max;
      const hpColor =
        hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
      ctx.fillStyle = hpColor;
      ctx.fillText(`${token.hp_current}/${token.hp_max}`, x, y);

      // Token name
      ctx.fillStyle = '#ccc';
      ctx.font = '10px sans-serif';
      ctx.fillText(token.name, x, y + size + 12);
    });
  };

  // Draw hovered square
  const drawHover = (ctx: CanvasRenderingContext2D) => {
    if (hoveredPos && !readOnly) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.fillRect(
        hoveredPos.x * squareSize,
        hoveredPos.y * squareSize,
        squareSize,
        squareSize
      );

      // Show distance if token is selected
      if (selectedTokenId) {
        const selected = tokens.find((t) => t.id === selectedTokenId);
        if (selected) {
          const distance = calculateDistance(selected.position, hoveredPos);
          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${distance}sq`,
            hoveredPos.x * squareSize + squareSize / 2,
            hoveredPos.y * squareSize + squareSize / 2
          );
        }
      }
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
    drawTokens(ctx);
    drawHover(ctx);
  };

  // Handle canvas events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / squareSize);
    const y = Math.floor((e.clientY - rect.top) / squareSize);

    setHoveredPos({ x, y });
    redraw();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || readOnly) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / squareSize);
    const y = Math.floor((e.clientY - rect.top) / squareSize);
    const clickedPos = { x, y };

    // Check if clicked on token
    const clickedToken = tokens.find(
      (t) => t.position.x === x && t.position.y === y
    );
    if (clickedToken) {
      onSelectToken?.(clickedToken.id);
      return;
    }

    // Move selected token
    if (selectedTokenId && onTokenMove) {
      onTokenMove(selectedTokenId, clickedPos);
    }
  };

  // Redraw on tokens change
  useEffect(() => {
    redraw();
  }, [tokens, selectedTokenId, hoveredPos]);

  return (
    <div className="tactical-map">
      <div className="map-header">
        <h3>⚔️ Tactical Map</h3>
        <div className="map-info">
          <span>{gridWidth}×{gridHeight} squares</span>
          <span>{tokens.length} tokens</span>
        </div>
      </div>

      <div className="map-container">
        <canvas
          ref={canvasRef}
          width={gridWidth * squareSize}
          height={gridHeight * squareSize}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="tactical-canvas"
        />
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#4ade80' }}></span>
          <span>Player Characters</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#0ea5e9' }}></span>
          <span>NPCs</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#ef4444' }}></span>
          <span>Enemies</span>
        </div>
      </div>

      <style>{`
        .tactical-map {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .map-header h3 {
          margin: 0;
          color: #fff;
        }

        .map-info {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #999;
        }

        .map-container {
          display: flex;
          justify-content: center;
          overflow: auto;
          background: #0d0d0d;
          border-radius: 6px;
          padding: 8px;
        }

        .tactical-canvas {
          border: 1px solid #333;
          cursor: crosshair;
          border-radius: 4px;
        }

        .map-legend {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #ccc;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid #333;
        }
      `}</style>
    </div>
  );
};

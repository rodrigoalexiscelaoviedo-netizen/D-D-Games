import { useId, type ReactNode } from 'react';
import type { BattleMapDef, FeatureKind, FloorKind, MapFeature, DmMarker } from '../../content/modules/types';

const S = 40; // px por casilla (1,5 m / 5 pies)

const FLOOR: Record<FloorKind | 'void', { base: string; line: string }> = {
  stone: { base: '#6b6358', line: '#57504a' },
  wood: { base: '#7a5534', line: '#5e3f25' },
  grass: { base: '#4f6136', line: '#5d7040' },
  dirt: { base: '#7d6646', line: '#6a5539' },
  water: { base: '#2f5a6e', line: '#4a7c91' },
  cave: { base: '#4a4038', line: '#3b332c' },
  tile: { base: '#8a7d68', line: '#6f6452' },
  void: { base: '#0e0b09', line: '#0e0b09' },
};

interface Props {
  map: BattleMapDef;
  isDM: boolean;
  revealed: Set<string>;
  showDmLayer?: boolean;
  onToggleArea?: (areaId: string) => void;
}

export const BattleMap = ({ map, isDM, revealed, showDmLayer = true, onToggleArea }: Props) => {
  const uid = useId().replace(/:/g, '');
  const pid = (k: string) => `${uid}-${k}`;
  const W = map.cols * S;
  const H = map.rows * S;

  const isHidden = (areaId: string, hidden?: boolean) => Boolean(hidden) && !revealed.has(areaId);

  return (
    <svg
      className="battle-map"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Mapa: ${map.name}`}
    >
      <defs>
        <FloorPatterns pid={pid} />
        <filter id={pid('rough')}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.18" /></feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <pattern id={pid('fog')} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill="#0e0b09" fillOpacity="0.55" />
          <line x1="0" y1="0" x2="0" y2="12" stroke="#c9a24b" strokeOpacity="0.35" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Fondo exterior */}
      <rect width={W} height={H} fill={map.outside === 'void' ? FLOOR.void.base : `url(#${pid(map.outside)})`} />

      {/* Áreas */}
      {map.areas.map((a) => {
        // Para los jugadores, una zona oculta no se dibuja: ni su forma debe intuirse
        if (!isDM && isHidden(a.id, a.hidden)) return null;
        const floor = a.floor ?? 'stone';
        return (
          <g key={a.id}>
            <rect
              x={a.x * S} y={a.y * S} width={a.w * S} height={a.h * S}
              fill={`url(#${pid(floor)})`}
              stroke="#1a1410" strokeWidth={map.outside === 'void' || map.outside === 'cave' ? 6 : 2}
            />
          </g>
        );
      })}

      {/* Rejilla */}
      <g stroke="#000" strokeOpacity="0.18" strokeWidth="1">
        {Array.from({ length: map.cols + 1 }, (_, i) => <line key={`v${i}`} x1={i * S} y1={0} x2={i * S} y2={H} />)}
        {Array.from({ length: map.rows + 1 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * S} x2={W} y2={i * S} />)}
      </g>

      {/* Mobiliario */}
      {map.features.map((f, i) => {
        const area = map.areas.find((a) => f.x >= a.x && f.x < a.x + a.w && f.y >= a.y && f.y < a.y + a.h);
        if (!isDM && area && isHidden(area.id, area.hidden)) return null;
        return <Feature key={i} f={f} />;
      })}

      {/* Etiquetas de áreas */}
      {map.areas.map((a) =>
        a.label && !(isHidden(a.id, a.hidden) && !isDM) ? (
          <text key={`l-${a.id}`} x={a.x * S + 6} y={a.y * S + 16} className="map-area-label">
            {a.label}
          </text>
        ) : null,
      )}

      {/* Niebla de guerra */}
      {isDM && map.areas.map((a) =>
        isHidden(a.id, a.hidden) ? (
          <g key={`fog-${a.id}`}>
            <rect
              x={a.x * S} y={a.y * S} width={a.w * S} height={a.h * S}
              fill={isDM ? `url(#${pid('fog')})` : '#0e0b09'}
              stroke={isDM ? '#c9a24b' : 'none'} strokeDasharray="6 4" strokeWidth="2"
              className={isDM && onToggleArea ? 'map-fog-dm' : undefined}
              onClick={isDM && onToggleArea ? () => onToggleArea(a.id) : undefined}
            >
              {isDM && <title>Oculto a los jugadores · clic para revelar</title>}
            </rect>
            {isDM && (
              <text x={(a.x + a.w / 2) * S} y={(a.y + a.h / 2) * S} textAnchor="middle" className="map-fog-label">
                Oculto
              </text>
            )}
          </g>
        ) : null,
      )}

      {/* Capa del DM */}
      {isDM && showDmLayer && map.dmMarkers?.map((m, i) => <Marker key={i} m={m} />)}

      <rect width={W} height={H} filter={`url(#${pid('rough')})`} fill="#000" pointerEvents="none" />
    </svg>
  );
};

const FloorPatterns = ({ pid }: { pid: (k: string) => string }) => (
  <>
    <pattern id={pid('stone')} width={S} height={S} patternUnits="userSpaceOnUse">
      <rect width={S} height={S} fill={FLOOR.stone.base} />
      <path d={`M0 ${S / 2}H${S}M${S / 2} 0V${S / 2}M${S / 4} ${S / 2}V${S}`} stroke={FLOOR.stone.line} strokeWidth="2" />
    </pattern>
    <pattern id={pid('wood')} width={S} height={S / 4} patternUnits="userSpaceOnUse">
      <rect width={S} height={S / 4} fill={FLOOR.wood.base} />
      <path d={`M0 ${S / 4 - 1}H${S}M${S * 0.6} 0V${S / 4}`} stroke={FLOOR.wood.line} strokeWidth="1.5" />
    </pattern>
    <pattern id={pid('grass')} width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill={FLOOR.grass.base} />
      <path d="M3 12l1-4 1 4M11 6l1-4 1 4" stroke={FLOOR.grass.line} strokeWidth="1.2" fill="none" />
    </pattern>
    <pattern id={pid('dirt')} width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill={FLOOR.dirt.base} />
      <circle cx="5" cy="6" r="1.4" fill={FLOOR.dirt.line} />
      <circle cx="14" cy="15" r="1" fill={FLOOR.dirt.line} />
    </pattern>
    <pattern id={pid('water')} width="32" height="16" patternUnits="userSpaceOnUse">
      <rect width="32" height="16" fill={FLOOR.water.base} />
      <path d="M0 8q8-6 16 0t16 0" stroke={FLOOR.water.line} strokeWidth="1.5" fill="none" />
    </pattern>
    <pattern id={pid('cave')} width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill={FLOOR.cave.base} />
      <path d="M4 20l6-5 5 3M18 8l5-3" stroke={FLOOR.cave.line} strokeWidth="2" fill="none" />
    </pattern>
    <pattern id={pid('tile')} width={S} height={S} patternUnits="userSpaceOnUse">
      <rect width={S} height={S} fill={FLOOR.tile.base} />
      <rect width={S / 2} height={S / 2} fill={FLOOR.tile.line} fillOpacity="0.45" />
      <rect x={S / 2} y={S / 2} width={S / 2} height={S / 2} fill={FLOOR.tile.line} fillOpacity="0.45" />
    </pattern>
  </>
);

const INK = '#1a1410';

function Feature({ f }: { f: MapFeature }) {
  const x = f.x * S;
  const y = f.y * S;
  const w = (f.w ?? 1) * S;
  const h = (f.h ?? 1) * S;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const shapes: Record<FeatureKind, ReactNode> = {
    pillar: <circle cx={cx} cy={cy} r={S * 0.38} fill="#9b9183" stroke={INK} strokeWidth="3" />,
    barrel: (
      <g>
        <circle cx={cx} cy={cy} r={S * 0.36} fill="#8a5a2b" stroke={INK} strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r={S * 0.2} fill="none" stroke={INK} strokeWidth="1.5" />
      </g>
    ),
    crate: (
      <g>
        <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} fill="#a07440" stroke={INK} strokeWidth="2.5" />
        <path d={`M${x + 5} ${y + 5}L${x + w - 5} ${y + h - 5}M${x + w - 5} ${y + 5}L${x + 5} ${y + h - 5}`} stroke={INK} strokeWidth="1.5" />
      </g>
    ),
    table: <rect x={x + 4} y={y + 6} width={w - 8} height={h - 12} rx="3" fill="#5e3f25" stroke={INK} strokeWidth="2.5" />,
    bar: <rect x={x} y={y + 8} width={w} height={h - 16} fill="#4a301c" stroke={INK} strokeWidth="3" />,
    door: <rect x={x + 4} y={y + 12} width={w - 8} height={h - 24} fill="#c9a24b" stroke={INK} strokeWidth="2.5" />,
    tree: (
      <g>
        <circle cx={cx} cy={cy} r={S * 0.75} fill="#2f3f22" fillOpacity="0.85" stroke={INK} strokeWidth="2" />
        <circle cx={cx - 6} cy={cy - 6} r={S * 0.35} fill="#3d5229" />
        <circle cx={cx} cy={cy} r="4" fill="#4a301c" />
      </g>
    ),
    bush: <circle cx={cx} cy={cy} r={S * 0.4} fill="#3d5229" stroke={INK} strokeWidth="1.5" />,
    rock: <path d={`M${x + 6} ${y + h - 8}L${x + 10} ${y + 10}L${x + w - 12} ${y + 6}L${x + w - 5} ${y + h - 10}Z`} fill="#7d776e" stroke={INK} strokeWidth="2.5" />,
    rubble: (
      <g fill="#7d776e" stroke={INK} strokeWidth="1.5">
        <circle cx={x + 10} cy={y + 12} r="6" />
        <circle cx={x + 26} cy={y + 18} r="7" />
        <circle cx={x + 16} cy={y + 30} r="5" />
      </g>
    ),
    altar: <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill="#d8d0c0" stroke={INK} strokeWidth="3" />,
    stairs: (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#57504a" stroke={INK} strokeWidth="2" />
        {(() => {
          const steps = Math.max(3, Math.round(h / 10));
          return Array.from({ length: steps }, (_, i) => (
            <line key={i} x1={x} x2={x + w} y1={y + ((i + 1) * h) / (steps + 1)} y2={y + ((i + 1) * h) / (steps + 1)} stroke={INK} strokeWidth="2" />
          ));
        })()}
      </g>
    ),
    fire: (
      <g>
        <circle cx={cx} cy={cy} r={S * 0.42} fill="#3a2a1c" stroke={INK} strokeWidth="2" />
        <path d={`M${cx} ${cy - 12}q9 10 0 16q-9-6 0-16`} fill="#e3863b" />
        <path d={`M${cx} ${cy - 4}q4 5 0 8q-4-3 0-8`} fill="#f6d36b" />
      </g>
    ),
    bed: <rect x={x + 6} y={y + 3} width={w - 12} height={h - 6} rx="4" fill="#8f7a5c" stroke={INK} strokeWidth="2" />,
    chest: (
      <g>
        <rect x={x + 7} y={y + 10} width={w - 14} height={h - 20} fill="#7a4a1e" stroke={INK} strokeWidth="2.5" />
        <rect x={cx - 3} y={y + 16} width="6" height="8" fill="#c9a24b" />
      </g>
    ),
    statue: (
      <g>
        <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} fill="#9b9183" stroke={INK} strokeWidth="2" />
        <circle cx={cx} cy={cy} r={S * 0.2} fill="#c7beb0" stroke={INK} strokeWidth="1.5" />
      </g>
    ),
    bell: (
      <path
        d={`M${x + w * 0.2} ${y + h * 0.8}Q${x + w * 0.2} ${y + h * 0.2} ${cx} ${y + h * 0.15}Q${x + w * 0.8} ${y + h * 0.2} ${x + w * 0.8} ${y + h * 0.8}Z`}
        fill="#b0813a" stroke={INK} strokeWidth="3"
      />
    ),
    wagon: (
      <g>
        <rect x={x + 4} y={y + 8} width={w - 8} height={h - 16} fill="#8a6235" stroke={INK} strokeWidth="3" />
        <rect x={x + 10} y={y + 12} width={w - 20} height={h - 24} fill="#d9cdb0" stroke={INK} strokeWidth="1.5" />
        <circle cx={x + 14} cy={y + 8} r="5" fill={INK} />
        <circle cx={x + w - 14} cy={y + 8} r="5" fill={INK} />
        <circle cx={x + 14} cy={y + h - 8} r="5" fill={INK} />
        <circle cx={x + w - 14} cy={y + h - 8} r="5" fill={INK} />
      </g>
    ),
    tent: (
      <g>
        <path d={`M${x + 4} ${y + h - 4}L${cx} ${y + 4}L${x + w - 4} ${y + h - 4}Z`} fill="#b9a27a" stroke={INK} strokeWidth="2.5" />
        <line x1={cx} y1={y + 4} x2={cx} y2={y + h - 4} stroke={INK} strokeWidth="1.5" />
      </g>
    ),
    bookshelf: (
      <g>
        <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} fill="#4a301c" stroke={INK} strokeWidth="2.5" />
        {Array.from({ length: Math.round(h / 8) }, (_, i) => (
          <rect key={i} x={x + 6} y={y + 5 + i * 8} width={w - 12} height="4" fill={['#7c2d3a', '#3b4a7c', '#5a6b3b'][i % 3]} />
        ))}
      </g>
    ),
    well: (
      <g>
        <circle cx={cx} cy={cy} r={S * 0.42} fill="#7d776e" stroke={INK} strokeWidth="3" />
        <circle cx={cx} cy={cy} r={S * 0.25} fill="#1f3a47" />
      </g>
    ),
    telescope: (
      <g>
        <circle cx={cx} cy={cy} r={S * 0.4} fill="#57504a" stroke={INK} strokeWidth="2" />
        <rect x={cx - 4} y={y - 6} width="8" height={h * 0.75} fill="#c9a24b" stroke={INK} strokeWidth="2" transform={`rotate(35 ${cx} ${cy})`} />
      </g>
    ),
    coffin: <path d={`M${x + 4} ${cy}L${x + 12} ${y + 6}L${x + w - 6} ${y + 6}L${x + w - 4} ${cy}L${x + w - 6} ${y + h - 6}L${x + 12} ${y + h - 6}Z`} fill="#5e4a38" stroke={INK} strokeWidth="2.5" />,
    web: (
      <g stroke="#ede4d3" strokeOpacity="0.7" strokeWidth="1" fill="none">
        <path d={`M${x} ${y}L${x + w} ${y + h}M${x + w} ${y}L${x} ${y + h}M${cx} ${y}V${y + h}M${x} ${cy}H${x + w}`} />
        <circle cx={cx} cy={cy} r={S * 0.25} />
        <circle cx={cx} cy={cy} r={S * 0.45} />
      </g>
    ),
  };
  return <>{shapes[f.kind]}</>;
}

const MARKER_STYLE: Record<DmMarker['kind'], { fill: string; glyph: string }> = {
  enemy: { fill: '#9c3a4a', glyph: '!' },
  trap: { fill: '#e3863b', glyph: '△' },
  treasure: { fill: '#e3bd63', glyph: '$' },
  secret: { fill: '#6c8fbf', glyph: '?' },
  npc: { fill: '#5a6b3b', glyph: '◆' },
};

function Marker({ m }: { m: DmMarker }) {
  const cx = m.x * S + S / 2;
  const cy = m.y * S + S / 2;
  const st = MARKER_STYLE[m.kind];
  return (
    <g className="map-marker">
      <title>{m.label}</title>
      <circle cx={cx} cy={cy} r={S * 0.36} fill={st.fill} stroke="#ede4d3" strokeWidth="2" />
      <text x={cx} y={cy + 5} textAnchor="middle" className="map-marker-glyph">{st.glyph}</text>
    </g>
  );
}

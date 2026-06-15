import { MAP_PINS } from '../../data/penangItinerary.js'

export default function ItineraryMap({ activePin, onPinClick }) {
  return (
    <div className="map-wrap">
      <svg viewBox="0 0 280 340" xmlns="http://www.w3.org/2000/svg" aria-label="Penang route map">
        <defs>
          <radialGradient id="seaGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#2C5A54" />
            <stop offset="100%" stopColor="#1E3D39" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="280" height="340" fill="url(#seaGrad)" />

        <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5">
          <line x1="0" y1="60" x2="280" y2="60" />
          <line x1="0" y1="120" x2="280" y2="120" />
          <line x1="0" y1="180" x2="280" y2="180" />
          <line x1="0" y1="240" x2="280" y2="240" />
          <line x1="0" y1="300" x2="280" y2="300" />
          <line x1="56" y1="0" x2="56" y2="340" />
          <line x1="112" y1="0" x2="112" y2="340" />
          <line x1="168" y1="0" x2="168" y2="340" />
          <line x1="224" y1="0" x2="224" y2="340" />
        </g>

        <path
          d="M 82,195 C 75,188 72,178 74,168 C 76,155 84,145 94,138 C 104,130 118,126 130,124 C 144,122 158,124 168,130 C 180,137 188,148 190,160 C 192,172 188,185 180,194 C 170,204 156,210 142,212 C 126,214 108,212 96,206 Z"
          fill="#4A7A6E"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />
        <path
          d="M 100,168 C 106,158 118,150 130,148 C 142,146 155,152 162,162 C 168,170 166,180 158,186 C 148,193 132,194 120,190 C 108,186 98,178 100,168 Z"
          fill="#3D6A5E"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.5"
        />
        <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" fill="none" strokeLinecap="round">
          <path d="M 96,194 C 104,182 118,170 132,164 C 146,158 160,162 168,172" />
          <path d="M 110,204 C 116,190 124,176 132,164" />
          <path d="M 132,164 C 132,158 130,148 128,140" />
          <path d="M 132,164 C 140,170 152,180 158,190" />
          <path d="M 96,194 C 90,196 84,196 80,192" />
        </g>
        <path
          d="M 188,100 C 196,95 208,92 218,96 C 228,100 234,112 232,126 C 230,140 220,152 208,158 C 196,164 182,164 176,158 C 168,150 168,136 172,122 C 176,110 180,104 188,100 Z"
          fill="#4A7A6E"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />
        <line x1="168" y1="160" x2="188" y2="156" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3,2" />
        <line x1="164" y1="184" x2="185" y2="188" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,2" />

        <text
          x="38"
          y="270"
          fill="rgba(255,255,255,0.15)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.15em"
          textAnchor="middle"
          transform="rotate(-15,38,270)"
        >
          STRAIT OF
        </text>
        <text
          x="38"
          y="281"
          fill="rgba(255,255,255,0.15)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.15em"
          textAnchor="middle"
          transform="rotate(-15,38,281)"
        >
          MALACCA
        </text>

        <g transform="translate(244,36)">
          <circle cx="0" cy="0" r="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          <text x="0" y="-5" fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="700" textAnchor="middle">
            N
          </text>
          <line x1="0" y1="-2" x2="0" y2="-10" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <polygon points="0,-10 -2,-4 2,-4" fill="rgba(255,255,255,0.5)" />
        </g>

        {MAP_PINS.map((pin) => (
          <g
            key={pin.num}
            className={`map-pin${activePin === pin.num ? ' active' : ''}`}
            onClick={() => onPinClick(pin.num)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onPinClick(pin.num)
            }}
            aria-label={`Day ${pin.num}: ${pin.label}`}
          >
            <circle className="pin-circle" cx={pin.cx} cy={pin.cy} r="10" filter="url(#glow)" />
            <text className="pin-num" x={pin.cx} y={pin.cy + 4} textAnchor="middle">
              {pin.num}
            </text>
            <rect x={pin.rectX} y={pin.cy - 16} width={pin.rectW} height="13" rx="3" className="pin-label-bg" />
            <text className="pin-label-text" x={pin.labelX} y={pin.labelY} textAnchor="middle">
              {pin.label}
            </text>
          </g>
        ))}

        <polyline
          points="128,148 160,178 108,170 96,196 142,156"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.2"
          strokeDasharray="4,3"
          strokeLinecap="round"
        />

        <text x="16" y="22" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="700" letterSpacing="0.12em">
          PENANG
        </text>
        <text x="16" y="34" fill="rgba(255,255,255,0.35)" fontSize="7.5" fontWeight="600" letterSpacing="0.08em">
          5-DAY ROUTE
        </text>
      </svg>
    </div>
  )
}

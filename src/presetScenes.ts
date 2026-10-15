import { PresetScene } from './types';

export const PRESET_SCENES: PresetScene[] = [
  {
    id: 'hallway-stairs',
    title: 'Hallway with Steps & Box',
    category: 'Indoor Hazards',
    description: 'Corridor with drop-down stairs, a red box on the ground, and a chair obstructing the walkway.',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%230f172a"/>
          <stop offset="100%" stop-color="%231e293b"/>
        </linearGradient>
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%23334155"/>
          <stop offset="100%" stop-color="%230f172a"/>
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(%23wall)"/>
      <polygon points="120,480 240,200 400,200 520,480" fill="url(%23floor)"/>
      <!-- Stair steps -->
      <line x1="230" y1="230" x2="410" y2="230" stroke="%2364748b" stroke-width="4"/>
      <rect x="220" y="310" width="200" height="28" fill="%23475569" stroke="%23cbd5e1" stroke-width="2"/>
      <rect x="245" y="345" width="150" height="28" fill="%23334155" stroke="%2394a3b8" stroke-width="2"/>
      <rect x="260" y="380" width="120" height="28" fill="%231e293b" stroke="%2364748b" stroke-width="2"/>
      <!-- Hazardous Box on left ground -->
      <rect x="150" y="370" width="85" height="75" rx="8" fill="%23ef4444" stroke="%23b91c1c" stroke-width="3"/>
      <polygon points="150,370 190,345 275,345 235,370" fill="%23f87171"/>
      <polygon points="235,370 275,345 275,420 235,445" fill="%23dc2626"/>
      <text x="192" y="415" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">BOX</text>
      <!-- Chair on right path -->
      <rect x="420" y="270" width="95" height="160" rx="8" fill="%23f59e0b" stroke="%23d97706" stroke-width="3"/>
      <rect x="425" y="275" width="85" height="70" rx="6" fill="%23fbbf24"/>
      <line x1="430" y1="350" x2="430" y2="430" stroke="%2378350f" stroke-width="6"/>
      <line x1="505" y1="350" x2="505" y2="430" stroke="%2378350f" stroke-width="6"/>
      <text x="468" y="330" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">CHAIR</text>
      <!-- Ceiling sign -->
      <rect x="220" y="50" width="200" height="50" rx="6" fill="%230284c7" stroke="%2338bdf8" stroke-width="2"/>
      <text x="320" y="80" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23f8fafc" text-anchor="middle">EXIT ➔ CAUTION STEPS</text>
      <text x="320" y="150" font-family="sans-serif" font-weight="bold" font-size="18" fill="%2394a3b8" text-anchor="middle">STAIRCASE CORRIDOR</text>
    </svg>`
  },
  {
    id: 'sidewalk-cone-bike',
    title: 'Sidewalk with Traffic Cone & Bike',
    category: 'Outdoor Pedestrian',
    description: 'City sidewalk with high-visibility orange cone in the walking lane and a bicycle parked on the curb.',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%230284c7"/>
          <stop offset="100%" stop-color="%2338bdf8"/>
        </linearGradient>
      </defs>
      <rect width="640" height="200" fill="url(%23sky)"/>
      <rect y="200" width="640" height="280" fill="%23475569"/>
      <!-- Sidewalk pavement lines -->
      <line x1="0" y1="280" x2="640" y2="280" stroke="%2364748b" stroke-width="3"/>
      <line x1="0" y1="380" x2="640" y2="380" stroke="%2364748b" stroke-width="3"/>
      <!-- Warning Traffic Cone in the middle of walking path -->
      <polygon points="320,180 270,360 370,360" fill="%23f97316" stroke="%23ea580c" stroke-width="3"/>
      <polygon points="320,240 295,300 345,300" fill="%23ffffff"/>
      <rect x="250" y="360" width="140" height="24" rx="4" fill="%23c2410c"/>
      <text x="320" y="340" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">CONE</text>
      <!-- Bicycle on the left curb -->
      <circle cx="150" cy="330" r="45" fill="none" stroke="%23e11d48" stroke-width="6"/>
      <circle cx="230" cy="330" r="45" fill="none" stroke="%23e11d48" stroke-width="6"/>
      <line x1="150" y1="330" x2="190" y2="300" stroke="%23e11d48" stroke-width="5"/>
      <line x1="190" y1="300" x2="230" y2="330" stroke="%23e11d48" stroke-width="5"/>
      <line x1="190" y1="300" x2="190" y2="260" stroke="%23e11d48" stroke-width="5"/>
      <line x1="175" y1="260" x2="205" y2="260" stroke="%231e293b" stroke-width="6"/>
      <line x1="220" y1="290" x2="240" y2="250" stroke="%23e11d48" stroke-width="5"/>
      <line x1="230" y1="250" x2="250" y2="250" stroke="%230f172a" stroke-width="5"/>
      <text x="190" y="370" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23ffffff" text-anchor="middle">BICYCLE</text>
      <!-- Street Sign -->
      <rect x="470" y="110" width="120" height="50" rx="6" fill="%2316a34a" stroke="%2322c55e" stroke-width="2"/>
      <text x="530" y="135" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23ffffff" text-anchor="middle">PEDESTRIAN</text>
      <text x="530" y="150" font-family="sans-serif" font-size="11" fill="%23ffffff" text-anchor="middle">WALKWAY</text>
      <line x1="530" y1="160" x2="530" y2="320" stroke="%2394a3b8" stroke-width="6"/>
    </svg>`
  },
  {
    id: 'crosswalk-car',
    title: 'Crosswalk with Approaching Vehicle',
    category: 'Traffic Safety',
    description: 'Pedestrian zebra crossing with a red sedan approaching, walk signal, and stop line.',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="%231e293b"/>
      <!-- Road asphalt -->
      <polygon points="100,480 220,180 420,180 540,480" fill="%230f172a"/>
      <!-- Zebra Stripes -->
      <rect x="220" y="380" width="200" height="20" fill="%23ffffff"/>
      <rect x="235" y="420" width="170" height="20" fill="%23ffffff"/>
      <rect x="250" y="460" width="140" height="20" fill="%23ffffff"/>
      <!-- Approaching Car -->
      <rect x="260" y="220" width="120" height="80" rx="12" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/>
      <!-- Windshield -->
      <rect x="275" y="230" width="90" height="30" rx="4" fill="%2338bdf8"/>
      <!-- Headlights -->
      <circle cx="275" cy="280" r="10" fill="%23fef08a"/>
      <circle cx="365" cy="280" r="10" fill="%23fef08a"/>
      <text x="320" y="295" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ffffff" text-anchor="middle">CAR 15M AHEAD</text>
      <!-- Traffic Light / Walk signal -->
      <rect x="80" y="80" width="60" height="120" rx="10" fill="%23020617" stroke="%23334155" stroke-width="3"/>
      <circle cx="110" cy="110" r="16" fill="%23ef4444"/>
      <circle cx="110" cy="140" r="16" fill="%23475569"/>
      <circle cx="110" cy="170" r="16" fill="%23475569"/>
      <line x1="110" y1="200" x2="110" y2="380" stroke="%2364748b" stroke-width="8"/>
      <text x="320" y="120" font-family="sans-serif" font-weight="bold" font-size="20" fill="%23f87171" text-anchor="middle">STOP: VEHICLE APPROACHING</text>
    </svg>`
  },
  {
    id: 'medicine-currency',
    title: 'Medicine Bottles & Currency Notes',
    category: 'Objects & OCR',
    description: 'Table with prescription medicine bottles, dosage label, and currency notes.',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="%2318181b"/>
      <!-- Wooden table surface -->
      <rect y="160" width="640" height="320" fill="%23451a03"/>
      <!-- Medicine bottle 1 -->
      <rect x="140" y="200" width="80" height="150" rx="12" fill="%23ea580c" stroke="%239a3412" stroke-width="2"/>
      <rect x="155" y="175" width="50" height="25" rx="4" fill="%23f8fafc"/>
      <rect x="145" y="240" width="70" height="70" fill="%23ffffff"/>
      <text x="180" y="260" font-family="sans-serif" font-weight="bold" font-size="11" fill="%230f172a" text-anchor="middle">AMOXICILLIN</text>
      <text x="180" y="280" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ef4444" text-anchor="middle">500 MG</text>
      <text x="180" y="295" font-family="sans-serif" font-size="9" fill="%23334155" text-anchor="middle">Take 1 Capsule Daily</text>
      <!-- Medicine bottle 2 -->
      <rect x="250" y="240" width="70" height="110" rx="10" fill="%230284c7" stroke="%230369a1" stroke-width="2"/>
      <rect x="262" y="220" width="46" height="20" rx="4" fill="%23ffffff"/>
      <rect x="255" y="270" width="60" height="50" fill="%23ffffff"/>
      <text x="285" y="295" font-family="sans-serif" font-weight="bold" font-size="11" fill="%230f172a" text-anchor="middle">EYE DROPS</text>
      <!-- Currency Note (100) -->
      <rect x="360" y="250" width="220" height="110" rx="6" fill="%23059669" stroke="%2310b981" stroke-width="2"/>
      <rect x="375" y="262" width="190" height="86" fill="none" stroke="%2334d399" stroke-width="1.5"/>
      <text x="470" y="295" font-family="sans-serif" font-weight="bold" font-size="28" fill="%23ecfdf5" text-anchor="middle">$100 / ₹500</text>
      <text x="470" y="325" font-family="sans-serif" font-size="12" fill="%23a7f3d0" text-anchor="middle">CURRENCY NOTE</text>
      <!-- Title banner -->
      <text x="320" y="90" font-family="sans-serif" font-weight="bold" font-size="18" fill="%23e2e8f0" text-anchor="middle">PRESCRIPTION LABEL &amp; CURRENCY</text>
    </svg>`
  }
];

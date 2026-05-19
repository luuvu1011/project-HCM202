"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function FloatingShip() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="relative z-10 w-[min(90vw,440px)]"
      animate={reduced ? undefined : { y: [0, -12, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 440 310"
        className="w-full"
        style={{ filter: "drop-shadow(0 32px 70px rgba(0,0,0,0.62)) drop-shadow(0 0 40px rgba(212,168,83,0.08))" }}
        aria-hidden
      >
        <defs>
          {/* Hull gradient */}
          <linearGradient id="fsh-hull" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#223550" />
            <stop offset="60%"  stopColor="#152438" />
            <stop offset="100%" stopColor="#0a1625" />
          </linearGradient>

          {/* Main sail — warm parchment */}
          <linearGradient id="fsh-sail-main" x1="0.1" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#f4ead6" />
            <stop offset="70%"  stopColor="#d4b882" />
            <stop offset="100%" stopColor="#a88248" />
          </linearGradient>

          {/* Fore/mizzen sails — slightly cooler */}
          <linearGradient id="fsh-sail-off" x1="0.2" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#ede2cc" />
            <stop offset="70%"  stopColor="#c4a470" />
            <stop offset="100%" stopColor="#9c7840" />
          </linearGradient>

          {/* Mast: burnished gold */}
          <linearGradient id="fsh-mast" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#7a5e20" />
            <stop offset="40%"  stopColor="#d4a848" />
            <stop offset="100%" stopColor="#7a5e20" />
          </linearGradient>

          {/* Water surface */}
          <linearGradient id="fsh-water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="rgba(26,75,124,0.75)" />
            <stop offset="100%" stopColor="rgba(5,15,31,0.0)"    />
          </linearGradient>

          {/* Horizon glow behind ship */}
          <radialGradient id="fsh-glow" cx="50%" cy="66%" r="50%">
            <stop offset="0%"   stopColor="rgba(200,130,40,0.18)" />
            <stop offset="100%" stopColor="rgba(200,130,40,0.0)"  />
          </radialGradient>

          {/* Porthole window */}
          <radialGradient id="fsh-port" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="rgba(212,168,83,0.25)" />
            <stop offset="100%" stopColor="rgba(212,168,83,0.0)"  />
          </radialGradient>

          {/* Sail crinkle filter */}
          <filter id="fsh-sail-crinkle" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06 0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* ── Atmospheric horizon glow ── */}
        <ellipse cx="220" cy="215" rx="200" ry="55" fill="url(#fsh-glow)" />

        {/* ── Water layer ── */}
        {/* Base ocean surface */}
        <ellipse cx="220" cy="225" rx="185" ry="16" fill="rgba(14,38,72,0.5)" />

        {/* Ship hull reflection */}
        <path
          d="M120 225 C155 228 190 230 220 230 C250 230 285 228 320 225 L316 242 C285 238 250 235 220 235 C190 235 155 238 124 242 Z"
          fill="rgba(12,28,55,0.4)"
          opacity="0.6"
        />

        {/* Wake foam streaks */}
        <motion.g
          animate={reduced ? undefined : { opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="295" cy="222" rx="52" ry="4.5"  fill="rgba(200,220,240,0.18)" />
          <ellipse cx="310" cy="226" rx="36" ry="3"    fill="rgba(200,220,240,0.12)" />
          <ellipse cx="318" cy="230" rx="22" ry="2"    fill="rgba(200,220,240,0.08)" />
        </motion.g>

        {/* ── Hull ── */}
        <motion.g
          animate={reduced ? undefined : { x: [0, 4, -2, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Main hull body */}
          <path
            d="M82 200
               C105 172 148 162 190 164
               C234 166 280 174 318 192
               C334 199 342 210 340 218
               L312 226
               C282 218 252 215 220 215
               C175 215 135 220  90 230
               Z"
            fill="url(#fsh-hull)"
            stroke="rgba(212,168,83,0.38)"
            strokeWidth="1.6"
          />

          {/* Gold waterline stripe */}
          <path
            d="M88 210 C115 202 155 197 192 197 C232 197 272 202 310 212 L315 218 C277 208 234 203 192 203 C153 203 113 208 86 216 Z"
            fill="rgba(212,168,83,0.42)"
          />

          {/* Lower hull edge */}
          <path
            d="M88 218 C120 225 165 228 220 228 C272 228 308 224 338 218 L340 222 C308 228 270 232 220 232 C168 232 124 228 88 222 Z"
            fill="rgba(10,22,42,0.8)"
          />

          {/* Stern decoration */}
          <rect x="80" y="195" width="14" height="34" rx="3" fill="#1a2d47" stroke="rgba(212,168,83,0.3)" strokeWidth="1" />

          {/* Bowsprit (forward-pointing spar) */}
          <line x1="340" y1="197" x2="395" y2="178" stroke="url(#fsh-mast)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="394" y1="178" x2="340" y2="192" stroke="rgba(168,136,48,0.35)" strokeWidth="0.8" />

          {/* Portholes */}
          {[175, 205, 235, 265, 295].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy={188} r={5.5} fill="url(#fsh-port)" stroke="rgba(212,168,83,0.45)" strokeWidth="1.2" />
              <circle cx={cx} cy={188} r={2.5} fill="rgba(212,168,83,0.12)" />
            </g>
          ))}

          {/* Deck railing */}
          <path
            d="M105 184 C145 172 178 168 215 169 C252 170 285 177 318 192"
            fill="none"
            stroke="rgba(212,168,83,0.28)"
            strokeWidth="0.9"
            strokeDasharray="4 5"
          />

          {/* Stern quarter gallery windows */}
          <rect x="82"  y="202" width="7"  height="5" rx="1.5" fill="rgba(212,168,83,0.20)" stroke="rgba(212,168,83,0.4)" strokeWidth="0.8" />
          <rect x="82"  y="210" width="7"  height="5" rx="1.5" fill="rgba(212,168,83,0.20)" stroke="rgba(212,168,83,0.4)" strokeWidth="0.8" />
        </motion.g>

        {/* ── Masts, Sails, Rigging ── */}
        <motion.g
          animate={reduced ? undefined : { x: [0, 4, -2, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ── Mizzenmast (left / stern) ── */}
          <line x1="138" y1="200" x2="142" y2="88"   stroke="url(#fsh-mast)" strokeWidth="3.2" strokeLinecap="round" />
          {/* Mizzen yard */}
          <line x1="116" y1="110" x2="166" y2="106"  stroke="#b89030" strokeWidth="1.5" strokeLinecap="round" />
          {/* Mizzen cap */}
          <circle cx="141" cy="89"  r="2.8" fill="#d4a853" />

          {/* Mizzen sail */}
          <motion.path
            d="M116 110 L166 106 L162 158 C150 162 140 162 131 160 C124 157 118 152 116 148 Z"
            fill="url(#fsh-sail-off)"
            opacity="0.88"
            filter="url(#fsh-sail-crinkle)"
            animate={reduced ? undefined : { d: [
              "M116 110 L166 106 L162 158 C150 162 140 162 131 160 C124 157 118 152 116 148 Z",
              "M118 110 L166 107 L163 157 C151 161 141 162 132 160 C125 156 119 151 117 147 Z",
              "M116 110 L166 106 L162 158 C150 162 140 162 131 160 C124 157 118 152 116 148 Z",
            ]}}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Mainmast (tallest, center) ── */}
          <line x1="220" y1="195" x2="220" y2="20"   stroke="url(#fsh-mast)" strokeWidth="4"   strokeLinecap="round" />
          {/* Upper yard */}
          <line x1="172" y1="52"  x2="268" y2="48"   stroke="#b89030" strokeWidth="2"   strokeLinecap="round" />
          {/* Lower yard */}
          <line x1="180" y1="86"  x2="260" y2="82"   stroke="#b89030" strokeWidth="1.8" strokeLinecap="round" />
          {/* Mainmast cap + flag */}
          <circle cx="220" cy="21"  r="3.2" fill="#d4a853" />
          {/* Vietnamese flag pennant */}
          <path d="M220 21 L244 16 L222 28" fill="rgba(194,59,59,0.75)" />

          {/* Main upper sail */}
          <motion.path
            d="M172 52 L268 48 L264 82 L180 86 Z"
            fill="url(#fsh-sail-main)"
            opacity="0.91"
            filter="url(#fsh-sail-crinkle)"
            animate={reduced ? undefined : { d: [
              "M172 52 L268 48 L264 82 L180 86 Z",
              "M174 52 L268 49 L265 82 L181 86 Z",
              "M172 52 L268 48 L264 82 L180 86 Z",
            ]}}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Main lower sail */}
          <motion.path
            d="M180 86 L260 82 L255 160 C240 164 228 165 218 165 C207 165 194 163 186 160 Z"
            fill="url(#fsh-sail-main)"
            opacity="0.87"
            filter="url(#fsh-sail-crinkle)"
            animate={reduced ? undefined : { d: [
              "M180 86 L260 82 L255 160 C240 164 228 165 218 165 C207 165 194 163 186 160 Z",
              "M181 86 L261 82 L257 159 C241 163 229 165 219 165 C208 165 195 162 187 159 Z",
              "M180 86 L260 82 L255 160 C240 164 228 165 218 165 C207 165 194 163 186 160 Z",
            ]}}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />

          {/* ── Foremast (right side) ── */}
          <line x1="298" y1="190" x2="295" y2="64"   stroke="url(#fsh-mast)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Fore yard */}
          <line x1="264" y1="86"  x2="326" y2="82"   stroke="#b89030" strokeWidth="1.8" strokeLinecap="round" />
          {/* Fore cap */}
          <circle cx="295" cy="65"  r="2.8" fill="#d4a853" />

          {/* Fore sail */}
          <motion.path
            d="M264 86 L326 82 L320 150 C305 155 295 155 286 153 C276 151 268 147 265 143 Z"
            fill="url(#fsh-sail-off)"
            opacity="0.86"
            filter="url(#fsh-sail-crinkle)"
            animate={reduced ? undefined : { d: [
              "M264 86 L326 82 L320 150 C305 155 295 155 286 153 C276 151 268 147 265 143 Z",
              "M265 86 L326 83 L321 149 C306 154 296 154 287 152 C277 150 269 146 266 142 Z",
              "M264 86 L326 82 L320 150 C305 155 295 155 286 153 C276 151 268 147 265 143 Z",
            ]}}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />

          {/* Staysail between foremast and mainmast */}
          <motion.path
            d="M263 87 L218 85 L218 155 C238 150 254 140 262 130 Z"
            fill="url(#fsh-sail-off)"
            opacity="0.72"
            animate={reduced ? undefined : { d: [
              "M263 87 L218 85 L218 155 C238 150 254 140 262 130 Z",
              "M264 87 L219 85 L219 154 C239 149 255 139 263 129 Z",
              "M263 87 L218 85 L218 155 C238 150 254 140 262 130 Z",
            ]}}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* ── Rigging network ── */}
          {/* Forestay: bow → mainmast */}
          <line x1="390" y1="180" x2="220" y2="24"   stroke="rgba(168,136,48,0.30)" strokeWidth="0.9" />
          {/* Main shroud left */}
          <line x1="220" y1="45"  x2="188" y2="188"  stroke="rgba(168,136,48,0.28)" strokeWidth="0.8" />
          {/* Main shroud right */}
          <line x1="220" y1="45"  x2="252" y2="188"  stroke="rgba(168,136,48,0.28)" strokeWidth="0.8" />
          {/* Backstay main */}
          <line x1="220" y1="38"  x2="118" y2="192"  stroke="rgba(168,136,48,0.22)" strokeWidth="0.8" />
          {/* Fore shroud */}
          <line x1="295" y1="70"  x2="270" y2="188"  stroke="rgba(168,136,48,0.24)" strokeWidth="0.8" />
          <line x1="295" y1="70"  x2="320" y2="186"  stroke="rgba(168,136,48,0.24)" strokeWidth="0.8" />
          {/* Between masts */}
          <line x1="295" y1="70"  x2="220" y2="42"   stroke="rgba(168,136,48,0.28)" strokeWidth="0.7" />
          <line x1="220" y1="65"  x2="142" y2="94"   stroke="rgba(168,136,48,0.22)" strokeWidth="0.7" />

          {/* Mast glow (subtle) */}
          <line x1="220" y1="195" x2="220" y2="20"   stroke="rgba(212,168,83,0.06)" strokeWidth="7" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

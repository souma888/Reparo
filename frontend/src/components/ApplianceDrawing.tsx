export function ApplianceDrawing() {
  return (
    <svg
      className="appliance-drawing"
      viewBox="0 0 520 490"
      fill="none"
      role="img"
      aria-label="Architectural illustration of a washing machine with a bronze circular door"
    >
      <defs>
        <linearGradient
          id="cabinet"
          x1="110"
          y1="60"
          x2="410"
          y2="440"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#393A38" />
          <stop offset="1" stopColor="#222321" />
        </linearGradient>
        <linearGradient
          id="bronze"
          x1="165"
          y1="185"
          x2="340"
          y2="360"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D5B88D" />
          <stop offset=".45" stopColor="#A77B46" />
          <stop offset="1" stopColor="#604728" />
        </linearGradient>
        <radialGradient id="glass">
          <stop stopColor="#3B4140" />
          <stop offset="1" stopColor="#171B1B" />
        </radialGradient>
        <pattern id="drum" width="13" height="13" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1" fill="#72736B" opacity=".3" />
        </pattern>
      </defs>
      <ellipse cx="273" cy="439" rx="178" ry="17" fill="#000" opacity=".24" />
      <path
        d="m121 76 32-21h254v353l-33 23H121V76Z"
        fill="#343532"
        stroke="#66645B"
        strokeWidth=".8"
      />
      <path d="m374 77 33-22v353l-33 23V77Z" fill="#20211F" />
      <path d="m121 76 32-21h254l-33 22H121Z" fill="#51514B" />
      <rect
        x="121"
        y="77"
        width="253"
        height="354"
        rx="3"
        fill="url(#cabinet)"
        stroke="#77746A"
        strokeWidth=".7"
      />
      <path d="M122 143h251" stroke="#77746A" strokeWidth=".6" />
      <rect
        x="137"
        y="96"
        width="65"
        height="26"
        rx="2"
        stroke="#77746A"
        strokeWidth=".8"
      />
      <path d="M145 108h45" stroke="#77746A" strokeWidth=".7" />
      <circle cx="239" cy="109" r="16" fill="#262724" stroke="#969080" />
      <path d="M239 97v8" stroke="#C5AD89" strokeWidth="1.5" />
      <rect x="280" y="99" width="59" height="20" rx="2" fill="#161917" />
      <text
        x="310"
        y="113"
        fill="#C4B99B"
        textAnchor="middle"
        fontSize="10"
        fontFamily="monospace"
        letterSpacing="2"
      >
        0:48
      </text>
      <circle cx="248" cy="270" r="99" stroke="#615B4E" strokeWidth=".7" />
      <circle cx="248" cy="270" r="88" fill="url(#bronze)" />
      <circle
        cx="248"
        cy="270"
        r="78"
        fill="#1B1E1C"
        stroke="#D2B181"
        strokeWidth=".7"
      />
      <circle cx="248" cy="270" r="68" fill="url(#glass)" />
      <circle cx="248" cy="270" r="65" fill="url(#drum)" />
      <path
        d="M194 286c23-38 55 13 106-11-12 47-87 63-106 11Z"
        fill="#666C62"
        opacity=".3"
      />
      <path
        d="M201 241a54 54 0 0 1 73-21"
        stroke="#DAD6C5"
        strokeOpacity=".18"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M318 252v31"
        stroke="#D1B080"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M136 405h224" stroke="#77746A" strokeWidth=".5" />
      <rect
        x="325"
        y="383"
        width="27"
        height="12"
        rx="1"
        stroke="#77746A"
        strokeWidth=".6"
      />
      <path d="M140 432v7m215-7v7" stroke="#54534B" strokeWidth="7" />
      <path
        d="M82 190h58m-58 0v49m266 106h70m0 0v-50"
        stroke="#A77B46"
        strokeWidth=".7"
      />
      <circle cx="140" cy="190" r="2.5" fill="#A77B46" />
      <circle cx="348" cy="345" r="2.5" fill="#A77B46" />
      <text
        x="63"
        y="264"
        fill="#9B9689"
        fontFamily="monospace"
        fontSize="9"
        letterSpacing="2"
        transform="rotate(-90 63 264)"
      >
        DESIGNED TO LAST
      </text>
    </svg>
  );
}

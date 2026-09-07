export const HardwareIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" {...props}>
    <style>{`
      .slot1 { animation: blink 1.2s ease-in-out infinite; }
      .slot2 { animation: blink 1.2s ease-in-out 0.4s infinite; }
      .slot3 { animation: blink 1.2s ease-in-out 0.8s infinite; }
      .led1 { animation: led 0.6s ease-in-out infinite; }
      .led2 { animation: led 0.5s ease-in-out 0.2s infinite; }
      .led3 { animation: led 0.7s ease-in-out 0.1s infinite; }
      .led4 { animation: led 0.55s ease-in-out 0.3s infinite; }
      .wave1 { animation: wave 1.4s ease-in-out infinite; }
      .wave2 { animation: wave 1.8s ease-in-out 0.3s infinite; }
      .rack { animation: pulse 2s ease-in-out infinite; }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.45} }
      @keyframes led { 0%,100%{opacity:1} 50%{opacity:0.15} }
      @keyframes wave {
        0%,100% { d: path("M95 40 Q105 50 95 60"); opacity:0.8 }
        50% { d: path("M95 40 Q118 50 95 60"); opacity:0.3 }
      }
      @keyframes pulse {
        0%,100% { filter: drop-shadow(0 0 4px #ff6b6b); }
        50% { filter: drop-shadow(0 0 12px #ff6b6b); }
      }
    `}</style>
    <defs>
      <linearGradient id="hwG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff6b6b"/>
        <stop offset="100%" stop-color="#e17055"/>
      </linearGradient>
    </defs>
    <rect className="rack" x="25" y="18" width="70" height="84" rx="8" fill="url(#hwG)"/>
    <rect className="slot1" x="32" y="26" width="56" height="18" rx="3" fill="#2d3436"/>
    <rect className="slot2" x="32" y="50" width="56" height="18" rx="3" fill="#2d3436"/>
    <rect className="slot3" x="32" y="74" width="56" height="18" rx="3" fill="#2d3436"/>
    <circle className="led1" cx="42" cy="35" r="3.5" fill="#00ff88"/>
    <circle className="led2" cx="54" cy="35" r="3.5" fill="#00ff88"/>
    <circle className="led3" cx="42" cy="59" r="3.5" fill="#74b9ff"/>
    <circle className="led4" cx="54" cy="59" r="3.5" fill="#fdcb6e"/>
    <circle className="led1" cx="42" cy="83" r="3.5" fill="#ff7675"/>
    <circle className="led2" cx="54" cy="83" r="3.5" fill="#a29bfe"/>
    <path className="wave1" d="M95 40 Q105 50 95 60" fill="none" stroke="#ff7675" stroke-width="2.5"/>
    <path className="wave2" d="M95 55 Q110 68 95 80" fill="none" stroke="#fab1a0" stroke-width="2"/>
  </svg>
);

export const SoftwareIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" {...props}>
    <style>{`
      .line1 { animation: type 2s ease-in-out infinite; }
      .line2 { animation: type 2.2s ease-in-out 0.2s infinite; }
      .line3 { animation: type 1.8s ease-in-out 0.4s infinite; }
      .line4 { animation: type 2.4s ease-in-out 0.1s infinite; }
      .line5 { animation: type 2s ease-in-out 0.3s infinite; }
      .cursor { animation: blink 0.7s step-end infinite; }
      .float1 { animation: float 2.5s ease-in-out infinite; }
      .float2 { animation: float 3s ease-in-out 0.5s infinite; }
      .book { animation: softPulse 2.5s ease-in-out infinite; }
      @keyframes type {
        0%,100% { width: 28px; }
        50% { width: 38px; }
      }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes float {
        0%,100% { transform: translateY(0); opacity:0.7 }
        50% { transform: translateY(-10px); opacity:1 }
      }
      @keyframes softPulse {
        0%,100% { filter: drop-shadow(0 0 3px #74b9ff); }
        50% { filter: drop-shadow(0 0 10px #0984e3); }
      }
    `}</style>
    <defs>
      <linearGradient id="swG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#74b9ff"/>
        <stop offset="100%" stop-color="#0984e3"/>
      </linearGradient>
    </defs>
    <rect className="book" x="28" y="20" width="58" height="80" rx="5" fill="url(#swG)"/>
    <rect x="34" y="27" width="46" height="66" rx="3" fill="#dfe6e9"/>
    <rect className="line1" x="40" y="35" height="5" rx="1.5" fill="#0984e3" width="30"/>
    <rect className="line2" x="40" y="46" height="5" rx="1.5" fill="#00b894" width="25"/>
    <rect className="line3" x="40" y="57" height="5" rx="1.5" fill="#6c5ce7" width="35"/>
    <rect className="line4" x="40" y="68" height="5" rx="1.5" fill="#e17055" width="22"/>
    <rect className="line5" x="40" y="79" height="5" rx="1.5" fill="#00cec9" width="28"/>
    <rect className="cursor" x="72" y="34" width="2.5" height="8" fill="#2d3436"/>
    <text className="float1" x="92" y="42" font-size="11" fill="#74b9ff" font-family="monospace">{`{ }`}</text>
    <text className="float2" x="90" y="60" font-size="10" fill="#00b894" font-family="monospace">&lt;/&gt;</text>
    <text className="float1" x="94" y="78" font-size="9" fill="#a29bfe" font-family="monospace">fn</text>
  </svg>
);

export const SecurityIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" {...props}>
    <style>{`
      .bar1 { animation: grow 1.6s ease-in-out infinite; }
      .bar2 { animation: grow 1.9s ease-in-out 0.3s infinite; }
      .bar3 { animation: grow 1.4s ease-in-out 0.5s infinite; }
      .shield { animation: spin 6s linear infinite; transform-origin: 100px 22px; }
      .radar1 { animation: radar 2s ease-out infinite; }
      .radar2 { animation: radar 2s ease-out 0.7s infinite; }
      .screen { animation: glow 2s ease-in-out infinite; }
      @keyframes grow {
        0%,100% { transform: scaleY(1); }
        50% { transform: scaleY(1.6); }
      }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes radar {
        0% { r: 4; opacity: 0.9; }
        100% { r: 28; opacity: 0; }
      }
      @keyframes glow {
        0%,100% { filter: drop-shadow(0 0 4px #a29bfe); }
        50% { filter: drop-shadow(0 0 14px #6c5ce7); }
      }
    `}</style>
    <defs>
      <linearGradient id="admG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a29bfe"/>
        <stop offset="100%" stop-color="#6c5ce7"/>
      </linearGradient>
    </defs>
    <rect x="18" y="88" width="84" height="10" rx="3" fill="#636e72"/>
    <rect x="38" y="91" width="44" height="4" rx="1.5" fill="#b2bec3"/>
    <rect className="screen" x="24" y="22" width="72" height="60" rx="5" fill="url(#admG)"/>
    <rect x="30" y="28" width="60" height="46" rx="3" fill="#1e272e"/>
    <g transform="translate(0,74)">
      <rect className="bar1" x="36" y="-28" width="14" height="18" rx="2" fill="#6c5ce7" style={{transformOrigin: "43px 0"}}/>
      <rect className="bar2" x="54" y="-22" width="14" height="12" rx="2" fill="#00cec9" style={{transformOrigin: "61px 0"}}/>
      <rect className="bar3" x="72" y="-32" width="12" height="22" rx="2" fill="#fd79a8" style={{transformOrigin: "78px 0"}}/>
    </g>
    <circle className="radar1" cx="60" cy="48" r="4" fill="none" stroke="#a29bfe" stroke-width="1.5"/>
    <circle className="radar2" cx="60" cy="48" r="4" fill="none" stroke="#6c5ce7" stroke-width="1.5"/>
    <g className="shield">
      <path d="M100 10 L110 16 L110 28 L100 34 L90 28 L90 16 Z" fill="#fd79a8"/>
      <circle cx="100" cy="22" r="4" fill="#fff"/>
    </g>
  </svg>
);

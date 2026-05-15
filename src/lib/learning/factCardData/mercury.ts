export const MERCURY_FACT_CARDS = [
  {
    id: 'mercury_temperature',
    bodyId: 'mercury',
    icon: '🌡️',
    level: 'both',
    title: { sv: 'Extrema temperaturer', en: 'Extreme temperatures' },
    body: {
      sv: 'På Merkurius är det 430 °C på dagen och –180 °C på natten — den största temperaturskillnaden av alla planeter. Det beror på att Merkurius saknar atmosfär som kan hålla kvar värmen.',
      en: "On Mercury it's 430 °C during the day and –180 °C at night — the largest temperature swing of any planet. This is because Mercury has no atmosphere to hold in heat.",
    },
  },
  {
    id: 'mercury_slow_day',
    bodyId: 'mercury',
    icon: '🐢',
    level: 'upper',
    title: { sv: 'En dag längre än ett år', en: 'A day longer than a year' },
    body: {
      sv: 'Merkurius roterar så långsamt att ett dygn tar 176 jorddagar, men planeten hinner kretsa runt Solen på bara 88 dagar. Alltså är ett år kortare än ett dygn.',
      en: 'Mercury rotates so slowly that one day lasts 176 Earth days, but the planet orbits the Sun in just 88 days. So a year is actually shorter than a single day.',
    },
  },
  {
    id: 'mercury_craters',
    bodyId: 'mercury',
    icon: '🕳️',
    level: 'middle',
    title: { sv: 'En yta full av sår', en: 'A surface full of scars' },
    body: {
      sv: 'Merkurius yta är täckt av kratrarna — spår från miljarder år av asteroidnedslag. Utan atmosfär eroderas ingenting, så alla gamla sår syns fortfarande precis som de en gång uppstod.',
      en: "Mercury's surface is covered in craters — scars from billions of years of asteroid impacts. With no atmosphere, nothing erodes, so every ancient wound is still visible exactly as it formed.",
    },
  },
  {
    id: 'mercury_hard_to_see',
    bodyId: 'mercury',
    icon: '🔭',
    level: 'middle',
    title: { sv: 'Svår att se på himlen', en: 'Hard to spot in the sky' },
    body: {
      sv: 'Merkurius är den innersta planeten och alltid nära Solen på himlen. Många stjärntittare har aldrig sett den med blotta ögat — den dyker bara upp nära horisonten strax efter solnedgång.',
      en: 'Mercury is the innermost planet and always close to the Sun in the sky. Many stargazers have never spotted it with the naked eye — it only appears near the horizon just after sunset.',
    },
  },
] as const;

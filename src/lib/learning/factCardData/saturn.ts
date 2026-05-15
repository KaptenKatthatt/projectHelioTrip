export const SATURN_FACT_CARDS = [
  {
    id: 'saturn_rings',
    bodyId: 'saturn',
    icon: '💍',
    level: 'middle',
    title: {
      sv: 'Ringarna — tunnare än ett papper',
      en: 'The rings — thinner than a sheet of paper',
    },
    body: {
      sv: 'Saturnus ringar är gjorda av miljarder isbitar och stenblock. I förhållande till sin bredd är ringarna tunnare än ett A4-papper.',
      en: "Saturn's rings are made of billions of pieces of ice and rock. Relative to their width, the rings are thinner than a sheet of A4 paper.",
    },
  },
  {
    id: 'saturn_floats',
    bodyId: 'saturn',
    icon: '⚖️',
    level: 'both',
    title: { sv: 'Den enda planeten som flyter', en: 'The only planet that floats' },
    body: {
      sv: 'Saturnus är den enda planeten i solsystemet som är lättare än vatten. Om du hade ett tillräckligt stort badkar skulle Saturnus flyta på ytan.',
      en: 'Saturn is the only planet in the solar system less dense than water. If you had a bathtub large enough, Saturn would float.',
    },
  },
  {
    id: 'saturn_winds',
    bodyId: 'saturn',
    icon: '🌬️',
    level: 'upper',
    title: {
      sv: 'Vindar starkare än jordens kraftigaste orkan',
      en: "Winds stronger than Earth's worst hurricane",
    },
    body: {
      sv: 'Saturnus har vindar upp till 1 800 km/h vid ekvatorn — fem gånger starkare än de kraftigaste orkanerna på Jorden.',
      en: "Saturn has winds up to 1,800 km/h at the equator — five times stronger than Earth's worst hurricanes.",
    },
  },
  {
    id: 'saturn_rings_temporary',
    bodyId: 'saturn',
    icon: '🕰️',
    level: 'both',
    title: { sv: 'Ringarna försvinner', en: 'The rings are disappearing' },
    body: {
      sv: 'Saturnus ringar krymper sakta och kommer att vara borta om ungefär 100 miljoner år — en kort stund kosmiskt sett. Vi lever i en lycklig tid då de fortfarande finns att se.',
      en: "Saturn's rings are slowly shrinking and will be gone in about 100 million years — a brief moment in cosmic terms. We live in a lucky era when they're still there to see.",
    },
  },
] as const;

export const MOON_FACT_CARDS = [
  {
    id: 'moon_locked',
    bodyId: 'moon',
    icon: '🌕',
    level: 'middle',
    title: { sv: 'Varför ser vi alltid samma sida?', en: 'Why do we always see the same side?' },
    body: {
      sv: 'Månen roterar precis lika snabbt som den kretsar runt Jorden, så vi ser alltid samma sida. Det kallas "låst rotation" och uppstår när tyngdkraften saktar ner ett objekts snurr.',
      en: 'The Moon rotates at exactly the same speed as it orbits Earth, so we always see the same face. This is called "tidal locking" and happens when gravity gradually slows an object\'s spin over time.',
    },
  },
  {
    id: 'moon_tides',
    bodyId: 'moon',
    icon: '🌊',
    level: 'middle',
    title: { sv: 'Månens drag skapar tidvatten', en: "The Moon's pull creates tides" },
    body: {
      sv: 'Månens gravitation drar i Jordens hav och skapar tidvatten — havet höjs och sänks upp till tolv meter vid vissa kuster.',
      en: "The Moon's gravity pulls on Earth's oceans, creating tides — the sea rises and falls by up to twelve metres at some coasts.",
    },
  },
  {
    id: 'moon_visited',
    bodyId: 'moon',
    icon: '🚀',
    level: 'middle',
    title: {
      sv: 'Det enda stället utanför Jorden vi besökt',
      en: 'The only place beyond Earth humans have visited',
    },
    body: {
      sv: 'Månen är det enda himmelsobjektet utanför Jorden där människor har landat. Neil Armstrong och Buzz Aldrin klev ner den 20 juli 1969. Totalt tolv astronauter har gått på Månen.',
      en: 'The Moon is the only celestial body beyond Earth where humans have landed. Neil Armstrong and Buzz Aldrin stepped down on July 20, 1969. Twelve astronauts in total have walked on the Moon.',
    },
  },
  {
    id: 'moon_origin',
    bodyId: 'moon',
    icon: '💥',
    level: 'upper',
    title: { sv: 'Månens våldsamma ursprung', en: "The Moon's violent origin" },
    body: {
      sv: 'Månen bildades troligtvis när en Mars-stor kropp kraschade in i den unga Jorden för 4,5 miljarder år sedan. Debriset kastades ut i omloppsbana och klumpade ihop sig till vår Måne.',
      en: 'The Moon most likely formed when a Mars-sized body smashed into the young Earth 4.5 billion years ago. The debris was thrown into orbit and clumped together to form our Moon.',
    },
  },
] as const;

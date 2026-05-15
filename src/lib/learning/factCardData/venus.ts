export const VENUS_FACT_CARDS = [
  {
    id: 'venus_hottest',
    bodyId: 'venus',
    icon: '🔥',
    level: 'both',
    title: {
      sv: 'Hetare än Merkurius — trots att den är längre bort',
      en: 'Hotter than Mercury — despite being farther away',
    },
    body: {
      sv: 'Venus är den hetaste planeten trots att den inte är närmast Solen. Tjocka koldioxidmoln fungerar som ett växthus och håller kvar värmen tills ytan når 465 °C.',
      en: "Venus is the hottest planet even though it isn't the closest to the Sun. Thick carbon dioxide clouds act like a greenhouse, trapping heat until the surface reaches 465 °C.",
    },
  },
  {
    id: 'venus_backwards',
    bodyId: 'venus',
    icon: '⏰',
    level: 'upper',
    title: { sv: 'Bakvänd dag', en: 'A backwards day' },
    body: {
      sv: 'Venus roterar åt motsatt håll jämfört med de flesta planeter. Om du stod på Venus skulle solen gå upp i väster och ner i öster — precis tvärtom mot Jorden.',
      en: 'Venus rotates in the opposite direction to most planets. If you stood on Venus, the Sun would rise in the west and set in the east — the exact opposite of Earth.',
    },
  },
  {
    id: 'venus_acid_rain',
    bodyId: 'venus',
    icon: '🌫️',
    level: 'both',
    title: { sv: 'Syraregn som aldrig når marken', en: 'Acid rain that never reaches the ground' },
    body: {
      sv: 'Venusatmosfären innehåller svavelsyra och det "regnar" faktiskt. Men syrregnet avdunstar direkt i den extrema värmen innan det ens är halvvägs ner mot marken.',
      en: 'Venus\'s atmosphere contains sulfuric acid and it actually "rains." But the acid rain evaporates immediately in the extreme heat before it even reaches halfway to the ground.',
    },
  },
  {
    id: 'venus_twin',
    bodyId: 'venus',
    icon: '🌍',
    level: 'middle',
    title: { sv: 'Jordens farliga syster', en: "Earth's dangerous twin" },
    body: {
      sv: 'Venus kallas ibland Jordens syster — den är ungefär lika stor och lika tung. Men likheterna tar slut där. Venus är ett inferno med skyhögt lufttryck, Jorden ett paradis.',
      en: "Venus is sometimes called Earth's twin sister — it's roughly the same size and mass. But the similarities end there. Venus is an inferno with crushing air pressure; Earth is a paradise.",
    },
  },
] as const;

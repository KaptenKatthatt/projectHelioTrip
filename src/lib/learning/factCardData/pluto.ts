export const PLUTO_FACT_CARDS = [
  {
    id: 'pluto_dwarf',
    bodyId: 'pluto',
    icon: '🌑',
    level: 'both',
    title: { sv: 'Inte längre en planet', en: 'No longer a planet' },
    body: {
      sv: 'Pluto klassades som planet från 1930 till 2006, då astronomerna omdefinierade "planet". Pluto har inte rensat sin omloppsbana på andra objekt och är nu en dvärgplanet.',
      en: 'Pluto was classed as a planet from 1930 until 2006, when astronomers redefined "planet." Pluto hasn\'t cleared its orbit of other objects — so it\'s now a dwarf planet.',
    },
  },
  {
    id: 'pluto_heart',
    bodyId: 'pluto',
    icon: '🏔️',
    level: 'middle',
    title: { sv: 'Hjärtat på Pluto', en: "Pluto's heart" },
    body: {
      sv: 'Pluto har ett gigantiskt hjärtformat område av ren kväveseis kallat Tombaugh Regio. Det hittades av rymdsonden New Horizons 2015 — 85 år efter att Pluto upptäcktes.',
      en: 'Pluto has a giant heart-shaped region of pure nitrogen ice called Tombaugh Regio. It was discovered by the New Horizons spacecraft in 2015 — 85 years after Pluto itself was found.',
    },
  },
  {
    id: 'pluto_cold',
    bodyId: 'pluto',
    icon: '❄️',
    level: 'middle',
    title: { sv: 'Nästan absolut nollpunkt', en: 'Almost absolute zero' },
    body: {
      sv: 'Temperaturen på Pluto är ungefär –230 °C. Absoluta nollpunkten — kallaste möjliga temperaturen — är –273 °C. Pluto är alltså bara 43 grader från det fysikaliska bottnet.',
      en: 'The temperature on Pluto is about –230 °C. Absolute zero — the coldest possible temperature — is –273 °C. So Pluto is just 43 degrees away from the physical bottom.',
    },
  },
  {
    id: 'pluto_new_horizons',
    bodyId: 'pluto',
    icon: '🔭',
    level: 'upper',
    title: { sv: 'Den sista att besökas', en: 'The last to be visited' },
    body: {
      sv: 'New Horizons lämnade Jorden 2006 och flög förbi Pluto i juli 2015 — en resa på 9,5 år. Bilderna visade en förvånansvärt aktiv värld med berg, slätter och atmosfär.',
      en: 'New Horizons left Earth in 2006 and flew past Pluto in July 2015 — a 9.5-year journey. The images revealed a surprisingly geologically active world with mountains, plains, and an atmosphere.',
    },
  },
] as const;

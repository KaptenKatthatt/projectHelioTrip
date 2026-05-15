export const NEPTUNE_FACT_CARDS = [
  {
    id: 'neptune_winds',
    bodyId: 'neptune',
    icon: '🌬️',
    level: 'both',
    title: {
      sv: 'Starkaste vindarna i solsystemet',
      en: 'The strongest winds in the solar system',
    },
    body: {
      sv: 'Neptunus har de starkaste vindarna av alla planeter — upp till 2 100 km/h. Det är märkligt eftersom Neptunus är så långt från Solen och tar emot lite energi.',
      en: 'Neptune has the strongest winds of any planet — up to 2,100 km/h. This is puzzling because Neptune is so far from the Sun and receives little energy.',
    },
  },
  {
    id: 'neptune_blue',
    bodyId: 'neptune',
    icon: '🔵',
    level: 'middle',
    title: { sv: 'Den blåaste planeten', en: 'The bluest planet' },
    body: {
      sv: 'Neptunus är den djupblåaste planeten i solsystemet. Precis som Uranus beror det på metan i atmosfären — men Neptunus är tydligt mörkare blå.',
      en: "Neptune is the most intensely blue planet in the solar system. Like Uranus it's due to methane in the atmosphere — but Neptune is noticeably darker blue.",
    },
  },
  {
    id: 'neptune_voyage',
    bodyId: 'neptune',
    icon: '🛤️',
    level: 'middle',
    title: { sv: '12 år för att nå dit', en: '12 years to get there' },
    body: {
      sv: 'Det tog rymdsonden Voyager 2 tolv år att nå Neptunus efter att den lämnade Jorden 1977. Den flög förbi 1989 och är fortfarande den enda sond som besökt planeten.',
      en: 'It took the Voyager 2 spacecraft twelve years to reach Neptune after leaving Earth in 1977. It flew past in 1989 and remains the only spacecraft ever to have visited the planet.',
    },
  },
  {
    id: 'neptune_triton',
    bodyId: 'neptune',
    icon: '🌑',
    level: 'both',
    title: { sv: 'Bakvänd måne', en: 'A backwards moon' },
    body: {
      sv: 'Neptunus största måne Triton rör sig bakvänt — motsatt Neptunus rotation. Det tyder på att Triton inte bildades runt Neptunus utan fångades in från det yttre solsystemet.',
      en: "Neptune's largest moon Triton orbits backwards — opposite to Neptune's rotation. This suggests Triton didn't form around Neptune but was captured from the outer solar system.",
    },
  },
] as const;

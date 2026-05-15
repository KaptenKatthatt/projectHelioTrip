export const TRITON_FACT_CARDS = [
  {
    id: 'triton_backwards',
    bodyId: 'triton',
    icon: '🔄',
    level: 'both',
    title: { sv: 'Den bakvänt kretsande månen', en: 'The moon that orbits backwards' },
    body: {
      sv: 'Triton kretsar runt Neptunus i motsatt riktning mot Neptunus rotation — den enda stora månen i solsystemet som gör det. Det tyder på att den fångades in utifrån.',
      en: "Triton orbits Neptune in the opposite direction to Neptune's rotation — the only large moon in the solar system to do so. This strongly suggests it was captured from elsewhere.",
    },
  },
  {
    id: 'triton_geysers',
    bodyId: 'triton',
    icon: '🌋',
    level: 'both',
    title: { sv: 'Kvävegeysers i kylan', en: 'Nitrogen geysers in the cold' },
    body: {
      sv: 'Triton har aktiva gejsrar som sprutar kvävegas upp till 8 km i höjden. Solljuset värmer upp kväveisen under ytan tills den förvandlas till gas och bryter igenom.',
      en: 'Triton has active geysers that shoot nitrogen gas up to 8 km into the air. Sunlight heats nitrogen ice below the surface until it turns to gas and breaks through.',
    },
  },
  {
    id: 'triton_cold',
    bodyId: 'triton',
    icon: '❄️',
    level: 'middle',
    title: {
      sv: 'En av de kallaste platserna vi mätt',
      en: "One of the coldest places we've measured",
    },
    body: {
      sv: 'Triton är en av de kallaste kroppar vi har mätt i solsystemet — ungefär –235 °C. Det är bara 38 grader över den absoluta nollpunkten.',
      en: "Triton is one of the coldest objects we've measured in the solar system — about –235 °C. That's just 38 degrees above absolute zero.",
    },
  },
  {
    id: 'triton_doomed',
    bodyId: 'triton',
    icon: '🕐',
    level: 'upper',
    title: { sv: 'En måne med inbyggt förfallodatum', en: 'A moon with a built-in expiry date' },
    body: {
      sv: 'Triton rör sig i en sakta spiralformad bana mot Neptunus. Om ungefär 3,6 miljarder år kommer Neptunus tyngdkraft riva sönder månen och skapa ett nytt ringsystem.',
      en: "Triton is slowly spiralling inward toward Neptune. In about 3.6 billion years, Neptune's gravity will tear the moon apart and create a new ring system.",
    },
  },
] as const;

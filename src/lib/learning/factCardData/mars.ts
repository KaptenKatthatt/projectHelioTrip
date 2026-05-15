export const MARS_FACT_CARDS = [
  {
    id: 'mars_olympus',
    bodyId: 'mars',
    icon: '🏔️',
    level: 'middle',
    title: { sv: 'Solsystemets högsta berg', en: 'The tallest mountain in the solar system' },
    body: {
      sv: 'Olympus Mons på Mars är tre gånger högre än Mount Everest och lika brett som Sverige. Det är en gammal vulkan — och den högsta kända toppen i hela solsystemet.',
      en: "Olympus Mons on Mars is three times taller than Mount Everest and as wide as Sweden. It's an ancient volcano — and the tallest known peak in the entire solar system.",
    },
  },
  {
    id: 'mars_red',
    bodyId: 'mars',
    icon: '🔴',
    level: 'middle',
    title: { sv: 'En planet täckt av rost', en: 'A planet covered in rust' },
    body: {
      sv: 'Mars är röd för att ytan täcks av järnoxid — rost. Det är exakt samma process som när en gammal cykel rostar, fast på planetskala.',
      en: "Mars is red because its surface is covered in iron oxide — rust. It's the exact same process as when an old bicycle rusts, just on a planetary scale.",
    },
  },
  {
    id: 'mars_dust_storms',
    bodyId: 'mars',
    icon: '🌬️',
    level: 'both',
    title: { sv: 'Planettäckande sandstormar', en: 'Planet-wide dust storms' },
    body: {
      sv: 'Mars har enorma dammstormar som ibland täcker hela planeten i månader. Under de värsta stormarna når solljuset knappt ned till ytan — himlen är konstant orange dimma.',
      en: 'Mars experiences massive dust storms that sometimes cover the entire planet for months. During the worst storms, sunlight barely reaches the surface — the sky is a constant orange haze.',
    },
  },
  {
    id: 'mars_water_past',
    bodyId: 'mars',
    icon: '💧',
    level: 'upper',
    title: { sv: 'Floder och sjöar en gång i tiden', en: 'Rivers and lakes long ago' },
    body: {
      sv: 'För miljarder år sedan flödade vatten i floder och sjöar på Mars. Idag finns vatten kvar som is vid polerna och möjligen som saltlösning djupt under ytan.',
      en: 'Billions of years ago, water flowed in rivers and lakes on Mars. Today, water remains as ice at the poles and possibly as saltwater deep underground.',
    },
  },
] as const;

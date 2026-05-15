export const ISS_FACT_CARDS = [
  {
    id: 'iss_construction',
    bodyId: 'iss',
    icon: '🏗️',
    level: 'middle',
    title: { sv: 'Byggd i rymden, bit för bit', en: 'Built in space, piece by piece' },
    body: {
      sv: 'ISS byggdes inte i ett stycke och sköts upp. Den monterades bit för bit i rymden under 13 år av astronauter från 15 länder.',
      en: "The ISS wasn't built in one piece and launched. It was assembled piece by piece in space over 13 years by astronauts from 15 countries.",
    },
  },
  {
    id: 'iss_research',
    bodyId: 'iss',
    icon: '🔬',
    level: 'both',
    title: { sv: 'Forskning i tyngdlöshet', en: 'Research in weightlessness' },
    body: {
      sv: 'På ISS studerar forskare hur kropp och material beter sig utan tyngdkraft. Resultaten hjälper oss förstå hur människan kan överleva en lång resa till Mars.',
      en: 'On the ISS, scientists study how bodies and materials behave without gravity. The findings help us understand how humans could survive a long journey to Mars.',
    },
  },
  {
    id: 'iss_sunrises',
    bodyId: 'iss',
    icon: '🌍',
    level: 'middle',
    title: { sv: '16 soluppgångar om dagen', en: '16 sunrises a day' },
    body: {
      sv: 'ISS kretsar runt Jorden 16 gånger per dygn med en hastighet av 28 000 km/h. Det innebär att astronauterna ombord upplever 16 soluppgångar varje dag.',
      en: 'The ISS orbits Earth 16 times per day at 28,000 km/h. This means astronauts on board experience 16 sunrises and 16 sunsets every single day.',
    },
  },
  {
    id: 'iss_maintenance',
    bodyId: 'iss',
    icon: '🛠️',
    level: 'upper',
    title: { sv: 'Ständigt underhåll', en: 'Constant maintenance' },
    body: {
      sv: 'ISS underhålls kontinuerligt av astronauter som utför rymdpromenader. Utan regelbundna försörjningsraketer och reservdelar skulle stationen inte klara sig mer än några år.',
      en: 'The ISS is continuously maintained by astronauts performing spacewalks. Without regular supply rockets and spare parts, the station would not survive more than a few years.',
    },
  },
] as const;

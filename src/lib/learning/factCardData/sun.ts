export const SUN_FACT_CARDS = [
  {
    id: 'sun_scale',
    bodyId: 'sun',
    icon: '☀️',
    level: 'middle',
    title: { sv: 'Hur stor är egentligen Solen?', en: 'How big is the Sun, really?' },
    body: {
      sv: 'Solen är så stor att 1,3 miljoner jordklot skulle rymmas inuti den. Om Solen vore en fotboll skulle Jorden vara en liten ärta.',
      en: 'The Sun is so large that 1.3 million Earths could fit inside it. If the Sun were a football, Earth would be a small pea.',
    },
  },
  {
    id: 'sun_fusion',
    bodyId: 'sun',
    icon: '⚡',
    level: 'upper',
    title: { sv: 'Solens motor — kärnfusion', en: "The Sun's engine — nuclear fusion" },
    body: {
      sv: 'Solen producerar energi genom kärnfusion: väteatomer trycks ihop till helium och frigör enorm energi. Varje sekund omvandlas fyra miljoner ton materia till ljus och värme.',
      en: 'The Sun produces energy through nuclear fusion: hydrogen atoms are compressed into helium, releasing enormous energy. Every second, four million tonnes of matter are converted into light and heat.',
    },
  },
  {
    id: 'sun_storms',
    bodyId: 'sun',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Solstormar når Jorden', en: 'Solar storms reach Earth' },
    body: {
      sv: 'Solen kastar ibland ut gigantiska gasmoln mot rymden — solstormar. När de träffar Jordens magnetfält kan de störa satelliter och skapa polarsken långt söderut.',
      en: "The Sun sometimes hurls giant clouds of gas into space — solar storms. When they hit Earth's magnetic field, they can disrupt satellites and create auroras far from the poles.",
    },
  },
  {
    id: 'sun_lifespan',
    bodyId: 'sun',
    icon: '🕰️',
    level: 'middle',
    title: { sv: 'Solens ålder och framtid', en: "The Sun's age and future" },
    body: {
      sv: 'Solen är ungefär 4,6 miljarder år gammal — äldre än dinosaurierna en miljon gånger om. Den har bränsle för ungefär lika länge till innan den sväller och slukar Jordens bana.',
      en: "The Sun is about 4.6 billion years old — a million times older than the dinosaurs. It has enough fuel for roughly the same time again before it swells up and engulfs Earth's orbit.",
    },
  },
] as const;

export const JUPITER_FACT_CARDS = [
  {
    id: 'jupiter_storm',
    bodyId: 'jupiter',
    icon: '🌪️',
    level: 'middle',
    title: { sv: 'En storm som är äldre än Sverige', en: 'A storm older than modern science' },
    body: {
      sv: 'Jupiters stora röda fläck är en storm som rasat i mer än 350 år. Den är dubbelt så stor som hela Jorden. Varför den inte avtar är fortfarande ett mysterium.',
      en: "Jupiter's Great Red Spot is a storm that has raged for over 350 years. It's twice the size of Earth. Why it doesn't die down is still a mystery.",
    },
  },
  {
    id: 'jupiter_moons',
    bodyId: 'jupiter',
    icon: '🌙',
    level: 'middle',
    title: { sv: '95 månar', en: '95 moons' },
    body: {
      sv: 'Jupiter har 95 kända månar — flest av alla planeter. De fyra största hittades av Galileo Galilei med ett hemmagjort teleskop år 1610. De kallas de galileiska månarna.',
      en: "Jupiter has 95 known moons — more than any other planet. The four largest were found by Galileo Galilei with a homemade telescope in 1610. They're called the Galilean moons.",
    },
  },
  {
    id: 'jupiter_gravity_weight',
    bodyId: 'jupiter',
    icon: '⚖️',
    level: 'middle',
    title: { sv: 'Hur tung är du på Jupiter?', en: 'How heavy are you on Jupiter?' },
    body: {
      sv: 'På Jupiters yta väger du 2,5 gånger mer än på Jorden. Om du väger 40 kg på Jorden väger du 100 kg på Jupiter. Fast "ytan" är bara gas — du skulle sjunka rakt igenom.',
      en: "On Jupiter's surface you'd weigh 2.5 times more than on Earth. If you weigh 40 kg on Earth, you'd weigh 100 kg on Jupiter. But the \"surface\" is just gas — you'd sink right through.",
    },
  },
  {
    id: 'jupiter_shield',
    bodyId: 'jupiter',
    icon: '🛡️',
    level: 'upper',
    title: { sv: 'Jordens vakthund', en: "Earth's guardian" },
    body: {
      sv: 'Jupiters enorma gravitation fångar upp asteroider och kometer som annars skulle kunna träffa Jorden. Forskare tror att Jupiter har räddat livet på Jorden åtskilliga gånger under solsystemets historia.',
      en: "Jupiter's enormous gravity captures asteroids and comets that might otherwise hit Earth. Scientists believe Jupiter has saved life on Earth numerous times throughout the solar system's history.",
    },
  },
] as const;

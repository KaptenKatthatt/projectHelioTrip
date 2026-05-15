export const SPUTNIK_FACT_CARDS = [
  {
    id: 'sputnik_first',
    bodyId: 'sputnik',
    icon: '🚀',
    level: 'both',
    title: { sv: 'Den första satelliten', en: 'The first satellite' },
    body: {
      sv: 'Sputnik 1 sköts upp av Sovjetunionen den 4 oktober 1957. Det var den allra första artificiella satelliten i rymden och startskottet för rymdkapplöpningen.',
      en: 'Sputnik 1 was launched by the Soviet Union on October 4, 1957. It was the very first artificial satellite in space and marked the start of the Space Race.',
    },
  },
  {
    id: 'sputnik_beep',
    bodyId: 'sputnik',
    icon: '📻',
    level: 'middle',
    title: { sv: 'Bip-bip-bip från rymden', en: 'Beep-beep-beep from space' },
    body: {
      sv: 'Satelliten var bara 58 cm i diameter och hade inga kameror. Istället sände den ut ett enkelt pipande radioljud som radioamatörer över hela världen kunde lyssna på.',
      en: 'The satellite was only 58 cm in diameter and had no cameras. Instead, it broadcast a simple beeping radio signal that amateur radio operators worldwide could listen to.',
    },
  },
  {
    id: 'sputnik_orbit',
    bodyId: 'sputnik',
    icon: '🔥',
    level: 'upper',
    title: { sv: 'Ett kort men historiskt liv', en: 'A short but historic life' },
    body: {
      sv: 'Sputnik 1 kretsade runt Jorden i över 1 400 varv innan dess batterier tog slut. Efter tre månader bromsades den in av atmosfären och brann upp.',
      en: 'Sputnik 1 orbited Earth over 1,400 times before its batteries died. After three months, it was slowed down by the atmosphere and burned up.',
    },
  },
] as const;

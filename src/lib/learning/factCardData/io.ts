export const IO_FACT_CARDS = [
  {
    id: 'io_volcanoes',
    bodyId: 'io',
    icon: '🌋',
    level: 'both',
    title: {
      sv: 'Mest vulkanisk kropp i solsystemet',
      en: 'The most volcanically active body in the solar system',
    },
    body: {
      sv: 'Io är den mest vulkaniskt aktiva kroppen i hela solsystemet. Det pågår alltid aktiva utbrott — hundratals vulkaner syns ibland simultant från rymden.',
      en: 'Io is the most volcanically active body in the entire solar system. There are always active eruptions — hundreds of volcanoes can sometimes be seen simultaneously from space.',
    },
  },
  {
    id: 'io_tidal_heating',
    bodyId: 'io',
    icon: '🔥',
    level: 'upper',
    title: { sv: 'Uppvärmd av tidvattenkrafter', en: 'Heated by tidal forces' },
    body: {
      sv: 'Ios vulkanism orsakas av Jupiters gravitationskrafter som ständigt knådar och tänjer på månens inre — som att böja ett gem fram och tillbaka tills det blir varmt.',
      en: "Io's volcanism is caused by Jupiter's gravity constantly kneading and stretching the moon's interior — like bending a paperclip back and forth until it gets warm.",
    },
  },
  {
    id: 'io_sulphur',
    bodyId: 'io',
    icon: '🌈',
    level: 'middle',
    title: { sv: 'En mångfärgad svavelyta', en: 'A multicoloured sulphur surface' },
    body: {
      sv: 'Ios yta täcks av svavel i många färger — gult, orange, rött och svart — beroende på vilken temperatur svavlet stelnat vid.',
      en: "Io's surface is covered in sulphur in many colours — yellow, orange, red and black — depending on the temperature at which it solidified.",
    },
  },
  {
    id: 'io_radiation',
    bodyId: 'io',
    icon: '☢️',
    level: 'upper',
    title: { sv: 'Badad i dödlig strålning', en: 'Bathed in deadly radiation' },
    body: {
      sv: 'Io befinner sig djupt inne i Jupiters intensiva strålningsbälten. En astronaut utan skydd skulle få en livsfarlig stråldos på bara några timmar.',
      en: "Io sits deep inside Jupiter's intense radiation belts. An unprotected astronaut would receive a lethal radiation dose in just a few hours.",
    },
  },
] as const;

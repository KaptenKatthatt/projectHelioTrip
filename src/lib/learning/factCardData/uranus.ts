export const URANUS_FACT_CARDS = [
  {
    id: 'uranus_tilt',
    bodyId: 'uranus',
    icon: '🔄',
    level: 'both',
    title: { sv: 'En planet som ligger ner', en: 'A planet lying on its side' },
    body: {
      sv: 'Uranus lutar 98 grader — planeten kretsar nästan på sidan. Det innebär att varje pol har 42 år av konstant solsken följt av 42 år av totalt mörker.',
      en: 'Uranus tilts 98 degrees — the planet essentially orbits on its side. This means each pole has 42 years of constant sunlight followed by 42 years of total darkness.',
    },
  },
  {
    id: 'uranus_ice_giant',
    bodyId: 'uranus',
    icon: '🌊',
    level: 'middle',
    title: { sv: 'Is som inte är is', en: "Ice that isn't really ice" },
    body: {
      sv: 'Uranus kallas en "isjätte" — men under gasskiktet finns inte vanlig is utan ett hav av supervarm, superkomprimerat vatten och ammoniak under extremt tryck.',
      en: 'Uranus is called an "ice giant" — but beneath the gas layer isn\'t regular ice but a sea of super-hot, super-compressed water and ammonia under extreme pressure.',
    },
  },
  {
    id: 'uranus_colour',
    bodyId: 'uranus',
    icon: '🔵',
    level: 'middle',
    title: { sv: 'Varför är Uranus blågrön?', en: 'Why is Uranus blue-green?' },
    body: {
      sv: 'Uranus blågrön färg kommer från metan i atmosfären, som absorberar rött ljus och reflekterar blått och grönt.',
      en: "Uranus's blue-green colour comes from methane in the atmosphere, which absorbs red light and reflects blue and green.",
    },
  },
  {
    id: 'uranus_quiet',
    bodyId: 'uranus',
    icon: '🌀',
    level: 'upper',
    title: { sv: 'Förvånansvärt lugn', en: 'Surprisingly calm' },
    body: {
      sv: 'Trots att Uranus är en gasjätte är den förvånansvärt slät och saknar tydliga stormmönster jämfört med Jupiter och Saturnus. Varför är ännu inte klarlagt.',
      en: 'Despite being a gas giant, Uranus is surprisingly featureless and lacks clear storm patterns compared to Jupiter and Saturn. Why this is the case is still not fully understood.',
    },
  },
] as const;

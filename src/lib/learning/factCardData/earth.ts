export const EARTH_FACT_CARDS = [
  {
    id: 'earth_water',
    bodyId: 'earth',
    icon: '💧',
    level: 'middle',
    title: { sv: 'Vattenplaneten', en: 'The water planet' },
    body: {
      sv: 'Jordens yta täcks till 71 % av vatten — mer än någon annan känd planet. Flytande vatten på ytan är ovanligt i solsystemet; de flesta planeter har det bara som is, gas eller inte alls.',
      en: "Earth's surface is 71% water — more than any other known planet. Liquid water on the surface is rare in the solar system; most planets only have it as ice, gas, or not at all.",
    },
  },
  {
    id: 'earth_shield',
    bodyId: 'earth',
    icon: '🛡️',
    level: 'both',
    title: { sv: 'Det osynliga sköldet', en: 'The invisible shield' },
    body: {
      sv: 'Jordens flytande järnkärna skapar ett magnetfält som skyddar oss mot solens starka strålning. Utan det skulle UV-strålning göra Jordens yta i stort sett obeboelig.',
      en: "Earth's liquid iron core generates a magnetic field that shields us from the Sun's powerful radiation. Without it, UV radiation would make Earth's surface largely uninhabitable.",
    },
  },
  {
    id: 'earth_moon_effect',
    bodyId: 'earth',
    icon: '🌙',
    level: 'middle',
    title: { sv: 'Månen håller oss stabila', en: 'The Moon keeps us stable' },
    body: {
      sv: 'Månens gravitation skapar tidvatten och håller Jordens lutning stabil. Utan Månen skulle lutningen slumpa runt under miljontals år och göra säsongerna fullständigt oförutsägbara.',
      en: "The Moon's gravity creates tides and keeps Earth's axial tilt stable. Without the Moon, the tilt would wander randomly over millions of years, making seasons completely unpredictable.",
    },
  },
  {
    id: 'earth_goldilocks',
    bodyId: 'earth',
    icon: '🌡️',
    level: 'both',
    title: { sv: 'Precis lagom', en: 'Just right' },
    body: {
      sv: 'Jorden befinner sig i solsystemets "livsbälte" — varken för nära eller för långt från Solen. Det gör att flytande vatten kan finnas på ytan och att livet kan blomstra.',
      en: 'Earth sits in the solar system\'s "habitable zone" — not too close, not too far from the Sun. This allows liquid water to exist on the surface and for life to flourish.',
    },
  },
] as const;

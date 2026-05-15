export const TITAN_FACT_CARDS = [
  {
    id: 'titan_lakes',
    bodyId: 'titan',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Sjöar av flytande gas', en: 'Lakes of liquid gas' },
    body: {
      sv: 'Titan är den enda månen med stabila vätskor på ytan. Men det är inte vatten — det är sjöar och hav av flytande metan och etan vid –179 °C.',
      en: "Titan is the only moon with stable liquids on its surface. But it's not water — it's lakes and seas of liquid methane and ethane at –179 °C.",
    },
  },
  {
    id: 'titan_atmosphere',
    bodyId: 'titan',
    icon: '🌫️',
    level: 'middle',
    title: { sv: 'En tjockare atmosfär än Jordens', en: "A thicker atmosphere than Earth's" },
    body: {
      sv: 'Titan har en atmosfär tjockare än Jordens, mestadels kväve. En orange dimma omger hela månen. Rymdsonden Huygens landade i dimman 2005.',
      en: "Titan has an atmosphere thicker than Earth's, mostly nitrogen. An orange haze surrounds the entire moon. The Huygens probe landed in the haze in 2005.",
    },
  },
  {
    id: 'titan_life_possible',
    bodyId: 'titan',
    icon: '🔬',
    level: 'upper',
    title: { sv: 'En alternativ livsmiljö?', en: 'An alternative habitat for life?' },
    body: {
      sv: 'Titans kombination av kolväten, kväve och energikällor liknar teorier om hur livet kan ha börjat på urtida Jorden. Möjligen kan metanbaserat liv existera i sjöarna.',
      en: "Titan's combination of hydrocarbons, nitrogen and energy sources resembles theories about how life may have started on early Earth. Possibly methane-based life could exist in the lakes.",
    },
  },
  {
    id: 'titan_cassini',
    bodyId: 'titan',
    icon: '🔭',
    level: 'both',
    title: { sv: 'Cassinis trettonåriga arv', en: "Cassini's thirteen-year legacy" },
    body: {
      sv: 'Rymdsonden Cassini tillbringade 13 år i Saturnussystemet och kartlade Titan i detalj. 2017 dök den med flit ner i Saturnus atmosfär — för att inte förorena Titan med jordbakterier.',
      en: "The Cassini spacecraft spent 13 years in the Saturn system and mapped Titan in detail. In 2017 it deliberately plunged into Saturn's atmosphere — to avoid contaminating Titan with Earth bacteria.",
    },
  },
] as const;

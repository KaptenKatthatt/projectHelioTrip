export const GANYMEDE_FACT_CARDS = [
  {
    id: 'ganymede_biggest',
    bodyId: 'ganymede',
    icon: '🏆',
    level: 'both',
    title: { sv: 'Störst av alla månar', en: 'Largest of all moons' },
    body: {
      sv: 'Ganymedes är den största månen i hela solsystemet — till och med större än planeten Merkurius. Ändå kretsar den runt Jupiter, inte runt Solen.',
      en: 'Ganymede is the largest moon in the entire solar system — even bigger than the planet Mercury. Yet it orbits Jupiter, not the Sun.',
    },
  },
  {
    id: 'ganymede_magnetic',
    bodyId: 'ganymede',
    icon: '🧲',
    level: 'upper',
    title: {
      sv: 'Den enda månen med eget magnetfält',
      en: 'The only moon with its own magnetic field',
    },
    body: {
      sv: 'Ganymedes är den enda månen i solsystemet med ett eget magnetfält. Det skapar ett mini-polarsken ovanpå Jupiters enorma polarsken.',
      en: "Ganymede is the only moon in the solar system with its own magnetic field. It creates a mini aurora on top of Jupiter's enormous aurora.",
    },
  },
  {
    id: 'ganymede_hidden_ocean',
    bodyId: 'ganymede',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Ocean djupare ner', en: 'An ocean even deeper down' },
    body: {
      sv: 'Under Ganymedes yta döljer sig sannolikt ett saltvattensoceanen. Rymdteleskopet Hubble hittade indikationer via polarskenets rörelser.',
      en: "Beneath Ganymede's surface likely hides a saltwater ocean. The Hubble Space Telescope found evidence through the motion of its auroras.",
    },
  },
  {
    id: 'ganymede_terrain',
    bodyId: 'ganymede',
    icon: '🪨',
    level: 'middle',
    title: { sv: 'Blandat landskap', en: 'Mixed landscape' },
    body: {
      sv: 'Ganymedes yta har två sorters terräng: mörkt, gammalt krattat land och ljust, yngre land med parallella åsar — tecken på geologisk aktivitet.',
      en: "Ganymede's surface has two types of terrain: dark, ancient heavily cratered land, and bright, younger terrain with parallel ridges — signs of geological activity.",
    },
  },
] as const;

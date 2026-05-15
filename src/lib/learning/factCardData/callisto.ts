export const CALLISTO_FACT_CARDS = [
  {
    id: 'callisto_craters',
    bodyId: 'callisto',
    icon: '🕳️',
    level: 'middle',
    title: { sv: 'Det mest kratrade objektet', en: 'The most cratered object' },
    body: {
      sv: 'Callisto är det mest kratrade objektet i solsystemet. Ytan har inte förändrats på miljarder år — en fryst ögonblicksbild av solsystemets barndom.',
      en: "Callisto is the most cratered object in the solar system. The surface hasn't changed for billions of years — a frozen snapshot of what the solar system looked like in its infancy.",
    },
  },
  {
    id: 'callisto_radiation_safe',
    bodyId: 'callisto',
    icon: '☣️',
    level: 'upper',
    title: { sv: 'Skyddad från Jupiters strålning', en: "Sheltered from Jupiter's radiation" },
    body: {
      sv: 'Callisto befinner sig utanför Jupiters intensiva inre strålningsbälten. Det gör den till en av de mer realistiska kandidaterna för en framtida bemannad utpost nära Jupiter.',
      en: "Callisto lies outside Jupiter's intense inner radiation belts. This makes it one of the more realistic candidates for a future crewed outpost in the Jupiter system.",
    },
  },
  {
    id: 'callisto_possible_ocean',
    bodyId: 'callisto',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Möjligt hav under ytan', en: 'A possible ocean below the surface' },
    body: {
      sv: 'Trots sin uråldriga yta tyder magnetmätningar på att Callisto kan gömma ett flytande hav långt under ytan — oväntat för en så till synes inaktiv måne.',
      en: 'Despite its ancient, undisturbed surface, magnetic measurements suggest Callisto may hide a liquid ocean far underground — unexpected for such an apparently inactive moon.',
    },
  },
  {
    id: 'callisto_no_magnetic',
    bodyId: 'callisto',
    icon: '💡',
    level: 'upper',
    title: { sv: 'Inget eget magnetfält', en: 'No magnetic field of its own' },
    body: {
      sv: 'Till skillnad från Ganymedes har Callisto inget eget magnetfält, vilket tyder på en mer homogen inre struktur som aldrig separerat i en järnkärna.',
      en: 'Unlike Ganymede, Callisto has no magnetic field of its own, suggesting a more uniform interior that never separated into an iron core surrounded by a mantle.',
    },
  },
] as const;

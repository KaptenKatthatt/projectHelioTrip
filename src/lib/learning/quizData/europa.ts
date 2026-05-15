export const EUROPA_QUESTIONS = [
  {
    type: 'true-false',
    id: 'quiz_europa_ocean',
    bodyId: 'europa',
    level: 'both',
    statement: {
      sv: 'Det finns ett flytande hav under Europas yta.',
      en: "There is a liquid ocean beneath Europa's surface.",
    },
    correct: true,
    hint: {
      sv: 'Vad håller ett hav flytande när det är –160 °C på ytan?',
      en: "What keeps an ocean liquid when it's –160 °C on the surface?",
    },
    explanation: {
      sv: 'Jupiters tidvattenkrafter värmer Europas inre och håller havet under isen flytande. Det kan innehålla mer vatten än alla Jordens hav tillsammans.',
      en: "Jupiter's tidal forces heat Europa's interior and keep the ocean beneath the ice liquid. It may contain more water than all of Earth's oceans combined.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_europa_life',
    bodyId: 'europa',
    level: 'middle',
    question: {
      sv: 'Varför anser många forskare att Europa är ett bra ställe att söka efter liv?',
      en: 'Why do many scientists consider Europa a good place to search for life?',
    },
    options: [
      { key: 'A', sv: 'Det finns syre i atmosfären', en: 'There is oxygen in its atmosphere' },
      {
        key: 'B',
        sv: 'Det finns ett flytande hav med energi och möjlig kemi för liv',
        en: 'There is a liquid ocean with energy and possible chemistry for life',
      },
      { key: 'C', sv: 'Temperaturen är behaglig', en: 'The temperature is comfortable' },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk på vad livet på Jordens djuphav behöver.',
      en: "Think about what life in Earth's deep oceans needs.",
    },
    explanation: {
      sv: 'Europas hav under isen kan ha värme från Jupiters tidvattenkrafter, kemiska ämnen och flytande vatten — de tre grundförutsättningarna som liv vi känner det verkar kräva.',
      en: "Europa's subsurface ocean may have heat from Jupiter's tidal forces, chemical nutrients and liquid water — the three basic requirements that life as we know it seems to need.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_europa_ice',
    bodyId: 'europa',
    level: 'upper',
    question: {
      sv: 'Ungefär hur tjock är Europas isskorpa?',
      en: "Approximately how thick is Europa's ice shell?",
    },
    options: [
      { key: 'A', sv: '1–2 km', en: '1–2 km' },
      { key: 'B', sv: '15–25 km', en: '15–25 km' },
      { key: 'C', sv: '200–300 km', en: '200–300 km' },
    ],
    correct: 'B',
    hint: {
      sv: 'Det är tjockare än de flesta berg är höga.',
      en: "It's thicker than most mountains are tall.",
    },
    explanation: {
      sv: 'Europas isskorpa beräknas vara 15–25 km tjock. Under den kan havet vara 60–150 km djupt — långt djupare än Jordens Marianergraven.',
      en: "Europa's ice shell is estimated to be 15–25 km thick. Below it, the ocean may be 60–150 km deep — far deeper than Earth's Mariana Trench.",
    },
  },
] as const;

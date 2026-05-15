export const EUROPA_FACT_CARDS = [
  {
    id: 'europa_ocean',
    bodyId: 'europa',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Ett hav gömt under isen', en: 'An ocean hidden beneath the ice' },
    body: {
      sv: 'Under Europas isiga yta döljer sig ett flytande hav som kan innehålla mer vatten än alla Jordens hav tillsammans. Det hålls flytande av värme från Jupiters tidvattenkrafter.',
      en: "Beneath Europa's icy surface hides a liquid ocean that may contain more water than all of Earth's oceans combined. It's kept liquid by heat from Jupiter's tidal forces.",
    },
  },
  {
    id: 'europa_life',
    bodyId: 'europa',
    icon: '🔬',
    level: 'middle',
    title: { sv: 'Kanske finns liv under isen', en: 'Life might exist beneath the ice' },
    body: {
      sv: 'Europa är ett av de mest lovande ställena att söka efter liv utanför Jorden. Havet under isen kan ha rätt förutsättningar — värme, vatten och kemi — för enkla organismer.',
      en: 'Europa is one of the most promising places to search for life beyond Earth. The ocean beneath the ice may have the right conditions — heat, water and chemistry — for simple organisms to survive.',
    },
  },
  {
    id: 'europa_cracks',
    bodyId: 'europa',
    icon: '❄️',
    level: 'middle',
    title: { sv: 'Sprickor i isen', en: 'Cracks in the ice' },
    body: {
      sv: 'Europas yta är täckt av långa sprickor och rödbruna linjer. De bildas när isskorpan rör sig och böjs av trycket från det varma havet under.',
      en: "Europa's surface is covered in long cracks and reddish-brown lines. They form as the ice shell moves and flexes under pressure from the warm ocean below.",
    },
  },
  {
    id: 'europa_ice_thickness',
    bodyId: 'europa',
    icon: '🧊',
    level: 'upper',
    title: { sv: 'Isskorpa och djuphav', en: 'Ice shell and deep ocean' },
    body: {
      sv: 'Europas isskorpa är uppskattad till 15–25 km tjock. Under den tror forskarna att havet är 60–150 km djupt — tre till åtta gånger djupare än Jordens Marianergraven.',
      en: "Europa's ice shell is estimated to be 15–25 km thick. Beneath it, researchers believe the ocean is 60–150 km deep — three to eight times deeper than Earth's Mariana Trench.",
    },
  },
] as const;

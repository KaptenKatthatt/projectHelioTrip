export const SATURN_QUESTIONS = [
  {
    type: 'true-false',
    id: 'quiz_saturn_rings',
    bodyId: 'saturn',
    level: 'both',
    statement: {
      sv: 'Saturnus ringar är gjorda av flytande vatten.',
      en: "Saturn's rings are made of liquid water.",
    },
    correct: false,
    hint: {
      sv: 'Tänk på vad som händer med vatten i det kalla yttre solsystemet.',
      en: 'Think about what happens to water in the cold outer solar system.',
    },
    explanation: {
      sv: 'Ringarna består av miljarder bitar av is och sten — inte flytande vatten. Isbitarna varierar i storlek från sandkorn till flervåningshus.',
      en: 'The rings consist of billions of pieces of ice and rock — not liquid water. The ice chunks range in size from sand grains to multi-storey buildings.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_saturn_density',
    bodyId: 'saturn',
    level: 'both',
    question: {
      sv: 'Vad är unikt med Saturnus densitet?',
      en: "What is unique about Saturn's density?",
    },
    options: [
      {
        key: 'A',
        sv: 'Den är tyngre än allt annat i solsystemet',
        en: 'It is denser than anything else in the solar system',
      },
      {
        key: 'B',
        sv: 'Den är lättare än vatten — Saturnus skulle flyta',
        en: 'It is less dense than water — Saturn would float',
      },
      { key: 'C', sv: 'Den är precis lika tät som Jorden', en: 'It is exactly as dense as Earth' },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk dig att du har ett oändligt badkar.',
      en: 'Imagine you had an infinitely large bathtub.',
    },
    explanation: {
      sv: 'Saturnus är den enda planeten i solsystemet med lägre densitet än vatten. Om du hade ett tillräckligt stort badkar skulle planeten flyta.',
      en: 'Saturn is the only planet in the solar system with lower density than water. If you had a large enough bathtub, the planet would float.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_saturn_rings_future',
    bodyId: 'saturn',
    level: 'both',
    statement: {
      sv: 'Saturnus ringar kommer alltid att finnas kvar.',
      en: "Saturn's rings will exist forever.",
    },
    correct: false,
    hint: {
      sv: 'Ringarna rör sig sakta inåt mot planeten.',
      en: 'The rings slowly move inward toward the planet.',
    },
    explanation: {
      sv: 'Saturnus ringar krymper sakta och beräknas vara borta om ungefär 100 miljoner år. Vi lever i en lycklig era — för 100 miljoner år sedan var ringarna ännu tjockare.',
      en: "Saturn's rings are slowly shrinking and are estimated to be gone in about 100 million years. We live in a lucky era — 100 million years ago the rings were even thicker.",
    },
  },
] as const;

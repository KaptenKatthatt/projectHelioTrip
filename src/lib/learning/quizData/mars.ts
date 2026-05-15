export const MARS_QUESTIONS = [
  {
    type: 'multiple-choice',
    id: 'quiz_mars_mountain',
    bodyId: 'mars',
    level: 'middle',
    question: {
      sv: 'Vad heter solsystemets högsta berg och var finns det?',
      en: 'What is the tallest mountain in the solar system and where is it?',
    },
    options: [
      { key: 'A', sv: 'Everest på Jorden', en: 'Everest on Earth' },
      { key: 'B', sv: 'Olympus Mons på Mars', en: 'Olympus Mons on Mars' },
      { key: 'C', sv: 'Maxwell Montes på Venus', en: 'Maxwell Montes on Venus' },
    ],
    correct: 'B',
    hint: {
      sv: 'Det är en vulkan på vår röde granne.',
      en: "It's a volcano on our red neighbour.",
    },
    explanation: {
      sv: 'Olympus Mons på Mars är ungefär 22 km högt — tre gånger högre än Mount Everest. Det är en sköldvulkan lika bred som Sverige.',
      en: "Olympus Mons on Mars is about 22 km tall — three times taller than Mount Everest. It's a shield volcano as wide as Sweden.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_mars_red',
    bodyId: 'mars',
    level: 'middle',
    question: { sv: 'Varför är Mars röd?', en: 'Why is Mars red?' },
    options: [
      {
        key: 'A',
        sv: 'Hemoglobin (blodprotein) i gammal lava',
        en: 'Haemoglobin (blood protein) in ancient lava',
      },
      { key: 'B', sv: 'Järnoxid (rost) på ytan', en: 'Iron oxide (rust) on the surface' },
      {
        key: 'C',
        sv: 'Reflektion av rött ljus från Solen',
        en: 'Reflection of red light from the Sun',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Samma ämne som gör en gammal cykel rödbrun.',
      en: 'The same substance that makes an old bicycle go rusty.',
    },
    explanation: {
      sv: 'Mars yta täcks av järnoxid — rost. Det är exakt samma kemiska process som när järn rostar på Jorden, men på planetskala.',
      en: "Mars's surface is covered in iron oxide — rust. It's the exact same chemical process as iron rusting on Earth, but on a planetary scale.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_mars_water',
    bodyId: 'mars',
    level: 'upper',
    statement: {
      sv: 'Mars hade aldrig flytande vatten på ytan.',
      en: 'Mars never had liquid water on its surface.',
    },
    correct: false,
    hint: {
      sv: 'Titta på Mars yta — vad påminner de långa svängende dalarna om?',
      en: "Look at Mars's surface — what do the long winding valleys resemble?",
    },
    explanation: {
      sv: 'Tvärtom — Mars hade flytande vatten för miljarder år sedan. Vi ser fortfarande tydliga floddalar, deltan och mineralavlagringar som bara bildas i vatten.',
      en: 'On the contrary — Mars had liquid water billions of years ago. We can still see clear river valleys, deltas and mineral deposits that only form in water.',
    },
  },
] as const;

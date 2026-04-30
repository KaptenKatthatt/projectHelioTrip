import type { BodyId } from '../bodies';

export type FactCardLevel = 'middle' | 'upper' | 'both';

export type FactCard = {
  readonly id: string;
  readonly bodyId: BodyId;
  readonly icon: string;
  readonly level: FactCardLevel;
  readonly title: { readonly sv: string; readonly en: string };
  readonly body: { readonly sv: string; readonly en: string };
};

const FACT_CARDS: ReadonlyArray<FactCard> = [
  // SUN
  {
    id: 'sun_scale', bodyId: 'sun', icon: '☀️', level: 'middle',
    title: { sv: 'Hur stor är egentligen Solen?', en: 'How big is the Sun, really?' },
    body: { sv: 'Solen är så stor att 1,3 miljoner jordklot skulle rymmas inuti den. Om Solen vore en fotboll skulle Jorden vara en liten ärta.', en: 'The Sun is so large that 1.3 million Earths could fit inside it. If the Sun were a football, Earth would be a small pea.' },
  },
  {
    id: 'sun_fusion', bodyId: 'sun', icon: '⚡', level: 'upper',
    title: { sv: 'Solens motor — kärnfusion', en: "The Sun's engine — nuclear fusion" },
    body: { sv: 'Solen producerar energi genom kärnfusion: väteatomer trycks ihop till helium och frigör enorm energi. Varje sekund omvandlas fyra miljoner ton materia till ljus och värme.', en: 'The Sun produces energy through nuclear fusion: hydrogen atoms are compressed into helium, releasing enormous energy. Every second, four million tonnes of matter are converted into light and heat.' },
  },
  {
    id: 'sun_storms', bodyId: 'sun', icon: '🌊', level: 'both',
    title: { sv: 'Solstormar når Jorden', en: 'Solar storms reach Earth' },
    body: { sv: 'Solen kastar ibland ut gigantiska gasmoln mot rymden — solstormar. När de träffar Jordens magnetfält kan de störa satelliter och skapa polarsken långt söderut.', en: 'The Sun sometimes hurls giant clouds of gas into space — solar storms. When they hit Earth\'s magnetic field, they can disrupt satellites and create auroras far from the poles.' },
  },
  {
    id: 'sun_lifespan', bodyId: 'sun', icon: '🕰️', level: 'middle',
    title: { sv: 'Solens ålder och framtid', en: "The Sun's age and future" },
    body: { sv: 'Solen är ungefär 4,6 miljarder år gammal — äldre än dinosaurierna en miljon gånger om. Den har bränsle för ungefär lika länge till innan den sväller och slukar Jordens bana.', en: 'The Sun is about 4.6 billion years old — a million times older than the dinosaurs. It has enough fuel for roughly the same time again before it swells up and engulfs Earth\'s orbit.' },
  },

  // MERCURY
  {
    id: 'mercury_temperature', bodyId: 'mercury', icon: '🌡️', level: 'both',
    title: { sv: 'Extrema temperaturer', en: 'Extreme temperatures' },
    body: { sv: 'På Merkurius är det 430 °C på dagen och –180 °C på natten — den största temperaturskillnaden av alla planeter. Det beror på att Merkurius saknar atmosfär som kan hålla kvar värmen.', en: 'On Mercury it\'s 430 °C during the day and –180 °C at night — the largest temperature swing of any planet. This is because Mercury has no atmosphere to hold in heat.' },
  },
  {
    id: 'mercury_slow_day', bodyId: 'mercury', icon: '🐢', level: 'upper',
    title: { sv: 'En dag längre än ett år', en: 'A day longer than a year' },
    body: { sv: 'Merkurius roterar så långsamt att ett dygn tar 176 jorddagar, men planeten hinner kretsa runt Solen på bara 88 dagar. Alltså är ett år kortare än ett dygn.', en: 'Mercury rotates so slowly that one day lasts 176 Earth days, but the planet orbits the Sun in just 88 days. So a year is actually shorter than a single day.' },
  },
  {
    id: 'mercury_craters', bodyId: 'mercury', icon: '🕳️', level: 'middle',
    title: { sv: 'En yta full av sår', en: 'A surface full of scars' },
    body: { sv: 'Merkurius yta är täckt av kratrarna — spår från miljarder år av asteroidnedslag. Utan atmosfär eroderas ingenting, så alla gamla sår syns fortfarande precis som de en gång uppstod.', en: 'Mercury\'s surface is covered in craters — scars from billions of years of asteroid impacts. With no atmosphere, nothing erodes, so every ancient wound is still visible exactly as it formed.' },
  },
  {
    id: 'mercury_hard_to_see', bodyId: 'mercury', icon: '🔭', level: 'middle',
    title: { sv: 'Svår att se på himlen', en: 'Hard to spot in the sky' },
    body: { sv: 'Merkurius är den innersta planeten och alltid nära Solen på himlen. Många stjärntittare har aldrig sett den med blotta ögat — den dyker bara upp nära horisonten strax efter solnedgång.', en: 'Mercury is the innermost planet and always close to the Sun in the sky. Many stargazers have never spotted it with the naked eye — it only appears near the horizon just after sunset.' },
  },

  // VENUS
  {
    id: 'venus_hottest', bodyId: 'venus', icon: '🔥', level: 'both',
    title: { sv: 'Hetare än Merkurius — trots att den är längre bort', en: 'Hotter than Mercury — despite being farther away' },
    body: { sv: 'Venus är den hetaste planeten trots att den inte är närmast Solen. Tjocka koldioxidmoln fungerar som ett växthus och håller kvar värmen tills ytan når 465 °C.', en: 'Venus is the hottest planet even though it isn\'t the closest to the Sun. Thick carbon dioxide clouds act like a greenhouse, trapping heat until the surface reaches 465 °C.' },
  },
  {
    id: 'venus_backwards', bodyId: 'venus', icon: '⏰', level: 'upper',
    title: { sv: 'Bakvänd dag', en: 'A backwards day' },
    body: { sv: 'Venus roterar åt motsatt håll jämfört med de flesta planeter. Om du stod på Venus skulle solen gå upp i väster och ner i öster — precis tvärtom mot Jorden.', en: 'Venus rotates in the opposite direction to most planets. If you stood on Venus, the Sun would rise in the west and set in the east — the exact opposite of Earth.' },
  },
  {
    id: 'venus_acid_rain', bodyId: 'venus', icon: '🌫️', level: 'both',
    title: { sv: 'Syraregn som aldrig når marken', en: 'Acid rain that never reaches the ground' },
    body: { sv: 'Venusatmosfären innehåller svavelsyra och det "regnar" faktiskt. Men syrregnet avdunstar direkt i den extrema värmen innan det ens är halvvägs ner mot marken.', en: "Venus's atmosphere contains sulfuric acid and it actually \"rains.\" But the acid rain evaporates immediately in the extreme heat before it even reaches halfway to the ground." },
  },
  {
    id: 'venus_twin', bodyId: 'venus', icon: '🌍', level: 'middle',
    title: { sv: 'Jordens farliga syster', en: "Earth's dangerous twin" },
    body: { sv: 'Venus kallas ibland Jordens syster — den är ungefär lika stor och lika tung. Men likheterna tar slut där. Venus är ett inferno med skyhögt lufttryck, Jorden ett paradis.', en: 'Venus is sometimes called Earth\'s twin sister — it\'s roughly the same size and mass. But the similarities end there. Venus is an inferno with crushing air pressure; Earth is a paradise.' },
  },

  // EARTH
  {
    id: 'earth_water', bodyId: 'earth', icon: '💧', level: 'middle',
    title: { sv: 'Vattenplaneten', en: 'The water planet' },
    body: { sv: 'Jordens yta täcks till 71 % av vatten — mer än någon annan känd planet. Flytande vatten på ytan är ovanligt i solsystemet; de flesta planeter har det bara som is, gas eller inte alls.', en: "Earth's surface is 71% water — more than any other known planet. Liquid water on the surface is rare in the solar system; most planets only have it as ice, gas, or not at all." },
  },
  {
    id: 'earth_shield', bodyId: 'earth', icon: '🛡️', level: 'both',
    title: { sv: 'Det osynliga sköldet', en: 'The invisible shield' },
    body: { sv: 'Jordens flytande järnkärna skapar ett magnetfält som skyddar oss mot solens starka strålning. Utan det skulle UV-strålning göra Jordens yta i stort sett obeboelig.', en: "Earth's liquid iron core generates a magnetic field that shields us from the Sun's powerful radiation. Without it, UV radiation would make Earth's surface largely uninhabitable." },
  },
  {
    id: 'earth_moon_effect', bodyId: 'earth', icon: '🌙', level: 'middle',
    title: { sv: 'Månen håller oss stabila', en: 'The Moon keeps us stable' },
    body: { sv: 'Månens gravitation skapar tidvatten och håller Jordens lutning stabil. Utan Månen skulle lutningen slumpa runt under miljontals år och göra säsongerna fullständigt oförutsägbara.', en: "The Moon's gravity creates tides and keeps Earth's axial tilt stable. Without the Moon, the tilt would wander randomly over millions of years, making seasons completely unpredictable." },
  },
  {
    id: 'earth_goldilocks', bodyId: 'earth', icon: '🌡️', level: 'both',
    title: { sv: 'Precis lagom', en: 'Just right' },
    body: { sv: 'Jorden befinner sig i solsystemets "livsbälte" — varken för nära eller för långt från Solen. Det gör att flytande vatten kan finnas på ytan och att livet kan blomstra.', en: 'Earth sits in the solar system\'s "habitable zone" — not too close, not too far from the Sun. This allows liquid water to exist on the surface and for life to flourish.' },
  },

  // MARS
  {
    id: 'mars_olympus', bodyId: 'mars', icon: '🏔️', level: 'middle',
    title: { sv: 'Solsystemets högsta berg', en: 'The tallest mountain in the solar system' },
    body: { sv: 'Olympus Mons på Mars är tre gånger högre än Mount Everest och lika brett som Sverige. Det är en gammal vulkan — och den högsta kända toppen i hela solsystemet.', en: 'Olympus Mons on Mars is three times taller than Mount Everest and as wide as Sweden. It\'s an ancient volcano — and the tallest known peak in the entire solar system.' },
  },
  {
    id: 'mars_red', bodyId: 'mars', icon: '🔴', level: 'middle',
    title: { sv: 'En planet täckt av rost', en: 'A planet covered in rust' },
    body: { sv: 'Mars är röd för att ytan täcks av järnoxid — rost. Det är exakt samma process som när en gammal cykel rostar, fast på planetskala.', en: "Mars is red because its surface is covered in iron oxide — rust. It's the exact same process as when an old bicycle rusts, just on a planetary scale." },
  },
  {
    id: 'mars_dust_storms', bodyId: 'mars', icon: '🌬️', level: 'both',
    title: { sv: 'Planettäckande sandstormar', en: 'Planet-wide dust storms' },
    body: { sv: 'Mars har enorma dammstormar som ibland täcker hela planeten i månader. Under de värsta stormarna når solljuset knappt ned till ytan — himlen är konstant orange dimma.', en: 'Mars experiences massive dust storms that sometimes cover the entire planet for months. During the worst storms, sunlight barely reaches the surface — the sky is a constant orange haze.' },
  },
  {
    id: 'mars_water_past', bodyId: 'mars', icon: '💧', level: 'upper',
    title: { sv: 'Floder och sjöar en gång i tiden', en: 'Rivers and lakes long ago' },
    body: { sv: 'För miljarder år sedan flödade vatten i floder och sjöar på Mars. Idag finns vatten kvar som is vid polerna och möjligen som saltlösning djupt under ytan.', en: 'Billions of years ago, water flowed in rivers and lakes on Mars. Today, water remains as ice at the poles and possibly as saltwater deep underground.' },
  },

  // JUPITER
  {
    id: 'jupiter_storm', bodyId: 'jupiter', icon: '🌪️', level: 'middle',
    title: { sv: 'En storm som är äldre än Sverige', en: 'A storm older than modern science' },
    body: { sv: 'Jupiters stora röda fläck är en storm som rasat i mer än 350 år. Den är dubbelt så stor som hela Jorden. Varför den inte avtar är fortfarande ett mysterium.', en: "Jupiter's Great Red Spot is a storm that has raged for over 350 years. It's twice the size of Earth. Why it doesn't die down is still a mystery." },
  },
  {
    id: 'jupiter_moons', bodyId: 'jupiter', icon: '🌙', level: 'middle',
    title: { sv: '95 månar', en: '95 moons' },
    body: { sv: 'Jupiter har 95 kända månar — flest av alla planeter. De fyra största hittades av Galileo Galilei med ett hemmagjort teleskop år 1610. De kallas de galileiska månarna.', en: 'Jupiter has 95 known moons — more than any other planet. The four largest were found by Galileo Galilei with a homemade telescope in 1610. They\'re called the Galilean moons.' },
  },
  {
    id: 'jupiter_gravity_weight', bodyId: 'jupiter', icon: '⚖️', level: 'middle',
    title: { sv: 'Hur tung är du på Jupiter?', en: 'How heavy are you on Jupiter?' },
    body: { sv: 'På Jupiters yta väger du 2,5 gånger mer än på Jorden. Om du väger 40 kg på Jorden väger du 100 kg på Jupiter. Fast "ytan" är bara gas — du skulle sjunka rakt igenom.', en: "On Jupiter's surface you'd weigh 2.5 times more than on Earth. If you weigh 40 kg on Earth, you'd weigh 100 kg on Jupiter. But the \"surface\" is just gas — you'd sink right through." },
  },
  {
    id: 'jupiter_shield', bodyId: 'jupiter', icon: '🛡️', level: 'upper',
    title: { sv: 'Jordens vakthund', en: "Earth's guardian" },
    body: { sv: 'Jupiters enorma gravitation fångar upp asteroider och kometer som annars skulle kunna träffa Jorden. Forskare tror att Jupiter har räddat livet på Jorden åtskilliga gånger under solsystemets historia.', en: "Jupiter's enormous gravity captures asteroids and comets that might otherwise hit Earth. Scientists believe Jupiter has saved life on Earth numerous times throughout the solar system's history." },
  },

  // SATURN
  {
    id: 'saturn_rings', bodyId: 'saturn', icon: '💍', level: 'middle',
    title: { sv: 'Ringarna — tunnare än ett papper', en: 'The rings — thinner than a sheet of paper' },
    body: { sv: 'Saturnus ringar är gjorda av miljarder isbitar och stenblock. I förhållande till sin bredd är ringarna tunnare än ett A4-papper.', en: "Saturn's rings are made of billions of pieces of ice and rock. Relative to their width, the rings are thinner than a sheet of A4 paper." },
  },
  {
    id: 'saturn_floats', bodyId: 'saturn', icon: '⚖️', level: 'both',
    title: { sv: 'Den enda planeten som flyter', en: 'The only planet that floats' },
    body: { sv: 'Saturnus är den enda planeten i solsystemet som är lättare än vatten. Om du hade ett tillräckligt stort badkar skulle Saturnus flyta på ytan.', en: 'Saturn is the only planet in the solar system less dense than water. If you had a bathtub large enough, Saturn would float.' },
  },
  {
    id: 'saturn_winds', bodyId: 'saturn', icon: '🌬️', level: 'upper',
    title: { sv: 'Vindar starkare än jordens kraftigaste orkan', en: "Winds stronger than Earth's worst hurricane" },
    body: { sv: 'Saturnus har vindar upp till 1 800 km/h vid ekvatorn — fem gånger starkare än de kraftigaste orkanerna på Jorden.', en: "Saturn has winds up to 1,800 km/h at the equator — five times stronger than Earth's worst hurricanes." },
  },
  {
    id: 'saturn_rings_temporary', bodyId: 'saturn', icon: '🕰️', level: 'both',
    title: { sv: 'Ringarna försvinner', en: 'The rings are disappearing' },
    body: { sv: 'Saturnus ringar krymper sakta och kommer att vara borta om ungefär 100 miljoner år — en kort stund kosmiskt sett. Vi lever i en lycklig tid då de fortfarande finns att se.', en: "Saturn's rings are slowly shrinking and will be gone in about 100 million years — a brief moment in cosmic terms. We live in a lucky era when they're still there to see." },
  },

  // URANUS
  {
    id: 'uranus_tilt', bodyId: 'uranus', icon: '🔄', level: 'both',
    title: { sv: 'En planet som ligger ner', en: 'A planet lying on its side' },
    body: { sv: 'Uranus lutar 98 grader — planeten kretsar nästan på sidan. Det innebär att varje pol har 42 år av konstant solsken följt av 42 år av totalt mörker.', en: 'Uranus tilts 98 degrees — the planet essentially orbits on its side. This means each pole has 42 years of constant sunlight followed by 42 years of total darkness.' },
  },
  {
    id: 'uranus_ice_giant', bodyId: 'uranus', icon: '🌊', level: 'middle',
    title: { sv: 'Is som inte är is', en: "Ice that isn't really ice" },
    body: { sv: 'Uranus kallas en "isjätte" — men under gasskiktet finns inte vanlig is utan ett hav av supervarm, superkomprimerat vatten och ammoniak under extremt tryck.', en: 'Uranus is called an "ice giant" — but beneath the gas layer isn\'t regular ice but a sea of super-hot, super-compressed water and ammonia under extreme pressure.' },
  },
  {
    id: 'uranus_colour', bodyId: 'uranus', icon: '🔵', level: 'middle',
    title: { sv: 'Varför är Uranus blågrön?', en: 'Why is Uranus blue-green?' },
    body: { sv: 'Uranus blågrön färg kommer från metan i atmosfären, som absorberar rött ljus och reflekterar blått och grönt.', en: "Uranus's blue-green colour comes from methane in the atmosphere, which absorbs red light and reflects blue and green." },
  },
  {
    id: 'uranus_quiet', bodyId: 'uranus', icon: '🌀', level: 'upper',
    title: { sv: 'Förvånansvärt lugn', en: 'Surprisingly calm' },
    body: { sv: 'Trots att Uranus är en gasjätte är den förvånansvärt slät och saknar tydliga stormmönster jämfört med Jupiter och Saturnus. Varför är ännu inte klarlagt.', en: 'Despite being a gas giant, Uranus is surprisingly featureless and lacks clear storm patterns compared to Jupiter and Saturn. Why this is the case is still not fully understood.' },
  },

  // NEPTUNE
  {
    id: 'neptune_winds', bodyId: 'neptune', icon: '🌬️', level: 'both',
    title: { sv: 'Starkaste vindarna i solsystemet', en: 'The strongest winds in the solar system' },
    body: { sv: 'Neptunus har de starkaste vindarna av alla planeter — upp till 2 100 km/h. Det är märkligt eftersom Neptunus är så långt från Solen och tar emot lite energi.', en: 'Neptune has the strongest winds of any planet — up to 2,100 km/h. This is puzzling because Neptune is so far from the Sun and receives little energy.' },
  },
  {
    id: 'neptune_blue', bodyId: 'neptune', icon: '🔵', level: 'middle',
    title: { sv: 'Den blåaste planeten', en: 'The bluest planet' },
    body: { sv: 'Neptunus är den djupblåaste planeten i solsystemet. Precis som Uranus beror det på metan i atmosfären — men Neptunus är tydligt mörkare blå.', en: 'Neptune is the most intensely blue planet in the solar system. Like Uranus it\'s due to methane in the atmosphere — but Neptune is noticeably darker blue.' },
  },
  {
    id: 'neptune_voyage', bodyId: 'neptune', icon: '🛤️', level: 'middle',
    title: { sv: '12 år för att nå dit', en: '12 years to get there' },
    body: { sv: 'Det tog rymdsonden Voyager 2 tolv år att nå Neptunus efter att den lämnade Jorden 1977. Den flög förbi 1989 och är fortfarande den enda sond som besökt planeten.', en: 'It took the Voyager 2 spacecraft twelve years to reach Neptune after leaving Earth in 1977. It flew past in 1989 and remains the only spacecraft ever to have visited the planet.' },
  },
  {
    id: 'neptune_triton', bodyId: 'neptune', icon: '🌑', level: 'both',
    title: { sv: 'Bakvänd måne', en: 'A backwards moon' },
    body: { sv: 'Neptunus största måne Triton rör sig bakvänt — motsatt Neptunus rotation. Det tyder på att Triton inte bildades runt Neptunus utan fångades in från det yttre solsystemet.', en: "Neptune's largest moon Triton orbits backwards — opposite to Neptune's rotation. This suggests Triton didn't form around Neptune but was captured from the outer solar system." },
  },

  // PLUTO
  {
    id: 'pluto_dwarf', bodyId: 'pluto', icon: '🌑', level: 'both',
    title: { sv: 'Inte längre en planet', en: 'No longer a planet' },
    body: { sv: 'Pluto klassades som planet från 1930 till 2006, då astronomerna omdefinierade "planet". Pluto har inte rensat sin omloppsbana på andra objekt och är nu en dvärgplanet.', en: 'Pluto was classed as a planet from 1930 until 2006, when astronomers redefined "planet." Pluto hasn\'t cleared its orbit of other objects — so it\'s now a dwarf planet.' },
  },
  {
    id: 'pluto_heart', bodyId: 'pluto', icon: '🏔️', level: 'middle',
    title: { sv: 'Hjärtat på Pluto', en: "Pluto's heart" },
    body: { sv: 'Pluto har ett gigantiskt hjärtformat område av ren kväveseis kallat Tombaugh Regio. Det hittades av rymdsonden New Horizons 2015 — 85 år efter att Pluto upptäcktes.', en: 'Pluto has a giant heart-shaped region of pure nitrogen ice called Tombaugh Regio. It was discovered by the New Horizons spacecraft in 2015 — 85 years after Pluto itself was found.' },
  },
  {
    id: 'pluto_cold', bodyId: 'pluto', icon: '❄️', level: 'middle',
    title: { sv: 'Nästan absolut nollpunkt', en: 'Almost absolute zero' },
    body: { sv: 'Temperaturen på Pluto är ungefär –230 °C. Absoluta nollpunkten — kallaste möjliga temperaturen — är –273 °C. Pluto är alltså bara 43 grader från det fysikaliska bottnet.', en: 'The temperature on Pluto is about –230 °C. Absolute zero — the coldest possible temperature — is –273 °C. So Pluto is just 43 degrees away from the physical bottom.' },
  },
  {
    id: 'pluto_new_horizons', bodyId: 'pluto', icon: '🔭', level: 'upper',
    title: { sv: 'Den sista att besökas', en: 'The last to be visited' },
    body: { sv: 'New Horizons lämnade Jorden 2006 och flög förbi Pluto i juli 2015 — en resa på 9,5 år. Bilderna visade en förvånansvärt aktiv värld med berg, slätter och atmosfär.', en: 'New Horizons left Earth in 2006 and flew past Pluto in July 2015 — a 9.5-year journey. The images revealed a surprisingly geologically active world with mountains, plains, and an atmosphere.' },
  },

  // MOON
  {
    id: 'moon_locked', bodyId: 'moon', icon: '🌕', level: 'middle',
    title: { sv: 'Varför ser vi alltid samma sida?', en: 'Why do we always see the same side?' },
    body: { sv: 'Månen roterar precis lika snabbt som den kretsar runt Jorden, så vi ser alltid samma sida. Det kallas "låst rotation" och uppstår när tyngdkraften saktar ner ett objekts snurr.', en: 'The Moon rotates at exactly the same speed as it orbits Earth, so we always see the same face. This is called "tidal locking" and happens when gravity gradually slows an object\'s spin over time.' },
  },
  {
    id: 'moon_tides', bodyId: 'moon', icon: '🌊', level: 'middle',
    title: { sv: 'Månens drag skapar tidvatten', en: "The Moon's pull creates tides" },
    body: { sv: 'Månens gravitation drar i Jordens hav och skapar tidvatten — havet höjs och sänks upp till tolv meter vid vissa kuster.', en: "The Moon's gravity pulls on Earth's oceans, creating tides — the sea rises and falls by up to twelve metres at some coasts." },
  },
  {
    id: 'moon_visited', bodyId: 'moon', icon: '🚀', level: 'middle',
    title: { sv: 'Det enda stället utanför Jorden vi besökt', en: 'The only place beyond Earth humans have visited' },
    body: { sv: 'Månen är det enda himmelsobjektet utanför Jorden där människor har landat. Neil Armstrong och Buzz Aldrin klev ner den 20 juli 1969. Totalt tolv astronauter har gått på Månen.', en: 'The Moon is the only celestial body beyond Earth where humans have landed. Neil Armstrong and Buzz Aldrin stepped down on July 20, 1969. Twelve astronauts in total have walked on the Moon.' },
  },
  {
    id: 'moon_origin', bodyId: 'moon', icon: '💥', level: 'upper',
    title: { sv: 'Månens våldsamma ursprung', en: "The Moon's violent origin" },
    body: { sv: 'Månen bildades troligtvis när en Mars-stor kropp kraschade in i den unga Jorden för 4,5 miljarder år sedan. Debriset kastades ut i omloppsbana och klumpade ihop sig till vår Måne.', en: 'The Moon most likely formed when a Mars-sized body smashed into the young Earth 4.5 billion years ago. The debris was thrown into orbit and clumped together to form our Moon.' },
  },

  // IO
  {
    id: 'io_volcanoes', bodyId: 'io', icon: '🌋', level: 'both',
    title: { sv: 'Mest vulkanisk kropp i solsystemet', en: 'The most volcanically active body in the solar system' },
    body: { sv: 'Io är den mest vulkaniskt aktiva kroppen i hela solsystemet. Det pågår alltid aktiva utbrott — hundratals vulkaner syns ibland simultant från rymden.', en: 'Io is the most volcanically active body in the entire solar system. There are always active eruptions — hundreds of volcanoes can sometimes be seen simultaneously from space.' },
  },
  {
    id: 'io_tidal_heating', bodyId: 'io', icon: '🔥', level: 'upper',
    title: { sv: 'Uppvärmd av tidvattenkrafter', en: 'Heated by tidal forces' },
    body: { sv: 'Ios vulkanism orsakas av Jupiters gravitationskrafter som ständigt knådar och tänjer på månens inre — som att böja ett gem fram och tillbaka tills det blir varmt.', en: "Io's volcanism is caused by Jupiter's gravity constantly kneading and stretching the moon's interior — like bending a paperclip back and forth until it gets warm." },
  },
  {
    id: 'io_sulphur', bodyId: 'io', icon: '🌈', level: 'middle',
    title: { sv: 'En mångfärgad svavelyta', en: 'A multicoloured sulphur surface' },
    body: { sv: 'Ios yta täcks av svavel i många färger — gult, orange, rött och svart — beroende på vilken temperatur svavlet stelnat vid.', en: "Io's surface is covered in sulphur in many colours — yellow, orange, red and black — depending on the temperature at which it solidified." },
  },
  {
    id: 'io_radiation', bodyId: 'io', icon: '☢️', level: 'upper',
    title: { sv: 'Badad i dödlig strålning', en: 'Bathed in deadly radiation' },
    body: { sv: 'Io befinner sig djupt inne i Jupiters intensiva strålningsbälten. En astronaut utan skydd skulle få en livsfarlig stråldos på bara några timmar.', en: "Io sits deep inside Jupiter's intense radiation belts. An unprotected astronaut would receive a lethal radiation dose in just a few hours." },
  },

  // EUROPA
  {
    id: 'europa_ocean', bodyId: 'europa', icon: '🌊', level: 'both',
    title: { sv: 'Ett hav gömt under isen', en: 'An ocean hidden beneath the ice' },
    body: { sv: 'Under Europas isiga yta döljer sig ett flytande hav som kan innehålla mer vatten än alla Jordens hav tillsammans. Det hålls flytande av värme från Jupiters tidvattenkrafter.', en: "Beneath Europa's icy surface hides a liquid ocean that may contain more water than all of Earth's oceans combined. It's kept liquid by heat from Jupiter's tidal forces." },
  },
  {
    id: 'europa_life', bodyId: 'europa', icon: '🔬', level: 'middle',
    title: { sv: 'Kanske finns liv under isen', en: 'Life might exist beneath the ice' },
    body: { sv: 'Europa är ett av de mest lovande ställena att söka efter liv utanför Jorden. Havet under isen kan ha rätt förutsättningar — värme, vatten och kemi — för enkla organismer.', en: "Europa is one of the most promising places to search for life beyond Earth. The ocean beneath the ice may have the right conditions — heat, water and chemistry — for simple organisms to survive." },
  },
  {
    id: 'europa_cracks', bodyId: 'europa', icon: '❄️', level: 'middle',
    title: { sv: 'Sprickor i isen', en: 'Cracks in the ice' },
    body: { sv: 'Europas yta är täckt av långa sprickor och rödbruna linjer. De bildas när isskorpan rör sig och böjs av trycket från det varma havet under.', en: "Europa's surface is covered in long cracks and reddish-brown lines. They form as the ice shell moves and flexes under pressure from the warm ocean below." },
  },
  {
    id: 'europa_ice_thickness', bodyId: 'europa', icon: '🧊', level: 'upper',
    title: { sv: 'Isskorpa och djuphav', en: 'Ice shell and deep ocean' },
    body: { sv: 'Europas isskorpa är uppskattad till 15–25 km tjock. Under den tror forskarna att havet är 60–150 km djupt — tre till åtta gånger djupare än Jordens Marianergraven.', en: "Europa's ice shell is estimated to be 15–25 km thick. Beneath it, researchers believe the ocean is 60–150 km deep — three to eight times deeper than Earth's Mariana Trench." },
  },

  // GANYMEDE
  {
    id: 'ganymede_biggest', bodyId: 'ganymede', icon: '🏆', level: 'both',
    title: { sv: 'Störst av alla månar', en: 'Largest of all moons' },
    body: { sv: 'Ganymedes är den största månen i hela solsystemet — till och med större än planeten Merkurius. Ändå kretsar den runt Jupiter, inte runt Solen.', en: 'Ganymede is the largest moon in the entire solar system — even bigger than the planet Mercury. Yet it orbits Jupiter, not the Sun.' },
  },
  {
    id: 'ganymede_magnetic', bodyId: 'ganymede', icon: '🧲', level: 'upper',
    title: { sv: 'Den enda månen med eget magnetfält', en: 'The only moon with its own magnetic field' },
    body: { sv: 'Ganymedes är den enda månen i solsystemet med ett eget magnetfält. Det skapar ett mini-polarsken ovanpå Jupiters enorma polarsken.', en: "Ganymede is the only moon in the solar system with its own magnetic field. It creates a mini aurora on top of Jupiter's enormous aurora." },
  },
  {
    id: 'ganymede_hidden_ocean', bodyId: 'ganymede', icon: '🌊', level: 'both',
    title: { sv: 'Ocean djupare ner', en: 'An ocean even deeper down' },
    body: { sv: 'Under Ganymedes yta döljer sig sannolikt ett saltvattensoceanen. Rymdteleskopet Hubble hittade indikationer via polarskenets rörelser.', en: "Beneath Ganymede's surface likely hides a saltwater ocean. The Hubble Space Telescope found evidence through the motion of its auroras." },
  },
  {
    id: 'ganymede_terrain', bodyId: 'ganymede', icon: '🪨', level: 'middle',
    title: { sv: 'Blandat landskap', en: 'Mixed landscape' },
    body: { sv: 'Ganymedes yta har två sorters terräng: mörkt, gammalt krattat land och ljust, yngre land med parallella åsar — tecken på geologisk aktivitet.', en: "Ganymede's surface has two types of terrain: dark, ancient heavily cratered land, and bright, younger terrain with parallel ridges — signs of geological activity." },
  },

  // CALLISTO
  {
    id: 'callisto_craters', bodyId: 'callisto', icon: '🕳️', level: 'middle',
    title: { sv: 'Det mest kratrade objektet', en: 'The most cratered object' },
    body: { sv: 'Callisto är det mest kratrade objektet i solsystemet. Ytan har inte förändrats på miljarder år — en fryst ögonblicksbild av solsystemets barndom.', en: "Callisto is the most cratered object in the solar system. The surface hasn't changed for billions of years — a frozen snapshot of what the solar system looked like in its infancy." },
  },
  {
    id: 'callisto_radiation_safe', bodyId: 'callisto', icon: '☣️', level: 'upper',
    title: { sv: 'Skyddad från Jupiters strålning', en: "Sheltered from Jupiter's radiation" },
    body: { sv: 'Callisto befinner sig utanför Jupiters intensiva inre strålningsbälten. Det gör den till en av de mer realistiska kandidaterna för en framtida bemannad utpost nära Jupiter.', en: "Callisto lies outside Jupiter's intense inner radiation belts. This makes it one of the more realistic candidates for a future crewed outpost in the Jupiter system." },
  },
  {
    id: 'callisto_possible_ocean', bodyId: 'callisto', icon: '🌊', level: 'both',
    title: { sv: 'Möjligt hav under ytan', en: 'A possible ocean below the surface' },
    body: { sv: 'Trots sin uråldriga yta tyder magnetmätningar på att Callisto kan gömma ett flytande hav långt under ytan — oväntat för en så till synes inaktiv måne.', en: "Despite its ancient, undisturbed surface, magnetic measurements suggest Callisto may hide a liquid ocean far underground — unexpected for such an apparently inactive moon." },
  },
  {
    id: 'callisto_no_magnetic', bodyId: 'callisto', icon: '💡', level: 'upper',
    title: { sv: 'Inget eget magnetfält', en: 'No magnetic field of its own' },
    body: { sv: 'Till skillnad från Ganymedes har Callisto inget eget magnetfält, vilket tyder på en mer homogen inre struktur som aldrig separerat i en järnkärna.', en: "Unlike Ganymede, Callisto has no magnetic field of its own, suggesting a more uniform interior that never separated into an iron core surrounded by a mantle." },
  },

  // TITAN
  {
    id: 'titan_lakes', bodyId: 'titan', icon: '🌊', level: 'both',
    title: { sv: 'Sjöar av flytande gas', en: 'Lakes of liquid gas' },
    body: { sv: 'Titan är den enda månen med stabila vätskor på ytan. Men det är inte vatten — det är sjöar och hav av flytande metan och etan vid –179 °C.', en: "Titan is the only moon with stable liquids on its surface. But it's not water — it's lakes and seas of liquid methane and ethane at –179 °C." },
  },
  {
    id: 'titan_atmosphere', bodyId: 'titan', icon: '🌫️', level: 'middle',
    title: { sv: 'En tjockare atmosfär än Jordens', en: "A thicker atmosphere than Earth's" },
    body: { sv: 'Titan har en atmosfär tjockare än Jordens, mestadels kväve. En orange dimma omger hela månen. Rymdsonden Huygens landade i dimman 2005.', en: "Titan has an atmosphere thicker than Earth's, mostly nitrogen. An orange haze surrounds the entire moon. The Huygens probe landed in the haze in 2005." },
  },
  {
    id: 'titan_life_possible', bodyId: 'titan', icon: '🔬', level: 'upper',
    title: { sv: 'En alternativ livsmiljö?', en: 'An alternative habitat for life?' },
    body: { sv: 'Titans kombination av kolväten, kväve och energikällor liknar teorier om hur livet kan ha börjat på urtida Jorden. Möjligen kan metanbaserat liv existera i sjöarna.', en: "Titan's combination of hydrocarbons, nitrogen and energy sources resembles theories about how life may have started on early Earth. Possibly methane-based life could exist in the lakes." },
  },
  {
    id: 'titan_cassini', bodyId: 'titan', icon: '🔭', level: 'both',
    title: { sv: 'Cassinis trettonåriga arv', en: "Cassini's thirteen-year legacy" },
    body: { sv: 'Rymdsonden Cassini tillbringade 13 år i Saturnussystemet och kartlade Titan i detalj. 2017 dök den med flit ner i Saturnus atmosfär — för att inte förorena Titan med jordbakterier.', en: 'The Cassini spacecraft spent 13 years in the Saturn system and mapped Titan in detail. In 2017 it deliberately plunged into Saturn\'s atmosphere — to avoid contaminating Titan with Earth bacteria.' },
  },

  // TRITON
  {
    id: 'triton_backwards', bodyId: 'triton', icon: '🔄', level: 'both',
    title: { sv: 'Den bakvänt kretsande månen', en: 'The moon that orbits backwards' },
    body: { sv: 'Triton kretsar runt Neptunus i motsatt riktning mot Neptunus rotation — den enda stora månen i solsystemet som gör det. Det tyder på att den fångades in utifrån.', en: "Triton orbits Neptune in the opposite direction to Neptune's rotation — the only large moon in the solar system to do so. This strongly suggests it was captured from elsewhere." },
  },
  {
    id: 'triton_geysers', bodyId: 'triton', icon: '🌋', level: 'both',
    title: { sv: 'Kvävegeysers i kylan', en: 'Nitrogen geysers in the cold' },
    body: { sv: 'Triton har aktiva geysers som sprutar kvävegas upp till 8 km i höjden. Solljuset värmer upp kväveisen under ytan tills den förvandlas till gas och bryter igenom.', en: 'Triton has active geysers that shoot nitrogen gas up to 8 km into the air. Sunlight heats nitrogen ice below the surface until it turns to gas and breaks through.' },
  },
  {
    id: 'triton_cold', bodyId: 'triton', icon: '❄️', level: 'middle',
    title: { sv: 'En av de kallaste platserna vi mätt', en: "One of the coldest places we've measured" },
    body: { sv: 'Triton är en av de kallaste kroppar vi har mätt i solsystemet — ungefär –235 °C. Det är bara 38 grader över den absoluta nollpunkten.', en: "Triton is one of the coldest objects we've measured in the solar system — about –235 °C. That's just 38 degrees above absolute zero." },
  },
  {
    id: 'triton_doomed', bodyId: 'triton', icon: '🕐', level: 'upper',
    title: { sv: 'En måne med inbyggt förfallodatum', en: 'A moon with a built-in expiry date' },
    body: { sv: 'Triton rör sig i en sakta spiralformad bana mot Neptunus. Om ungefär 3,6 miljarder år kommer Neptunus tyngdkraft riva sönder månen och skapa ett nytt ringsystem.', en: "Triton is slowly spiralling inward toward Neptune. In about 3.6 billion years, Neptune's gravity will tear the moon apart and create a new ring system." },
  },

  // ISS
  {
    id: 'iss_construction', bodyId: 'iss', icon: '🏗️', level: 'middle',
    title: { sv: 'Byggd i rymden, bit för bit', en: 'Built in space, piece by piece' },
    body: { sv: 'ISS byggdes inte i ett stycke och sköts upp. Den monterades bit för bit i rymden under 13 år av astronauter från 15 länder.', en: "The ISS wasn't built in one piece and launched. It was assembled piece by piece in space over 13 years by astronauts from 15 countries." },
  },
  {
    id: 'iss_research', bodyId: 'iss', icon: '🔬', level: 'both',
    title: { sv: 'Forskning i tyngdlöshet', en: 'Research in weightlessness' },
    body: { sv: 'På ISS studerar forskare hur kropp och material beter sig utan tyngdkraft. Resultaten hjälper oss förstå hur människan kan överleva en lång resa till Mars.', en: "On the ISS, scientists study how bodies and materials behave without gravity. The findings help us understand how humans could survive a long journey to Mars." },
  },
  {
    id: 'iss_sunrises', bodyId: 'iss', icon: '🌍', level: 'middle',
    title: { sv: '16 soluppgångar om dagen', en: '16 sunrises a day' },
    body: { sv: 'ISS kretsar runt Jorden 16 gånger per dygn med en hastighet av 28 000 km/h. Det innebär att astronauterna ombord upplever 16 soluppgångar varje dag.', en: 'The ISS orbits Earth 16 times per day at 28,000 km/h. This means astronauts on board experience 16 sunrises and 16 sunsets every single day.' },
  },
  {
    id: 'iss_maintenance', bodyId: 'iss', icon: '🛠️', level: 'upper',
    title: { sv: 'Ständigt underhåll', en: 'Constant maintenance' },
    body: { sv: 'ISS underhålls kontinuerligt av astronauter som utför rymdpromenader. Utan regelbundna försörjningsraketer och reservdelar skulle stationen inte klara sig mer än några år.', en: "The ISS is continuously maintained by astronauts performing spacewalks. Without regular supply rockets and spare parts, the station would not survive more than a few years." },
  },
];

export const getFactCardsForBody = (
  bodyId: BodyId,
  level: FactCardLevel,
): ReadonlyArray<FactCard> => {
  if (level === 'both') {
    return FACT_CARDS.filter((c) => c.bodyId === bodyId);
  }

  return FACT_CARDS.filter(
    (c) => c.bodyId === bodyId && (c.level === 'both' || c.level === level),
  );
};

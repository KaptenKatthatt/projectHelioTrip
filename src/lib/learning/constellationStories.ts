import type { ConstellationId } from '../constellations';

export type ConstellationStory = {
  readonly id: ConstellationId;
  readonly story: { readonly sv: string; readonly en: string };
  readonly findIt: { readonly sv: string; readonly en: string };
  readonly funFact: { readonly sv: string; readonly en: string };
};

export const CONSTELLATION_STORIES: ReadonlyArray<ConstellationStory> = [
  {
    id: 'orion',
    story: {
      sv: 'Orion var en mäktig jägare i grekisk mytologi, son till havsguden Poseidon. Han skröt om att han skulle döda alla djur på Jorden. För att straffa hans högmod sände gudarna en skorpion som stack honom till döds. Zeus placerade sedan både Orion och Skorpionen på himlen — men på motsatta sidor, så att de aldrig möts.',
      en: "Orion was a mighty hunter in Greek mythology, son of the sea god Poseidon. He boasted that he would kill all the animals on Earth. To punish his arrogance, the gods sent a scorpion that stung him to death. Zeus then placed both Orion and the Scorpion in the sky — but on opposite sides, so they never meet.",
    },
    findIt: {
      sv: 'Sök efter tre stjärnor på rad i ett rätlinjigt bälte — det är Orions bälte. Det är ett av de mest igenkänliga mönstren på himlen. Ovanför och under bältet sitter ytterligare stjärnor som markerar axlarna och fötterna. Synlig i Sverige december–mars, bäst i söder.',
      en: "Look for three stars in a straight line — that's Orion's belt. It's one of the most recognisable patterns in the sky. Above and below the belt are further stars marking the shoulders and feet. Visible in Sweden December–March, best viewed toward the south.",
    },
    funFact: {
      sv: 'Orions övre vänstra stjärna — Betelgeuse — är en röd superjätte nära slutet av sitt liv. Den kan explodera i en supernova inom de närmaste 100 000 åren. Om den exploderar syns den på daghimlen och lyser lika starkt som Månen.',
      en: "Orion's upper left star — Betelgeuse — is a red supergiant near the end of its life. It could explode as a supernova within the next 100,000 years. If it does, it will be visible in daylight and shine as brightly as the Moon.",
    },
  },
  {
    id: 'ursaMajor',
    story: {
      sv: 'Kallisto var en vacker nymf som av gudarna förvandlades till en björn av svartsjuka — olika myter ger olika syndabockar. Hennes son Arkas var nära att döda henne på jakt. Zeus förvandlade då också Arkas till en björn och placerade dem båda på himlen. Den lilla björnen är sonen, den stora är modern.',
      en: 'Callisto was a beautiful nymph transformed into a bear by jealous gods — different myths blame different culprits. Her son Arcas nearly killed her while hunting. Zeus then turned Arcas into a bear too and placed them both in the sky. The little bear is the son, the great bear is the mother.',
    },
    findIt: {
      sv: 'Stora björnen syns hela året i Sverige. Karlavagnens sju ljusaste stjärnor sitter i stjärnbilden — de formar en gryta med handtag. Använd de två yttersta stjärnorna i grytan som en pekare: dra en linje fem gånger deras avstånd — du hittar Polaris, Nordstjärnan.',
      en: "The Great Bear is visible all year in Sweden. The Big Dipper's seven brightest stars sit within the constellation — they form a ladle with a handle. Use the two outer stars of the ladle as a pointer: draw a line five times their distance and you find Polaris, the North Star.",
    },
    funFact: {
      sv: 'De sju stjärnorna i Karlavagnen rör sig faktiskt i rymden som en grupp — de bildades ungefär samtidigt och rör sig åt samma håll. Om tio miljoner år har karlavagnen böjts så att den inte längre ser ut som en gryta.',
      en: 'The seven stars of the Big Dipper are actually moving through space as a group — they formed at about the same time and move in the same direction. In ten million years, the dipper will have bent so much it no longer looks like a ladle.',
    },
  },
  {
    id: 'karlaVagnen',
    story: {
      sv: 'Karlavagnen är inte en stjärnbild i sig utan en "asterism" — ett lättigenkänt mönster av stjärnor som tillhör Stora björnen. I Sverige har den länge kallats "Karlavagnen" — männens vagn. I USA kallas den "The Big Dipper" (den stora skeden).',
      en: 'The Big Dipper isn\'t a constellation in itself but an "asterism" — an easily recognised star pattern belonging to Ursa Major. In Sweden it\'s long been called "Karlavagnen" — the men\'s cart. In the US it\'s called "The Big Dipper."',
    },
    findIt: {
      sv: 'Karlavagnen är ett av de lättaste mönstren att hitta på nordliga breddgrader. De sju stjärnorna formar en gryta med ett långt handtag. Kretsar runt Polaris hela natten och är synlig hela året i Sverige.',
      en: 'The Big Dipper is one of the easiest patterns to find at northern latitudes. The seven stars form a bowl with a long handle. It circles Polaris throughout the night and is visible year-round in Sweden.',
    },
    funFact: {
      sv: 'Stjärnan Mizar i handtaget har en svagare följeslagare, Alcor, alldeles bredvid. De kallas "häst och ryttare". Förr i tiden användes synen att skilja dem åt som ett synskärpetest för soldater.',
      en: "The star Mizar in the handle has a fainter companion, Alcor, right next to it. They're called \"horse and rider.\" In ancient times, being able to split them apart was used as a vision test for soldiers.",
    },
  },
  {
    id: 'ursaMinor',
    story: {
      sv: 'Lilla björnen representerar Arkas, son till Kallisto (Stora björnen), i den grekiska myten. Zeus förvandlade honom till en björn och placerade honom på himlen bredvid sin mor. Nordstjärnan — Polaris — sitter i svansen på Lilla björnen.',
      en: 'Little Bear represents Arcas, son of Callisto (the Great Bear), in Greek myth. Zeus transformed him into a bear and placed him in the sky beside his mother. The North Star — Polaris — sits at the tip of Little Bear\'s tail.',
    },
    findIt: {
      sv: 'Hitta Karlavagnen och använd de två yttersta stjärnorna som pekare. Den ljusa stjärnan de pekar mot är Polaris — Nordstjärnan — som sitter i stjärnsvansen på Lilla björnen. Hela stjärnbilden roterar runt Polaris under natten.',
      en: "Find the Big Dipper and use the two outer bowl stars as pointers. The bright star they point to is Polaris — the North Star — which sits at the tip of Little Bear's tail. The whole constellation rotates around Polaris throughout the night.",
    },
    funFact: {
      sv: 'Polaris är inte den ljusaste stjärnan på himlen — det är Sirius. Men Polaris är speciell eftersom den befinner sig nästan exakt ovanför Jordens nordpol. Det gör att den inte rör sig medan alla andra stjärnor roterar runt den.',
      en: "Polaris isn't the brightest star in the sky — that's Sirius. But Polaris is special because it sits almost directly above Earth's North Pole. This means it doesn't move while all other stars rotate around it.",
    },
  },
  {
    id: 'cassiopeia',
    story: {
      sv: 'Cassiopeja var en fåfäng drottning i etiopisk mytologi som skröt om att hennes skönhet övergick havets nymfer. Som straff bands hennes dotter Andromeda vid en klippa som offer åt ett sjömonster. Hjälten Perseus räddade Andromeda — och båda finns nu som stjärnbilder på himlen.',
      en: "Cassiopeia was a vain queen in Ethiopian mythology who boasted that her beauty surpassed the sea nymphs. As punishment, her daughter Andromeda was chained to a rock as a sacrifice to a sea monster. The hero Perseus rescued Andromeda — and both are now constellations in the sky.",
    },
    findIt: {
      sv: 'Cassiopeja syns hela året i Sverige. Den fem stjärnor formar ett tydligt W (eller M, beroende på tid på natten). Hitta Nordstjärnan och Cassiopeja sitter ungefär lika långt bort på andra sidan — de roterar runt Polaris som ett par.',
      en: 'Cassiopeia is visible all year in Sweden. Its five stars form a clear W (or M, depending on the time of night). Find the North Star and Cassiopeia sits roughly the same distance away on the opposite side — they rotate around Polaris like a pair.',
    },
    funFact: {
      sv: '1572 exploderade en stjärna i Cassiopeja i en supernova som var synlig på daghimlen i nästan två veckor. Den danska astronomen Tycho Brahe observerade den noga och kallade den "Nova Stella" — ny stjärna. Det ändrade synen på rymden som något evigt och oföränderligt.',
      en: 'In 1572, a star in Cassiopeia exploded as a supernova visible in daylight for nearly two weeks. The Danish astronomer Tycho Brahe observed it carefully and called it "Nova Stella" — new star. It changed the view of space as something eternal and unchanging.',
    },
  },
  {
    id: 'cygnus',
    story: {
      sv: 'Svanen på himlen sägs vara Zeus förklädd till svan i ett av sina många äventyr. En annan version berättar om Phaethon, som försökte köra sin fars solstridsvagn men tappade kontrollen och störtade. Hans vän Cygnus sörjde länge vid flodens strand — Zeus förvandlade honom till svan och placerade honom på himlen.',
      en: "The swan in the sky is said to be Zeus disguised as a swan in one of his many adventures. Another version tells of Phaethon, who tried to drive his father's sun chariot but lost control and crashed. His friend Cygnus mourned for a long time at the riverbank — Zeus transformed him into a swan and placed him in the sky.",
    },
    findIt: {
      sv: 'Cygnus syns bäst på sommaren och hösten. Den ljusaste stjärnan, Deneb, sitter i svanens svans och är en av hörnen i det kända "Sommartriangelns" asterism. De övriga hörnen är Vega (i Lyra) och Altair (i Örnen). Hitta triangeln och Cygnus är den nordligaste grenen.',
      en: 'Cygnus is best seen in summer and autumn. Its brightest star, Deneb, sits in the swan\'s tail and is one corner of the well-known "Summer Triangle" asterism. The other corners are Vega (in Lyra) and Altair (in Aquila). Find the triangle and Cygnus is the northernmost branch.',
    },
    funFact: {
      sv: 'Deneb är en av de mest lysande stjärnor vi känner till — men den ser inte ljusast ut för att den är otroligt långt borta, ungefär 2 600 ljusår. Om Deneb befann sig lika nära som Sirius (8,6 ljusår) skulle den kasta skuggor på Jordens yta.',
      en: "Deneb is one of the most luminous stars we know of — but it doesn't appear brightest because it's incredibly far away, about 2,600 light-years. If Deneb were as close as Sirius (8.6 light-years), it would cast shadows on Earth's surface.",
    },
  },
  {
    id: 'scorpius',
    story: {
      sv: 'Skorpionen är figuren som dödade den store jägaren Orion i den grekiska myten. Zeus separerade dem på himlen — när Skorpionen stiger upp i öster sjunker Orion i väster. De jagar varandra men träffas aldrig. Det är därför de aldrig syns på himlen samtidigt.',
      en: "The Scorpion is the creature that killed the great hunter Orion in Greek myth. Zeus separated them in the sky — when the Scorpion rises in the east, Orion sets in the west. They chase each other but never meet. This is why they're never visible in the sky at the same time.",
    },
    findIt: {
      sv: 'Skorpionen syns bäst på sommaren, lågt i söder. Stjärnan Antares — rödaktig och lysande — markerar skorpionens hjärta. Stjärnbilden är lättare att se från sydligare breddgrader; i Sverige syns bara den övre delen över horisonten.',
      en: 'Scorpius is best seen in summer, low in the south. The star Antares — reddish and bright — marks the scorpion\'s heart. The constellation is easier to see from more southerly latitudes; in Sweden only the upper portion clears the horizon.',
    },
    funFact: {
      sv: 'Antares — stjärnan i Skorpionens hjärta — är en röd superjätte ungefär 700 gånger bredare än Solen. Om den ersatte Solen i vårt solsystem skulle Antares yta sträcka sig förbi Mars bana.',
      en: "Antares — the star in the Scorpion's heart — is a red supergiant roughly 700 times wider than the Sun. If it replaced our Sun, Antares's surface would extend past the orbit of Mars.",
    },
  },
  {
    id: 'leo',
    story: {
      sv: 'Lejonet i stjärnorna är det Nemeiska lejonet från den grekiske hjälten Hercules tolv stordåd. Lejonet hade ett ospårbart skinn och kunde inte skadas av vapen. Hercules kämpade med det och strypte det med bara händerna. Han bar sedan lejonhuden som rustning.',
      en: "The lion in the stars is the Nemean Lion from Heracles's twelve labours. The lion had impenetrable skin and couldn't be harmed by weapons. Heracles wrestled it and strangled it with his bare hands. He then wore the lion skin as armour.",
    },
    findIt: {
      sv: 'Leo syns bäst på våren. Stjärnan Regulus markerar lejonets hjärta och sitter direkt på ekliptikan — Solens bana på himlen. En grupp stjärnor i lejonets huvud formar ett bakvänt frågetecken (eller en skäreliknande form) som kallas "Lejonets lie".',
      en: 'Leo is best seen in spring. The star Regulus marks the lion\'s heart and sits directly on the ecliptic — the Sun\'s path through the sky. A group of stars in the lion\'s head form a backwards question mark (or sickle shape) called "the Sickle of Leo."',
    },
    funFact: {
      sv: 'Varje år i november passerar Jorden genom resterna av en komet i närheten av Leo. Det skapar ett meteorregn kallat Leoniderna. Under extraordinära år kan man se tusentals meteorer per timme — ett av naturens mest spektakulära skådespel.',
      en: "Every year in November, Earth passes through the debris of a comet near Leo. This creates a meteor shower called the Leonids. In extraordinary years, thousands of meteors per hour can be seen — one of nature's most spectacular displays.",
    },
  },
  {
    id: 'taurus',
    story: {
      sv: 'Oxen på himlen sägs vara Zeus förklädd till en vit tjur för att imponera på prinsessan Europa. Han lockade henne upp på ryggen och simmade med henne till ön Kreta. Stjärnhopen Plejaderna i tjurens skuldra är sju systrar som Zeus förvandlade till stjärnor för att skydda dem.',
      en: 'The bull in the sky is said to be Zeus disguised as a white bull to impress the princess Europa. He lured her onto his back and swam with her to the island of Crete. The Pleiades star cluster in the bull\'s shoulder are seven sisters Zeus transformed into stars to protect them.',
    },
    findIt: {
      sv: 'Taurus syns bäst på vintern. Stjärnan Aldebaran — rödaktig och lysande — markerar tjurens öga och är lätt att hitta nära Orion. Plejaderna sitter lite längre bort och syns som en liten knippa av stjärnor — det mest folk misstar för en liten Karlavagn.',
      en: "Taurus is best seen in winter. The star Aldebaran — reddish and bright — marks the bull's eye and is easy to find near Orion. The Pleiades are a little further away and appear as a small cluster of stars — what most people mistake for a miniature Big Dipper.",
    },
    funFact: {
      sv: 'År 1054 exploderade en stjärna i Taurus i en supernova som var synlig på daghimlen i 23 dagar. Kvar finns Krabbgasmoln — en glödande rest av explosionen. Det är ett av de mest fotograferade objekten i universum och syns i teleskop i dag.',
      en: 'In 1054, a star in Taurus exploded as a supernova visible in daylight for 23 days. What remains is the Crab Nebula — a glowing remnant of the explosion. It\'s one of the most photographed objects in the universe and is visible through telescopes today.',
    },
  },
  {
    id: 'gemini',
    story: {
      sv: 'Tvillingarna är Castor och Pollux — bröder med delade gudomligheter i grekisk mytologi. Castor var dödlig, Pollux odödlig. När Castor dödades vägrade Pollux att gå till Olympen utan sin bror. Zeus förvandlade dem båda till stjärnor så att de aldrig behövde skiljas åt.',
      en: "The twins are Castor and Pollux — brothers of shared divinity in Greek mythology. Castor was mortal, Pollux immortal. When Castor was killed, Pollux refused to go to Olympus without his brother. Zeus transformed them both into stars so they would never have to be parted.",
    },
    findIt: {
      sv: 'Tvillingarna syns bäst på vintern. De två ljusaste stjärnorna — Castor och Pollux — sitter parallellt och pekar mot varandra. Hitta Orion och flytta blicken nordöst — de ljusa paret är tydliga. Gemini befinner sig nära Orion på himlen.',
      en: 'Gemini is best seen in winter. Its two brightest stars — Castor and Pollux — sit parallel and point toward each other. Find Orion and look northeast — the bright pair is obvious. Gemini sits close to Orion in the sky.',
    },
    funFact: {
      sv: 'Stjärnan Castor, som ser ut som en enda stjärna, är faktiskt ett sextuppelsystem — sex stjärnor som kretsar runt varandra i komplexa banor. Med ett amatörteleskop kan man se att det är minst tre.',
      en: 'The star Castor, which appears as a single star, is actually a sextuple system — six stars orbiting each other in complex paths. With an amateur telescope you can see that it\'s at least three.',
    },
  },
  {
    id: 'sagittarius',
    story: {
      sv: 'Skytten är en kentaur — halvhäst, halvmän — som siktar med en båge mot Skorpionen. I den romerska myten är han Chiron, den vise kentaurens lärare. I äldre myter är det Crotus, son till Pan, som uppfann konsten att skjuta med pil och båge.',
      en: 'The Archer is a centaur — half horse, half man — aiming a bow at the Scorpion. In Roman myth he is Chiron, the wise centaur teacher. In older myths he is Crotus, son of Pan, who invented the art of archery.',
    },
    findIt: {
      sv: 'Skytten syns på sommaren, lågt i söder. Den centrala delen av stjärnbilden liknar en tekanna — med handtag, pip och lock. Det sägs att Vintergatan "ångar" upp ur tekannans pip. Sikta mot tekannans pip för att titta mot Vintergatans centrum.',
      en: 'Sagittarius is best seen in summer, low in the south. The central part of the constellation resembles a teapot — with handle, spout and lid. The Milky Way is said to "steam" up from the teapot\'s spout. Aim toward the spout to look toward the centre of the Milky Way.',
    },
    funFact: {
      sv: 'Vintergatans centrum — ett supertungt svart hål kallat Sagittarius A* — befinner sig rakt bakom Skytten. Det svarta hålet är fyra miljoner gånger tyngre än Solen. 2022 fotograferades det för första gången av Event Horizon Telescope.',
      en: "The Milky Way's centre — a supermassive black hole called Sagittarius A* — lies directly behind the Archer. The black hole is four million times more massive than the Sun. In 2022 it was photographed for the first time by the Event Horizon Telescope.",
    },
  },
  {
    id: 'canisMajor',
    story: {
      sv: 'Stora hunden är Orions jakthund i den grekiska mytologin. Hunden följer sin herre tätt — när Orion stiger upp i öster följer Canis Major strax efter. Den lysande stjärnan Sirius i hundens nos kallas "Hundstjärnan" och har spelat en roll i astronomin sedan antiken.',
      en: "The Great Dog is Orion's hunting hound in Greek mythology. The dog follows its master closely — when Orion rises in the east, Canis Major follows shortly after. The brilliant star Sirius in the dog's nose is called the \"Dog Star\" and has played a role in astronomy since antiquity.",
    },
    findIt: {
      sv: 'Hitta Orion och följ bältets tre stjärnor åt sydöst — nästan i förlängningen hittar du Sirius, den ljusaste stjärnan på hela natthimlen. Det är omisskänligt; Sirius glittrar starkt, ofta med en regnbåge av färger nära horisonten på grund av atmosfärens brytning.',
      en: "Find Orion and follow the belt's three stars to the southeast — almost in the extension you find Sirius, the brightest star in the entire night sky. It's unmistakable; Sirius sparkles brilliantly, often with a rainbow of colours near the horizon due to atmospheric refraction.",
    },
    funFact: {
      sv: 'Sirius är inte bara ljusast på natthimlen — den är faktiskt ett dubbelstjärnesystem. Sirius A är den ljusa stjärnan vi ser; Sirius B är en liten vit dvärgstjärna, ungefär lika stor som Jorden men lika tung som Solen. Den upptäcktes 1862.',
      en: "Sirius isn't just the brightest star in the night sky — it's actually a binary star system. Sirius A is the bright star we see; Sirius B is a tiny white dwarf, roughly Earth-sized but as massive as the Sun. It was discovered in 1862.",
    },
  },
  {
    id: 'pegasus',
    story: {
      sv: 'Pegasus är den bevingade hästen som sprang fram ur blodet från Medusa när Perseus högg av hennes huvud. Pegasus klättrade upp till gudarna på Olympen och bar Zeus åskvigg. Hjälten Bellerofon försökte rida Pegasus till Olympen men kastades av, medan Pegasus fick bo bland gudarna för evigt.',
      en: "Pegasus is the winged horse that sprang from Medusa's blood when Perseus cut off her head. Pegasus climbed to the gods on Olympus and carried Zeus's thunderbolts. The hero Bellerophon tried to ride Pegasus to Olympus but was thrown off, while Pegasus was allowed to live among the gods forever.",
    },
    findIt: {
      sv: 'Pegasus syns bäst på hösten. De fyra stjärnorna som markerar hästens kropp — varav en lånas av Andromeda — bildar den stora "Pegasuskvadrat", ett tydligt fyrkantat mönster. Det är ett utmärkt utgångspunkt för att orientera sig på hösthimlen.',
      en: 'Pegasus is best seen in autumn. The four stars marking the horse\'s body — one of which is shared with Andromeda — form the Great Square of Pegasus, a clear rectangular pattern. It\'s an excellent starting point for navigating the autumn sky.',
    },
    funFact: {
      sv: 'År 1995 hittades en av de första kända exoplaneterna — planeter utanför vårt solsystem — i omloppsbana runt stjärnan 51 Pegasi i stjärnbilden. Det var ett historiskt fynd som bekräftade att planeter kretsar runt andra solar.',
      en: "In 1995, one of the first known exoplanets — planets outside our solar system — was found orbiting the star 51 Pegasi in this constellation. It was a historic discovery confirming that planets orbit other suns.",
    },
  },
  {
    id: 'andromeda',
    story: {
      sv: 'Andromeda var prinsessa av Etiopien, dotter till den fåfänga drottningen Cassiopeja. Som straff bands hon vid en klippa som offer åt havsmonstret Cetus. Hjälten Perseus dödade monstret och räddade henne. De gifte sig och deras kärlek finns nu på himlen som grannstjärnbilder.',
      en: 'Andromeda was princess of Ethiopia, daughter of the vain queen Cassiopeia. As punishment, she was chained to a rock as a sacrifice to the sea monster Cetus. The hero Perseus killed the monster and rescued her. They married and their love now lives in the sky as neighbouring constellations.',
    },
    findIt: {
      sv: 'Hitta Pegasuskvadrat på hösten. Stjärnan i det övre vänstra hörnet är faktiskt Andromedas huvud — därifrån sträcker sig en lång kedja av stjärnor ut. Mitt i kedjan, med blotta ögat, kan du se en svag fläck: det är Andromedagalaxen, 2,5 miljoner ljusår bort.',
      en: "Find the Great Square of Pegasus in autumn. The star at the upper left corner is actually Andromeda's head — from there a long chain of stars extends outward. Midway along the chain, with the naked eye, you can spot a faint smudge: that's the Andromeda Galaxy, 2.5 million light-years away.",
    },
    funFact: {
      sv: 'Andromedagalaxen är det mest avlägsna objekt man kan se med blotta ögat — 2,5 miljoner ljusår bort. Ljuset du ser lämnade galaxen när de första Homo sapiens precis hade börjat vandra i Afrika. Om ungefär 4 miljarder år krockar Andromeda med Vintergatan.',
      en: "The Andromeda Galaxy is the most distant object visible to the naked eye — 2.5 million light-years away. The light you see left the galaxy when the first Homo sapiens were just beginning to walk in Africa. In about 4 billion years, Andromeda will collide with the Milky Way.",
    },
  },
  {
    id: 'aquarius',
    story: {
      sv: 'Vattumannen är en figur som häller vatten från en kruka i den babylonska och grekiska astronomin. I den grekiska myten är det Ganymedes — den sköne ynglingen som Zeus förvandlade till örn och bar upp till Olympen för att bli gudarnas mundskänk och hälla nektar. Han placerades bland stjärnorna som belöning.',
      en: "The Water Bearer is a figure pouring water from a jar in Babylonian and Greek astronomy. In Greek myth it's Ganymede — the beautiful youth whom Zeus transformed into an eagle and carried up to Olympus to become the gods' cupbearer and pour nectar. He was placed among the stars as a reward.",
    },
    findIt: {
      sv: 'Vattumannen är en stor men relativt svag stjärnbild, synlig på hösten i söder. Den innehåller ingen riktigt lysande stjärna, men stjärnhopen NGC 7089 (M2) är ett av de finaste klotformiga stjärnhoparna på norra halvklotet och syns i kikare.',
      en: 'Aquarius is a large but relatively faint constellation, visible in autumn in the south. It contains no really bright star, but the star cluster NGC 7089 (M2) is one of the finest globular clusters in the northern hemisphere and is visible in binoculars.',
    },
    funFact: {
      sv: 'Helix-nebulosan — en av de vackraste planetariska nebulosor vi känner till — befinner sig i Vattumannen och kallas ibland "Guds öga". Det är resten av en stjärna som exploderade för ungefär 10 000 år sedan, ungefär 650 ljusår bort.',
      en: 'The Helix Nebula — one of the most beautiful planetary nebulae we know of — lies in Aquarius and is sometimes called "the Eye of God." It\'s the remnant of a star that exploded about 10,000 years ago, roughly 650 light-years away.',
    },
  },
  {
    id: 'lyra',
    story: {
      sv: 'Lyran tillhör Orfeus, den bäste musikern i den grekiska mytologin. Hans musik var så vacker att djur och stenar stannade för att lyssna. När hans älskade Eurydike dog försökte han hämta henne från dödsriket. Hades tillät det — men Orfeus bröt det enda villkoret och vände sig om, och Eurydike försvann för alltid.',
      en: "The Lyre belongs to Orpheus, the greatest musician in Greek mythology. His music was so beautiful that animals and stones stopped to listen. When his beloved Eurydice died, he tried to retrieve her from the underworld. Hades allowed it — but Orpheus broke the one condition and looked back, and Eurydice was lost forever.",
    },
    findIt: {
      sv: 'Lyran innehåller Vega — den femte ljusaste stjärnan på natthimlen och ett av hörnen i Sommartriangelns asterism. Vega är lätt att hitta på sommaren och hösten, nära zenit i Sverige. Lyrans övriga stjärnor bildar ett litet parallellogram nära Vega.',
      en: "Lyra contains Vega — the fifth brightest star in the night sky and one corner of the Summer Triangle asterism. Vega is easy to find in summer and autumn, near the zenith in Sweden. Lyra's other stars form a small parallelogram close to Vega.",
    },
    funFact: {
      sv: 'Vega var Nordstjärnan för ungefär 14 000 år sedan och kommer att vara det igen om ungefär 12 000 år. Det beror på att Jordens axel "svajtar" som en snurra — ett fenomen kallat precession — med en period på ungefär 26 000 år.',
      en: 'Vega was the North Star about 14,000 years ago and will be again in about 12,000 years. This is because Earth\'s axis "wobbles" like a spinning top — a phenomenon called precession — with a period of about 26,000 years.',
    },
  },
];

export const getConstellationStory = (id: ConstellationId): ConstellationStory | undefined =>
  CONSTELLATION_STORIES.find((s) => s.id === id);

import type { DescribeImage } from "@/lib/types";

// Curated set of picture-description exercises, bundled with the app.
// Images are stable Lorem Picsum ids (sourced from Unsplash photographers,
// free to use under the Unsplash License). Sentences and vocab are
// hand-written to match each photo, so "Listen & Learn" needs no LLM call
// and "Practice" has a reliable reference description to grade against.
export const describeImages: DescribeImage[] = [
  {
    id: "freelance-desk",
    title: "Working Outdoors",
    imageUrl: "https://picsum.photos/id/1/900/600",
    credit: "Photo via Unsplash / Lorem Picsum",
    sentences: [
      "A young man sits at a rustic wooden picnic table, typing on his laptop.",
      "He is completely absorbed in his work, barely glancing away from the screen.",
      "Beside the laptop, a smartphone and a small notebook lie within easy reach.",
      "A cup of coffee sits nearby, though it looks like he has forgotten about it.",
      "The blurred greenery in the background suggests he has chosen to work al fresco rather than indoors.",
    ],
    vocab: [
      {
        phrase: "rustic",
        sentenceIndex: 0,
        definition: "having a simple, rough charm typical of the countryside",
        partOfSpeech: "adjective",
        synonyms: ["rural", "countrified", "homespun"],
        examples: [
          "They renovated the old barn into a rustic guesthouse.",
          "The restaurant had a rustic decor with exposed wooden beams.",
        ],
      },
      {
        phrase: "absorbed",
        sentenceIndex: 1,
        definition: "having one's attention fully occupied; deeply engaged in something",
        partOfSpeech: "adjective",
        synonyms: ["engrossed", "immersed", "engaged"],
        examples: [
          "She was so absorbed in the novel that she missed her stop.",
          "He became absorbed in the puzzle and forgot about lunch.",
        ],
      },
      {
        phrase: "blurred",
        sentenceIndex: 4,
        definition: "not clearly defined or focused; indistinct",
        partOfSpeech: "adjective",
        synonyms: ["hazy", "fuzzy", "unclear"],
        examples: [
          "The photo was blurred because the camera moved.",
          "Her memory of that night is blurred.",
        ],
      },
      {
        phrase: "al fresco",
        sentenceIndex: 4,
        definition: "taking place or done outdoors",
        partOfSpeech: "adjective",
        synonyms: ["outdoors", "in the open air"],
        examples: [
          "We had dinner al fresco on the terrace.",
          "The cafe offers al fresco seating in summer.",
        ],
      },
    ],
  },
  {
    id: "cafe-corner",
    title: "A Quiet Café Corner",
    imageUrl: "https://picsum.photos/id/76/900/600",
    credit: "Photo via Unsplash / Lorem Picsum",
    sentences: [
      "Two small espresso cups rest on the polished wooden table of a cozy café.",
      "Sunlight streams in through the large glass windows at the front of the shop.",
      "In the background, a couple of customers chat quietly near the entrance.",
      "A phone lies abandoned on the table, forgotten in the middle of conversation.",
      "The whole scene has a relaxed, unhurried atmosphere.",
    ],
    vocab: [
      {
        phrase: "cozy",
        sentenceIndex: 0,
        definition: "comfortable, warm, and snug",
        partOfSpeech: "adjective",
        synonyms: ["snug", "comfortable", "homely"],
        examples: [
          "The cabin felt cozy with the fireplace lit.",
          "She wrapped herself in a cozy blanket.",
        ],
      },
      {
        phrase: "streams",
        sentenceIndex: 1,
        definition: "flows or pours in a continuous, steady way",
        partOfSpeech: "verb",
        synonyms: ["pours", "flows", "floods"],
        examples: [
          "Light streamed through the open curtains.",
          "Tourists streamed into the museum all morning.",
        ],
      },
      {
        phrase: "abandoned",
        sentenceIndex: 3,
        definition: "left behind or deserted, without the intention of returning for it",
        partOfSpeech: "adjective",
        synonyms: ["deserted", "forsaken", "discarded"],
        examples: [
          "He found an abandoned bicycle by the road.",
          "The old house had been abandoned for years.",
        ],
      },
      {
        phrase: "unhurried",
        sentenceIndex: 4,
        definition: "relaxed and calm, without rushing",
        partOfSpeech: "adjective",
        synonyms: ["leisurely", "relaxed", "calm"],
        examples: [
          "They enjoyed an unhurried breakfast on vacation.",
          "She walked at an unhurried pace through the park.",
        ],
      },
    ],
  },
  {
    id: "santorini-village",
    title: "A Cliffside Village",
    imageUrl: "https://picsum.photos/id/100/900/600",
    credit: "Photo via Unsplash / Lorem Picsum",
    sentences: [
      "A cluster of whitewashed houses tumbles down the side of a steep cliff.",
      "A traditional windmill stands out among the rooftops, its blades now still.",
      "A small blue-domed chapel sits proudly near the top of the hill.",
      "In the distance, the pale sea merges almost seamlessly with the hazy sky.",
      "The entire village seems to glow softly in the late afternoon light.",
    ],
    vocab: [
      {
        phrase: "cluster",
        sentenceIndex: 0,
        definition: "a small group of similar things positioned closely together",
        partOfSpeech: "noun",
        synonyms: ["group", "bunch", "clump"],
        examples: [
          "A cluster of tourists gathered around the guide.",
          "Grapes grow in clusters on the vine.",
        ],
      },
      {
        phrase: "whitewashed",
        sentenceIndex: 0,
        definition: "painted white with a thin, simple coat of paint",
        partOfSpeech: "adjective",
        synonyms: ["white-painted", "limewashed"],
        examples: [
          "The whitewashed walls of the village gleamed in the sun.",
          "Whitewashed cottages lined the narrow street.",
        ],
      },
      {
        phrase: "seamlessly",
        sentenceIndex: 3,
        definition: "smoothly and without any noticeable gaps or interruptions",
        partOfSpeech: "adverb",
        synonyms: ["smoothly", "fluidly", "effortlessly"],
        examples: [
          "The two songs blended seamlessly into one another.",
          "The team worked seamlessly together on the project.",
        ],
      },
      {
        phrase: "hazy",
        sentenceIndex: 3,
        definition: "slightly obscured or blurred, as if covered by a thin mist",
        partOfSpeech: "adjective",
        synonyms: ["misty", "foggy", "blurry"],
        examples: [
          "The mountains looked hazy in the summer heat.",
          "She had only a hazy memory of the accident.",
        ],
      },
    ],
  },
  {
    id: "harbor-bird",
    title: "A Bird on the Dock",
    imageUrl: "https://picsum.photos/id/110/900/600",
    credit: "Photo via Unsplash / Lorem Picsum",
    sentences: [
      "A dark seabird perches on a thick rope stretched between the harbor and a moored boat.",
      "It has spread its wings wide, perhaps to dry them in the morning sun.",
      "The water below is calm and almost silver, rippled only slightly by a gentle breeze.",
      "The old boat's hull curves gracefully at the bow, weathered by years at sea.",
      "The whole scene feels still, as if time had briefly paused.",
    ],
    vocab: [
      {
        phrase: "perches",
        sentenceIndex: 0,
        definition: "sits or rests on the edge or top of something narrow",
        partOfSpeech: "verb",
        synonyms: ["sits", "rests", "roosts"],
        examples: [
          "A sparrow perched on the windowsill.",
          "She perched on the edge of the chair, ready to leave.",
        ],
      },
      {
        phrase: "moored",
        sentenceIndex: 0,
        definition: "(of a boat) tied up or anchored to a fixed point",
        partOfSpeech: "adjective",
        synonyms: ["anchored", "docked", "tied up"],
        examples: [
          "Several yachts were moored in the harbor.",
          "They moored the boat to the pier for the night.",
        ],
      },
      {
        phrase: "rippled",
        sentenceIndex: 2,
        definition: "formed into small waves on the surface of water",
        partOfSpeech: "verb",
        synonyms: ["wavy", "undulating"],
        examples: [
          "The pond rippled as the fish jumped.",
          "A breeze rippled across the wheat field.",
        ],
      },
      {
        phrase: "weathered",
        sentenceIndex: 3,
        definition: "worn or damaged by long exposure to the weather",
        partOfSpeech: "adjective",
        synonyms: ["worn", "battered", "eroded"],
        examples: [
          "The old fence was grey and weathered.",
          "His weathered hands showed years of outdoor work.",
        ],
      },
    ],
  },
  {
    id: "field-of-daisies",
    title: "A Girl in the Field",
    imageUrl: "https://picsum.photos/id/130/900/600",
    credit: "Photo via Unsplash / Lorem Picsum",
    sentences: [
      "A young woman stands in a wide, open field, holding a bunch of wild daisies close to her face.",
      "She wears a pair of dark sunglasses that hide most of her expression.",
      "The late sunlight gives the whole photo a warm, golden glow.",
      "Her hair falls loosely over one shoulder as she glances sideways at the camera.",
      "Behind her, the field stretches out until it meets a distant line of trees.",
    ],
    vocab: [
      {
        phrase: "bunch",
        sentenceIndex: 0,
        definition: "a group of things, especially flowers, held or growing together",
        partOfSpeech: "noun",
        synonyms: ["cluster", "bundle", "bouquet"],
        examples: [
          "She picked a bunch of wildflowers on her walk.",
          "He bought a bunch of bananas at the market.",
        ],
      },
      {
        phrase: "glow",
        sentenceIndex: 2,
        definition: "a soft, steady light or warm radiance",
        partOfSpeech: "noun",
        synonyms: ["radiance", "shine", "warmth"],
        examples: [
          "The candle gave the room a soft glow.",
          "Her cheeks had a healthy glow after the run.",
        ],
      },
      {
        phrase: "loosely",
        sentenceIndex: 3,
        definition: "in a way that is not tight or firmly fixed",
        partOfSpeech: "adverb",
        synonyms: ["freely", "slackly"],
        examples: [
          "Her scarf was tied loosely around her neck.",
          "The rope hung loosely from the post.",
        ],
      },
      {
        phrase: "stretches",
        sentenceIndex: 4,
        definition: "extends continuously over an area or distance",
        partOfSpeech: "verb",
        synonyms: ["extends", "spans", "reaches"],
        examples: [
          "The desert stretches for hundreds of miles.",
          "The coastline stretches from the cliffs to the bay.",
        ],
      },
    ],
  },
  {
    id: "old-barn-bicycle",
    title: "A Bicycle by the Barn",
    imageUrl: "https://picsum.photos/id/168/900/600",
    credit: "Photo via Unsplash / Lorem Picsum",
    sentences: [
      "A rusty green bicycle leans against the weathered wooden wall of an old barn.",
      "The barn's paint is peeling badly, revealing bare, sun-bleached wood underneath.",
      "One door is painted a faded blue, its hinges clearly worn from years of use.",
      "Tall grass grows freely around the base of the building, untouched for a long while.",
      "The whole structure has an abandoned, forgotten charm to it.",
    ],
    vocab: [
      {
        phrase: "rusty",
        sentenceIndex: 0,
        definition: "covered with a reddish-brown coating caused by corrosion of metal",
        partOfSpeech: "adjective",
        synonyms: ["corroded", "rust-covered"],
        examples: [
          "The old gate was rusty and creaked loudly.",
          "They found a rusty key buried in the garden.",
        ],
      },
      {
        phrase: "peeling",
        sentenceIndex: 1,
        definition: "coming away from a surface in thin strips or pieces",
        partOfSpeech: "verb",
        synonyms: ["flaking", "chipping"],
        examples: [
          "The paint on the fence was peeling badly.",
          "Her sunburned skin started peeling after a few days.",
        ],
      },
      {
        phrase: "faded",
        sentenceIndex: 2,
        definition: "having lost brightness or strength of color, typically from age",
        partOfSpeech: "adjective",
        synonyms: ["dull", "washed-out", "pale"],
        examples: [
          "The curtains were faded from years of sunlight.",
          "He wore a faded pair of jeans.",
        ],
      },
      {
        phrase: "worn",
        sentenceIndex: 2,
        definition: "damaged or shabby as a result of long or hard use",
        partOfSpeech: "adjective",
        synonyms: ["worn-out", "shabby", "frayed"],
        examples: [
          "The stairs were worn smooth by decades of footsteps.",
          "She replaced her worn shoes with a new pair.",
        ],
      },
    ],
  },
  {
    id: "busy-beach",
    title: "A Crowded Beach",
    imageUrl: "https://picsum.photos/id/180/900/600",
    credit: "Photo via Unsplash / Lorem Picsum",
    sentences: [
      "Dozens of people gather along a wide, sandy beach beneath a hazy sky.",
      "Waves roll steadily onto the shore, drawing swimmers further into the water.",
      "In the distance, a row of buildings and hills lines the coast.",
      "A thin mist hangs over the scene, softening the outlines of the crowd.",
      "Despite the haze, the beach feels lively, full of quiet, scattered activity.",
    ],
    vocab: [
      {
        phrase: "dozens",
        sentenceIndex: 0,
        definition: "a large but unspecified number, roughly in multiples of twelve",
        partOfSpeech: "noun",
        synonyms: ["many", "numerous groups"],
        examples: [
          "Dozens of birds flew overhead at sunset.",
          "She received dozens of messages after the announcement.",
        ],
      },
      {
        phrase: "shore",
        sentenceIndex: 1,
        definition: "the land along the edge of a sea, lake, or large body of water",
        partOfSpeech: "noun",
        synonyms: ["coast", "coastline", "seaside"],
        examples: [
          "The waves crashed gently against the shore.",
          "They walked hand in hand along the shore.",
        ],
      },
      {
        phrase: "mist",
        sentenceIndex: 3,
        definition: "a thin cloud of tiny water droplets suspended in the air",
        partOfSpeech: "noun",
        synonyms: ["fog", "haze", "vapor"],
        examples: [
          "Morning mist covered the valley.",
          "The mountains disappeared into the mist.",
        ],
      },
      {
        phrase: "scattered",
        sentenceIndex: 4,
        definition: "spread out or distributed unevenly over an area",
        partOfSpeech: "adjective",
        synonyms: ["dispersed", "spread out", "sporadic"],
        examples: [
          "Scattered clouds dotted the sky.",
          "Toys were scattered across the living room floor.",
        ],
      },
    ],
  },
  {
    id: "milky-way-fence",
    title: "Stars Over a Fence",
    imageUrl: "https://picsum.photos/id/149/900/600",
    credit: "Photo via Unsplash / Lorem Picsum",
    sentences: [
      "A wooden fence stretches into the darkness beneath a sky thick with stars.",
      "A faint band of light, the Milky Way, glows softly across the horizon.",
      "No artificial light interrupts the scene, making the stars appear unusually vivid.",
      "The fence posts stand in a slightly uneven row, worn by years of wind and rain.",
      "The whole photo has a quiet, almost otherworldly stillness to it.",
    ],
    vocab: [
      {
        phrase: "faint",
        sentenceIndex: 1,
        definition: "barely perceptible; not clear or strong",
        partOfSpeech: "adjective",
        synonyms: ["dim", "weak", "subtle"],
        examples: [
          "A faint smell of smoke lingered in the air.",
          "She heard a faint knock at the door.",
        ],
      },
      {
        phrase: "vivid",
        sentenceIndex: 2,
        definition: "producing powerful, clear images in the mind; strikingly bright",
        partOfSpeech: "adjective",
        synonyms: ["bright", "intense", "striking"],
        examples: [
          "He had a vivid memory of his childhood home.",
          "The sunset painted the sky in vivid colors.",
        ],
      },
      {
        phrase: "uneven",
        sentenceIndex: 3,
        definition: "not level, smooth, or regular",
        partOfSpeech: "adjective",
        synonyms: ["irregular", "rough", "lopsided"],
        examples: [
          "The uneven ground made hiking difficult.",
          "Her handwriting was uneven and hard to read.",
        ],
      },
      {
        phrase: "otherworldly",
        sentenceIndex: 4,
        definition: "seeming to belong to another, unearthly or magical world",
        partOfSpeech: "adjective",
        synonyms: ["ethereal", "surreal", "unearthly"],
        examples: [
          "The glowing cave had an otherworldly beauty.",
          "The music created an otherworldly atmosphere.",
        ],
      },
    ],
  },
];

export function getDescribeImage(id: string): DescribeImage | undefined {
  return describeImages.find((img) => img.id === id);
}

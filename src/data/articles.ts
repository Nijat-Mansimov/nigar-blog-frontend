export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  date: string;
  category: string;
  featured?: boolean;
  readingTime: number;
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "the-silence-between-words",
    title: "The Silence Between Words",
    subtitle: "On language, loss, and the things we leave unsaid",
    excerpt:
      "Every sentence is a small act of courage. To name a feeling is to accept it. To write it down is to set it free — or perhaps to cage it forever in ink.",
    body: `Every sentence is a small act of courage. To name a feeling is to accept it. To write it down is to set it free — or perhaps to cage it forever in ink.

I have been thinking lately about the spaces between words. The pause before an admission. The breath before a goodbye. Language, for all its precision, is most honest in its silences. We communicate in gaps — in the ellipses that trail off into the unutterable, in the white space between stanzas where the real poem lives.

My grandmother never said she loved us. She said: "Eat before it gets cold." She said: "Call me when you arrive." Love was a verb she conjugated through action — she pressed it into dough, stitched it into hems, translated it into the language of care. And yet somehow, we always knew.

There is a term in Japanese: *ma* (間) — the pregnant pause, the meaningful void. It is the interval between notes that makes music. The shadow that defines light. Western thought tends to fear silence, fills it with noise, mistakes absence for emptiness. But silence is never empty. It is where meaning pools when language runs out.

Writing, I have come to believe, is the art of creating that *ma* on the page. It is knowing when to stop. It is trusting the reader to stand in the space you have left them, to bring their own weight to it, their own grief or joy or longing.

The most powerful thing I ever wrote was not a sentence. It was a paragraph I deleted. The reader never saw it, but I did — and somehow, having written it and then erased it, I had said everything.`,
    date: "February 20, 2026",
    category: "Essay",
    featured: true,
    readingTime: 6,
  },
  {
    id: "2",
    slug: "on-becoming-a-morning-person",
    title: "On Becoming a Morning Person",
    subtitle: "A reluctant conversion story",
    excerpt:
      "The morning is not an hour. It is a disposition — a willingness to meet the world before the world has had a chance to disappoint you.",
    body: `The morning is not an hour. It is a disposition — a willingness to meet the world before the world has had a chance to disappoint you.

I used to believe that morning people were a different species. Disciplined. Self-righteous. The kind who post photographs of golden-hour coffee cups with captions about gratitude. I was not that person. I was the person who set five alarms, silenced them all in a dopamine-deprived stupor, and emerged at noon like a creature surprised by the concept of daylight.

Then something changed.

It was grief that did it, as it so often is. When my father died in the winter of 2023, I found that I could not sleep past four. My body would simply refuse — jolting me awake into the dark as if checking that the world was still there. And so I began to meet those early hours. Not with productivity. Not with yoga or journaling or any of the rituals the wellness industry prescribes. I met them with silence.

There is a quality of morning light that exists nowhere else — a provisional brightness, uncertain of itself, still negotiating with the horizon. The city is a different creature at dawn. Gentler. More honest. The performances of the day have not yet begun.

I am still not a morning person in the accepted sense. I do not spring joyfully from bed. But I have learned to sit with those quiet hours before the world demands anything of me, and I have found that they are mine in a way that no other hour is.

Some gifts come dressed as unwanted visitors. You only recognize them after they have left.`,
    date: "February 12, 2026",
    category: "Personal",
    readingTime: 5,
  },
  {
    id: "3",
    slug: "the-aesthetics-of-restraint",
    title: "The Aesthetics of Restraint",
    subtitle: "Why less is not merely more — it is everything",
    excerpt:
      "Minimalism is not poverty of imagination. It is the courage to leave space for the reader's mind to move.",
    body: `Minimalism is not poverty of imagination. It is the courage to leave space for the reader's mind to move.

I have a recurring argument with a friend — a novelist, lavish in his prose, baroque in his architecture of metaphor — about the ethics of style. He believes that maximalism is generosity: that to give the reader everything, every sensation and shade, is the writer's highest act of service. I disagree.

Consider Hemingway's iceberg theory, which most people cite and fewer truly practice: the dignity of movement in an iceberg is due to only one-eighth of it being above water. What lies beneath is not absence. It is mass. It is weight. It is the unspoken life of the work pressing upward through the surface.

The Shakers built furniture designed to be hung on pegs when not in use — their reasoning was theological: the pegs created space for angels to walk through. I think about this often. What must we remove to let something sacred pass through?

In Japanese aesthetics, *wabi-sabi* honors the imperfect, the incomplete, the transient. A tea bowl with an uneven glaze. A poem that stops before its conclusion. These are not failures. They are invitations. The crack in the bowl is where the tea's heat escapes to meet your hand. The unfinished poem is where you begin to write.

Restraint, I have come to believe, is not withholding. It is precision. It is the surgeon's economy of motion. Every word that stays must earn its place; every word that goes must be mourned. The goal is not emptiness but exactness — the charged silence of a room where something important is about to be said.`,
    date: "January 28, 2026",
    category: "Culture",
    readingTime: 7,
  },
  {
    id: "4",
    slug: "letters-i-never-sent",
    title: "Letters I Never Sent",
    subtitle: "On the private literature of unfinished correspondence",
    excerpt:
      "The unsent letter is the purest form of writing. There is no audience to perform for, no approval to seek. Only the brutal democracy of truth.",
    body: `The unsent letter is the purest form of writing. There is no audience to perform for, no approval to seek. Only the brutal democracy of truth.

I keep a folder. Every writer I know keeps a folder — digital or physical, acknowledged or not — full of things that were never meant to be sent. Letters to the living and the dead. Drafts of apologies too heavy to deliver. Declarations of feeling that would change everything, and so change nothing.

The unsent letter has a long, distinguished literary history. Beethoven wrote to his "Immortal Beloved" and never sent it; we found it in a drawer after his death. Kafka wrote to his father a letter of fifty pages, a masterwork of grievance and longing; his father never read it. Fitzgerald wrote to Zelda from the asylum, letters she burned. In each case, the not-sending was the point. The writing was enough. The writing was, perhaps, everything.

There is something that happens in the writing of a letter with no intention of sending. The usual editorial self — the one that softens, hedges, performs — goes quiet. What remains is the raw animal of feeling, pacing its enclosure. You find out what you actually think. You find out what you actually want.

I wrote one to my younger self last year. Sat down with a glass of water at the kitchen table and wrote until I ran out of ink. I told her things she would not have believed. I told her the names of the people who would matter and the ones who would not. I told her: the suffering that feels eternal is seasonal. I told her: the loneliness is not a flaw in you but a space being held for something.

I still haven't sent it. Of course. That's not the point.`,
    date: "January 14, 2026",
    category: "Essay",
    readingTime: 6,
  },
  {
    id: "5",
    slug: "a-city-in-winter",
    title: "A City in Winter",
    subtitle: "Baku, fog, and the memory of cold",
    excerpt:
      "There is a particular kind of beauty that only reveals itself in withdrawal — the bare tree, the empty square, the city stripped to its structural honesty.",
    body: `There is a particular kind of beauty that only reveals itself in withdrawal — the bare tree, the empty square, the city stripped to its structural honesty.

Baku in January is a city becoming. The Caspian exhales its cold breath over the old city walls, and the streets narrow to the essential: a single street lamp, its cone of amber light on wet cobblestones. A woman in a dark coat moving through the frame of a doorway. The sound of your own footsteps on a street that empties at dusk.

I grew up believing that beauty required warmth. The high summer light over the bay, the wedding-cake buildings turning gold, the promenade in its seasonal glamour. It took adulthood — and a decade away — to recognize what winter gave the city: its skeleton.

In summer, Baku performs. In winter, it simply is. And what it is, stripped of visitors and soft light and the social obligations of warmth, is strange and beautiful and very old. The fire temple at the edge of the city burns silently through the fog. The mud volcanoes on the Absheron peninsula release their slow exhalations into the grey sky. Everything smells of salt and petroleum and something else — the particular scent of a place that has been inhabited continuously for millennia.

I think of those winters now from wherever I am. The specific weight of a city that holds its history in its architecture, in its stones, in the way a door is carved. I am made of that cold, that fog. No matter how far I travel, some part of me is standing at the edge of the Caspian in January, listening to the water.`,
    date: "December 31, 2025",
    category: "Travel",
    readingTime: 5,
  },
  {
    id: "6",
    slug: "what-reading-teaches",
    title: "What Reading Teaches",
    subtitle: "Notes on the private education of a bookish childhood",
    excerpt:
      "No one who reads deeply is ever entirely alone. The solitude of books is a populated solitude — crowded with other minds, other centuries, other selves.",
    body: `No one who reads deeply is ever entirely alone. The solitude of books is a populated solitude — crowded with other minds, other centuries, other selves.

I learned to read at four and never really stopped. By eight I had developed the particular social camouflage of the bookish child: the ability to seem present at family gatherings while being, in fact, three hundred years away in a different country. My mother called this "disappearing." I called it surviving.

Books taught me things that the curriculum did not include. They taught me that other people's inner lives were as complex and contradictory and surprising as my own — this seemed obvious, and yet in practice it is one of the hardest things to hold onto. They taught me that the feelings I thought were uniquely, shamefully mine had names, and those names had been written by someone, somewhere, who had felt them first and put them down for me to find.

Anna Karenina taught me about the terrible precision of social expectation. Middlemarch taught me about the undramatic heroism of daily decency. The Stranger taught me about absurdity; One Hundred Years of Solitude taught me about the way time moves in families; Giovanni's Room taught me something I was not ready to understand and came back to when I was.

What reading ultimately teaches, I think, is the practice of inhabiting an other. It is an ethical exercise as much as an intellectual one. The reader who has truly entered a novel — who has felt what the character feels, who has seen through eyes not their own — is briefly changed. The question is whether they carry that change back out into the world.

Some do. Some don't. But the capacity is there, inscribed in the pages. It is the most radical technology we have invented: the mechanism by which a dead person's consciousness enters a living one. Every book is a small resurrection.`,
    date: "December 10, 2025",
    category: "Books",
    readingTime: 7,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getFeaturedArticle(): Article {
  return articles.find((a) => a.featured) || articles[0];
}

export function getSecondaryArticles(): Article[] {
  const featured = getFeaturedArticle();
  return articles.filter((a) => a.id !== featured.id);
}

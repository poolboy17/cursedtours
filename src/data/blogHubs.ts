/**
 * Blog Hub Data
 * Central configuration for topic-based blog hub pages.
 * These are content-first hubs that link INTO destination hubs for tour conversion.
 *
 * Three-layer architecture:
 *   City Hubs (geography, tour-focused) → existing, no changes
 *   Destination Hubs (landmark tour pages) → existing, no changes
 *   Blog Hubs (topic, content-first) → THIS FILE
 */

import { getArticlesByCategory } from './articles';

export interface BlogHubData {
  /** URL slug — used in /blog/{slug}/ */
  slug: string;
  /** Display name */
  name: string;
  /** Short tagline for the hero */
  tagline: string;
  /** SEO meta description */
  metaDescription: string;
  /** Intro paragraph(s) for the hub page */
  intro: string;
  /** Category slug in articles.ts that maps articles to this hub */
  categorySlug: string;
  /** Destination hubs this blog hub links to for tour conversion */
  relatedDestinations: Array<{
    name: string;
    slug: string;
  }>;
  /** Related city hubs */
  relatedCityHubs: Array<{
    name: string;
    slug: string;
  }>;
  /** Other blog hubs for cross-linking */
  relatedBlogHubs: Array<{
    name: string;
    slug: string;
  }>;
  /** FAQ items for schema markup and on-page content */
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export const BLOG_HUBS: Record<string, BlogHubData> = {
  'salem-witch-trials': {
    slug: 'salem-witch-trials',
    name: 'Salem Witch Trials History',
    tagline: 'The causes, people, and lasting legacy of 1692',
    metaDescription: 'Explore the full history of the Salem witch trials—who was accused, how the courts worked, why it ended, and what it teaches us about moral panic today.',
    intro: 'In the summer of 1692, a small Puritan village turned on itself. Over nine months, more than 200 people were accused of witchcraft. Twenty were executed. The Salem witch trials remain one of the most studied episodes in American history—not because of what happened, but because of what it reveals about fear, power, and the fragility of justice.',
    categorySlug: 'salem-witch-trials-history',
    relatedDestinations: [
      { name: "Salem's Haunted History", slug: 'salem' },
    ],
    relatedCityHubs: [
      { name: 'Salem Ghost Tours', slug: 'salem' },
      { name: 'Boston Ghost Tours', slug: 'boston' },
    ],
    relatedBlogHubs: [
      { name: 'American Prison History', slug: 'prison-history' },
    ],
    faq: [
      {
        question: 'How many people died in the Salem witch trials?',
        answer: 'Twenty people were executed: nineteen by hanging and one (Giles Corey) pressed to death with stones. At least five more died in jail awaiting trial.',
      },
      {
        question: 'What caused the Salem witch trials?',
        answer: 'Historians point to a combination of Puritan religious extremism, social tensions between Salem Village and Salem Town, property disputes, frontier war anxieties, and possible ergot poisoning—though no single cause explains it all.',
      },
      {
        question: 'Were the Salem witches actually burned?',
        answer: 'No. This is one of the most persistent myths. All nineteen who were executed were hanged. Witch burning was a European practice, not an American colonial one.',
      },
    ],
  },

  'vampire-culture': {
    slug: 'vampire-culture',
    name: 'Vampire Culture',
    tagline: 'From Vlad to Twilight—how the vampire legend refuses to die',
    metaDescription: 'Explore vampire folklore, Bram Stoker\'s Dracula, real-life vampire legends, and how pop culture keeps reinventing the undead from Nosferatu to modern film.',
    intro: 'The vampire is the most durable monster in Western culture. From medieval Slavic folklore to Bram Stoker\'s novel to a billion-dollar film industry, the legend has been reinvented for every generation. The connections between Stoker\'s Dracula and the historical Vlad III are more metaphorical than literal—a name, a region, a reputation for cruelty—but the mythology they spawned is very real.',
    categorySlug: 'vampire-culture',
    relatedDestinations: [
      { name: "Dracula's Castle", slug: 'draculas-castle' },
    ],
    relatedCityHubs: [
      { name: 'Dublin Ghost Tours', slug: 'dublin' },
      { name: 'London Ghost Tours', slug: 'london' },
    ],
    relatedBlogHubs: [
      { name: 'Tower of London History', slug: 'tower-of-london' },
    ],
    faq: [
      {
        question: 'Was Dracula based on Vlad the Impaler?',
        answer: 'Bram Stoker borrowed the name and Transylvanian setting, but the connections are more metaphorical than literal. Stoker\'s Dracula is a Victorian gothic creation; Vlad III was a 15th-century Wallachian prince. They share a name and a reputation for cruelty, but Stoker\'s novel draws more from Irish folklore and the author\'s own nightmares than from Romanian history.',
      },
      {
        question: 'Where did vampire legends originate?',
        answer: 'Vampire folklore appears across nearly every culture, but the modern Western vampire traces primarily to Slavic and Eastern European traditions from the 17th-18th centuries, when reports of "undead" corpses triggered village panics and official government investigations.',
      },
      {
        question: 'Can you visit Dracula\'s Castle in Romania?',
        answer: 'Bran Castle in Transylvania is marketed as "Dracula\'s Castle," though Vlad III\'s actual connection to it is minimal. It\'s a popular tourist destination and does have genuinely eerie medieval atmosphere, regardless of the Dracula branding.',
      },
    ],
  },

  'tower-of-london': {
    slug: 'tower-of-london',
    name: 'Tower of London History',
    tagline: 'Nearly 1,000 years of royal terror',
    metaDescription: 'Explore the Tower of London\'s dark history—executions, famous prisoners, the Crown Jewels, ghost sightings, and why this fortress still haunts the British imagination.',
    intro: 'The Tower of London has served as a royal palace, a prison, an execution ground, a zoo, and a vault for the Crown Jewels. In nearly 1,000 years, it has witnessed some of the most dramatic moments in British history. The ghosts said to walk its grounds—Anne Boleyn, the Princes in the Tower, Sir Walter Raleigh—are less interesting than the documented history that put them there.',
    categorySlug: 'tower-of-london-history',
    relatedDestinations: [
      { name: 'Tower of London', slug: 'tower-of-london' },
    ],
    relatedCityHubs: [
      { name: 'London Ghost Tours', slug: 'london' },
    ],
    relatedBlogHubs: [
      { name: 'Vampire Culture', slug: 'vampire-culture' },
      { name: 'American Prison History', slug: 'prison-history' },
    ],
    faq: [
      {
        question: 'Who was executed at the Tower of London?',
        answer: 'Only seven people were executed within the Tower walls (on Tower Green), including Anne Boleyn, Catherine Howard, and Lady Jane Grey. Many more were executed publicly on nearby Tower Hill.',
      },
      {
        question: 'What happened to the Princes in the Tower?',
        answer: 'Edward V and his brother Richard disappeared from the Tower in 1483 after their uncle took the throne as Richard III. Their fate remains one of history\'s greatest unsolved mysteries, though most historians believe they were murdered.',
      },
    ],
  },

  'prison-history': {
    slug: 'prison-history',
    name: 'American Prison History',
    tagline: 'From Eastern State to Alcatraz—solitary, escapes, and the haunted remains',
    metaDescription: 'Explore America\'s most notorious prisons—Eastern State Penitentiary, Alcatraz, and beyond. The history of solitary confinement, famous inmates, daring escapes, and paranormal claims.',
    intro: 'America\'s abandoned prisons are monuments to failed ideas about punishment. Eastern State Penitentiary invented solitary confinement and drove inmates mad. Alcatraz was supposed to be escape-proof. Port Arthur in Tasmania pioneered psychological punishment a century before the term existed. These places didn\'t just hold criminals—they created the modern concept of incarceration, for better and worse.',
    categorySlug: 'american-prison-history',
    relatedDestinations: [
      { name: 'Eastern State Penitentiary', slug: 'eastern-state-penitentiary' },
      { name: 'Alcatraz Island', slug: 'alcatraz-island' },
      { name: 'Port Arthur', slug: 'port-arthur-historic-site' },
    ],
    relatedCityHubs: [],
    relatedBlogHubs: [
      { name: 'Gettysburg & the Civil War', slug: 'gettysburg' },
      { name: 'Tower of London History', slug: 'tower-of-london' },
    ],
    faq: [
      {
        question: 'Why is Eastern State Penitentiary considered haunted?',
        answer: 'The prison pioneered solitary confinement in 1829, keeping inmates in complete isolation for years. Many went insane. The combination of documented psychological suffering and the prison\'s dramatic Gothic architecture has made it one of the most investigated "haunted" sites in America.',
      },
      {
        question: 'Did anyone escape from Alcatraz?',
        answer: 'In June 1962, Frank Morris and brothers John and Clarence Anglin escaped through ventilation ducts using sharpened spoons and homemade rafts. They were never found. The FBI officially considers them drowned, but the case remains open.',
      },
    ],
  },

  'gettysburg': {
    slug: 'gettysburg',
    name: 'Gettysburg & the Civil War',
    tagline: 'The bloodiest battle and why it still haunts',
    metaDescription: 'Explore the Battle of Gettysburg—tactics, casualties, aftermath, and the ghost stories that persist at America\'s bloodiest Civil War battlefield.',
    intro: 'In three days of July 1863, roughly 165,000 soldiers fought across the fields and ridges around a small Pennsylvania town. When it was over, more than 50,000 were dead, wounded, or missing. Gettysburg became the turning point of the Civil War and, eventually, the most ghost-storied battlefield in America. The history is more compelling than the hauntings.',
    categorySlug: 'gettysburg-civil-war',
    relatedDestinations: [
      { name: 'Gettysburg Battlefield', slug: 'gettysburg' },
    ],
    relatedCityHubs: [
      { name: 'Savannah Ghost Tours', slug: 'savannah' },
      { name: 'Charleston Ghost Tours', slug: 'charleston' },
      { name: 'Nashville Ghost Tours', slug: 'nashville' },
    ],
    relatedBlogHubs: [
      { name: 'American Prison History', slug: 'prison-history' },
    ],
    faq: [
      {
        question: 'How many people died at Gettysburg?',
        answer: 'Estimates vary, but approximately 7,000-8,000 soldiers were killed outright, with total casualties (killed, wounded, captured, missing) exceeding 50,000 across both armies over three days of fighting.',
      },
      {
        question: 'Why is Gettysburg considered the turning point of the Civil War?',
        answer: 'The Confederate defeat at Gettysburg, combined with the fall of Vicksburg the next day, ended Lee\'s second invasion of the North and shifted the strategic initiative permanently to the Union. The Confederacy never mounted another major offensive.',
      },
    ],
  },

  'pop-culture': {
    slug: 'pop-culture',
    name: 'Pop Culture & Dark History',
    tagline: 'The real stories behind horror movies, urban legends, and true crime',
    metaDescription: 'Explore the true stories behind haunted movies, real-life horror inspirations, urban legends, and the dark history that pop culture can\'t stop retelling.',
    intro: 'Every great horror film, true crime podcast, and urban legend starts with something real. The Conjuring franchise draws from documented case files. The Texas Chain Saw Massacre was inspired by a Wisconsin grave robber. Dracula borrowed a real prince\'s name. This is where pop culture meets primary sources—the documented history behind the stories that keep us up at night.',
    categorySlug: 'pop-culture-dark-history',
    relatedDestinations: [],
    relatedCityHubs: [
      { name: 'New Orleans Ghost Tours', slug: 'new-orleans' },
      { name: 'Salem Ghost Tours', slug: 'salem' },
      { name: 'London Ghost Tours', slug: 'london' },
    ],
    relatedBlogHubs: [
      { name: 'Vampire Culture', slug: 'vampire-culture' },
      { name: 'American Prison History', slug: 'prison-history' },
    ],
    faq: [
      {
        question: 'What horror movies are based on true stories?',
        answer: 'Many iconic horror films draw from real events. The Exorcist was inspired by a 1949 exorcism case in Maryland. The Conjuring series is based on cases investigated by Ed and Lorraine Warren. The Texas Chain Saw Massacre drew inspiration from Wisconsin killer Ed Gein, who also inspired Psycho and Silence of the Lambs.',
      },
      {
        question: 'Are haunted house movies based on real places?',
        answer: 'Several are. The Amityville Horror is based on the DeFeo murders and the Lutz family\'s claims about 112 Ocean Avenue. The Conjuring\'s farmhouse in Harrisville, Rhode Island is a real property. The Enfield Poltergeist case inspired multiple films including The Conjuring 2.',
      },
      {
        question: 'What is the connection between true crime and ghost tours?',
        answer: 'Ghost tours often cover the same locations and events that true crime examines—murder sites, former prisons, places where violent deaths occurred. The difference is framing: true crime focuses on forensics and motive, while ghost tours layer in folklore and community memory that grew up around the same events.',
      },
    ],
  },
};

/** Get all blog hub slugs for static path generation */
export function getAllBlogHubSlugs(): string[] {
  return Object.keys(BLOG_HUBS);
}

/** Get a single blog hub by its URL slug */
export function getBlogHub(slug: string): BlogHubData | undefined {
  return BLOG_HUBS[slug];
}

/** Get all blog hubs as an array */
export function getAllBlogHubs(): BlogHubData[] {
  return Object.values(BLOG_HUBS);
}

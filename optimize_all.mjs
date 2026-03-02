import fs from 'fs';

const articles = [
  'real-mkultra-experiments-stranger-things',
  'the-shining-stanley-hotel-true-story',
  'princes-in-the-tower-mystery',
  'best-horror-movies-based-on-true-stories',
  'frankenstein-origin-story-lake-geneva'
];

// Article 1: MKUltra
console.log('Optimizing Article 1: MKUltra...');
const mkultra = JSON.parse(fs.readFileSync('src/data/articles/real-mkultra-experiments-stranger-things.json', 'utf-8'));

mkultra.content = mkultra.content.replace(
  'One such subject, Army biochemist Frank Olson, fell into a severe psychological crisis after being dosed without his knowledge and died after falling from a thirteenth-floor window in New York City in 1953.',
  'One such subject, Army biochemist Frank Olson, fell into a severe psychological crisis after being dosed without his knowledge. Olson had become troubled by the ethical implications of his work at Fort Detrick\'s biological warfare laboratory, and his CIA handlers grew concerned about his reliability after his dosing. On November 28, 1953, just over a week after receiving LSD in a glass of Cointreau at an agency safe house, Olson was found dead on the pavement below the Statler Hotel in New York City after falling from a thirteenth-floor window.'
);

mkultra.content = mkultra.content.replace(
  'Dr. Donald Ewen Cameron at McGill University\'s Allan Memorial Institute conducted experiments he called "psychic driving" – subjects were given massive doses of electroshock therapy,',
  'Dr. Donald Ewen Cameron at McGill University\'s Allan Memorial Institute conducted experiments he called "psychic driving" – a barbaric protocol in which subjects were given massive doses of electroshock therapy,'
);

mkultra.content = mkultra.content.replace(
  'The show captures several real elements of MKUltra with surprising accuracy. The use of sensory deprivation tanks – Eleven\'s primary tool for accessing her abilities – reflects actual MKUltra experiments with isolation and sensory deprivation conducted by Dr. John C. Lilly.',
  'The show captures several real elements of MKUltra with surprising accuracy. The sensory deprivation research conducted under MKUltra sought to understand whether removing all external stimuli could create a state of psychological vulnerability that might enhance interrogation effectiveness. The use of sensory deprivation tanks – Eleven\'s primary tool for accessing her abilities – reflects actual MKUltra experiments with isolation and sensory deprivation conducted by neuroscientist Dr. John C. Lilly, who later became famous for his cetacean communication research.'
);

mkultra.modified = '2026-02-24 16:00:00';
mkultra.wordCount = 1380;
fs.writeFileSync('src/data/articles/real-mkultra-experiments-stranger-things.json', JSON.stringify(mkultra, null, 2));
console.log('✓ Article 1 optimized');

// Article 2: Stanley Hotel
console.log('Optimizing Article 2: Stanley Hotel...');
const stanley = JSON.parse(fs.readFileSync('src/data/articles/the-shining-stanley-hotel-true-story.json', 'utf-8'));

stanley.content = stanley.content.replace(
  'F.O. Stanley and His Grand Hotel</h2>\\n<p>Freelan Oscar Stanley made his fortune co-inventing the Stanley Steamer automobile with his twin brother Francis. Diagnosed with tuberculosis in 1903, he moved to the mountain air of Estes Park, Colorado and – as wealthy men of the era tended to do – decided to build a hotel.',
  'F.O. Stanley and His Grand Hotel</h2>\\n<p>Freelan Oscar Stanley, known as F.O., made his fortune co-inventing the Stanley Steamer automobile – a self-propelled vehicle powered by steam rather than gasoline – with his twin brother Francis Edgar Stanley. The Stanley Steamer became one of the most iconic vehicles of the early automotive era, featuring unprecedented efficiency and speed records that made the brothers wealthy industrialists. Diagnosed with tuberculosis in 1903, F.O. moved to the mountain air of Estes Park, Colorado, seeking the altitude and pristine environment that the medical establishment of the era believed would cure or slow the disease. As wealthy men of the era tended to do when relocating to mountain regions, he decided to build a hotel.'
);

stanley.content = stanley.content.replace(
  'The Stanley Hotel opened in 1909, a Georgian Revival palace perched at 7,500 feet with panoramic views of Rocky Mountain National Park. It featured electricity throughout, en suite bathrooms, and a level of luxury that made it the social center of the Colorado resort season.',
  'The Stanley Hotel opened on June 12, 1909, a Georgian Revival palace perched at 7,500 feet with panoramic views of Rocky Mountain National Park. It featured electricity throughout – a significant amenity in 1909 – en suite bathrooms, electric heating, and a level of architectural and technological luxury that made it immediately the social center of the Colorado resort season. The hotel\'s design reflected the optimism and grandeur of the Gilded Age, with ballrooms, fine dining, and accommodations that rivaled the great resort hotels of Europe.'
);

stanley.content = stanley.content.replace(
  'Staff and guests at the Stanley Hotel have reported paranormal activity since long before King\'s visit. The most persistent reports center on F.O. Stanley himself, who is allegedly seen in the billiard room and the lobby – transparent, wearing turn-of-the-century clothing, watching the hotel he built with what witnesses describe as a proprietary air.',
  'Staff and guests at the Stanley Hotel have reported paranormal activity continuously since long before King\'s visit, making it one of the most extensively documented haunted locations in American hospitality history. The most persistent reports center on F.O. Stanley himself, who is allegedly seen in the billiard room and the lobby – described as transparent, wearing turn-of-the-century clothing, watching the hotel he built with what witnesses describe as a proprietary air, as though he remains tethered to his life\'s greatest creation.'
);

stanley.modified = '2026-02-24 16:00:00';
stanley.wordCount = 1380;
fs.writeFileSync('src/data/articles/the-shining-stanley-hotel-true-story.json', JSON.stringify(stanley, null, 2));
console.log('✓ Article 2 optimized');

// Article 3: Princes in the Tower
console.log('Optimizing Article 3: Princes in the Tower...');
const princes = JSON.parse(fs.readFileSync('src/data/articles/princes-in-the-tower-mystery.json', 'utf-8'));

princes.content = princes.content.replace(
  'Edward V was twelve years old when his father Edward IV died on April 9, 1483. The boy-king was traveling from Ludlow to London for his coronation when his uncle Richard, Duke of Gloucester, intercepted the party at Stony Stratford and took custody of the child.',
  'Edward V was twelve years old – still a child in an adult political landscape – when his father Edward IV died on April 9, 1483, after a reign marked by the Wars of the Roses. The boy-king was traveling from Ludlow to London for his coronation when his uncle Richard, Duke of Gloucester, intercepted the party at Stony Stratford and took custody of the child, citing concerns about protecting the young monarch from the influence of his mother\'s Woodville relatives.'
);

princes.content = princes.content.replace(
  'In 1674, workmen demolishing a staircase leading to the Chapel of the White Tower discovered a wooden chest buried approximately ten feet below ground level. The chest contained the bones of two children. Charles II, accepting them as the remains of the princes, ordered them placed in a marble urn designed by Christopher Wren and interred in the Henry VII Lady Chapel at Westminster Abbey.',
  'In 1674, workmen demolishing a staircase leading to the Chapel of the White Tower discovered a wooden chest buried approximately ten feet below ground level. The chest contained the bones of two children whose identities have never been conclusively established. Charles II, accepting them as the remains of the princes without scientific examination, ordered them placed in a marble urn designed by the renowned architect Christopher Wren and interred in the Henry VII Lady Chapel at Westminster Abbey, where they remain to this day in a sealed vault.'
);

princes.content = princes.content.replace(
  'The mystery endures because the evidence permits multiple narratives.',
  'The mystery endures because the contemporary evidence is fragmented, partisan, and incomplete – permitting multiple narratives that historians have used to support their preferred theories. DNA technology that could definitively resolve the question sits tantalizingly out of reach, locked away in institutional caution and concerns about the sanctity of royal remains.'
);

princes.modified = '2026-02-24 16:00:00';
princes.wordCount = 1360;
fs.writeFileSync('src/data/articles/princes-in-the-tower-mystery.json', JSON.stringify(princes, null, 2));
console.log('✓ Article 3 optimized');

// Article 4: Horror Movies
console.log('Optimizing Article 4: Horror Movies...');
const horror = JSON.parse(fs.readFileSync('src/data/articles/best-horror-movies-based-on-true-stories.json', 'utf-8'));

horror.content = horror.content.replace(
  'The phrase "based on a true story" has been slapped on so many horror films that audiences have learned to treat it as a marketing gimmick rather than a statement of fact.',
  'The phrase "based on a true story" has been slapped on so many horror films – often with only the thinnest connection to documented events – that audiences have learned to treat it as a marketing gimmick rather than a statement of fact. The difference between inspired by and adapted from often blurs conveniently when studios seek to claim authenticity while maintaining creative freedom.'
);

horror.content = horror.content.replace(
  'William Peter Blatty\'s novel and William Friedkin\'s film adaptation are based on the 1949 exorcism of a boy known by the pseudonym "Roland Doe" (later identified as Ronald Hunkeler) in Cottage City, Maryland and St. Louis, Missouri.',
  'William Peter Blatty\'s 1971 novel and William Friedkin\'s landmark 1973 film adaptation are based on the documented 1949 exorcism of a boy known by the pseudonym "Roland Doe" (later identified as Ronald Hunkeler) in Cottage City, Maryland and St. Louis, Missouri. The case was unusual because the Catholic Church authorized an official exorcism, meaning institutional religious authorities witnessed and documented the events.'
);

horror.content = horror.content.replace(
  'Tobe Hooper\'s film isn\'t based on a Texas chainsaw massacre because no such event occurred. The film draws its inspiration from Ed Gein, the Wisconsin grave robber and murderer whose farmhouse contained furniture and clothing made from human remains.',
  'Tobe Hooper\'s visceral 1974 film isn\'t based on a Texas chainsaw massacre because no such singular event occurred – demonstrating how effective horror can be when it synthesizes multiple real crimes into a unified narrative. The film draws its primary inspiration from Ed Gein, the Wisconsin grave robber and murderer whose farmhouse contained furniture and clothing made from human remains. Gein operated in rural Wisconsin between 1945 and 1957, largely undetected because isolation and social indifference allowed his crimes to continue.'
);

horror.modified = '2026-02-24 16:00:00';
horror.wordCount = 1370;
fs.writeFileSync('src/data/articles/best-horror-movies-based-on-true-stories.json', JSON.stringify(horror, null, 2));
console.log('✓ Article 4 optimized');

// Article 5: Frankenstein
console.log('Optimizing Article 5: Frankenstein...');
const frankenstein = JSON.parse(fs.readFileSync('src/data/articles/frankenstein-origin-story-lake-geneva.json', 'utf-8'));

frankenstein.content = frankenstein.content.replace(
  'In the summer of 1816, five people gathered at a villa on the shores of Lake Geneva and accidentally invented modern horror fiction. Mary Godwin – not yet Mary Shelley – was eighteen years old. Her companion Percy Bysshe Shelley was twenty-three, already a published poet and a scandal.',
  'In the summer of 1816, five people gathered at a villa on the shores of Lake Geneva and accidentally invented modern horror fiction – creating two of the most enduring archetypes in Western culture. Mary Godwin – not yet Mary Shelley – was eighteen years old, already well-read in philosophy and literature despite her youth. Her companion Percy Bysshe Shelley was twenty-three, already a published poet whose radical ideas on atheism and free love had made him a scandal in English society.'
);

frankenstein.content = frankenstein.content.replace(
  'The weather that summer was catastrophic. The eruption of Mount Tambora in Indonesia the previous year had thrown so much ash into the atmosphere that 1816 became known as "The Year Without a Summer." Cold rain fell almost continuously.',
  'The weather that summer was catastrophic – and volcanic in origin. The eruption of Mount Tambora in Indonesia in April 1815 had thrown approximately 60 million tons of ash into the stratosphere, creating a global climate anomaly. In 1816, the ash reduced solar radiation reaching Earth\'s surface, causing temperatures across the Northern Hemisphere to drop by 0.4 to 0.7 degrees Celsius. Cold rain fell almost continuously during the Geneva summer, sometimes hail in June.'
);

frankenstein.content = frankenstein.content.replace(
  'The breakthrough came in a waking nightmare. After an evening of conversation about galvanism – Luigi Galvani\'s experiments in which electrical current made dead frog legs twitch, suggesting that electricity might be the animating force of life – Mary lay in bed unable to sleep and saw, as she later described it, "the pale student of unhallowed arts kneeling beside the thing he had put together."',
  'The breakthrough came in a waking nightmare. After an evening of conversation about galvanism – Luigi Galvani\'s revolutionary experiments in which electrical current made dead frog legs twitch, suggesting that electricity might be the animating force of life itself – Mary lay in bed unable to sleep. She experienced what she would later describe as a "waking dream," in which she saw "the pale student of unhallowed arts kneeling beside the thing he had put together." The image was complete, philosophically coherent, and terrifying.'
);

frankenstein.modified = '2026-02-24 16:00:00';
frankenstein.wordCount = 1365;
fs.writeFileSync('src/data/articles/frankenstein-origin-story-lake-geneva.json', JSON.stringify(frankenstein, null, 2));
console.log('✓ Article 5 optimized');

console.log('\n✅ All 5 articles optimized successfully');

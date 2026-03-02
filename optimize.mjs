import fs from 'fs';

// Article 1: MKUltra
const mkultra = JSON.parse(fs.readFileSync('src/data/articles/real-mkultra-experiments-stranger-things.json', 'utf-8'));

mkultra.content = mkultra.content.replace(
  'One such subject, Army biochemist Frank Olson, fell into a severe psychological crisis after being dosed without his knowledge and died after falling from a thirteenth-floor window in New York City in 1953. His death was ruled a suicide, but Olson\'s family has maintained for decades that he was murdered to prevent him from revealing program details.',
  'One such subject, Army biochemist Frank Olson, fell into a severe psychological crisis after being dosed without his knowledge. Olson had become troubled by the ethical implications of his work at Fort Detrick\'s biological warfare laboratory, and his CIA handlers grew concerned about his reliability after his dosing. On November 28, 1953, just over a week after receiving LSD in a glass of Cointreau at an agency safe house, Olson was found dead on the pavement below the Statler Hotel in New York City after falling from a thirteenth-floor window. His death was ruled a suicide, but Olson\'s family has maintained for decades that he was murdered to prevent him from revealing program details. The circumstances of his death and the timeline of his psychological deterioration remain contested by researchers who question whether a man in his mental state could have organized his own death, or whether CIA handlers accelerated his decline to ensure his silence.'
);

mkultra.content = mkultra.content.replace(
  'LSD was only one component. MKUltra sub-projects explored sensory deprivation, electroshock therapy administered at levels far beyond therapeutic norms, hypnosis, isolation, verbal and sexual abuse, and various combinations thereof. Dr. Donald Ewen Cameron at McGill University\'s Allan Memorial Institute conducted experiments he called "psychic driving" – subjects were given massive doses of electroshock therapy, placed in drug-induced comas for weeks at a time, and forced to listen to recorded messages on continuous loops, all in an attempt to erase their existing personalities and rebuild them from scratch.',
  'LSD was only one component. MKUltra sub-projects explored sensory deprivation (often using isolation tanks similar to those later pioneered by neuroscientist John C. Lilly), electroshock therapy administered at levels far beyond therapeutic norms, hypnosis, isolation, verbal and sexual abuse, and various combinations thereof. The sensory deprivation research sought to understand whether removing all external stimuli could create a state of psychological vulnerability that might enhance suggestibility or induce hallucinations useful for interrogation. Dr. Donald Ewen Cameron at McGill University\'s Allan Memorial Institute conducted experiments he called "psychic driving" – a barbaric protocol in which subjects were given massive doses of electroshock therapy, placed in drug-induced comas for weeks at a time, and forced to listen to recorded messages on continuous loops, all in an attempt to erase their existing personalities and rebuild them from scratch. Cameron\'s work was supported by CIA funding through a front organization, and his subjects often emerged from treatment unable to recognize family members or remember their own names, reduced to a state of severe cognitive and emotional impairment from which many never recovered.'
);

mkultra.modified = '2026-02-24 16:00:00';
mkultra.wordCount = 1486;

fs.writeFileSync('src/data/articles/real-mkultra-experiments-stranger-things.json', JSON.stringify(mkultra, null, 2));

console.log('✓ Article 1 MKUltra optimized');

/**
 * Destination Archive Page Data
 * Central configuration for all destination pillar pages
 */

export interface FeaturedTour {
	productCode: string
	title: string
	image: string
	price: string
	rating: number
	reviews: number
	duration?: string
	tier: 'hero' | 'budget' | 'premium' | 'alternative'
	viatorUrl: string
	wpPostId?: number
}

export interface AuthoritativeSource {
	name: string
	url: string
	type: 'official' | 'government' | 'educational' | 'nonprofit' | 'museum'
	description: string
}

export interface ContentSection {
	heading: string
	body: string
	image?: {
		src: string
		alt: string
	}
}

export interface DestinationData {
	slug: string
	name: string
	subtitle?: string
	descriptor: string
	intro?: string
	heroImage?: {
		src: string
		alt: string
	}
	youtubeId?: string
	whyItMatters: string
	sections?: ContentSection[]
	relatedArticleSlugs?: string[]
	featuredTours?: FeaturedTour[]
	faq: Array<{
		question: string
		answer: string
	}>
	relatedDestinations: Array<{
		name: string
		slug: string
	}>
	authoritativeSources?: AuthoritativeSource[]
}

export const DESTINATIONS: Record<string, DestinationData> = {
	'eastern-state-penitentiary': {
		slug: 'eastern-state-penitentiary',
		name: 'Eastern State Penitentiary',
		descriptor: "Philadelphia's infamous abandoned prison, where solitary confinement drove inmates mad",
		intro: "Eastern State Penitentiary stands as a crumbling monument to America's experiment in isolation—a prison designed to reform through silence that instead created a factory of madness.",
		featuredTours: [
			{
				productCode: '6263P11',
				title: 'Dark Philly Adult Night Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/07/ab/6b/af.jpg',
				price: '$38',
				rating: 4.9,
				reviews: 4226,
				duration: '2 hours',
				tier: 'hero',
				viatorUrl: 'https://www.viator.com/tours/Philadelphia/Dark-Philly-Adult-Night-Tour/d906-6263P11?pid=P00166886&mcid=42383',
			},
			{
				productCode: '72503P1',
				title: 'Ghost Tour of Philadelphia by Candlelight',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/74/24/33.jpg',
				price: '$29',
				rating: 4.0,
				reviews: 149,
				duration: '75 minutes',
				tier: 'budget',
				viatorUrl: 'https://www.viator.com/tours/Philadelphia/Ghost-Tour-of-Philadelphia-by-Candlelight/d906-72503P1?pid=P00166886&mcid=42383',
			},
			{
				productCode: '6263P17',
				title: 'Haunted Pub Crawl',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/71/f5/fd.jpg',
				price: '$50',
				rating: 4.8,
				reviews: 60,
				duration: '3 hours',
				tier: 'premium',
				viatorUrl: 'https://www.viator.com/tours/Philadelphia/Haunted-Pub-Crawl/d906-6263P17?pid=P00166886&mcid=42383',
			},
			{
				productCode: '214193P1',
				title: "Philadelphia's Haunted History & Ghost Nighttime 1.5 Hour Tour",
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/13/63/65/4f.jpg',
				price: '$39',
				rating: 4.7,
				reviews: 84,
				duration: '90 minutes',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Philadelphia/Philadelphias-Haunted-History-Ghost-Nighttime-Tour/d906-214193P1?pid=P00166886&mcid=42383',
			},
			{
				productCode: '222222P105',
				title: 'Philadelphia Haunted Ghost Smartphone Guided Audio Walking Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/13/ca/c8/07.jpg',
				price: '$8',
				rating: 5.0,
				reviews: 2,
				duration: 'Self-guided',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Philadelphia/Philadelphia-Haunted-Ghost-Smartphone-Guided-Audio-Walking-Tour/d906-222222P105?pid=P00166886&mcid=42383',
			},
		],
		whyItMatters: `When Eastern State Penitentiary opened in 1829, it was the most expensive building in America and the most influential prison in the world. Its revolutionary design—individual cells with private outdoor exercise yards, all radiating from a central surveillance hub—was copied by over 300 prisons worldwide. The theory was simple: complete isolation would lead to penitence. Prisoners lived in total silence, hooded when moved, forbidden from communicating with guards or fellow inmates. They ate, slept, worked, and exercised alone. The result was catastrophic. Inmates went insane at alarming rates. Charles Dickens visited in 1842 and declared the system cruel and wrong. Despite abandoning strict solitary confinement, the prison continued operating until 1971, housing infamous inmates including Al Capone and bank robber Willie Sutton. Today, the prison's crumbling cellblocks and haunting architecture make it one of America's most visited historic sites—and reportedly one of its most haunted.`,
		faq: [
			{
				question: 'Is Eastern State Penitentiary really haunted?',
				answer: 'The prison is featured on numerous ghost hunting shows and has extensive documentation of paranormal activity. Whether you believe in ghosts or not, the atmosphere is genuinely unsettling. Night tours emphasize the haunted history.',
			},
			{
				question: 'How long does a visit take?',
				answer: 'Plan for 2 to 3 hours. The self-guided audio tour (narrated by Steve Buscemi) takes about 1.5 hours. Add time for special exhibits, Al Capone\'s cell, and photography.',
			},
			{
				question: 'What is Terror Behind the Walls?',
				answer: 'Terror Behind the Walls is the prison\'s massive Halloween haunted house event running September through November. It\'s separate from regular tours and features elaborate horror scenarios throughout the cellblocks.',
			},
			{
				question: 'Can I see Al Capone\'s cell?',
				answer: 'Yes, Capone\'s cell has been restored to its 1929 appearance, when he served 8 months here. His cell was famously luxurious compared to standard accommodations, featuring rugs, furniture, and a radio.',
			},
			{
				question: 'Is Eastern State suitable for children?',
				answer: 'Daytime tours are appropriate for most ages, though the crumbling prison is genuinely eerie. The audio tour discusses punishment and isolation. Terror Behind the Walls and night tours are not recommended for young children.',
			},
		],
		relatedDestinations: [
			{ name: 'Alcatraz Island', slug: 'alcatraz' },
			{ name: 'Port Arthur', slug: 'port-arthur' },
			{ name: 'Gettysburg Battlefield', slug: 'gettysburg' },
		],
		authoritativeSources: [
			{
				name: 'Eastern State Penitentiary Historic Site',
				url: 'https://www.easternstate.org/',
				type: 'official',
				description: 'Official museum website with tour information, history, and Terror Behind the Walls event details.',
			},
			{
				name: 'National Park Service - Eastern State',
				url: 'https://easternstate.org/',
				type: 'government',
				description: 'National Historic Landmark designation and preservation information.',
			},
			{
				name: 'Smithsonian Magazine - Eastern State',
				url: 'https://www.smithsonianmag.com/history/eastern-state-penitentiary-a-prison-with-a-past-14274660/',
				type: 'educational',
				description: 'In-depth historical analysis of the prison system and its impact on American corrections.',
			},
		],
	},
	'gettysburg': {
		slug: 'gettysburg',
		name: 'Gettysburg Battlefield',
		descriptor: 'Where 50,000 soldiers fell in three days of brutal Civil War combat',
		intro: "The fields and ridges around Gettysburg, Pennsylvania witnessed the bloodiest battle ever fought on American soil—a three-day nightmare that left 50,000 men dead, wounded, or missing.",
		featuredTours: [
			{
				productCode: '308362P7',
				title: 'Gettysburg: Ghost Hunt Tour with Ghost Hunting Equipment',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/16/f8/15/9b.jpg',
				price: '$29',
				rating: 4.6,
				reviews: 589,
				duration: '90 minutes',
				tier: 'hero',
				viatorUrl: 'https://www.viator.com/tours/Gettysburg/Ghost-Hunt-Tour-with-Ghost-Hunting-Equipment/d23009-308362P7?pid=P00166886&mcid=42383',
			},
			{
				productCode: '6437P5',
				title: 'Spirits of Jennie Wade Ghost Night Tour in Gettysburg',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/16/f8/15/9b.jpg',
				price: '$18',
				rating: 4.8,
				reviews: 308,
				duration: '90 minutes',
				tier: 'budget',
				viatorUrl: 'https://www.viator.com/tours/Gettysburg/Spirits-of-Jennie-Wade-Ghost-Night-Tour/d23009-6437P5?pid=P00166886&mcid=42383',
			},
			{
				productCode: '400455P2',
				title: 'Blood on the Battlefield Ages 16+',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/11/65/e6/fa.jpg',
				price: '$35',
				rating: 4.9,
				reviews: 171,
				duration: '90 minutes',
				tier: 'premium',
				viatorUrl: 'https://www.viator.com/tours/Gettysburg/Blood-on-the-Battlefield/d23009-400455P2?pid=P00166886&mcid=42383',
			},
			{
				productCode: '308362P1',
				title: 'Ghost Tour: History and Haunts - Family Friendly',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/12/90/ce/8f.jpg',
				price: '$24',
				rating: 4.5,
				reviews: 378,
				duration: '75 minutes',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Gettysburg/Ghost-Tour-History-and-Haunts-Family-Friendly/d23009-308362P1?pid=P00166886&mcid=42383',
			},
			{
				productCode: '400455P1',
				title: 'Echoes of War All Ages Ghost Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/62/6d/e6.jpg',
				price: '$30',
				rating: 4.8,
				reviews: 657,
				duration: '90 minutes',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Gettysburg/Echoes-of-War-Ghost-Tour/d23009-400455P1?pid=P00166886&mcid=42383',
			},
		],
		whyItMatters: `In July 1863, the Confederate Army of Northern Virginia and the Union Army of the Potomac collided at a small Pennsylvania crossroads town. What followed was three days of slaughter that would determine the course of American history. The fighting was apocalyptic: Pickett's Charge sent 12,500 Confederate soldiers across open ground into Union artillery; the Wheatfield changed hands six times in a single afternoon; Little Round Top saw hand-to-hand combat among the boulders. When the smoke cleared, the Confederacy had suffered a defeat from which it would never recover. The carnage was so immense that the town of 2,400 residents was left to deal with 22,000 wounded soldiers and 8,000 unburied corpses. Four months later, President Lincoln delivered his Gettysburg Address at the dedication of the Soldiers' National Cemetery. Today, the battlefield's 6,000 acres of monuments, memorials, and preserved terrain make it the most visited Civil War site in America—and, many believe, one of its most haunted.`,
		faq: [
			{
				question: 'How long should I spend at Gettysburg?',
				answer: 'A minimum of one full day, though serious history enthusiasts often spend 2-3 days. The battlefield alone covers 24 square miles with over 1,400 monuments. The museum and cyclorama add another 2-3 hours.',
			},
			{
				question: 'Should I hire a Licensed Battlefield Guide?',
				answer: 'Highly recommended. Licensed guides undergo extensive training and provide a 2-hour tour in your vehicle, bringing the battle to life in ways self-guided tours cannot match. Book in advance, especially for peak season.',
			},
			{
				question: 'Is Gettysburg haunted?',
				answer: 'Gettysburg is considered one of America\'s most haunted locations. With 50,000 casualties concentrated in a small area, reports of paranormal activity are extensive and well-documented. Multiple ghost tour companies operate nightly.',
			},
			{
				question: 'What is the best time to visit?',
				answer: 'Spring and fall offer comfortable weather and smaller crowds. The July 1-3 anniversary brings reenactments and commemorations but massive crowds. Winter provides solitude but harsh conditions.',
			},
			{
				question: 'Can I walk the battlefield?',
				answer: 'Yes, extensive walking trails cover key areas including Little Round Top, Devil\'s Den, and the High Water Mark. The Billy Yank Trail and Johnny Reb Trail offer themed walking routes.',
			},
		],
		relatedDestinations: [
			{ name: 'Eastern State Penitentiary', slug: 'eastern-state-penitentiary' },
			{ name: 'Salem Witch Trials', slug: 'salem-witch-trials' },
			{ name: 'Tower of London', slug: 'tower-of-london' },
		],
		authoritativeSources: [
			{
				name: 'Gettysburg National Military Park',
				url: 'https://www.nps.gov/gett/index.htm',
				type: 'government',
				description: 'Official National Park Service site with battlefield maps, visitor information, and educational resources.',
			},
			{
				name: 'Gettysburg Foundation',
				url: 'https://www.gettysburgfoundation.org/',
				type: 'nonprofit',
				description: 'Nonprofit partner supporting preservation and education at Gettysburg.',
			},
			{
				name: 'American Battlefield Trust - Gettysburg',
				url: 'https://www.battlefields.org/learn/civil-war/battles/gettysburg',
				type: 'nonprofit',
				description: 'Detailed battle history, maps, and preservation efforts from leading battlefield preservation organization.',
			},
			{
				name: 'Gettysburg Museum of History',
				url: 'https://www.gettysburgmuseumofhistory.com/',
				type: 'museum',
				description: 'Private collection of Civil War artifacts and Gettysburg memorabilia.',
			},
		],
	},

	'alcatraz': {
		slug: 'alcatraz',
		name: 'Alcatraz Island',
		descriptor: "America's most infamous federal penitentiary",
		intro: "Alcatraz Island rises from San Francisco Bay, its cellhouse a monument to federal punishment and failed escapes.",
		featuredTours: [
			{
				productCode: '7103P16',
				title: 'Alcatraz Plus San Francisco City Combo Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/09/27/3e.jpg',
				price: '$166',
				rating: 4.6,
				reviews: 32,
				duration: 'Full day',
				tier: 'hero',
				viatorUrl: 'https://www.viator.com/tours/San-Francisco/Alcatraz-Plus-San-Francisco-City-Combo-Tour/d651-7103P16?pid=P00166886&mcid=42383',
			},
			{
				productCode: '2660SFODLX3',
				title: 'Combo Tour: Alcatraz Island and San Francisco Grand City Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/07/38/d2/d9.jpg',
				price: '$149',
				rating: 4.2,
				reviews: 2228,
				duration: '6.5 hours',
				tier: 'budget',
				viatorUrl: 'https://www.viator.com/tours/San-Francisco/Alcatraz-and-San-Francisco-City-Tour/d651-2660SFODLX3?pid=P00166886&mcid=42383',
			},
			{
				productCode: '30758P1',
				title: 'San Francisco, Muir Woods, Sausalito and optional Alcatraz tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/79/ab/96.jpg',
				price: '$109',
				rating: 4.9,
				reviews: 754,
				duration: '5.5 hours',
				tier: 'premium',
				viatorUrl: 'https://www.viator.com/tours/San-Francisco/Muir-Woods-Sausalito-and-Alcatraz-Tour/d651-30758P1?pid=P00166886&mcid=42383',
			},
			{
				productCode: '7084CITYNALC',
				title: 'San Francisco Small Group City Sightseeing and Alcatraz Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/74/0c/59.jpg',
				price: '$180',
				rating: 4.9,
				reviews: 265,
				duration: '7 hours',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/San-Francisco/San-Francisco-City-Sightseeing-and-Alcatraz-Tour/d651-7084CITYNALC?pid=P00166886&mcid=42383',
			},
			{
				productCode: '421891P6',
				title: 'Alcatraz Night Tour and San Francisco Bay Cruise',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/11/c9/5b/95.jpg',
				price: '$169',
				rating: 3.8,
				reviews: 12,
				duration: '4 hours',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/San-Francisco/Alcatraz-Night-Tour-and-San-Francisco-Bay-Cruise/d651-421891P6?pid=P00166886&mcid=42383',
			},
		],
		whyItMatters: `Alcatraz operated as a federal penitentiary from 1934 to 1963, designed to hold prisoners who caused trouble at other facilities. The island's isolation—surrounded by frigid, treacherous currents—made it the perfect maximum-security prison. Its inmates included Al Capone, George "Machine Gun" Kelly, and Robert Stroud, the so-called "Birdman." The prison's harsh conditions, strict silence rules, and brutal solitary confinement in "The Hole" became legendary. Of the 36 men who attempted escape, none are confirmed to have survived the waters. Today, the deteriorating cellhouse stands as a stark reminder of America's experiment in punitive isolation—a place where the nation sent those it deemed irredeemable.`,
		faq: [
			{
				question: 'How long does a visit to Alcatraz take?',
				answer: 'Plan for 2.5 to 3 hours total. The ferry ride takes 15 minutes each way, and most visitors spend 1.5 to 2 hours exploring the island and cellhouse.',
			},
			{
				question: 'Do Alcatraz tickets sell out?',
				answer: 'Yes, frequently. Alcatraz receives over 1.4 million visitors annually with limited daily capacity. Book at least 2-3 weeks in advance, especially for summer visits or night tours.',
			},
			{
				question: 'Is the Alcatraz night tour worth it?',
				answer: 'The night tour offers smaller crowds, sunset views of San Francisco, and exclusive programs not available during the day. It sells out faster than day tours.',
			},
			{
				question: 'Is Alcatraz suitable for children?',
				answer: 'Yes, but content involves imprisonment, attempted escapes, and solitary confinement. The audio tour is engaging for ages 10+. Younger children may find the ferry ride more interesting than the cellhouse.',
			},
			{
				question: 'What is included in an Alcatraz tour?',
				answer: 'Standard tickets include round-trip ferry, access to the island, and the award-winning cellhouse audio tour narrated by former guards and inmates.',
			},
		],
		relatedDestinations: [
			{ name: 'Eastern State Penitentiary', slug: 'eastern-state-penitentiary' },
			{ name: 'Port Arthur', slug: 'port-arthur' },
			{ name: 'Tower of London', slug: 'tower-of-london' },
		],
		authoritativeSources: [
			{
				name: 'Alcatraz Island - National Park Service',
				url: 'https://www.nps.gov/alca/index.htm',
				type: 'government',
				description: 'Official NPS site with history, tour information, and visitor planning resources.',
			},
			{
				name: 'Alcatraz Cruises (Official Ferry)',
				url: 'https://www.alcatrazcruises.com/',
				type: 'official',
				description: 'Official concessioner for Alcatraz ferry tickets and tour bookings.',
			},
			{
				name: 'Federal Bureau of Prisons - Alcatraz History',
				url: 'https://www.bop.gov/about/history/alcatraz.jsp',
				type: 'government',
				description: 'Bureau of Prisons official history of Alcatraz as a federal penitentiary.',
			},
			{
				name: 'Golden Gate National Recreation Area',
				url: 'https://www.nps.gov/goga/index.htm',
				type: 'government',
				description: 'Alcatraz is part of the Golden Gate NRA; provides regional context and planning.',
			},
		],
	},
	'tower-of-london': {
		slug: 'tower-of-london',
		name: 'Tower of London',
		descriptor: 'Nine centuries of royal power, imprisonment, and execution',
		intro: "The Tower of London has served as fortress, palace, and prison—a place where England's monarchs displayed their power through spectacle and violence.",
		featuredTours: [
			{
				productCode: '278452P2',
				title: 'Private Tour: The Iconic Tower of London',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/c9/ad/ee.jpg',
				price: '$356',
				rating: 5.0,
				reviews: 26,
				duration: '2.5 hours',
				tier: 'hero',
				viatorUrl: 'https://www.viator.com/tours/London/Private-Tour-The-Iconic-Tower-of-London/d737-278452P2?pid=P00166886&mcid=42383',
			},
			{
				productCode: '75760P23',
				title: 'Tower of London & 30+ London Sights Walking Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/14/29/30/09.jpg',
				price: '$162',
				rating: 4.6,
				reviews: 33,
				duration: '6 hours',
				tier: 'budget',
				viatorUrl: 'https://www.viator.com/tours/London/Tower-of-London-30-Sights-Walking-Tour/d737-75760P23?pid=P00166886&mcid=42383',
			},
			{
				productCode: '75038P1',
				title: 'Private Tour of The Tower of London',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/12/27/b1/00.jpg',
				price: '$358',
				rating: 5.0,
				reviews: 202,
				duration: '3 hours',
				tier: 'premium',
				viatorUrl: 'https://www.viator.com/tours/London/Private-Tour-of-The-Tower-of-London/d737-75038P1?pid=P00166886&mcid=42383',
			},
			{
				productCode: '349592P2',
				title: 'Tower of London Private Tour for Families and Friends',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/11/d7/2b/f2.jpg',
				price: '$335',
				rating: 5.0,
				reviews: 50,
				duration: '3 hours',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/London/Tower-of-London-Private-Tour-for-Families/d737-349592P2?pid=P00166886&mcid=42383',
			},
			{
				productCode: '103389P5',
				title: 'Kid-Friendly Tour: Tower of London and Tower Bridge Entry',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/11/6b/f2/b8.jpg',
				price: '$392',
				rating: 4.8,
				reviews: 25,
				duration: '4 hours',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/London/Kid-Friendly-Tour-Tower-of-London-and-Tower-Bridge/d737-103389P5?pid=P00166886&mcid=42383',
			},
		],
		whyItMatters: `For nearly a thousand years, the Tower of London has embodied the brutal machinery of English royal power. Built by William the Conqueror in 1066, it became a place where kings imprisoned rivals, tortured confessions from the accused, and executed those who threatened the throne. Anne Boleyn, Lady Jane Grey, and Sir Thomas More all met their deaths within its walls. The Tower's dungeons held prisoners scratched their final messages into stone—messages still visible today. The Crown Jewels on display represent the wealth extracted through empire, while the ravens that patrol the grounds carry their own legend: should they ever leave, the kingdom will fall.`,
		faq: [
			{
				question: 'How long should I spend at the Tower of London?',
				answer: 'Allow 3 to 4 hours to explore thoroughly. The complex includes multiple towers, the Crown Jewels, and the White Tower museum. Yeoman Warder tours run hourly and last 60 minutes.',
			},
			{
				question: 'Do Tower of London tickets sell out?',
				answer: 'Peak summer days and school holidays can sell out. Booking online in advance saves money and guarantees entry. Consider arriving at opening (10am) to beat crowds.',
			},
			{
				question: 'What is included in Tower of London admission?',
				answer: 'Entry includes access to all towers, the Crown Jewels, White Tower exhibits, and free Yeoman Warder tours. Audio guides cost extra but are recommended.',
			},
			{
				question: 'Is the Tower of London suitable for children?',
				answer: 'Yes, though content includes executions and torture. The interactive exhibits, armour displays, and ravens engage children. The Yeoman Warders are skilled at age-appropriate storytelling.',
			},
			{
				question: 'When is the best time to visit?',
				answer: 'Weekday mornings offer the smallest crowds. Winter months are quieter but colder. The Ceremony of the Keys (nightly locking ritual) requires separate free tickets booked months ahead.',
			},
		],
		relatedDestinations: [
			{ name: "Dracula's Castle", slug: 'draculas-castle' },
			{ name: 'Eastern State Penitentiary', slug: 'eastern-state-penitentiary' },
			{ name: 'Alcatraz Island', slug: 'alcatraz' },
		],
		authoritativeSources: [
			{
				name: 'Historic Royal Palaces - Tower of London',
				url: 'https://www.hrp.org.uk/tower-of-london/',
				type: 'official',
				description: 'Official site for tickets, visiting information, and history from the charity managing the Tower.',
			},
			{
				name: 'Royal Collection Trust',
				url: 'https://www.rct.uk/collection/themes/trails/the-crown-jewels',
				type: 'official',
				description: 'Information about the Crown Jewels collection housed at the Tower.',
			},
			{
				name: 'English Heritage - Tower of London',
				url: 'https://www.english-heritage.org.uk/visit/places/tower-of-london/',
				type: 'government',
				description: 'Historical context and heritage preservation information.',
			},
			{
				name: 'British History Online - Tower Records',
				url: 'https://www.british-history.ac.uk/search/series/tower-london',
				type: 'educational',
				description: 'Digitized historical documents and records from the Tower of London.',
			},
		],
	},
	'draculas-castle': {
		slug: 'draculas-castle',
		name: "Dracula's Castle",
		subtitle: 'Bran Castle, Transylvania',
		descriptor: "The Transylvanian fortress where Bram Stoker set literature's most famous vampire — and where centuries of real dark history lurk behind the legend",
		intro: "When Bram Stoker imagined a remote castle perched above a Transylvanian mountain pass, he created the most iconic setting in horror literature. Bran Castle — the real fortress that inspired Dracula's lair — stands at the border between myth and history, where the brutal legacy of Vlad the Impaler collides with the Gothic imagination that made this place famous worldwide.",
		heroImage: {
			src: '/images/destinations/draculas-castle.webp',
			alt: "Bran Castle perched on a cliff in the Transylvanian mountains at dusk",
		},
		youtubeId: 'Mw9iEvqefHU',
		featuredTours: [
			{
				productCode: '10193P2',
				title: 'Bucharest to Dracula Castle, Peles Castle and Brasov Guided Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0e/39/4c/8c.jpg',
				price: '$34',
				rating: 4.5,
				reviews: 2870,
				duration: '12 hours',
				tier: 'hero',
				viatorUrl: 'https://www.viator.com/tours/Bucharest/Bucharest-to-Dracula-Castle-Peles-Castle-and-Brasov-Guided-Tour/d22134-10193P2?pid=P00166886&mcid=42383',
				wpPostId: 27158,
			},
			{
				productCode: '16115P26',
				title: "Day trip to Dracula's Castle, Peles Castle and Medieval Brasov",
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/6b/80/7d.jpg',
				price: '$23',
				rating: 4.7,
				reviews: 41,
				duration: '12 hours',
				tier: 'budget',
				viatorUrl: 'https://www.viator.com/tours/Bucharest/Day-Trip-to-Draculas-Castle-from-Bucharest-with-airport-transfer-included/d22134-16115P26?pid=P00166886&mcid=42383',
				wpPostId: 27003,
			},
			{
				productCode: '44775P3',
				title: 'Private Day Trip to Transylvania: Dracula Castle, Royal Palace, Brasov Old Town',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0b/e3/1d/05.jpg',
				price: '$260',
				rating: 5.0,
				reviews: 20,
				duration: '10 hours',
				tier: 'premium',
				viatorUrl: 'https://www.viator.com/tours/Bucharest/Private-Day-Trip-to-Transylvania-Dracula-Castle-Royal-Palace-Brasov-Old-Town/d22134-44775P3?pid=P00166886&mcid=42383',
				wpPostId: 24209,
			},
			{
				productCode: '12254P32',
				title: 'Transylvania with Dracula Castle, Bear Sanctuary and Brasov',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/09/46/9a/fb.jpg',
				price: '$154',
				rating: 4.8,
				reviews: 17,
				duration: '14 hours',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Bucharest/Transylvania-with-Dracula-Castle-Bear-Sanctuary-and-Brasov/d22134-12254P32?pid=P00166886&mcid=42383',
				wpPostId: 25194,
			},
			{
				productCode: '7745P1',
				title: 'Transylvania and Dracula Castle Full Day Tour from Bucharest',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0e/39/4c/8c.jpg',
				price: '$34',
				rating: 4.5,
				reviews: 1573,
				duration: '12 hours',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Bucharest/Transylvania-and-Dracula-Castle-Full-Day-Tour-from-Bucharest/d22134-7745P1?pid=P00166886&mcid=42383',
			},
		],
		whyItMatters: `Dracula's Castle stands at the intersection of real medieval brutality and the Gothic imagination that transformed a Transylvanian fortress into the most famous haunted castle on Earth. The connection between Bran Castle and the vampire Count Dracula is literary — invented by Bram Stoker in 1897 — but the real history behind these walls is arguably darker than any fiction. For over six centuries, this castle has guarded a mountain pass where empires clashed, armies marched, and a prince nicknamed "the Impaler" earned his reputation through methods that horrified even his contemporaries.`,
		sections: [
			{
				heading: 'The Real History: A Fortress Built for War',
				body: `Bran Castle was constructed in 1388 by Saxon merchants from the nearby city of Brașov, who needed a customs post and defensive stronghold to guard the Bran Pass — the critical mountain route connecting Transylvania to Wallachia. The castle's strategic position atop a 200-foot cliff made it nearly impregnable. Over the centuries it changed hands between Hungarian kings, Wallachian princes, and Habsburg rulers. It served as a border checkpoint where trade goods were taxed, a military garrison during Ottoman invasions, and eventually a royal residence. Queen Marie of Romania restored the castle in the 1920s, filling it with art and furniture that remain on display today. After World War II, the communist regime seized the castle; it was returned to the Habsburg family in 2009 and opened as a museum.`,
			},
			{
				heading: 'Vlad the Impaler: The Man Behind the Monster',
				body: `Vlad III, Prince of Wallachia, earned the epithet "Țepeș" (the Impaler) through his preferred method of execution — driving sharpened stakes through the bodies of enemies and leaving them displayed as warnings. During his reign from 1456 to 1462, Vlad is estimated to have killed between 40,000 and 100,000 people through impalement, burning, skinning, and boiling alive. His cruelty was legendary even in an era that expected brutality from its rulers. Vlad's connection to Bran Castle itself is tenuous — he likely passed through the fortress during military campaigns and may have been briefly imprisoned here. But it was his reputation as a bloodthirsty warlord that gave Bram Stoker the raw material to create Count Dracula.`,
				image: {
					src: '/images/destinations/transylvania-medieval-fortress.webp',
					alt: 'Medieval Corvin Castle in Transylvania, Romania — one of the great fortresses of the region Vlad the Impaler once ruled',
				},
			},
			{
				heading: "Bram Stoker's Invention: How a Novel Created a Legend",
				body: `Bram Stoker never visited Romania. Working from travel guides, maps, and accounts of Transylvanian geography in the British Museum reading room, the Irish author crafted a fictional castle that matched Bran's description almost perfectly: a fortress perched on a cliff above a mountain pass, surrounded by dense forests and the Carpathian peaks. Stoker borrowed Vlad's patronymic — Dracula, meaning "son of the dragon" — for his vampire count, blending Wallachian history with Eastern European vampire folklore and his own Gothic imagination. The novel was published in 1897 and slowly grew into one of the most influential horror stories ever written. By the mid-20th century, Bran Castle had become irrevocably identified as "Dracula's Castle" in the popular imagination, drawing visitors from around the world.`,
			},
			{
				heading: 'Visiting Today: What to Expect',
				body: `The castle museum spans four floors of winding staircases, narrow corridors, and period-furnished rooms that reflect Queen Marie's early 20th-century restoration. Highlights include a basement torture exhibit, a secret passage connecting the first and third floors, medieval weapons displays, and a courtyard well that — according to local legend — connects to underground tunnels. Outside, the village of Bran has built a cottage industry around Dracula tourism, with souvenir markets, themed restaurants, and a Halloween festival that has become one of Europe's largest. Most visitors arrive on organized day trips from Bucharest (a three-hour drive) or Brașov (30 minutes), often combining the visit with nearby Peleș Castle and the medieval city center of Brașov.`,
			},
		],
		relatedArticleSlugs: [
			'transylvania-dracula-tourism',
			'dracula-novel-historical-analysis',
			'vampire-folklore-eastern-europe',
			'bram-stoker-dublin-dracula-origins',
			'real-vampire-legends-history',
			'vampire-hunters-real-history',
			'nosferatu-film-history',
			'new-nosferatu-film-2024-locations',
			'interview-with-the-vampire-new-orleans',
			'twilight-vampire-renaissance-pop-culture',
		],
		faq: [
			{
				question: "Is Bran Castle really Dracula's castle?",
				answer: "Bran Castle is the real fortress that most closely matches Bram Stoker's description of Count Dracula's castle. Stoker never visited Romania, but used travel guides and maps that described a castle matching Bran's location and appearance. The historical Vlad the Impaler — whose nickname inspired the Dracula character — had only a tenuous connection to the castle itself.",
			},
			{
				question: 'Who was Vlad the Impaler?',
				answer: "Vlad III (1431–1476) was the Prince of Wallachia, a region in present-day Romania. He earned the name 'the Impaler' for his preferred execution method. His patronymic 'Dracula' (son of the dragon) came from his father's membership in the Order of the Dragon. Bram Stoker borrowed this name and Vlad's fearsome reputation for his 1897 novel.",
			},
			{
				question: 'How long does a Bran Castle visit take?',
				answer: 'The castle tour takes 1 to 1.5 hours. Add time for the surrounding village market, souvenir shops, and nearby attractions. Most organized tours from Bucharest or Brașov are full-day excursions that also include Peleș Castle and Brașov old town.',
			},
			{
				question: 'How do I get to Bran Castle from Bucharest?',
				answer: "Bran Castle is about 170 km (3 hours) north of Bucharest by car. You can drive, take an organized day tour, or travel by bus to Brașov and then a local bus to Bran. Most visitors choose a guided day tour that includes hotel pickup and multiple stops.",
			},
			{
				question: 'Why did Bram Stoker choose Bran Castle for Dracula?',
				answer: "Stoker never actually visited Romania — he researched the novel entirely from books and maps in the British Museum. He needed a castle perched above a remote mountain pass at the edge of Transylvania, and Bran Castle's position guarding the Bran Pass between Transylvania and Wallachia matched his description almost exactly. More dramatic castles like Corvin Castle exist in the region, but Bran's geography — isolated on a cliff above the road into the mountains — fit the narrative he was building. The name 'Dracula' came separately, borrowed from Vlad III's patronymic meaning 'son of the dragon.'",
			},
			{
				question: 'What is there to see at Bran Castle?',
				answer: "The castle museum includes Queen Marie's restored rooms, medieval weapons displays, a torture exhibit in the basement, secret passages between floors, and a courtyard with panoramic mountain views. The village market outside sells local crafts, cheese, and Dracula-themed souvenirs.",
			},
			{
				question: 'Can I visit independently or do I need a tour?',
				answer: 'Both options work. Independent visits allow more flexibility and are easy if you have a rental car or are based in Brașov (30-minute bus ride). Organized tours from Bucharest handle all logistics and typically combine Bran with Peleș Castle and Brașov.',
			},
			{
				question: 'Does Bran Castle have a Halloween event?',
				answer: "Yes. The annual Halloween party at Bran Castle has become one of Europe's most popular Halloween events, featuring themed decorations, live performances, and nighttime castle access. Tickets sell out months in advance.",
			},
			{
				question: 'Are there other castles nearby worth visiting?',
				answer: "Peleș Castle in Sinaia (40 minutes away) is a stunning Neo-Renaissance royal palace and one of Europe's most beautiful castles. Rășnov Fortress is a 13th-century citadel just 15 minutes from Bran. Both are commonly included in day tours.",
			},
		],
		relatedDestinations: [
			{ name: 'Tower of London', slug: 'tower-of-london' },
			{ name: 'Salem Witch Trials', slug: 'salem-witch-trials' },
			{ name: 'Eastern State Penitentiary', slug: 'eastern-state-penitentiary' },
		],
		authoritativeSources: [
			{
				name: 'Bran Castle Official Website',
				url: 'https://www.bfranzfoundation.com/en/visit/bran-castle/',
				type: 'official',
				description: 'Official castle website with history, visiting hours, and the real story behind the Dracula legend.',
			},
			{
				name: 'Romania Tourism - Bran Castle',
				url: 'https://romaniatourism.com/bran-castle.html',
				type: 'government',
				description: 'Romanian national tourism authority guide to visiting Bran Castle.',
			},
			{
				name: 'Transylvania Tourism',
				url: 'https://www.romania.travel/en/destinations/transylvania',
				type: 'government',
				description: 'Official regional tourism resource for planning Transylvania visits.',
			},
			{
				name: 'Brașov Tourism Office',
				url: 'https://www.brasovtourism.eu/',
				type: 'government',
				description: 'Local tourism information for the Brașov region where Bran Castle is located.',
			},
		],
	},
	'salem-witch-trials': {
		slug: 'salem-witch-trials',
		name: 'Salem Witch Trials',
		descriptor: 'Where mass hysteria condemned the innocent',
		intro: 'In 1692, accusations of witchcraft tore through Salem Village, leading to the execution of twenty people and the imprisonment of hundreds more.',
		featuredTours: [
			{
				productCode: '378991P1',
				title: 'Wicked Awesome Tours: Witch Trial History and Salem Haunts!',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/12/e2/93/40.jpg',
				price: '$28',
				rating: 4.8,
				reviews: 1026,
				duration: '60 minutes',
				tier: 'hero',
				viatorUrl: 'https://www.viator.com/tours/Salem/Wicked-Awesome-Tours-Witch-Trial-History-and-Salem-Haunts/d23183-378991P1?pid=P00166886&mcid=42383',
			},
			{
				productCode: '259665P14',
				title: 'Ultimate Historic Salem and Witch Trials Self-Guided Walking Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0c/0f/c9/4b.jpg',
				price: '$17',
				rating: 4.3,
				reviews: 67,
				duration: 'Self-guided',
				tier: 'budget',
				viatorUrl: 'https://www.viator.com/tours/Salem/Ultimate-Historic-Salem-Witch-Trials-Self-Guided-Walking-Tour/d23183-259665P14?pid=P00166886&mcid=42383',
			},
			{
				productCode: '26797P1',
				title: "Salem's Best Ghost Tour",
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/c1/5e/04.jpg',
				price: '$30',
				rating: 4.6,
				reviews: 4181,
				duration: '75 minutes',
				tier: 'premium',
				viatorUrl: 'https://www.viator.com/tours/Salem/Salems-Best-Ghost-Tour/d23183-26797P1?pid=P00166886&mcid=42383',
			},
			{
				productCode: '299566P1',
				title: 'Salem Uncovered: The Salem Witch Trials Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0b/ac/5a/25.jpg',
				price: '$26',
				rating: 4.7,
				reviews: 471,
				duration: '90 minutes',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Salem/Salem-Uncovered-The-Salem-Witch-Trials-Tour/d23183-299566P1?pid=P00166886&mcid=42383',
			},
			{
				productCode: '378991P3',
				title: 'Salem and The Witch Trials',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/82/4f/0a.jpg',
				price: '$29',
				rating: 4.9,
				reviews: 43,
				duration: '75 minutes',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Salem/Salem-and-The-Witch-Trials/d23183-378991P3?pid=P00166886&mcid=42383',
			},
		],
		whyItMatters: `The Salem witch trials remain America's most infamous episode of mass hysteria and judicial murder. Between February 1692 and May 1693, more than 200 people were accused of practicing witchcraft. Nineteen were hanged on Gallows Hill, one was pressed to death with stones, and at least five died in jail. The accused ranged from a four-year-old child to elderly church members. The trials exposed the dangers of spectral evidence, religious extremism, and community paranoia. Today, Salem has transformed its dark legacy into a memorial and a warning. The Witch Trials Memorial lists the names of the executed, while museums examine how fear and accusation can destroy communities. The word "witch hunt" entered the language as a permanent reminder of Salem's horror.`,
		faq: [
			{
				question: 'How long should I spend in Salem?',
				answer: 'A full day allows time for the major sites: Witch Trials Memorial, Witch House, Peabody Essex Museum, and Charter Street Cemetery. Walking tours take 1-2 hours each.',
			},
			{
				question: 'What is the best time to visit Salem?',
				answer: 'October brings Halloween events and massive crowds. Spring and early fall offer pleasant weather and smaller groups. The trials actually occurred in winter and spring of 1692.',
			},
			{
				question: 'Where did the witch trials executions happen?',
				answer: "Executions took place at Proctor's Ledge (identified in 2016), not Gallows Hill as long believed. The site now has a small memorial. Bodies were buried in shallow graves nearby.",
			},
			{
				question: 'Is Salem appropriate for children?',
				answer: 'Most museums are family-friendly but discuss executions and imprisonment. The Witch House and walking tours work well for ages 8+. Some attractions lean into theatrical horror.',
			},
			{
				question: 'What is included in Salem witch trial tours?',
				answer: 'Walking tours typically cover trial locations, the memorial, Charter Street Cemetery, and historical context. Some include museum admission. Night tours add theatrical elements.',
			},
		],
		relatedDestinations: [
			{ name: 'Gettysburg Battlefield', slug: 'gettysburg' },
			{ name: 'Eastern State Penitentiary', slug: 'eastern-state-penitentiary' },
			{ name: 'Tower of London', slug: 'tower-of-london' },
		],
		authoritativeSources: [
			{
				name: 'Salem Witch Museum',
				url: 'https://salemwitchmuseum.com/',
				type: 'museum',
				description: 'One of Salem\'s premier witch trial museums with exhibits and educational programs.',
			},
			{
				name: 'Peabody Essex Museum - Salem Witch Trials',
				url: 'https://www.pem.org/',
				type: 'museum',
				description: 'Houses original court documents and artifacts from the 1692 trials.',
			},
			{
				name: 'National Geographic - Salem',
				url: 'https://www.nationalgeographic.com/history/article/salem-witch-trials',
				type: 'educational',
				description: 'Historical analysis and modern understanding of the witch trial hysteria.',
			},
			{
				name: 'Destination Salem (Official Tourism)',
				url: 'https://www.salem.org/',
				type: 'official',
				description: 'Official Salem tourism site with visitor guides, events, and heritage trail information.',
			},
			{
				name: 'Salem Witch Trials Documentary Archive',
				url: 'https://salem.lib.virginia.edu/',
				type: 'educational',
				description: 'University of Virginia scholarly archive of primary source documents from the trials.',
			},
		],
	},
	'port-arthur': {
		slug: 'port-arthur',
		name: 'Port Arthur',
		descriptor: "Tasmania's brutal penal colony, now Australia's most haunted historic site",
		intro: "On Tasmania's remote Tasman Peninsula, Port Arthur stands as Australia's most intact convict site—and its darkest reminder of the transportation era.",
		featuredTours: [
			{
				productCode: '276771P12',
				title: 'Port Arthur Full-day Guided Tour with Harbour Cruise and Tasman National Park',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/e4/0f/18.jpg',
				price: '$116',
				rating: 4.7,
				reviews: 569,
				duration: '9 hours',
				tier: 'hero',
				viatorUrl: 'https://www.viator.com/tours/Hobart/Port-Arthur-Full-day-Guided-Tour-with-Harbour-Cruise/d390-276771P12?pid=P00166886&mcid=42383',
			},
			{
				productCode: '47321P8',
				title: 'Port Arthur and Tasman Sights with Harbour Cruise',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/e4/0f/18.jpg',
				price: '$34',
				rating: 4.8,
				reviews: 342,
				duration: '8 hours',
				tier: 'budget',
				viatorUrl: 'https://www.viator.com/tours/Hobart/Port-Arthur-and-Tasman-Sights-with-Harbour-Cruise/d390-47321P8?pid=P00166886&mcid=42383',
			},
			{
				productCode: '5500TIC_PA',
				title: 'Tasman Island Cruises and Port Arthur Historic Site Day Tour from Hobart',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/e4/0f/18.jpg',
				price: '$225',
				rating: 4.8,
				reviews: 473,
				duration: '10.5 hours',
				tier: 'premium',
				viatorUrl: 'https://www.viator.com/tours/Hobart/Tasman-Island-Cruises-and-Port-Arthur-Day-Tour/d390-5500TIC_PA?pid=P00166886&mcid=42383',
			},
			{
				productCode: '5774PABEP',
				title: 'Port Arthur Historic Site [official]',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/e4/0f/18.jpg',
				price: '$36',
				rating: 4.5,
				reviews: 279,
				duration: 'Full day',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Port-Arthur/Port-Arthur-Historic-Site/d23167-5774PABEP?pid=P00166886&mcid=42383',
			},
			{
				productCode: '5774PAGT',
				title: 'Port Arthur Ghost Tour',
				image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/e4/0f/18.jpg',
				price: '$24',
				rating: 4.2,
				reviews: 209,
				duration: '90 minutes',
				tier: 'alternative',
				viatorUrl: 'https://www.viator.com/tours/Port-Arthur/Port-Arthur-Ghost-Tour/d23167-5774PAGT?pid=P00166886&mcid=42383',
			},
		],
		whyItMatters: `From 1833 to 1853, Port Arthur served as the destination for the British Empire's most hardened convicts—men who had reoffended after transportation to Australia. The settlement pioneered psychological punishment: the Separate Prison used complete silence and isolation to break inmates' spirits, while the Model Prison's "dumb cells" drove men to madness. Convicts built the settlement's impressive buildings while enduring brutal conditions. The site housed boys as young as nine at Point Puer, the first juvenile prison in the British Empire. After closing as a prison, bushfires in the 1890s destroyed much of the settlement, leaving the haunting ruins visible today. In 1996, Port Arthur suffered a modern tragedy when a mass shooting killed 35 people, adding another layer of grief to this already haunted ground. Ghost tours have operated here since the 1990s, with countless reports of paranormal activity.`,
		faq: [
			{
				question: 'How long should I spend at Port Arthur?',
				answer: 'A full day is recommended. The site is extensive, including over 30 buildings, ruins, and gardens. The introductory guided tour and harbor cruise together take about 2 hours.',
			},
			{
				question: 'Are the ghost tours worth it?',
				answer: 'Port Arthur\'s ghost tours are among Australia\'s most respected, running since 1995. The 90-minute lantern-lit tours visit buildings closed during the day and include documented accounts of paranormal activity.',
			},
			{
				question: 'What is included in admission?',
				answer: 'Entry includes a 40-minute introductory walking tour, a harbor cruise, and access to all buildings and grounds. Ghost tours and the Isle of the Dead tour cost extra.',
			},
			{
				question: 'Can I visit the Isle of the Dead?',
				answer: 'Yes, via a separate boat tour. The island cemetery holds nearly 1,800 convicts, soldiers, and free settlers. Tours run several times daily and include a guided walk among the graves.',
			},
			{
				question: 'How do I get to Port Arthur?',
				answer: 'Port Arthur is 100km (1.5 hours) from Hobart. Drive via the Arthur Highway or join an organized day tour. There is no public transport to the site.',
			},
		],
		relatedDestinations: [
			{ name: 'Alcatraz Island', slug: 'alcatraz' },
			{ name: 'Eastern State Penitentiary', slug: 'eastern-state-penitentiary' },
			{ name: 'Tower of London', slug: 'tower-of-london' },
		],
		authoritativeSources: [
			{
				name: 'Port Arthur Historic Site',
				url: 'https://portarthur.org.au/',
				type: 'official',
				description: 'Official site for tickets, tours, ghost tours, and historical information.',
			},
			{
				name: 'Australian Convict Sites (UNESCO)',
				url: 'https://whc.unesco.org/en/list/1306/',
				type: 'educational',
				description: 'UNESCO World Heritage listing for Port Arthur as part of Australian Convict Sites.',
			},
			{
				name: 'Tasmanian Government - Heritage',
				url: 'https://www.heritage.tas.gov.au/',
				type: 'government',
				description: 'Tasmanian heritage protection and conservation information.',
			},
			{
				name: 'Convict Records of Australia',
				url: 'https://www.records.nsw.gov.au/archives/collections-and-research/guides-and-indexes/convict-records-guide',
				type: 'government',
				description: 'NSW State Archives guide to researching convict records and transportation history.',
			},
		],
	},
}

# Hub Page Image Plan — CursedTours.com

## Summary

18 city hub pages are walls of text with zero images. Custom gothic hero
graphics already exist in `public/images/city-hubs/` (JPG + WebP) for
every city — they just aren't referenced in the templates.

**Two tasks:**
1. Wire hero images into templates (Claude does this — no API needed)
2. Source ~108 real stock photos for section breaks (Unsplash API via Desktop Commander)

---

## TASK 1: Wire Hero Images (Claude handles this)

### Existing Assets (public/images/city-hubs/)
All 18 hubs have `.jpg` and `.webp` branded title graphics ready to go.

### What Claude Will Do
Add the hero image to each hub page's hero section and add one `<img>` tag per
content section pointing to the stock photos once they're downloaded.

---

## TASK 2: Section Stock Photos (Desktop Commander + Unsplash API)

### Specs
- **Save to**: `public/images/hubs/`
- **Width**: 1200px
- **Format**: JPEG, quality 80
- **Orientation**: landscape
- **Style**: moody, atmospheric, architectural, historic, night/dusk preferred
- **Avoid**: bright tourist shots, people-focused, food, generic stock

### Verification
After downloading each image, visually confirm it actually shows the correct
city/location. Unsplash search can return unrelated results.

---

### Austin (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `austin-haunted.jpg` | `Austin Texas historic building dusk` | `Austin Congress Avenue night` |
| `austin-sixth-street.jpg` | `Austin Sixth Street night neon` | `Austin Texas nightlife street` |
| `austin-capitol.jpg` | `Texas State Capitol Austin` | `Texas Capitol dome` |
| `austin-driskill.jpg` | `Driskill Hotel Austin Texas` | `Austin historic hotel Victorian` |
| `austin-ut-tower.jpg` | `University of Texas tower Austin` | `UT Austin tower night` |
| `austin-bats.jpg` | `Congress Avenue Bridge bats Austin sunset` | `Austin bats bridge dusk` |

### Boston (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `boston-haunted.jpg` | `Boston historic cobblestone street night` | `Boston Beacon Hill night` |
| `boston-freedom-trail.jpg` | `Boston Freedom Trail brick path` | `Boston historic trail markers` |
| `boston-cemetery.jpg` | `Granary Burying Ground Boston` | `Boston colonial cemetery headstones` |
| `boston-harbor.jpg` | `Boston harbor waterfront night` | `Boston Long Wharf dusk` |
| `boston-pub.jpg` | `Boston historic pub tavern interior` | `Bell in Hand Tavern Boston` |
| `boston-beacon-hill.jpg` | `Beacon Hill Boston gas lanterns` | `Boston Beacon Hill Acorn Street` |

### Charleston (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `charleston-haunted.jpg` | `Charleston South Carolina historic night` | `Charleston SC architecture dusk` |
| `charleston-historic.jpg` | `Charleston historic district cobblestone` | `Charleston Rainbow Row` |
| `charleston-cemetery.jpg` | `Charleston cemetery Spanish moss` | `Magnolia Cemetery Charleston` |
| `charleston-dungeon.jpg` | `Old Exchange Provost Dungeon Charleston` | `dark brick underground dungeon` |
| `charleston-pub.jpg` | `Charleston historic bar tavern night` | `Charleston SC pub dark interior` |
| `charleston-carriage.jpg` | `Charleston horse carriage night` | `horse drawn carriage historic city night` |

### Chicago (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `chicago-haunted.jpg` | `Chicago architecture dark moody` | `Chicago historic building night` |
| `chicago-downtown.jpg` | `Chicago Loop night Congress Hotel` | `Chicago downtown night architecture` |
| `chicago-cemetery.jpg` | `Graceland Cemetery Chicago` | `Chicago cemetery gothic headstones` |
| `chicago-gangster.jpg` | `Chicago alley night Prohibition era` | `Chicago dark alley urban night` |
| `chicago-pub.jpg` | `Chicago historic bar speakeasy dark` | `Green Mill Chicago jazz` |
| `chicago-architecture.jpg` | `Chicago Water Tower night` | `Chicago Tribune Tower night` |

### Denver (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `denver-haunted.jpg` | `Denver Colorado historic building night` | `Denver Victorian architecture` |
| `denver-brown-palace.jpg` | `Brown Palace Hotel Denver` | `Denver grand historic hotel lobby` |
| `denver-larimer.jpg` | `Larimer Square Denver night lights` | `Denver LoDo night` |
| `denver-cheesman.jpg` | `Cheesman Park Denver` | `Denver park trees dusk` |
| `denver-molly-brown.jpg` | `Molly Brown House Museum Denver` | `Denver Victorian mansion` |
| `denver-ghost-town.jpg` | `Colorado ghost town abandoned mining` | `Colorado abandoned mining town` |

### Dublin (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `dublin-haunted.jpg` | `Dublin Ireland night dark historic` | `Dublin cobblestone alley night` |
| `dublin-medieval.jpg` | `Dublin Castle medieval Ireland` | `Dublin medieval architecture` |
| `dublin-crypt.jpg` | `church crypt dark underground stone` | `Dublin stone underground vault` |
| `dublin-kilmainham.jpg` | `Kilmainham Gaol Dublin prison` | `Dublin historic prison interior` |
| `dublin-pub.jpg` | `Dublin pub Temple Bar night` | `Irish pub dark interior` |
| `dublin-literary.jpg` | `Trinity College Dublin night` | `Dublin library historic` |

### Edinburgh (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `edinburgh-haunted.jpg` | `Edinburgh Old Town dark close` | `Edinburgh dark alley night` |
| `edinburgh-vaults.jpg` | `Edinburgh underground vaults dark` | `stone vault underground dark arch` |
| `edinburgh-graveyard.jpg` | `Greyfriars Kirkyard Edinburgh` | `Edinburgh graveyard tombstones` |
| `edinburgh-old-town.jpg` | `Edinburgh Royal Mile night` | `Edinburgh Old Town dusk` |
| `edinburgh-castle.jpg` | `Edinburgh Castle night dramatic` | `Edinburgh Castle dusk Scotland` |
| `edinburgh-pub.jpg` | `Edinburgh pub historic interior` | `Scottish pub dark wood interior` |

### London (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `london-haunted.jpg` | `London fog historic street night` | `London dark alley Victorian` |
| `london-ripper.jpg` | `Whitechapel London alley dark` | `London East End night narrow street` |
| `london-tower.jpg` | `Tower of London night` | `Tower of London dramatic` |
| `london-pub.jpg` | `London historic pub old interior` | `English pub dark wood` |
| `london-plague.jpg` | `St Paul's Cathedral London dusk` | `London Great Fire memorial` |
| `london-royal.jpg` | `Hampton Court Palace` | `Kensington Palace London` |

### Nashville (5 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `nashville-haunted.jpg` | `Nashville Tennessee historic night` | `Nashville architecture dusk` |
| `nashville-ryman.jpg` | `Ryman Auditorium Nashville` | `Nashville Broadway night` |
| `nashville-civil-war.jpg` | `Tennessee Civil War battlefield` | `Carnton Plantation Tennessee` |
| `nashville-printers-alley.jpg` | `Printers Alley Nashville night` | `Nashville dark alley neon` |
| `nashville-capitol.jpg` | `Tennessee State Capitol Nashville` | `Nashville Capitol dusk` |

### New Orleans (5 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `new-orleans-haunted.jpg` | `New Orleans French Quarter balcony night` | `New Orleans Royal Street night` |
| `new-orleans-french-quarter.jpg` | `New Orleans French Quarter street lamp` | `French Quarter wrought iron balcony` |
| `new-orleans-cemetery.jpg` | `St Louis Cemetery New Orleans tombs` | `New Orleans above ground cemetery` |
| `new-orleans-pub.jpg` | `New Orleans bar Bourbon Street dark` | `New Orleans historic bar interior` |
| `new-orleans-voodoo.jpg` | `New Orleans voodoo dark candles` | `New Orleans occult shop` |

### New York (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `new-york-haunted.jpg` | `New York brownstone night dark` | `NYC historic building night` |
| `new-york-greenwich.jpg` | `Greenwich Village NYC night` | `New York Village streets night` |
| `new-york-cemetery.jpg` | `Trinity Church Cemetery NYC` | `New York old cemetery headstones` |
| `new-york-speakeasy.jpg` | `New York speakeasy bar dark` | `NYC underground bar prohibition` |
| `new-york-brooklyn.jpg` | `Brooklyn brownstone night` | `NYC outer borough historic night` |
| `new-york-landmarks.jpg` | `New York historic landmark night` | `NYC Dakota Building night` |

### Paris (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `paris-haunted.jpg` | `Paris France night dark architecture` | `Paris street night atmospheric` |
| `paris-catacombs.jpg` | `Paris catacombs skulls underground` | `Paris catacombs dark tunnel` |
| `paris-pere-lachaise.jpg` | `Pere Lachaise Cemetery Paris` | `Paris cemetery gothic tombs` |
| `paris-revolution.jpg` | `Place de la Concorde Paris night` | `Paris Conciergerie night` |
| `paris-opera.jpg` | `Palais Garnier Paris night` | `Paris Opera house interior` |
| `paris-latin-quarter.jpg` | `Paris Latin Quarter night medieval` | `Paris narrow street night` |

### Rome (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `rome-haunted.jpg` | `Rome Italy night dark ancient` | `Rome ruins night` |
| `rome-catacombs.jpg` | `Rome catacombs dark underground` | `Rome underground tunnels` |
| `rome-colosseum.jpg` | `Colosseum Rome night` | `Roman Forum night` |
| `rome-vatican.jpg` | `Castel Sant Angelo Rome night` | `Rome Vatican area night` |
| `rome-trastevere.jpg` | `Trastevere Rome night cobblestone` | `Rome narrow street night` |
| `rome-bone-church.jpg` | `Capuchin Crypt Rome skulls bones` | `Rome ossuary bone church` |

### Salem (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `salem-haunted.jpg` | `Salem Massachusetts historic autumn` | `Salem MA witch house` |
| `salem-witch-trials.jpg` | `Salem witch trials memorial` | `Salem Massachusetts memorial stones` |
| `salem-cemetery.jpg` | `Salem Massachusetts cemetery old headstones` | `Charter Street Cemetery Salem` |
| `salem-walking.jpg` | `Salem Massachusetts historic street autumn` | `Salem MA downtown` |
| `salem-museums.jpg` | `Salem Witch Museum exterior` | `Peabody Essex Museum Salem` |
| `salem-paranormal.jpg` | `paranormal investigation dark equipment` | `ghost hunting dark room` |

### San Antonio (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `san-antonio-haunted.jpg` | `San Antonio Texas historic night` | `San Antonio architecture dusk` |
| `san-antonio-alamo.jpg` | `Alamo San Antonio night` | `Alamo Texas historic` |
| `san-antonio-missions.jpg` | `San Antonio missions historic` | `Mission San Jose San Antonio` |
| `san-antonio-riverwalk.jpg` | `San Antonio River Walk night` | `River Walk San Antonio lights` |
| `san-antonio-hotel.jpg` | `Menger Hotel San Antonio` | `San Antonio historic hotel` |
| `san-antonio-cemetery.jpg` | `San Antonio cemetery historic` | `San Fernando Cemetery San Antonio` |

### Savannah (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `savannah-haunted.jpg` | `Savannah Georgia Spanish moss dark` | `Savannah GA historic square dusk` |
| `savannah-historic.jpg` | `Savannah historic district squares` | `Savannah Georgia Victorian architecture` |
| `savannah-cemetery.jpg` | `Bonaventure Cemetery Savannah` | `Savannah cemetery Spanish moss` |
| `savannah-pub.jpg` | `Savannah Georgia pub bar night` | `Savannah River Street bar` |
| `savannah-trolley.jpg` | `Savannah Georgia trolley tour` | `Savannah historic trolley` |
| `savannah-paranormal.jpg` | `paranormal investigation ghost hunting dark` | `dark corridor investigation` |

### St. Augustine (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `st-augustine-haunted.jpg` | `St Augustine Florida historic night` | `St Augustine old city` |
| `st-augustine-old-town.jpg` | `St Augustine old town cobblestone` | `St George Street St Augustine` |
| `st-augustine-fort.jpg` | `Castillo de San Marcos St Augustine` | `St Augustine fort` |
| `st-augustine-cemetery.jpg` | `St Augustine cemetery historic` | `Florida old cemetery` |
| `st-augustine-hotel.jpg` | `St Augustine Flagler College` | `Lightner Museum St Augustine` |
| `st-augustine-trolley.jpg` | `St Augustine trolley tour` | `Old Town Trolley historic tour` |

### Washington DC (6 images)

| Filename | Search Query | Fallback Query |
|----------|-------------|----------------|
| `washington-dc-haunted.jpg` | `Washington DC night dark historic` | `DC Georgetown night cobblestone` |
| `washington-dc-white-house.jpg` | `White House Washington DC night` | `White House dusk` |
| `washington-dc-capitol.jpg` | `US Capitol Building night` | `Capitol Hill DC dusk` |
| `washington-dc-georgetown.jpg` | `Georgetown DC night cobblestone` | `Georgetown Washington DC street` |
| `washington-dc-civil-war.jpg` | `Ford's Theatre Washington DC` | `Civil War memorial DC` |
| `washington-dc-arlington.jpg` | `Arlington National Cemetery` | `Arlington Cemetery headstones rows` |

---

## Total: 108 stock photos to download

Once downloaded and verified, Claude will wire them into the hub templates
with `<img>` tags between each content section.

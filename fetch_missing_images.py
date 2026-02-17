#!/usr/bin/env python3
"""
Fetch missing hero images for CursedTours articles.

Uses official Unsplash API with curated search terms per article.
Downloads best match, converts to .webp, saves to public/images/articles/.
Updates each article JSON's featuredImage with the local path + alt text.

Usage:
    python fetch_missing_images.py              # dry run
    python fetch_missing_images.py --fetch      # download all missing
    python fetch_missing_images.py --fetch --only key-west  # filter
"""

import json, os, sys, time, glob, re
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

UNSPLASH_KEY = os.environ.get("UNSPLASH_ACCESS_KEY", "")
ARTICLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "data", "articles")
IMAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images", "articles")
TARGET_WIDTH = 800
TARGET_HEIGHT = 450
WEBP_QUALITY = 80

# ─── Curated search terms per article slug ────────────────────────────────
SEARCH_TERMS = {
    # ── Key West ──────────────────────────────────────────────────────
    "robert-the-doll-key-west-haunted-history": "antique doll creepy vintage",
    "carl-von-cosel-elena-hoyos-key-west": "key west cemetery tropical night",
    "captain-tonys-saloon-key-west-haunted": "old saloon bar interior dim lighting",
    "key-west-cemetery-ghost-stories": "tropical cemetery headstones overgrown",
    "most-haunted-places-in-key-west": "key west old town night street",
    "fort-east-martello-key-west-haunted": "old brick fort ruins overgrown",
    "key-west-shipwrecks-wreckers-history": "shipwreck ocean reef underwater",
    "key-west-pirate-history-legends": "pirate ship sailing ocean vintage",
    "hemingway-house-key-west-ghosts": "hemingway house key west colonial",
    "key-west-yellow-fever-fort-jefferson": "fort jefferson dry tortugas aerial",
    "fort-zachary-taylor-key-west-haunted": "civil war fort stone walls cannon",

    # ── American Prison History ───────────────────────────────────────
    "al-capone-alcatraz-years": "alcatraz prison cell interior",
    "alcatraz-birdman-true-story": "alcatraz island fog san francisco",
    "alcatraz-complete-history": "alcatraz island aerial view bay",
    "american-penitentiary-system-origins": "old prison corridor stone walls",
    "angola-prison-louisiana-history": "louisiana plantation road dark",
    "devil-island-french-penal-colony": "tropical island prison ruins jungle",
    "eastern-state-al-capone-cell": "eastern state penitentiary cell corridor",
    "eastern-state-paranormal-investigations": "abandoned prison dark corridor",
    "eastern-state-penitentiary-complete-history": "eastern state penitentiary ruins gothic",
    "famous-alcatraz-escape-1962": "prison bars dark escape window",
    "famous-prison-escapes-history": "prison wall barbed wire night",
    "haunted-prisons-you-can-visit": "abandoned prison hallway eerie",
    "port-arthur-convict-history": "port arthur tasmania ruins historic",
    "prison-reform-movement-history": "old prison architecture building",
    "solitary-confinement-invention-history": "solitary cell small room dark",

    # ── Pop Culture Dark History ──────────────────────────────────────
    "amityville-horror-true-story-house": "haunted house night suburban dark",
    "best-horror-movies-based-on-true-stories": "dark movie theater empty seats",
    "cursed-horror-films-poltergeist-omen": "vintage television static dark room",
    "ed-gein-real-killer-psycho-leatherface": "abandoned farmhouse rural dark",
    "frankenstein-origin-story-lake-geneva": "lake geneva castle storm lightning",
    "hocus-pocus-filming-locations-salem": "salem massachusetts historic autumn",
    "lizzie-borden-true-crime-ghost-tours": "victorian house new england dark",
    "real-haunted-hotels-you-can-stay-in": "grand old hotel hallway dim",
    "real-haunted-houses-paranormal-investigations": "paranormal investigation dark room",
    "real-mkultra-experiments-stranger-things": "abandoned laboratory dark hallway",
    "rosemarys-baby-the-dakota-nyc": "dakota building new york gothic",
    "sleepy-hollow-washington-irving-tarrytown": "covered bridge autumn fog forest",
    "stephen-king-real-maine-haunted-places": "maine lighthouse fog coastal dark",
    "the-conjuring-house-true-story": "old farmhouse new england night",
    "the-shining-stanley-hotel-true-story": "stanley hotel colorado mountain winter",
    "urban-legends-that-turned-out-to-be-true": "dark road night fog headlights",
    "why-do-people-believe-in-ghosts": "misty graveyard moonlight silhouette",

    # ── Tower of London History ───────────────────────────────────────
    "anne-boleyn-execution-tower": "tower of london courtyard stone",
    "princes-in-the-tower-mystery": "castle tower window medieval dark",
    "tower-of-london-famous-prisoners": "tower of london fortress walls",
    "tower-of-london-ravens-legend": "raven black bird dark gothic",

    # ── Gettysburg / Civil War ────────────────────────────────────────
    "battle-of-gettysburg-complete-guide": "gettysburg battlefield cannon monument",
    "civil-war-ghost-stories-south": "civil war battlefield fog monument",
    "gettysburg-address-lincoln-legacy": "lincoln memorial statue washington",
    "gettysburg-ghost-stories-battlefield": "battlefield cemetery fog headstones",
    "picketts-charge-gettysburg": "open field battlefield historic fence",

    # ── Vampire Culture ───────────────────────────────────────────────
    "dracula-novel-historical-analysis": "old book library gothic dark",
    "interview-with-the-vampire-new-orleans": "new orleans french quarter night",
    "new-nosferatu-film-2024-locations": "gothic castle silhouette moon night",
    "nosferatu-film-history": "shadow staircase noir expressionist",
    "real-vampire-legends-history": "old castle eastern europe transylvania",
    "transylvania-dracula-tourism": "bran castle romania transylvania",
    "twilight-vampire-renaissance-pop-culture": "dark forest rain pacific northwest",
    "vampire-folklore-eastern-europe": "eastern europe village church dark",
    "vampire-hunters-real-history": "wooden stake candle medieval dark",
}


def unsplash_search(query, per_page=1):
    """Search Unsplash API, return first result's download URL or None."""
    if not UNSPLASH_KEY:
        print("  ERROR: UNSPLASH_ACCESS_KEY not set in .env")
        sys.exit(1)
    url = (
        f"https://api.unsplash.com/search/photos"
        f"?query={quote_plus(query)}"
        f"&per_page={per_page}"
        f"&orientation=landscape"
        f"&content_filter=high"
    )
    req = Request(url)
    req.add_header("Authorization", f"Client-ID {UNSPLASH_KEY}")
    req.add_header("Accept-Version", "v1")
    try:
        resp = urlopen(req, timeout=15)
        data = json.loads(resp.read().decode())
        results = data.get("results", [])
        if not results:
            return None, None, None
        photo = results[0]
        # Use the "regular" size (1080w) for good quality
        dl_url = photo["urls"].get("regular", photo["urls"]["full"])
        alt = photo.get("alt_description") or photo.get("description") or query
        photographer = photo["user"]["name"]
        return dl_url, alt, photographer
    except (HTTPError, URLError) as e:
        print(f"      Unsplash API error: {e}")
        return None, None, None


def download_image(url, max_retries=3):
    """Download image from URL, return bytes or None."""
    headers = {"User-Agent": "CursedTours/1.0 (https://cursedtours.com)"}
    for attempt in range(max_retries):
        try:
            req = Request(url, headers=headers)
            resp = urlopen(req, timeout=30)
            return resp.read()
        except (HTTPError, URLError, TimeoutError) as e:
            print(f"      Attempt {attempt+1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 * (attempt + 1))
    return None


def convert_to_webp(img_bytes, width=TARGET_WIDTH, height=TARGET_HEIGHT, quality=WEBP_QUALITY):
    """Convert image bytes to .webp at target dimensions."""
    img = Image.open(BytesIO(img_bytes))
    img = img.convert("RGB")
    # Smart crop: resize maintaining aspect ratio, then center crop
    src_w, src_h = img.size
    target_ratio = width / height
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        # Source is wider — scale by height, crop width
        new_h = height
        new_w = int(src_w * (height / src_h))
    else:
        # Source is taller — scale by width, crop height
        new_w = width
        new_h = int(src_h * (width / src_w))
    img = img.resize((new_w, new_h), Image.LANCZOS)
    # Center crop
    left = (new_w - width) // 2
    top = (new_h - height) // 2
    img = img.crop((left, top, left + width, top + height))
    out = BytesIO()
    img.save(out, format="WEBP", quality=quality)
    return out.getvalue()


def pixabay_search(query):
    """Search Pixabay API as fallback, return download URL or None."""
    pix_key = os.environ.get("PIXABAY_API_KEY", "")
    if not pix_key:
        return None, None
    url = (
        f"https://pixabay.com/api/"
        f"?key={pix_key}"
        f"&q={quote_plus(query)}"
        f"&image_type=photo"
        f"&orientation=horizontal"
        f"&min_width={TARGET_WIDTH}"
        f"&per_page=3"
        f"&safesearch=true"
    )
    req = Request(url)
    req.add_header("User-Agent", "CursedTours/1.0")
    try:
        resp = urlopen(req, timeout=15)
        data = json.loads(resp.read().decode())
        hits = data.get("hits", [])
        if not hits:
            return None, None
        # Pick the first hit with largest image
        hit = hits[0]
        dl_url = hit.get("largeImageURL") or hit.get("webformatURL")
        tags = hit.get("tags", query)
        return dl_url, tags
    except (HTTPError, URLError) as e:
        print(f"      Pixabay API error: {e}")
        return None, None


def get_missing_articles():
    """Return list of (slug, title, cats) for articles missing hero images."""
    missing = []
    for f in sorted(glob.glob(os.path.join(ARTICLES_DIR, "*.json"))):
        slug = os.path.splitext(os.path.basename(f))[0]
        img_path = os.path.join(IMAGES_DIR, slug + ".webp")
        if not os.path.exists(img_path):
            with open(f, "r", encoding="utf-8") as jf:
                data = json.load(jf)
            cats = [c["slug"] for c in data.get("categories", [])]
            missing.append((slug, data.get("title", ""), cats))
    return missing


def update_article_json(slug):
    """Update article JSON featuredImage to point to local .webp."""
    json_path = os.path.join(ARTICLES_DIR, f"{slug}.json")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["featuredImage"] = {
        "sourceUrl": f"/images/articles/{slug}.webp",
        "altText": data.get("title", slug),
        "width": TARGET_WIDTH,
        "height": TARGET_HEIGHT,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def auto_query(slug):
    """Auto-generate search query from slug when no curated term exists."""
    query = slug.replace("-", " ")
    stops = {"the","a","an","of","in","at","and","or","to","from",
             "true","story","complete","guide","history","most","you","can"}
    words = [w for w in query.split() if w not in stops]
    return " ".join(words[:5])


def main():
    do_fetch = "--fetch" in sys.argv
    only_filter = None
    if "--only" in sys.argv:
        idx = sys.argv.index("--only")
        if idx + 1 < len(sys.argv):
            only_filter = sys.argv[idx + 1]

    os.makedirs(IMAGES_DIR, exist_ok=True)
    missing = get_missing_articles()

    if only_filter:
        missing = [(s, t, c) for s, t, c in missing
                    if only_filter in s or only_filter in " ".join(c)]

    print(f"\n{'='*62}")
    print(f"  CURSEDTOURS IMAGE FETCHER")
    print(f"  Mode: {'FETCH' if do_fetch else 'DRY RUN'}")
    print(f"  Unsplash key: {'set' if UNSPLASH_KEY else 'MISSING'}")
    print(f"  Pixabay key:  {'set' if os.environ.get('PIXABAY_API_KEY') else 'MISSING'}")
    print(f"  Articles missing images: {len(missing)}")
    print(f"{'='*62}\n")

    fetched = 0
    skipped = 0
    failed = 0

    for slug, title, cats in missing:
        query = SEARCH_TERMS.get(slug) or auto_query(slug)
        if slug not in SEARCH_TERMS:
            print(f"  ! No curated terms for {slug}, auto: \"{query}\"")

        status = "FETCH" if do_fetch else "WOULD FETCH"
        print(f"  [{status}] {slug}")
        print(f"           Query: {query}")

        if not do_fetch:
            skipped += 1
            continue

        # Try Unsplash first, fall back to Pixabay
        dl_url = None
        alt_text = title
        source = None

        if UNSPLASH_KEY:
            dl_url, alt, photographer = unsplash_search(query)
            if dl_url:
                source = "Unsplash"
                if alt:
                    alt_text = alt

        if not dl_url:
            dl_url, tags = pixabay_search(query)
            if dl_url:
                source = "Pixabay"

        if not dl_url:
            print(f"           x No results from either API")
            failed += 1
            continue

        print(f"           Source: {source}")
        img_bytes = download_image(dl_url)
        if not img_bytes or len(img_bytes) < 5000:
            print(f"           x Download failed or too small")
            failed += 1
            continue

        webp_bytes = convert_to_webp(img_bytes)
        out_path = os.path.join(IMAGES_DIR, f"{slug}.webp")
        with open(out_path, "wb") as f:
            f.write(webp_bytes)
        update_article_json(slug)
        print(f"           OK Saved ({len(webp_bytes)//1024}KB) -> {slug}.webp")
        fetched += 1

        # Rate limit: 50 req/hr for Unsplash free tier
        time.sleep(2.0)

    print(f"\n{'='*62}")
    print(f"  RESULTS")
    if do_fetch:
        print(f"  Fetched:  {fetched}")
        print(f"  Failed:   {failed}")
    else:
        print(f"  Would fetch: {skipped} images")
        print(f"  Run with --fetch to download")
    print(f"{'='*62}\n")


if __name__ == "__main__":
    main()

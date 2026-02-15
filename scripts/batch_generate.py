#!/usr/bin/env python3
"""
Batch generate featured images for blog articles using DALL-E 3.

Reads article JSON files, crafts prompts from their content, generates images,
and updates the article's featuredImage field.

Usage:
    python3 batch_generate.py \
        --articles-dir /path/to/articles/ \
        --output-dir /path/to/public/images/articles/ \
        --style "dark atmospheric" \
        [--skip-existing] [--dry-run] [--api-key sk-...] [--yes]
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime

# Import shared utilities from generate_image.py
sys.path.insert(0, str(Path(__file__).parent))
from generate_image import find_api_key, convert_png_to_web

class HTMLTextExtractor(HTMLParser):
    """Extract plain text from HTML content."""
    def __init__(self):
        super().__init__()
        self.result = []
        self.skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip = True

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = False

    def handle_data(self, data):
        if not self.skip:
            self.result.append(data)

    def get_text(self):
        return ' '.join(self.result)


def html_to_text(html):
    """Convert HTML to plain text."""
    extractor = HTMLTextExtractor()
    extractor.feed(html or "")
    return extractor.get_text()

def extract_keywords(text, max_words=10):
    """Extract the most descriptive keywords from text content."""
    stop_words = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "dare", "ought",
        "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
        "as", "into", "through", "during", "before", "after", "above", "below",
        "between", "out", "off", "over", "under", "again", "further", "then",
        "once", "here", "there", "when", "where", "why", "how", "all", "both",
        "each", "few", "more", "most", "other", "some", "such", "no", "nor",
        "not", "only", "own", "same", "so", "than", "too", "very", "just",
        "because", "but", "and", "or", "if", "while", "that", "this", "these",
        "those", "it", "its", "they", "them", "their", "we", "our", "you",
        "your", "he", "him", "his", "she", "her", "what", "which", "who",
        "whom", "about", "also", "many", "much", "even", "still", "well",
        "back", "get", "got", "one", "two", "first", "new", "now", "way",
        "make", "like", "time", "long", "look", "come", "think", "know",
        "take", "people", "see", "say", "said", "going", "thing", "things",
    }
    words = re.findall(r'[a-zA-Z]{3,}', text.lower())
    keywords = [w for w in words if w not in stop_words]
    seen = set()
    unique = []
    for w in keywords:
        if w not in seen:
            seen.add(w)
            unique.append(w)
    return unique[:max_words]

def load_style_profiles():
    """Load city/category style profiles from JSON file."""
    profile_path = Path(__file__).parent / "style_profiles.json"
    if profile_path.exists():
        data = json.loads(profile_path.read_text(encoding="utf-8"))
        # Remove metadata keys
        return {k: v for k, v in data.items() if not k.startswith("_")}
    return {}

STYLE_PROFILES = load_style_profiles()

def extract_visual_subject(title):
    """Extract the core visual subject from an article title, stripping filler words and subtitles."""
    # Strip subtitle after colon
    subject = title.split(":")[0].strip()
    # Remove common leading fillers
    for filler in ["The ", "A ", "An ", "How to ", "Why ", "What ", "Guide to ", "Top ",
                    "Most ", "Best ", "How ", "Where ", "When ", "History of "]:
        if subject.startswith(filler):
            subject = subject[len(filler):]
            break
    # Remove trailing location qualifiers that repeat the category
    for suffix in ["in New Orleans", "in Paris", "in Rome", "in London", "in Chicago",
                   "in Edinburgh", "in Dublin", "in Savannah", "in Nashville",
                   "in Boston", "in Charleston", "in Denver", "in Austin",
                   "in San Antonio", "in St. Augustine", "in New York",
                   "in Washington DC", "After Salem"]:
        if subject.endswith(suffix):
            subject = subject[:-(len(suffix))].strip().rstrip(",")
            break
    # Remove possessive city names that duplicate category (e.g. "Charleston's Civil War Ghosts")
    import re
    subject = re.sub(r"^(Austin|Boston|Charleston|Chicago|Denver|Dublin|Edinburgh|London|Nashville|New Orleans|New York|Paris|Rome|Salem|San Antonio|Savannah|St\. Augustine|Washington DC)('s?\s+)", "", subject, flags=re.IGNORECASE)
    return subject.strip()

def craft_prompt(article, style="dark atmospheric"):
    """Craft a DALL-E prompt using city-specific style profiles for high-quality results."""
    title = article.get("title", "")
    categories = [c.get("name", "") for c in article.get("categories", [])]
    content_text = html_to_text(article.get("content", ""))[:800]

    # Find matching style profile
    profile = None
    category_name = ""
    for cat in categories:
        if cat in STYLE_PROFILES:
            profile = STYLE_PROFILES[cat]
            category_name = cat
            break

    subject = extract_visual_subject(title)
    content_keywords = extract_keywords(content_text, max_words=5)
    title_words = set(title.lower().split())
    extra_keywords = [k for k in content_keywords if k not in title_words][:3]

    if profile:
        # Use rich city-specific style profile
        prompt_parts = [
            f"Cinematic {style} photograph of {subject.lower()}",
            profile["setting"],
            profile["architecture"],
            profile["atmosphere"],
            f"color palette: {profile['palette']}",
            profile["lighting"],
        ]
        if extra_keywords:
            prompt_parts.append(f"featuring {', '.join(extra_keywords)}")
        prompt_parts.append("cinematic composition, high quality, detailed, 4K, no text or watermarks")
    else:
        # Fallback for uncategorized articles
        prompt_parts = [
            f"Dark {style} photograph of {subject.lower()}",
            "gothic atmosphere, moody tones",
        ]
        if extra_keywords:
            prompt_parts.append(f"featuring {', '.join(extra_keywords)}")
        prompt_parts.append("cinematic lighting, high quality, detailed, 4K, no text or watermarks")

    prompt = ", ".join(prompt_parts)
    if len(prompt) > 900:
        prompt = prompt[:897] + "..."
    return prompt

def generate_single(prompt, output_path, api_key, size="1792x1024", quality="standard"):
    """Generate one image and save it. Returns result dict with 'error' key on failure."""
    payload = json.dumps({
        "model": "dall-e-3", "prompt": prompt, "n": 1,
        "size": size, "quality": quality, "response_format": "url"
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        try:
            err = json.loads(error_body)
            msg = err.get("error", {}).get("message", str(e.code))
        except json.JSONDecodeError:
            msg = str(e.code)
        if e.code == 429:
            print(f"  Rate limited. Waiting 60s...")
            time.sleep(60)
            try:
                req2 = urllib.request.Request(
                    "https://api.openai.com/v1/images/generations",
                    data=payload,
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}
                )
                with urllib.request.urlopen(req2, timeout=120) as resp:
                    result = json.loads(resp.read().decode("utf-8"))
            except Exception as e2:
                return {"error": f"Rate limit retry failed: {e2}"}
        else:
            return {"error": f"API error {e.code}: {msg}"}
    except Exception as e:
        return {"error": str(e)}
    image_url = result["data"][0]["url"]
    revised_prompt = result["data"][0].get("revised_prompt", "")

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    tmp_png = output.with_suffix(".tmp.png")
    try:
        urllib.request.urlretrieve(image_url, str(tmp_png))
    except Exception as e:
        return {"error": f"Download failed: {e}"}

    if output.suffix.lower() in (".webp", ".jpg", ".jpeg", ".png"):
        if convert_png_to_web(tmp_png, output):
            tmp_png.unlink()
        else:
            tmp_png.rename(output)
    else:
        tmp_png.rename(output)

    return {"path": str(output), "size_bytes": output.stat().st_size, "revised_prompt": revised_prompt}


def load_progress(progress_file):
    """Load set of completed slugs from progress file."""
    if progress_file.exists():
        try:
            data = json.loads(progress_file.read_text())
            return set(data.get("completed", []))
        except (json.JSONDecodeError, KeyError):
            return set()
    return set()


def save_progress(progress_file, completed_slugs):
    """Save completed slugs to progress file for resume capability."""
    progress_file.write_text(json.dumps({
        "completed": sorted(completed_slugs),
        "updated": datetime.now().isoformat()
    }, indent=2))

def main():
    parser = argparse.ArgumentParser(description="Batch generate featured images for blog articles")
    parser.add_argument("--articles-dir", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--style", default="atmospheric")
    parser.add_argument("--size", default="landscape", choices=["square", "landscape", "portrait"])
    parser.add_argument("--quality", default="standard", choices=["standard", "hd"])
    parser.add_argument("--skip-existing", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--yes", action="store_true")
    parser.add_argument("--api-key", default=None)
    parser.add_argument("--delay", type=float, default=2.0)
    parser.add_argument("--filter", default=None)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--image-url-prefix", default="/images/articles/")
    args = parser.parse_args()

    api_key = find_api_key(args.api_key)
    if not api_key and not args.dry_run:
        print("ERROR: No OpenAI API key found.")
        sys.exit(1)

    articles_dir = Path(args.articles_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    SIZE_MAP = {"square": "1024x1024", "landscape": "1792x1024", "portrait": "1024x1792"}
    dall_e_size = SIZE_MAP[args.size]

    progress_file = output_dir / ".batch_progress.json"
    completed_slugs = load_progress(progress_file)
    json_files = sorted(articles_dir.glob("*.json"))
    print(f"Found {len(json_files)} article files in {articles_dir}")

    if args.filter:
        json_files = [f for f in json_files if args.filter in f.stem]
        print(f"Filtered to {len(json_files)} articles matching '{args.filter}'")

    to_process = []
    for jf in json_files:
        article = json.loads(jf.read_text(encoding="utf-8"))
        slug = article.get("slug", jf.stem)
        if slug in completed_slugs:
            continue
        if args.skip_existing:
            local_file = output_dir / f"{slug}.webp"
            if local_file.exists():
                continue
        to_process.append((jf, article, slug))

    if args.limit > 0:
        to_process = to_process[:args.limit]

    print(f"Articles to process: {len(to_process)}")
    print(f"Already completed (from progress): {len(completed_slugs)}")

    if not to_process:
        print("Nothing to do!")
        return

    cost_map = {
        ("standard", "square"): 0.04, ("standard", "landscape"): 0.08, ("standard", "portrait"): 0.08,
        ("hd", "square"): 0.08, ("hd", "landscape"): 0.12, ("hd", "portrait"): 0.12,
    }
    cost_per = cost_map.get((args.quality, args.size), 0.08)
    estimated_cost = len(to_process) * cost_per
    print(f"\nEstimated cost: ${estimated_cost:.2f} ({len(to_process)} images x ${cost_per:.2f}/each)")

    if not args.dry_run and not args.yes:
        confirm = input("Proceed? [y/N] ").strip().lower()
        if confirm not in ("y", "yes"):
            print("Aborted.")
            return
    results = {"success": [], "skipped": [], "failed": []}
    log_entries = []

    for i, (jf, article, slug) in enumerate(to_process, 1):
        title = article.get("title", slug)
        prompt = craft_prompt(article, args.style)

        if args.dry_run:
            print(f"\n[{i}/{len(to_process)}] {title}")
            print(f"  Prompt: {prompt}")
            log_entries.append({"slug": slug, "title": title, "prompt": prompt, "status": "dry_run"})
            continue

        print(f"\n[{i}/{len(to_process)}] Generating: {title}")
        print(f"  Prompt: {prompt[:80]}...")

        out_path = output_dir / f"{slug}.webp"
        result = generate_single(prompt, out_path, api_key, dall_e_size, args.quality)

        if "error" in result:
            print(f"  FAILED: {result['error']}")
            results["failed"].append({"slug": slug, "error": result["error"]})
            log_entries.append({"slug": slug, "title": title, "prompt": prompt, "status": "failed", "error": result["error"]})
        else:
            print(f"  Saved: {out_path} ({result['size_bytes']:,} bytes)")
            url_prefix = args.image_url_prefix.rstrip("/")
            article["featuredImage"] = {
                "sourceUrl": f"{url_prefix}/{slug}.webp",
                "altText": result.get("revised_prompt", title)[:200]
            }
            jf.write_text(json.dumps(article, indent=2, ensure_ascii=False), encoding="utf-8")
            results["success"].append(slug)
            completed_slugs.add(slug)
            save_progress(progress_file, completed_slugs)
            log_entries.append({"slug": slug, "title": title, "prompt": prompt, "status": "success",
                               "size_bytes": result["size_bytes"], "revised_prompt": result.get("revised_prompt", "")})

        if i < len(to_process):
            time.sleep(args.delay)
    print(f"\n{'='*60}")
    print(f"BATCH COMPLETE")
    print(f"  Generated: {len(results['success'])}")
    print(f"  Failed:    {len(results['failed'])}")

    if results["failed"]:
        print(f"\nFailed articles:")
        for f in results["failed"]:
            print(f"  - {f['slug']}: {f['error']}")

    actual_cost = len(results["success"]) * cost_per
    print(f"\nActual cost: ${actual_cost:.2f}")

    log_file = output_dir / f"batch_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "args": {"articles_dir": str(articles_dir), "output_dir": str(output_dir),
                 "style": args.style, "size": args.size, "quality": args.quality},
        "summary": {"total_processed": len(to_process), "success": len(results["success"]),
                     "failed": len(results["failed"]), "estimated_cost": f"${actual_cost:.2f}"},
        "entries": log_entries,
    }
    log_file.write_text(json.dumps(log_data, indent=2, ensure_ascii=False))
    print(f"\nLog saved: {log_file}")


if __name__ == "__main__":
    main()
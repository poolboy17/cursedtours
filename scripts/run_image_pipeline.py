#!/usr/bin/env python3
"""
Full image generation pipeline for CursedTours blog.

Stages:
  1. GENERATE  - Batch generate missing images using DALL-E + style profiles
  2. VALIDATE  - QC check every image (exists, valid webp, size, dimensions)
  3. ATTACH    - Update article JSON featuredImage fields
  4. VERIFY    - Confirm all articles have valid image references to real files
  5. FIX       - Retry any failed/invalid images from stages 2 or 4
  6. COMMIT    - Git add + commit images and updated JSONs

Usage:
  python run_image_pipeline.py --project-dir <project-path> [--dry-run] [--yes] [--skip-generate] [--skip-commit]
"""

import argparse
import json
import os
import sys
import time
import subprocess
from pathlib import Path
from datetime import datetime

# Add scripts dir to path
sys.path.insert(0, str(Path(__file__).parent))
from generate_image import generate_image, find_api_key, convert_png_to_web
from batch_generate import craft_prompt, load_style_profiles


# ── Constants ──────────────────────────────────────────────
IMAGE_EXT = ".webp"
IMAGE_URL_PREFIX = "/images/articles"
COST_PER_IMAGE = 0.08  # standard quality, landscape
DELAY_BETWEEN = 2.0    # seconds between API calls
MAX_RETRIES = 2


# ── Helpers ────────────────────────────────────────────────
def log(stage, msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] [{stage}] {level}: {msg}")


def load_articles(articles_dir):
    """Load all article JSON files. Returns list of (path, data) tuples."""
    articles = []
    for f in sorted(Path(articles_dir).glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            articles.append((f, data))
        except (json.JSONDecodeError, IOError) as e:
            log("LOAD", f"Failed to load {f.name}: {e}", "ERROR")
    return articles


# ── Stage 1: GENERATE ──────────────────────────────────────
def stage_generate(articles, images_dir, api_key, dry_run=False, yes=False):
    """Generate missing images for all articles."""
    log("GENERATE", f"Scanning {len(articles)} articles for missing images...")

    to_generate = []
    for fpath, data in articles:
        slug = data.get("slug", fpath.stem)
        img_path = images_dir / f"{slug}{IMAGE_EXT}"
        if not img_path.exists():
            to_generate.append((fpath, data, slug, img_path))

    log("GENERATE", f"{len(to_generate)} images to generate, {len(articles) - len(to_generate)} already exist")

    if not to_generate:
        return {"generated": [], "failed": [], "skipped": len(articles)}

    cost = len(to_generate) * COST_PER_IMAGE
    log("GENERATE", f"Estimated cost: ${cost:.2f} ({len(to_generate)} x ${COST_PER_IMAGE})")

    if dry_run:
        log("GENERATE", "DRY RUN - showing prompts only")
        for fpath, data, slug, img_path in to_generate:
            prompt = craft_prompt(data)
            log("GENERATE", f"  {slug}: {prompt[:120]}...")
        return {"generated": [], "failed": [], "skipped": len(articles), "dry_run": True}

    if not yes:
        confirm = input(f"Generate {len(to_generate)} images for ~${cost:.2f}? [y/N] ").strip().lower()
        if confirm not in ("y", "yes"):
            log("GENERATE", "Aborted by user")
            sys.exit(0)

    generated = []
    failed = []
    for i, (fpath, data, slug, img_path) in enumerate(to_generate, 1):
        prompt = craft_prompt(data)
        log("GENERATE", f"[{i}/{len(to_generate)}] {slug}")

        try:
            result = generate_image(
                prompt=prompt,
                output_path=str(img_path),
                size="landscape",
                quality="standard",
                api_key=api_key
            )
            generated.append({"slug": slug, "path": str(img_path), "size": result["size_bytes"], "prompt": prompt})
            log("GENERATE", f"  OK: {result['size_bytes']:,} bytes")
        except Exception as e:
            failed.append({"slug": slug, "error": str(e), "prompt": prompt})
            log("GENERATE", f"  FAILED: {e}", "ERROR")

        if i < len(to_generate):
            time.sleep(DELAY_BETWEEN)

    log("GENERATE", f"Done: {len(generated)} generated, {len(failed)} failed")
    return {"generated": generated, "failed": failed, "skipped": len(articles) - len(to_generate)}


# ── Stage 2: VALIDATE ──────────────────────────────────────
def stage_validate(articles, images_dir):
    """QC check every image: exists, valid format, reasonable size, correct dimensions."""
    log("VALIDATE", f"Checking {len(articles)} article images...")

    valid = []
    issues = []

    for fpath, data in articles:
        slug = data.get("slug", fpath.stem)
        img_path = images_dir / f"{slug}{IMAGE_EXT}"

        if not img_path.exists():
            issues.append({"slug": slug, "issue": "MISSING", "detail": f"No image at {img_path}"})
            continue

        size = img_path.stat().st_size

        # Size checks
        if size < 5000:
            issues.append({"slug": slug, "issue": "TOO_SMALL", "detail": f"{size:,} bytes - likely broken/empty"})
            continue
        if size > 2_000_000:
            issues.append({"slug": slug, "issue": "TOO_LARGE", "detail": f"{size:,} bytes - may not be compressed"})
            continue

        # Validate it's actually a readable image
        try:
            from PIL import Image
            img = Image.open(img_path)
            w, h = img.size
            img.close()

            if w < 100 or h < 100:
                issues.append({"slug": slug, "issue": "BAD_DIMENSIONS", "detail": f"{w}x{h} too small"})
                continue
            if w < 1000:
                issues.append({"slug": slug, "issue": "LOW_RES", "detail": f"{w}x{h} lower than expected"})
                # Warning, not a failure - still add to valid
                valid.append({"slug": slug, "path": str(img_path), "size": size, "dimensions": f"{w}x{h}", "warning": "low_res"})
                continue

            valid.append({"slug": slug, "path": str(img_path), "size": size, "dimensions": f"{w}x{h}"})
        except ImportError:
            # No Pillow - just check file size
            log("VALIDATE", "Pillow not available, skipping dimension checks", "WARN")
            valid.append({"slug": slug, "path": str(img_path), "size": size, "dimensions": "unknown"})
        except Exception as e:
            issues.append({"slug": slug, "issue": "CORRUPT", "detail": f"Cannot open: {e}"})

    log("VALIDATE", f"Valid: {len(valid)}, Issues: {len(issues)}")
    for item in issues:
        log("VALIDATE", f"  {item['issue']}: {item['slug']} - {item['detail']}", "WARN")

    return {"valid": valid, "issues": issues}


# ── Stage 3: ATTACH ────────────────────────────────────────
def stage_attach(articles, images_dir):
    """Update article JSON files with featuredImage pointing to generated images."""
    log("ATTACH", f"Updating featuredImage in {len(articles)} articles...")

    updated = []
    skipped = []

    for fpath, data in articles:
        slug = data.get("slug", fpath.stem)
        img_path = images_dir / f"{slug}{IMAGE_EXT}"

        if not img_path.exists():
            skipped.append(slug)
            continue

        image_url = f"{IMAGE_URL_PREFIX}/{slug}{IMAGE_EXT}"
        title = data.get("title", slug)

        existing = data.get("featuredImage", {})
        existing_url = existing.get("sourceUrl", "") if isinstance(existing, dict) else ""

        if existing_url == image_url:
            # Already correctly set
            continue

        data["featuredImage"] = {
            "sourceUrl": image_url,
            "altText": title[:200]
        }
        fpath.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        updated.append(slug)

    log("ATTACH", f"Updated: {len(updated)}, Skipped (no image): {len(skipped)}")
    return {"updated": updated, "skipped": skipped}


# ── Stage 4: VERIFY ────────────────────────────────────────
def stage_verify(articles, images_dir):
    """Final check: every article has a featuredImage pointing to an existing file."""
    log("VERIFY", f"Verifying all {len(articles)} articles...")

    ok = []
    problems = []

    for fpath, data in articles:
        slug = data.get("slug", fpath.stem)
        fi = data.get("featuredImage", {})

        if not fi or not isinstance(fi, dict):
            problems.append({"slug": slug, "problem": "NO_FEATURED_IMAGE", "detail": "featuredImage field missing or empty"})
            continue

        url = fi.get("sourceUrl", "")
        if not url:
            problems.append({"slug": slug, "problem": "EMPTY_URL", "detail": "sourceUrl is empty"})
            continue

        # Check the referenced file actually exists on disk
        # URL like /images/articles/slug.webp -> public/images/articles/slug.webp
        relative = url.lstrip("/")
        expected_path = images_dir.parent.parent / relative  # images_dir is public/images/articles, go up to public/
        if not expected_path.exists():
            # Try direct path in images_dir
            filename = Path(url).name
            direct_path = images_dir / filename
            if not direct_path.exists():
                problems.append({"slug": slug, "problem": "FILE_NOT_FOUND", "detail": f"{url} -> file not on disk"})
                continue

        ok.append(slug)

    log("VERIFY", f"Verified: {len(ok)} OK, {len(problems)} problems")
    for p in problems:
        log("VERIFY", f"  {p['problem']}: {p['slug']} - {p['detail']}", "WARN")

    return {"ok": ok, "problems": problems}


# ── Stage 5: FIX ───────────────────────────────────────────
def stage_fix(validate_issues, verify_problems, articles, images_dir, api_key, dry_run=False):
    """Retry generation for any images that failed validation or verification."""
    # Collect all slugs that need fixing
    fix_slugs = set()
    for item in validate_issues:
        if item["issue"] in ("MISSING", "TOO_SMALL", "CORRUPT", "BAD_DIMENSIONS"):
            fix_slugs.add(item["slug"])
    for item in verify_problems:
        if item["problem"] in ("NO_FEATURED_IMAGE", "FILE_NOT_FOUND"):
            fix_slugs.add(item["slug"])

    if not fix_slugs:
        log("FIX", "Nothing to fix!")
        return {"fixed": [], "still_failed": []}

    log("FIX", f"{len(fix_slugs)} images need regeneration")

    if dry_run:
        log("FIX", "DRY RUN - would regenerate:")
        for s in sorted(fix_slugs):
            log("FIX", f"  {s}")
        return {"fixed": [], "still_failed": list(fix_slugs), "dry_run": True}

    # Build lookup of articles by slug
    article_map = {}
    for fpath, data in articles:
        slug = data.get("slug", fpath.stem)
        article_map[slug] = (fpath, data)

    fixed = []
    still_failed = []

    for i, slug in enumerate(sorted(fix_slugs), 1):
        if slug not in article_map:
            log("FIX", f"  {slug}: no article found, skipping", "WARN")
            still_failed.append(slug)
            continue

        fpath, data = article_map[slug]
        img_path = images_dir / f"{slug}{IMAGE_EXT}"
        prompt = craft_prompt(data)

        # Delete broken file if it exists
        if img_path.exists():
            img_path.unlink()

        for attempt in range(1, MAX_RETRIES + 1):
            log("FIX", f"[{i}/{len(fix_slugs)}] {slug} (attempt {attempt}/{MAX_RETRIES})")
            try:
                result = generate_image(
                    prompt=prompt,
                    output_path=str(img_path),
                    size="landscape",
                    quality="standard",
                    api_key=api_key
                )
                fixed.append(slug)
                log("FIX", f"  Fixed: {result['size_bytes']:,} bytes")
                break
            except Exception as e:
                log("FIX", f"  Attempt {attempt} failed: {e}", "ERROR")
                if attempt < MAX_RETRIES:
                    time.sleep(5)
        else:
            still_failed.append(slug)
            log("FIX", f"  GAVE UP on {slug} after {MAX_RETRIES} attempts", "ERROR")

        if i < len(fix_slugs):
            time.sleep(DELAY_BETWEEN)

    log("FIX", f"Fixed: {len(fixed)}, Still failed: {len(still_failed)}")
    return {"fixed": fixed, "still_failed": still_failed}


# ── Stage 6: COMMIT ────────────────────────────────────────
def stage_commit(project_dir, dry_run=False):
    """Git add and commit all generated images and updated article JSONs."""
    log("COMMIT", "Staging files for git commit...")

    os.chdir(project_dir)

    # Stage images (force-add in case global gitignore matches image patterns)
    img_result = subprocess.run(
        ["git", "add", "-f", "public/images/articles/"],
        capture_output=True, text=True, cwd=project_dir
    )
    if img_result.returncode != 0:
        log("COMMIT", f"git add images failed: {img_result.stderr}", "ERROR")
        return {"committed": False, "error": img_result.stderr}

    # Stage article JSONs (force-add because global gitignore matches data/)
    json_result = subprocess.run(
        ["git", "add", "-f", "src/data/articles/"],
        capture_output=True, text=True, cwd=project_dir
    )
    if json_result.returncode != 0:
        log("COMMIT", f"git add articles failed: {json_result.stderr}", "ERROR")
        return {"committed": False, "error": json_result.stderr}

    # Check what's staged
    status = subprocess.run(
        ["git", "diff", "--cached", "--stat"],
        capture_output=True, text=True, cwd=project_dir
    )
    log("COMMIT", f"Staged changes:\n{status.stdout}")

    if not status.stdout.strip():
        log("COMMIT", "Nothing to commit")
        return {"committed": False, "reason": "no_changes"}

    if dry_run:
        log("COMMIT", "DRY RUN - would commit the above changes")
        # Unstage
        subprocess.run(["git", "reset", "HEAD", "."], capture_output=True, cwd=project_dir)
        return {"committed": False, "dry_run": True}

    # Commit
    msg = f"Add DALL-E generated featured images for blog articles\n\nGenerated webp images for article featured images using\nDALL-E 3 with city-specific style profiles.\n\nGenerated: {datetime.now().isoformat()}"
    commit_result = subprocess.run(
        ["git", "commit", "-m", msg],
        capture_output=True, text=True, cwd=project_dir
    )
    if commit_result.returncode != 0:
        log("COMMIT", f"git commit failed: {commit_result.stderr}", "ERROR")
        return {"committed": False, "error": commit_result.stderr}

    log("COMMIT", f"Committed: {commit_result.stdout.strip()}")
    return {"committed": True, "message": msg}


# ── Main Pipeline ──────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Full image generation pipeline for CursedTours")
    parser.add_argument("--project-dir", required=True, help="Path to cursedtours-astro project root")
    parser.add_argument("--dry-run", action="store_true", help="Show what would happen without generating or committing")
    parser.add_argument("--yes", action="store_true", help="Skip confirmation prompts")
    parser.add_argument("--skip-generate", action="store_true", help="Skip generation, run QC/attach/verify only")
    parser.add_argument("--skip-commit", action="store_true", help="Skip git commit at the end")
    parser.add_argument("--api-key", default=None)
    args = parser.parse_args()

    project = Path(args.project_dir)
    articles_dir = project / "src" / "data" / "articles"
    images_dir = project / "public" / "images" / "articles"

    if not articles_dir.exists():
        log("MAIN", f"Articles dir not found: {articles_dir}", "ERROR")
        sys.exit(1)

    images_dir.mkdir(parents=True, exist_ok=True)

    # Change to project dir so .env is found
    os.chdir(project)
    api_key = find_api_key(args.api_key)
    if not api_key and not args.dry_run and not args.skip_generate:
        log("MAIN", "No OpenAI API key found", "ERROR")
        sys.exit(1)

    # Load all articles
    articles = load_articles(articles_dir)
    log("MAIN", f"Loaded {len(articles)} articles")
    log("MAIN", "=" * 60)

    # ── Stage 1: Generate ──
    if not args.skip_generate:
        log("MAIN", "STAGE 1: GENERATE")
        gen_result = stage_generate(articles, images_dir, api_key, args.dry_run, args.yes)
        log("MAIN", f"  Generated: {len(gen_result['generated'])}, Failed: {len(gen_result['failed'])}")
    else:
        log("MAIN", "STAGE 1: GENERATE (skipped)")
        gen_result = {"generated": [], "failed": []}
    log("MAIN", "=" * 60)

    # ── Stage 2: Validate ──
    log("MAIN", "STAGE 2: VALIDATE")
    val_result = stage_validate(articles, images_dir)
    log("MAIN", f"  Valid: {len(val_result['valid'])}, Issues: {len(val_result['issues'])}")
    log("MAIN", "=" * 60)

    # ── Stage 3: Attach ──
    log("MAIN", "STAGE 3: ATTACH")
    # Reload articles in case generation updated them
    articles = load_articles(articles_dir)
    attach_result = stage_attach(articles, images_dir)
    log("MAIN", f"  Updated: {len(attach_result['updated'])}, Skipped: {len(attach_result['skipped'])}")
    log("MAIN", "=" * 60)

    # ── Stage 4: Verify ──
    log("MAIN", "STAGE 4: VERIFY")
    articles = load_articles(articles_dir)
    verify_result = stage_verify(articles, images_dir)
    log("MAIN", f"  OK: {len(verify_result['ok'])}, Problems: {len(verify_result['problems'])}")
    log("MAIN", "=" * 60)

    # ── Stage 5: Fix ──
    needs_fix = len(val_result["issues"]) > 0 or len(verify_result["problems"]) > 0
    if needs_fix and not args.skip_generate:
        log("MAIN", "STAGE 5: FIX (retrying failures)")
        fix_result = stage_fix(
            val_result["issues"], verify_result["problems"],
            articles, images_dir, api_key, args.dry_run
        )
        log("MAIN", f"  Fixed: {len(fix_result['fixed'])}, Still failed: {len(fix_result['still_failed'])}")

        # Re-run attach and verify after fixes
        if fix_result["fixed"]:
            log("MAIN", "Re-running ATTACH and VERIFY after fixes...")
            articles = load_articles(articles_dir)
            stage_attach(articles, images_dir)
            articles = load_articles(articles_dir)
            verify_result = stage_verify(articles, images_dir)
    else:
        log("MAIN", "STAGE 5: FIX (nothing to fix)" if not needs_fix else "STAGE 5: FIX (skipped - generate disabled)")
        fix_result = {"fixed": [], "still_failed": []}
    log("MAIN", "=" * 60)

    # ── Stage 6: Commit ──
    if not args.skip_commit:
        log("MAIN", "STAGE 6: COMMIT")
        commit_result = stage_commit(project, args.dry_run)
    else:
        log("MAIN", "STAGE 6: COMMIT (skipped)")
        commit_result = {"committed": False, "reason": "skipped"}
    log("MAIN", "=" * 60)

    # ── Final Report ──
    log("MAIN", "PIPELINE COMPLETE")
    log("MAIN", f"  Articles:    {len(articles)}")
    log("MAIN", f"  Generated:   {len(gen_result['generated'])}")
    log("MAIN", f"  Valid:       {len(val_result['valid'])}")
    log("MAIN", f"  Attached:    {len(attach_result['updated'])}")
    log("MAIN", f"  Verified:    {len(verify_result['ok'])}/{len(articles)}")
    if fix_result["still_failed"]:
        log("MAIN", f"  STILL FAILED: {fix_result['still_failed']}", "ERROR")
    if verify_result["problems"]:
        log("MAIN", f"  UNRESOLVED:  {len(verify_result['problems'])} articles missing images", "WARN")
    actual_cost = len(gen_result["generated"]) * COST_PER_IMAGE
    fix_cost = len(fix_result.get("fixed", [])) * COST_PER_IMAGE
    log("MAIN", f"  Total cost:  ${actual_cost + fix_cost:.2f}")

    # Save full report
    report = {
        "timestamp": datetime.now().isoformat(),
        "articles_total": len(articles),
        "generate": gen_result,
        "validate": val_result,
        "attach": attach_result,
        "verify": verify_result,
        "fix": fix_result,
        "commit": commit_result,
        "cost": f"${actual_cost + fix_cost:.2f}"
    }
    report_path = project / f"pipeline_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report_path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    log("MAIN", f"  Report:     {report_path}")


if __name__ == "__main__":
    main()

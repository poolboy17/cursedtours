#!/usr/bin/env python3
"""
Generate a single image using OpenAI's DALL-E 3 API.

Usage:
    python3 generate_image.py --prompt "..." --output /path/to/image.jpg [--size landscape] [--quality standard] [--api-key sk-...]
"""

import argparse
import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path


def find_api_key(args_key=None):
    """Find OpenAI API key from args, env, or .env file."""
    if args_key:
        return args_key
    if os.environ.get("OPENAI_API_KEY"):
        return os.environ["OPENAI_API_KEY"]
    for p in [Path.cwd()] + list(Path.cwd().parents):
        env_file = p / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                line = line.strip()
                if line.startswith("OPENAI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


SIZE_MAP = {
    "square": "1024x1024",
    "landscape": "1792x1024",
    "portrait": "1024x1792",
}


def convert_png_to_web(png_path, out_path, quality=80):
    """Convert a PNG file to optimized webp/jpeg. Returns True if Pillow available, False otherwise."""
    try:
        from PIL import Image
        img = Image.open(png_path).convert("RGB")
        ext = Path(out_path).suffix.lower()
        if ext == ".webp":
            img.save(out_path, "WEBP", quality=quality, method=6)
        elif ext in (".jpg", ".jpeg"):
            img.save(out_path, "JPEG", quality=quality, optimize=True)
        elif ext == ".png":
            img.save(out_path, "PNG", optimize=True)
        else:
            img.save(out_path)
        return True
    except ImportError:
        return False


def generate_image(prompt, output_path, size="landscape", quality="standard", api_key=None):
    """Generate an image with DALL-E 3 and save it to output_path."""
    key = find_api_key(api_key)
    if not key:
        raise RuntimeError("No OpenAI API key found. Provide via --api-key, OPENAI_API_KEY env var, or .env file.")

    dall_e_size = SIZE_MAP.get(size, size)
    if dall_e_size not in ("1024x1024", "1792x1024", "1024x1792"):
        raise ValueError(f"Invalid size '{size}'. Use: square, landscape, portrait, or exact dimensions.")

    payload = json.dumps({
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": dall_e_size,
        "quality": quality,
        "response_format": "url"
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}"
        }
    )

    print(f"Generating image ({dall_e_size}, {quality})...")
    print(f"Prompt: {prompt[:100]}{'...' if len(prompt) > 100 else ''}")

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        try:
            err = json.loads(error_body)
            msg = err.get("error", {}).get("message", error_body)
        except json.JSONDecodeError:
            msg = error_body[:500]
        raise RuntimeError(f"API returned {e.code}: {msg}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Connection failed: {e.reason}")

    image_url = result["data"][0]["url"]
    revised_prompt = result["data"][0].get("revised_prompt", "")

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    tmp_png = output.with_suffix(".tmp.png")
    print(f"Downloading to {output}...")
    urllib.request.urlretrieve(image_url, str(tmp_png))

    if output.suffix.lower() in (".webp", ".jpg", ".jpeg", ".png"):
        if convert_png_to_web(tmp_png, output):
            tmp_png.unlink()
            fmt = output.suffix.lstrip(".").upper()
            print(f"Converted to optimized {fmt}")
        else:
            tmp_png.rename(output)
            print(f"Warning: Pillow not installed, saved as raw PNG")
    else:
        tmp_png.rename(output)

    file_size = output.stat().st_size
    print(f"Saved: {output} ({file_size:,} bytes)")
    if revised_prompt:
        print(f"Revised prompt: {revised_prompt[:150]}...")

    return {
        "path": str(output),
        "size_bytes": file_size,
        "revised_prompt": revised_prompt,
        "original_prompt": prompt
    }


def main():
    parser = argparse.ArgumentParser(description="Generate a single image with DALL-E 3")
    parser.add_argument("--prompt", required=True, help="The DALL-E prompt")
    parser.add_argument("--output", required=True, help="Output file path")
    parser.add_argument("--size", default="landscape", choices=["square", "landscape", "portrait"])
    parser.add_argument("--quality", default="standard", choices=["standard", "hd"])
    parser.add_argument("--api-key", default=None)
    args = parser.parse_args()

    try:
        result = generate_image(args.prompt, args.output, args.size, args.quality, args.api_key)
        print(json.dumps(result, indent=2))
    except (RuntimeError, ValueError) as e:
        print(f"ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

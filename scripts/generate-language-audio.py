"""Build-time only: pip install gTTS==2.5.4 in a temporary virtual environment.

node scripts/language-audio-manifest.mjs > /tmp/dhruva-language-manifest.json
python scripts/generate-language-audio.py /tmp/dhruva-language-manifest.json

The published games play bundled files; they never call the generation service.
"""
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import sys
import time
from gtts import gTTS

root = Path(__file__).resolve().parents[1] / 'assets' / 'languages'
root.mkdir(parents=True, exist_ok=True)
manifest_path = root / 'manifest.json'
previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else {'entries': []}
known = {entry['path']: entry for entry in previous['entries']}
requests = json.loads(Path(sys.argv[1]).read_text())

def generate(entry):
    relative = f"{entry['language']}/{entry['kind']}-{entry['id']}.mp3"
    destination = root / relative
    digest = hashlib.sha256(entry['text'].encode()).hexdigest()
    if not (destination.exists() and known.get(relative, {}).get('textHash') == digest):
        destination.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(3):
            try:
                gTTS(text=entry['text'], lang=entry['lang'], slow=False, timeout=(10, 30)).save(str(destination))
                if destination.stat().st_size < 1000:
                    raise ValueError('Audio clip was unexpectedly short')
                break
            except Exception:
                if attempt == 2:
                    raise
                time.sleep(attempt + 1)
    return {**entry, 'path': relative, 'textHash': digest, 'bytes': destination.stat().st_size}

completed = []
with ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(generate, entry) for entry in requests]
    for future in as_completed(futures):
        completed.append(future.result())
        if len(completed) % 40 == 0:
            print(f'Prepared {len(completed)} / {len(requests)} language clips', flush=True)
manifest = {'generator': 'gTTS 2.5.4 / Google Translate text-to-speech', 'entries': sorted(completed, key=lambda entry: entry['path'])}
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f"Saved {len(completed)} clips ({sum(entry['bytes'] for entry in completed):,} bytes)", flush=True)

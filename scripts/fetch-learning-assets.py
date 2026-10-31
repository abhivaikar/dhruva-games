"""Prepare local educational artwork. Run only when refreshing bundled assets.

Sources: Natural Earth (public domain) and flag-icons v7.3.2 (MIT).
Normal gameplay and builds never need network access.
"""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
FLAG_ROOT = 'https://raw.githubusercontent.com/lipis/flag-icons/v7.3.2/'
MAP_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
CODES = 'sg jp cn in id my th vn kr fr de it gb us ca br au nz za eg'.split()


def download(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'DhruvaDiscoveryClub/1.0 asset preparation'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def flag(code):
    data = download(FLAG_ROOT + f'flags/4x3/{code}.svg')
    if b'<svg' not in data or b'<script' in data or b'http' in data.replace(b'http://www.w3.org/2000/svg', b'').replace(b'http://www.w3.org/1999/xlink', b''):
        raise ValueError(f'Unexpected SVG content: {code}')
    (ROOT / 'assets/flags' / f'{code}.svg').write_bytes(data)
    return code


def path_for(geometry):
    polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    parts = []
    for polygon in polygons:
        for ring in polygon:
            points = []
            for lon, lat, *_ in ring:
                x, y = (lon + 180) * 2, (85 - max(-60, min(85, lat))) * 2
                point = (round(x, 1), round(y, 1))
                if not points or points[-1] != point:
                    points.append(point)
            if len(points) > 2:
                parts.append('M' + 'L'.join(f'{x:g},{y:g}' for x, y in points) + 'Z')
    return ''.join(parts)


def main():
    (ROOT / 'assets/flags').mkdir(parents=True, exist_ok=True)
    (ROOT / 'src/club/data').mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        completed = list(pool.map(flag, CODES))
    (ROOT / 'assets/flags/LICENSE.txt').write_bytes(download(FLAG_ROOT + 'LICENSE'))
    raw_map = download(MAP_URL)
    data = json.loads(raw_map)
    paths = []
    for feature in data['features']:
        props = feature['properties']
        if props['ADM0_A3'] == 'ATA':
            continue
        paths.append({'id': props['ADM0_A3'], 'path': path_for(feature['geometry'])})
    output = '// Natural Earth 1:110m countries, public domain. Equirectangular projection.\n'
    output += '// Prepared by scripts/fetch-learning-assets.py; no network access during play.\n'
    output += 'export const WORLD_PATHS = ' + json.dumps(paths, separators=(',', ':')) + ';\n'
    (ROOT / 'src/club/data/world-paths.js').write_text(output)
    (ROOT / 'assets/map-source.json').write_text(json.dumps({
        'source': MAP_URL, 'sha256': hashlib.sha256(raw_map).hexdigest(),
        'license': 'Public domain', 'projection': 'Equirectangular; latitude -60 to 85',
        'flags': FLAG_ROOT, 'flag_license': 'MIT', 'countries': CODES,
    }, indent=2) + '\n')
    print(f'Prepared {len(completed)} local flags and {len(paths)} country outlines.')


if __name__ == '__main__':
    main()

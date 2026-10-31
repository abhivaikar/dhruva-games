# Bundled educational artwork and factual sources

The games load these assets locally. Playing does not contact their providers.

## World map

Country outlines are derived from Natural Earth’s 1:110m Admin 0 countries dataset, using an equirectangular projection and rounded display coordinates. Antarctica is omitted. Small countries can use locator dots. These are generalised educational outlines.

- Dataset: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson
- Terms: https://www.naturalearthdata.com/about/terms-of-use/
- Licence: public domain.
- The source URL, downloaded-file SHA-256, and preparation details are retained in `assets/map-source.json`.

## Country flags

The 20 local flag SVGs are from flag-icons v7.3.2 by Lipis and contributors.

- Source: https://github.com/lipis/flag-icons/tree/v7.3.2/flags/4x3
- Licence: MIT; the complete notice is included in `assets/flags/LICENSE.txt`.

Refresh these assets, if needed, with `python3 scripts/fetch-learning-assets.py`. That preparation script requires network access; normal builds do not.

## Learning content

Singapore MRT line names/colours and transport modes were checked against [LTA’s rail network information](https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/rail_network.html) and [official system map](https://www.lta.gov.sg/content/dam/ltagov/getting_around/public_transport/rail_network/pdf/SM_Eng_%28Ver101224%29_PC.pdf). North East Line ordering follows [SBS Transit](https://www.sbstransit.com.sg/first-train-last-train).

Maths Workshop offers selected skills for Primary 1–2, 3–4, and 5–6, informed by the [MOE primary mathematics syllabus](https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-dec-2024.pdf). It is not a complete syllabus course, assessment, or official MOE resource.

Content and sources reviewed on 31 October 2026. Illustrations elsewhere in the club are original SVG artwork.

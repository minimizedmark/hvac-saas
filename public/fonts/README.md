# Inter Font Files

This directory contains locally vendored Inter webfont assets (latin subsets only).

## Required Binary Files

The following woff2 files need to be manually added to this directory:

- `inter-v20-latin-400.woff2` (weight 400)
- `inter-v20-latin-600.woff2` (weight 600)  
- `inter-v20-latin-700.woff2` (weight 700)

## Source URLs

See `SOURCE_URLS.txt` for the exact URLs to download these files from Google Fonts CDN.

To manually download the files:

```bash
cd public/fonts
curl -L -o inter-v20-latin-400.woff2 "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
curl -L -o inter-v20-latin-600.woff2 "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZFhiI2B.woff2"
curl -L -o inter-v20-latin-700.woff2 "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZBhiI2B.woff2"
```

## Usage

The fonts are loaded via `local-google-fonts.css` which is linked in `app/layout.tsx`.

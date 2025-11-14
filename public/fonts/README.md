# Local Inter Font Files

This directory contains the vendored Inter font files for the HVAC SaaS application.

## Current Status

The CSS file (`local-google-fonts.css`) and provenance documentation (`SOURCE_URLS.txt`) are in place. However, the actual `.woff2` binary files need to be added manually due to network restrictions during the initial setup.

## Required Font Files

To complete the font vendoring, download and add the following files to this directory:

1. **inter-v20-latin-400.woff2** (Regular/Normal weight)
   - Source: https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2

2. **inter-v20-latin-600.woff2** (Semi-bold weight)
   - Source: https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZFhiI2B.woff2

3. **inter-v20-latin-700.woff2** (Bold weight)
   - Source: https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZBhiI2B.woff2

## How to Add the Font Files

You can add these files using one of these methods:

### Method 1: Manual Download
1. Visit each URL above in your browser
2. Save the downloaded `.woff2` file with the corresponding filename
3. Place the files in this directory (`public/fonts/`)

### Method 2: Using curl/wget
```bash
cd public/fonts/
curl -L -o inter-v20-latin-400.woff2 "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
curl -L -o inter-v20-latin-600.woff2 "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZFhiI2B.woff2"
curl -L -o inter-v20-latin-700.woff2 "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZBhiI2B.woff2"
```

### Method 3: Using CI/CD
Add a step to your deployment pipeline to download these files before building.

## Verification

After adding the font files, verify they work:

1. Run the development server: `npm run dev`
2. Open the browser developer tools
3. Check the Network tab for successful font file loads from `/fonts/`
4. Verify no errors about missing font files

## Why Vendor Fonts Locally?

- **Build Reliability**: Eliminates dependency on external Google Fonts services during CI/CD
- **Performance**: Fonts are served directly from your domain without DNS lookups
- **Privacy**: No third-party requests to Google servers
- **Offline Development**: Works without internet connection

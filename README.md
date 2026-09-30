# Quantum BioTesting

Static marketing and booking-enquiry site for Quantum BioTesting's Men's and Women's Health Checks. Plain HTML, one stylesheet, one script. No build step; deploy the repository root.

```
index.html      Home: hero, health checks, coverage, process, preparation, report, clinics, pricing, FAQ
testing.html    Full biomarker list (Men's categories, Women's health areas)
privacy.html    Privacy Policy
terms.html      Terms & Conditions
assets/css/site.css   Design system ("Precision Clinic"): tokens → base → layout → components → pages → motion
assets/js/site.js     Menu, booking dialog, cookie notice, reveal, biomarker tools, scroll spy
assets/fonts/         Literata + Albert Sans (Latin, variable, self-hosted, SIL OFL; see LICENSES.txt)
assets/images/        Temporary photography; replace freely (each sits in a fixed-ratio `.media` frame)
robots.txt, sitemap.xml
```

## Working on it

- Serve locally with any static server, e.g. `python3 -m http.server`.
- Colours, type, spacing and motion are CSS custom properties at the top of `site.css`. The brand blues are carried over from the previous site; re-derive them from the official logo when it is supplied.
- Header, footer and booking dialog markup is repeated on each page. Change it in all four files.
- Prices appear in the two product panels, the pricing table, the hero line, the CTA bands and the JSON-LD on `index.html`, and in the CTA of `testing.html`. Current values: RRP £2,112, offer £995, saving £1,117.

## Booking enquiry

The enquiry dialog (`#booking`) is a native `<dialog>` with two validated steps. It collects health check, clinic, preferred date, notes, name, email, phone and two consents. It does not collect date of birth.

It has no backend yet. Set `data-endpoint="https://…"` on `#booking-form` and it will POST the enquiry as JSON (see `payload()` in `site.js`); until then it completes client-side, as the previous site did. Wire an endpoint before launch so enquiries actually reach the team.

## Logo

The official logo file has not been added to the repository. The header and footer use a typographic wordmark marked `Wordmark placeholder` in the HTML. When the logo is supplied: replace the `.brand` content, add a favicon (`<link rel="icon">` currently points at an empty data URI), add `og:image`, and add `logo` to the Organization JSON-LD.

## Client facts still to confirm

- Contact details: telephone and email appear only in the legal pages (`hello@quantumbt.co.uk`, `01494 000 000`, `bookings@quantumbt.co.uk`). They are unverified and deliberately absent from the marketing pages, footer and structured data.
- Accreditation claims (UKAS, RIQAS, GCP), clinic count, country reach and partner-lab credentials have been removed from marketing pages. The legal pages still mention UKAS ISO 15189 and CQC-registered clinics.
- Canonical domain `quantumbt.co.uk`.
- Men's panel: the 300-marker list was unlabelled in the source page; it is presented as the Men's Health Check's 11 categories. It includes items such as CA-125, AMH and BRCA/APOE genotyping that should be confirmed per product.
- The NHS comparison figures (15–20 markers, results in 1–3 weeks) are carried over from existing copy.
- The Privacy Policy still lists date of birth among data collected; the website form no longer asks for it.

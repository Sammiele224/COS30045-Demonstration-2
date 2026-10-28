# COS30045 Demonstration 2 source

## Links

- Repository: https://github.com/Sammiele224/COS30045-Demonstration-2
- GitHub Pages site: https://sammiele224.github.io/COS30045-Demonstration-2/

## Run locally

From this directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. A server is necessary because `d3.csv()` uses `fetch` and browsers normally block local `file://` CSV requests.

## Pages and concepts

| Page | Required exercise | Main concept |
| --- | --- | --- |
| `week4/house.html` | 4.1 | SVG primitives, coordinates, shared window group, transforms |
| `week4/bar.html` | 4.3–4.6 | CSV loading, data binding, linear and band scales |
| `week5/index.html` | 5.1–5.3 | Vertical bars, scatter and line charts, donut |
| `week6/index.html` | 6.1–6.4 | Bins, technology filters, scatter colour and tooltips |

All pages have navigation. D3 v7 is included in `assets` so the site does not depend on a CDN. The Week 4 coordinate annotation is `assets/house-annotated.png`; it was drawn over a browser screenshot of `assets/house.svg`.

The original exercise page layout uses a mint and white colour palette, with “Demonstration 2” in the header.

## Data provenance and limits

- `source_data/Ex6_TVdata_withStar.csv` is the supplied course TV dataset. It contains 4,233 models. `build_data.py` keeps valid positive energy and 0–10 star ratings, normalises brand names to uppercase, and produces the Week 4–6 TV CSVs in `data`. Screen size is already in inches.
- `source_data/ARE_Spot_Prices.csv` is the supplied course electricity price dataset. The scatter and line charts use its `Average Price (notTas-Snowy)` column for all **27 years, 1998–2024**. The column excludes Tasmania and Snowy from the four-region average.
- The Week 6 histogram uses 100 kWh bins from 0 to 1,800 kWh/year. It excludes higher values from the histogram and reports their count. The scatterplot retains them. Its fixed histogram y scale makes filter comparisons fair.

To rebuild derived data from the supplied course CSVs, run `python3 build_data.py` from this directory.

## Demonstration pointers

- **SVG:** The `viewBox` defines coordinates independent of display size. The house body is a rectangle; the roof is a polygon; the walkway is a path. Both window groups are inside `.window`, so one CSS rule styles both, while `translate()` moves them. The Week 4 page displays the DOM inspection screenshot and links to the complete SVG source.
- **D3 data binding:** `d3.csv()` returns a promise. Numeric CSV fields need conversion from text, e.g. `+d.count`. `selectAll().data().join()` binds each row to one SVG mark. Inspect the DOM and console table in Developer Tools.
- **Scales:** `scaleLinear()` maps a number to pixels. `scaleBand()` maps a category to a position and supplies bandwidth. Axes render ticks from those scales. Bar height is `innerHeight - y(value)` because SVG y increases downward.
- **Line and donut:** `d3.line()` turns ordered data points into a path. `d3.pie()` calculates slice angles; `d3.arc()` draws donut paths with an inner radius.
- **Histogram and interaction:** `d3.bin()` counts observations in numeric intervals. The filter changes the data subset and transitions bar heights. Scatterplot points are coloured by technology. Mouse and keyboard focus events reveal a tooltip with the bound model data.

## Before Canvas submission

1. The **browser Developer Tools screenshot** for Exercise 4.1 is saved as `assets/week4-house-dom-inspection.png` and displayed on the Week 4 page.
2. Submit the link to the single public GitHub repository containing all four exercise pages. The PDF specifies Classroom repositories, but the student has stated that GitHub Classroom is no longer used. Confirm with the tutor that one repository is accepted.
3. Use the GitHub Pages link above for the website submission. The older PDF specifies Mercury, but the student has confirmed that GitHub Pages is accepted. Verify all four pages online before submitting.
4. Add the GitHub link as a Canvas comment, submit the website links, and upload the **separate** `GenAI_declaration.pdf` after checking its details and adding your name/student ID.
5. Review the code and practice explaining it in your own words. The assessment includes an oral demonstration and follow-up questions.

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

## Data provenance and limits

- `source_data/tv_2026_02_15.csv` came from the user's local `Downloads/Data Visualisation/W1` folder. It is a February 2026 snapshot, while the course exercises refer to a January 2026 TV file. `build_data.py` converts screen centimetres to rounded inches, keeps valid positive energy and 0–10 star ratings, and produces the Week 4–6 CSVs in `data`.
- `source_data/aemo_summary.csv` came from [ZC-ANZ/aemo-historical-prices](https://github.com/ZC-ANZ/aemo-historical-prices), which processes AEMO market data. `build_data.py` averages monthly nominal regional reference prices across five regions for years with all 60 region-month observations. The result covers **2006–2024**. It differs from the course's `ARE_Spot_Prices.csv` and from the AER's demand-weighted annual measure. Replace it with the Canvas CSV if available.
- The Week 6 histogram uses 100 kWh bins from 0 to 1,800 kWh/year. It excludes higher values from the histogram and reports their count. The scatterplot retains them. Its fixed histogram y scale makes filter comparisons fair.

To rebuild derived data after changing source CSVs, run `python3 build_data.py` from this directory. If replacing the course data, adapt `build_data.py` to the new column names and review every chart label.

## Demonstration pointers

- **SVG:** The `viewBox` defines coordinates independent of display size. The house body is a rectangle; the roof is a polygon; the walkway is a path. Both window groups are inside `.window`, so one CSS rule styles both, while `translate()` moves them.
- **D3 data binding:** `d3.csv()` returns a promise. Numeric CSV fields need conversion from text, e.g. `+d.count`. `selectAll().data().join()` binds each row to one SVG mark. Inspect the DOM and console table in Developer Tools.
- **Scales:** `scaleLinear()` maps a number to pixels. `scaleBand()` maps a category to a position and supplies bandwidth. Axes render ticks from those scales. Bar height is `innerHeight - y(value)` because SVG y increases downward.
- **Line and donut:** `d3.line()` turns ordered data points into a path. `d3.pie()` calculates slice angles; `d3.arc()` draws donut paths with an inner radius.
- **Histogram and interaction:** `d3.bin()` counts observations in numeric intervals. The filter changes the data subset and transitions bar heights. Scatterplot points are coloured by technology. Mouse and keyboard focus events reveal a tooltip with the bound model data.

## Before Canvas submission

1. Take a **browser Developer Tools screenshot** showing the SVG and its DOM tree for Exercise 4.1. The page describes where to inspect it; a genuine screenshot of your own browser is still needed.
2. Submit the link to the single public GitHub repository containing all four exercise pages. The PDF specifies Classroom repositories, but the student has stated that GitHub Classroom is no longer used. Confirm with the tutor that one repository is accepted.
3. Host the site on Mercury if that requirement is still in force, then verify all four URLs. The GitHub Pages link above is available, but no Mercury deployment has been made.
4. Add the GitHub link as a Canvas comment, submit the website links, and upload the **separate** `GenAI_declaration.pdf` after checking its details and adding your name/student ID.
5. Review the code and practice explaining it in your own words. The assessment includes an oral demonstration and follow-up questions.

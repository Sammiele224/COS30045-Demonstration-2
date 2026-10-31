# COS30045 Demonstration 2 source

## Submission layout

The current repository is the working source. Four separate repositories have been created under the student's GitHub account because no GitHub Classroom assignments are currently available. Run `python3 prepare_submissions.py` to rebuild their self-contained local projects in `submission_repos/`, the single four-page site in `mercury_site/`, and the upload archive `mercury_site.zip`.

| GitHub repository to submit | Mercury page to submit |
| --- | --- |
| [Exercise 4.1](https://github.com/Sammiele224/COS30045-Demonstration-2-exercise-4-1) | [SVG house](https://mercury.swin.edu.au/cos30045/s106216094/demonstration-2/week4/house.html) |
| [Exercises 4.3–4.6](https://github.com/Sammiele224/COS30045-Demonstration-2-exercise-4-3-to-4-6) | [Bar chart](https://mercury.swin.edu.au/cos30045/s106216094/demonstration-2/week4/bar.html) |
| [Exercise 5](https://github.com/Sammiele224/COS30045-Demonstration-2-exercise-5) | [Multi-chart page](https://mercury.swin.edu.au/cos30045/s106216094/demonstration-2/week5/index.html) |
| [Exercise 6](https://github.com/Sammiele224/COS30045-Demonstration-2-exercise-6) | [Interactivity](https://mercury.swin.edu.au/cos30045/s106216094/demonstration-2/week6/index.html) |

Each standalone project serves its exercise at `index.html`. The Mercury site keeps the existing navigation between all four pages.

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

All pages have navigation. D3 v7 is included in `assets` so the site does not depend on a CDN. The Week 4 coordinate annotation is `assets/house-annotated.png`; it was drawn over a browser screenshot of `assets/house.svg`. Week 4 and Week 5 show the original static SVG and charts; Week 6 contains the interactive exercises.

The original exercise page layout uses a mint and white colour palette, with “Demonstration 2” in the header.

## Data provenance and limits

- `source_data/Ex6_TVdata_withStar.csv` is the supplied course TV dataset. It contains 4,233 models. `build_data.py` keeps valid positive energy and 0–10 star ratings, normalises brand names to uppercase, and produces the Week 4–6 TV CSVs in `data`. Screen size is already in inches.
- `source_data/ARE_Spot_Prices.csv` is the supplied course electricity price dataset. The scatter and line charts use its `Average Price (notTas-Snowy)` column for all **27 years, 1998–2024**. The column excludes Tasmania and Snowy from the four-region average.
- The Week 6 histogram uses 100 kWh bins from 0 to 1,800 kWh/year. It excludes higher values from the histogram and reports their count. The scatterplot retains them. Its fixed histogram y scale makes filter comparisons fair.

To rebuild derived data from the supplied course CSVs, run `python3 build_data.py` from this directory.

## Mercury deployment

Mercury uses your existing Swinburne credentials. Connect to the Swinburne VPN, then run this script with `s` followed by your student ID. It opens the first SSH login, which creates your web directory. Type `exit` after the URL appears; the script then uploads the site into `www/htdocs/demonstration-2/` and prints all four page URLs.

```sh
./deploy_mercury.sh s<studentID>
```

The upload keeps Mercury's existing `.htaccess` file. Confirm the actual URL shown on login. Mercury's [web server guide](https://feenix.swin.edu.au/help/?page=Mercury+Web+Server) describes the URL and web directory, and its [SSH guide](https://feenix.swin.edu.au/help/?page=Linux+%28Mercury%29) explains first login and VPN access.

## Demonstration pointers

- **SVG:** The `viewBox` defines coordinates independent of display size. The house body is a rectangle; the roof is a polygon; the walkway is a path. Both window groups are inside `.window`, so one CSS rule styles both, while `translate()` moves them. The Week 4 page displays the DOM inspection screenshot and links to the complete SVG source.
- **D3 data binding:** `d3.csv()` returns a promise. Numeric CSV fields need conversion from text, e.g. `+d.count`. `selectAll().data().join()` binds each row to one SVG mark. Inspect the DOM and console table in Developer Tools.
- **Scales:** `scaleLinear()` maps a number to pixels. `scaleBand()` maps a category to a position and supplies bandwidth. Axes render ticks from those scales. Bar height is `innerHeight - y(value)` because SVG y increases downward.
- **Line and donut:** `d3.line()` turns ordered data points into a path. `d3.pie()` calculates slice angles; `d3.arc()` draws donut paths with an inner radius.
- **Histogram and interaction:** `d3.bin()` counts observations in numeric intervals. The technology filter changes the data subset and transitions bar heights. Selecting a histogram bin or adjusting the energy range highlights matching scatterplot points. Scatterplot points are coloured by technology. Mouse and keyboard focus events reveal a tooltip with the bound model data.

## Before Canvas submission

1. The **browser Developer Tools screenshot** for Exercise 4.1 is saved as `assets/week4-house-dom-inspection.png` and displayed on the Week 4 page.
2. Add all four GitHub repository links above as a Canvas comment. If Classroom assignments become available, use those assignment repositories instead.
3. Open and verify each of the four Mercury page URLs before submitting them to Canvas. The files are uploaded; browser access prompts for SIMS sign-in.
4. Upload the **separate** `GenAI_declaration.pdf` after checking its details and adding your name/student ID.
5. Review the code and practice explaining it in your own words. The assessment includes an oral demonstration and follow-up questions.

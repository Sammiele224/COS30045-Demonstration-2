"""Build four independent exercise repositories and one Mercury website.

Run from this directory with: python3 prepare_submissions.py
The output directories are ignored by the source repository. Existing .git
directories in the standalone projects are preserved when rebuilding.
"""

from pathlib import Path
import re
import shutil


ROOT = Path(__file__).resolve().parent
REPOS = ROOT / "submission_repos"
MERCURY = ROOT / "mercury_site"
MERCURY_BASE = "https://mercury.swin.edu.au/cos30045/s106216094/demonstration-2"

EXERCISES = {
    "exercise-4-1": {
        "page": "week4/house.html",
        "mercury_page": "week4/house.html",
        "title": "Exercise 4.1 · SVG house",
        "files": [
            "assets/site.css",
            "assets/house.svg",
            "assets/house-annotated.png",
            "assets/week4-house-dom-inspection.png",
        ],
        "sources": [],
    },
    "exercise-4-3-to-4-6": {
        "page": "week4/bar.html",
        "mercury_page": "week4/bar.html",
        "title": "Exercises 4.3–4.6 · Bar chart",
        "files": [
            "week4/bar.js",
            "assets/site.css",
            "assets/d3.v7.min.js",
            "data/brand_counts.csv",
        ],
        "sources": ["source_data/Ex6_TVdata_withStar.csv"],
    },
    "exercise-5": {
        "page": "week5/index.html",
        "mercury_page": "week5/index.html",
        "title": "Exercise 5 · Multi-chart page",
        "files": [
            "week5/charts.js",
            "assets/site.css",
            "assets/d3.v7.min.js",
            "data/energy_by_tech_55in.csv",
            "data/spot_prices_annual.csv",
            "data/size_groups.csv",
        ],
        "sources": [
            "source_data/Ex6_TVdata_withStar.csv",
            "source_data/ARE_Spot_Prices.csv",
        ],
    },
    "exercise-6": {
        "page": "week6/index.html",
        "mercury_page": "week6/index.html",
        "title": "Exercise 6 · Interactivity",
        "files": [
            "week6/shared-constants.js",
            "week6/histogram.js",
            "week6/scatterplot.js",
            "week6/interactions.js",
            "week6/load-data.js",
            "assets/site.css",
            "assets/d3.v7.min.js",
            "assets/chart-interactions.js",
            "data/tv_clean.csv",
        ],
        "sources": ["source_data/Ex6_TVdata_withStar.csv"],
    },
}


def copy_file(source: str, destination: Path) -> None:
    target = destination / source
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / source, target)


def build_repo(name: str, exercise: dict) -> None:
    destination = REPOS / name
    destination.mkdir(parents=True, exist_ok=True)
    for source in exercise["files"] + exercise["sources"]:
        if source.startswith("week4/") or source.startswith("week5/") or source.startswith("week6/"):
            target = destination / Path(source).name
            shutil.copy2(ROOT / source, target)
            if target.suffix == ".js":
                target.write_text(target.read_text().replace("../data/", "data/"))
        else:
            copy_file(source, destination)

    html = (ROOT / exercise["page"]).read_text()
    navigation = (
        '<nav aria-label="Exercises">'
        f'<a href="index.html" aria-current="page">{exercise["title"]}</a>'
        '</nav>'
    )
    html, count = re.subn(r'<nav aria-label="Exercises">.*?</nav>', navigation, html, count=1, flags=re.S)
    if count != 1:
        raise ValueError(f"Could not replace navigation in {exercise['page']}")
    html = html.replace("../assets/", "assets/")
    (destination / "index.html").write_text(html)

    source_list = "\n".join(f"- `{source}`" for source in exercise["sources"])
    if source_list:
        source_list = "\n\nOriginal course data included for provenance:\n\n" + source_list + "\n"
    (destination / "README.md").write_text(
        f"# {exercise['title']}\n\n"
        "Standalone COS30045 Demonstration 2 exercise. All assets and processed CSV data "
        "needed by this page are included here.\n\n"
        f"Mercury page: {MERCURY_BASE}/{exercise['mercury_page']}\n\n"
        "Run `python3 -m http.server 8000` in this directory, then open "
        "`http://localhost:8000/`. Use a server because browsers block local CSV fetches."
        f"{source_list}\n"
        "The GenAI declaration is submitted separately on Canvas.\n"
    )


def build_mercury_site() -> None:
    for source in ["index.html", *[item for item in (ROOT / "assets").iterdir() if item.is_file()]]:
        if isinstance(source, Path):
            copy_file(str(source.relative_to(ROOT)), MERCURY)
        else:
            copy_file(source, MERCURY)
    for directory in ("data", "week4", "week5", "week6"):
        for source in (ROOT / directory).iterdir():
            if source.is_file():
                copy_file(str(source.relative_to(ROOT)), MERCURY)


if __name__ == "__main__":
    for exercise_name, details in EXERCISES.items():
        build_repo(exercise_name, details)
    build_mercury_site()
    shutil.make_archive(str(MERCURY), "zip", root_dir=MERCURY)
    print(f"Prepared four standalone projects in {REPOS}")
    print(f"Prepared one multi-page website in {MERCURY}")
    print(f"Prepared upload archive at {MERCURY}.zip")

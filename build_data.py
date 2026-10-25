"""Rebuild the CSV files used by the four exercise pages. Run: python3 build_data.py"""
import csv
import statistics
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / 'data'
SOURCE = ROOT / 'source_data'


def write_csv(name, headings, rows):
    with (DATA / name).open('w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(headings)
        writer.writerows(rows)


models = []
with (SOURCE / 'tv_2026_02_15.csv').open(encoding='utf-8-sig', newline='') as file:
    for row in csv.DictReader(file):
        try:
            size_cm = float(row['screensize'])
            energy = float(row['Labelled energy consumption (kWh/year)'])
            star = float(row['Star2'])
        except (TypeError, ValueError):
            continue
        if size_cm <= 0 or energy <= 0 or not 0 <= star <= 10:
            continue
        tech = {'LCD (LED)': 'LED', 'LCD': 'LCD', 'OLED': 'OLED'}.get(row['Screen_Tech'])
        if tech is None:
            continue
        size = round(size_cm / 2.54)
        size_group = 'Small (<40 in)' if size < 40 else 'Medium (40–65 in)' if size <= 65 else 'Large (>65 in)'
        models.append((row['Brand_Reg'].strip().upper(), row['Model_No'].strip(), size,
                       tech, energy, star, size_group))

write_csv('tv_clean.csv', ['brand', 'model', 'screenSizeInches', 'screenTech',
                           'energyConsumption', 'starRating', 'sizeGroup'], models)
brands = Counter(row[0] for row in models)
write_csv('brand_counts.csv', ['brand', 'count'], brands.most_common(15))
by_tech = defaultdict(list)
for brand, model, size, tech, energy, star, group in models:
    if size == 55:
        by_tech[tech].append(energy)
write_csv('energy_by_tech_55in.csv', ['screenTech', 'averageEnergy', 'models'],
          ((tech, round(statistics.mean(values), 1), len(values))
           for tech, values in sorted(by_tech.items())))
sizes = Counter(row[6] for row in models)
write_csv('size_groups.csv', ['group', 'count'],
          ((group, sizes[group]) for group in ('Small (<40 in)', 'Medium (40–65 in)', 'Large (>65 in)')))

# Each row below is one region and month. This is an equal-weight mean of the 60
# monthly regional nominal prices in each complete calendar year, not AER's
# demand-weighted annual price measure.
annual = defaultdict(list)
with (SOURCE / 'aemo_summary.csv').open(newline='', encoding='utf-8') as file:
    for row in csv.DictReader(file):
        year = int(row['year_month'][:4])
        if 2004 <= year <= 2024:
            annual[year].append(float(row['rrp_nominal']))
write_csv('spot_prices_annual.csv', ['year', 'averagePrice'],
          ((year, round(statistics.mean(annual[year]), 2))
           for year in sorted(annual) if len(annual[year]) == 60))
print(f'Built chart data from {len(models)} TV models and {sum(len(v)==60 for v in annual.values())} full price years.')

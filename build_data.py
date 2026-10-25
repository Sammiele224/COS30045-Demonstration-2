"""Rebuild all chart CSVs from the two supplied course files.

Run from this folder: python3 build_data.py
"""
import csv
import statistics
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / 'data'
SOURCE = ROOT / 'source_data'


def write_csv(name, headings, rows):
    with (DATA / name).open('w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file, lineterminator='\n')
        writer.writerow(headings)
        writer.writerows(rows)


models = []
with (SOURCE / 'Ex6_TVdata_withStar.csv').open(encoding='utf-8-sig', newline='') as file:
    for row in csv.DictReader(file):
        try:
            size = int(float(row['screenSize']))
            energy = float(row['energyConsumption'])
            star = float(row['star'])
        except (TypeError, ValueError):
            continue
        tech = row['screenTech'].strip().upper()
        if size <= 0 or energy <= 0 or not 0 <= star <= 10 or tech not in {'LCD', 'LED', 'OLED'}:
            continue
        size_group = 'Small (<40 in)' if size < 40 else 'Medium (40–65 in)' if size <= 65 else 'Large (>65 in)'
        models.append((row['brand'].strip().upper(), row['model'].strip(), size,
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

prices = []
with (SOURCE / 'ARE_Spot_Prices.csv').open(encoding='utf-8-sig', newline='') as file:
    for row in csv.DictReader(file):
        prices.append((int(row['Year']), float(row['Average Price (notTas-Snowy)'])))
prices.sort()
write_csv('spot_prices_annual.csv', ['year', 'averagePrice'], prices)
print(f'Built chart data from {len(models)} TV models and {len(prices)} annual prices ({prices[0][0]}–{prices[-1][0]}).')

const width = 850,
  height = 480;
const margin = { top: 28, right: 155, bottom: 62, left: 72 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const colorScale = d3
  .scaleOrdinal()
  .domain(['LED', 'LCD', 'OLED'])
  .range(['#236f64', '#d58159', '#7b6eb5']);
const binGenerator = d3
  .bin()
  .value((d) => d.energyConsumption)
  .domain([0, 1800])
  .thresholds(d3.range(100, 1800, 100));
const filterOptions = [
  { id: 'all', label: 'All types' },
  { id: 'LED', label: 'LED' },
  { id: 'LCD', label: 'LCD' },
  { id: 'OLED', label: 'OLED' },
];
let histogramState,
  scatterState,
  activeFilter = 'all',
  activeBin = null;

function pointIsVisible(datum) {
  const matchesTechnology = activeFilter === 'all' || datum.screenTech === activeFilter;
  const matchesBin =
    !activeBin ||
    (datum.energyConsumption >= activeBin.x0 &&
      (datum.energyConsumption < activeBin.x1 ||
        (activeBin.x1 === 1800 && datum.energyConsumption === 1800)));
  return matchesTechnology && matchesBin;
}

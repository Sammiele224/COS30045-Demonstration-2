const W = 560,
  H = 340,
  m = { top: 28, right: 28, bottom: 54, left: 65 };
const iw = W - m.left - m.right,
  ih = H - m.top - m.bottom;
const spotState = { data: [], views: [], selectedYear: null, timer: null };

function renderSpotYear(year) {
  const observation = spotState.data.find((d) => d.year === year);
  for (const view of spotState.views) {
    view.points
      .classed('year-active', (d) => d.year === year)
      .attr('r', (d) => (d.year === year ? 8 : view.connected ? 5.5 : 5))
      .attr('opacity', (d) => (year === null || d.year === year ? 1 : 0.24))
      .attr('aria-pressed', (d) => String(d.year === spotState.selectedYear));
    view.guide
      .attr('x1', year === null ? 0 : view.x(year))
      .attr('x2', year === null ? 0 : view.x(year))
      .attr('opacity', year === null ? 0 : 1);
    view.status.text(
      observation
        ? `${observation.year}: A$${observation.averagePrice.toFixed(2)} per MWh`
        : view.initial,
    );
  }
  d3.select('#spot-year-output').text(
    observation ? `${year} · A$${observation.averagePrice.toFixed(2)}/MWh` : 'Choose a year',
  );
}

function selectSpotYear(year) {
  spotState.selectedYear = year;
  if (year !== null) d3.select('#spot-year').property('value', year);
  renderSpotYear(year);
}

function stopSpotPlayback() {
  if (spotState.timer) clearInterval(spotState.timer);
  spotState.timer = null;
  d3.select('#spot-play').text('Play timeline').attr('aria-pressed', 'false');
}

function setupSpotControls(data) {
  const slider = d3
    .select('#spot-year')
    .attr(
      'min',
      d3.min(data, (d) => d.year),
    )
    .attr(
      'max',
      d3.max(data, (d) => d.year),
    );
  slider.on('input', function () {
    stopSpotPlayback();
    selectSpotYear(+this.value);
  });
  d3.select('#spot-clear').on('click', () => {
    stopSpotPlayback();
    selectSpotYear(null);
  });
  d3.select('#spot-play').on('click', function () {
    if (spotState.timer) {
      stopSpotPlayback();
      return;
    }
    d3.select(this).text('Pause timeline').attr('aria-pressed', 'true');
    const firstYear = d3.min(data, (d) => d.year);
    const lastYear = d3.max(data, (d) => d.year);
    if (spotState.selectedYear === null) selectSpotYear(firstYear);
    spotState.timer = setInterval(() => {
      selectSpotYear(spotState.selectedYear >= lastYear ? firstYear : spotState.selectedYear + 1);
    }, 650);
  });
}
function frame(selector, label) {
  const svg = d3
    .select(selector)
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('role', 'group')
    .attr('aria-label', label);
  return { svg, plot: svg.append('g').attr('transform', `translate(${m.left},${m.top})`) };
}
function axisLabels(svg, xText, yText) {
  svg
    .append('text')
    .attr('class', 'chart-label')
    .attr('x', m.left + iw / 2)
    .attr('y', H - 7)
    .attr('text-anchor', 'middle')
    .text(xText);
  svg
    .append('text')
    .attr('class', 'chart-label')
    .attr('transform', `translate(17,${m.top + ih / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text(yText);
}
function drawBars(data) {
  const { svg, plot } = frame(
    '#vertical-bars',
    'Average annual energy use for 55 inch TVs by screen technology',
  );
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.screenTech))
    .range([0, iw])
    .padding(0.3);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.averageEnergy)])
    .nice()
    .range([ih, 0]);
  const bars = plot
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (d) => x(d.screenTech))
    .attr('y', (d) => y(d.averageEnergy))
    .attr('width', x.bandwidth())
    .attr('height', (d) => ih - y(d.averageEnergy))
    .attr('fill', '#236f64')
    .attr('rx', 4);
  plot
    .selectAll('.value')
    .data(data)
    .join('text')
    .attr('x', (d) => x(d.screenTech) + x.bandwidth() / 2)
    .attr('y', (d) => y(d.averageEnergy) - 8)
    .attr('text-anchor', 'middle')
    .attr('font-size', 13)
    .text((d) => `${Math.round(d.averageEnergy)} (${d.models})`);
  plot
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${ih})`)
    .call(d3.axisBottom(x));
  plot.append('g').attr('class', 'axis').call(d3.axisLeft(y).ticks(5));
  axisLabels(svg, 'Display technology', 'kWh per year');
  enableMarkInteraction(
    bars,
    '#vertical-status',
    (d) => `${d.screenTech}: ${d.averageEnergy.toFixed(1)} kWh per year across ${d.models} models`,
    (selected) => {
      bars
        .transition()
        .duration(250)
        .attr('opacity', (d) => (selected && d.screenTech !== selected.screenTech ? 0.3 : 1));
    },
  );
}
function drawSpot(data, selector, connected) {
  const { svg, plot } = frame(
    selector,
    connected
      ? 'Line chart of annual wholesale spot prices'
      : 'Scatter plot of annual wholesale spot prices',
  );
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.year))
    .range([0, iw]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.averagePrice)])
    .nice()
    .range([ih, 0]);
  if (connected) {
    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.averagePrice));
    plot
      .append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#236f64')
      .attr('stroke-width', 3);
  }
  const guide = plot
    .append('line')
    .attr('class', 'year-guide')
    .attr('y1', 0)
    .attr('y2', ih)
    .attr('opacity', 0);
  const points = plot
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => x(d.year))
    .attr('cy', (d) => y(d.averagePrice))
    .attr('r', connected ? 5.5 : 5)
    .attr('fill', connected ? '#164d45' : '#d58159');
  points.append('title').text((d) => `${d.year}: A$${d.averagePrice.toFixed(2)}/MWh`);
  plot
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${ih})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format('d')));
  plot.append('g').attr('class', 'axis').call(d3.axisLeft(y).ticks(5));
  axisLabels(svg, 'Year', 'A$ per MWh');
  const status = d3.select(connected ? '#spot-line-status' : '#spot-scatter-status');
  spotState.views.push({ points, guide, x, status, initial: status.text(), connected });
  points
    .classed('interactive-mark spot-point', true)
    .attr('role', 'button')
    .attr('tabindex', 0)
    .attr('aria-label', (d) => `${d.year}: A$${d.averagePrice.toFixed(2)} per MWh`)
    .attr('aria-pressed', 'false')
    .on('mouseenter focus', (event, d) => renderSpotYear(d.year))
    .on('mouseleave blur', () => renderSpotYear(spotState.selectedYear))
    .on('click', (event, d) => {
      stopSpotPlayback();
      selectSpotYear(d.year);
    })
    .on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        stopSpotPlayback();
        selectSpotYear(d.year);
      }
    });
}
function drawDonut(data) {
  const Wd = 560,
    Hd = 340,
    r = 125;
  const svg = d3
    .select('#donut')
    .append('svg')
    .attr('viewBox', `0 0 ${Wd} ${Hd}`)
    .attr('role', 'group')
    .attr('aria-label', 'Donut chart of TV model counts by screen size group');
  const group = svg.append('g').attr('transform', `translate(${Wd / 2},${Hd / 2})`);
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.group))
    .range(['#4e7991', '#236f64', '#a95531']);
  const pie = d3
    .pie()
    .sort(null)
    .value((d) => d.count)(data);
  const arc = d3
    .arc()
    .innerRadius(r * 0.56)
    .outerRadius(r)
    .padAngle(0.018)
    .cornerRadius(3);
  const slices = group
    .selectAll('path')
    .data(pie)
    .join('path')
    .attr('d', arc)
    .attr('fill', (d) => color(d.data.group));
  slices.append('title').text((d) => `${d.data.group}: ${d.data.count} models`);
  const total = d3.sum(data, (d) => d.count);
  group
    .selectAll('.arc-label')
    .data(pie)
    .join('text')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-weight', 700)
    .attr('font-size', 12)
    .text((d) => `${Math.round((d.data.count / total) * 100)}%`);
  const centerValue = group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', -4)
    .attr('font-size', 26)
    .attr('font-weight', 700)
    .text(total.toLocaleString());
  const centerLabel = group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 17)
    .attr('font-size', 12)
    .text('TV models');
  enableMarkInteraction(
    slices,
    '#donut-status',
    (d) =>
      `${d.data.group}: ${d.data.count.toLocaleString()} models (${((d.data.count / total) * 100).toFixed(1)}%)`,
    (selected) => {
      slices
        .transition()
        .duration(250)
        .attr('opacity', (d) => (selected && d.data.group !== selected.data.group ? 0.25 : 1))
        .attr('transform', (d) =>
          selected && d.data.group === selected.data.group
            ? `translate(${arc.centroid(d).map((value) => value * 0.08)})`
            : 'translate(0,0)',
        );
      centerValue.text(selected ? selected.data.count.toLocaleString() : total.toLocaleString());
      centerLabel.text(selected ? selected.data.group.split(' ')[0] : 'TV models');
    },
  );
  const legend = svg.append('g').attr('transform', 'translate(10,20)');
  data.forEach((d, i) => {
    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', i * 20)
      .attr('width', 11)
      .attr('height', 11)
      .attr('fill', color(d.group));
    legend
      .append('text')
      .attr('class', 'legend')
      .attr('x', 17)
      .attr('y', i * 20 + 10)
      .text(d.group);
  });
}
Promise.all([
  d3.csv('../data/energy_by_tech_55in.csv', (d) => ({
    screenTech: d.screenTech,
    averageEnergy: +d.averageEnergy,
    models: +d.models,
  })),
  d3.csv('../data/spot_prices_annual.csv', (d) => ({
    year: +d.year,
    averagePrice: +d.averagePrice,
  })),
  d3.csv('../data/size_groups.csv', (d) => ({ group: d.group, count: +d.count })),
])
  .then(([tech, spot, sizes]) => {
    console.table(tech);
    console.table(spot);
    console.table(sizes);
    drawBars(tech);
    spotState.data = spot;
    drawSpot(spot, '#spot-scatter', false);
    drawSpot(spot, '#spot-line', true);
    setupSpotControls(spot);
    drawDonut(sizes);
  })
  .catch((error) =>
    d3
      .select('main')
      .append('p')
      .attr('class', 'error')
      .text(`Could not load charts: ${error.message}`),
  );

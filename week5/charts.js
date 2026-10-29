const W = 560,
  H = 340,
  m = { top: 28, right: 28, bottom: 54, left: 65 };
const iw = W - m.left - m.right,
  ih = H - m.top - m.bottom;
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
  enableMarkInteraction(
    points,
    connected ? '#spot-line-status' : '#spot-scatter-status',
    (d) => `${d.year}: A$${d.averagePrice.toFixed(2)} per MWh`,
  );
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
  enableMarkInteraction(
    slices,
    '#donut-status',
    (d) =>
      `${d.data.group}: ${d.data.count.toLocaleString()} models (${((d.data.count / total) * 100).toFixed(1)}%)`,
  );
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
  group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', -4)
    .attr('font-size', 26)
    .attr('font-weight', 700)
    .text(total.toLocaleString());
  group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 17)
    .attr('font-size', 12)
    .text('TV models');
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
    drawSpot(spot, '#spot-scatter', false);
    drawSpot(spot, '#spot-line', true);
    drawDonut(sizes);
  })
  .catch((error) =>
    d3
      .select('main')
      .append('p')
      .attr('class', 'error')
      .text(`Could not load charts: ${error.message}`),
  );

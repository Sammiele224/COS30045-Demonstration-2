function populateFilters() {
  const buttons = d3
    .select('#filters_screen')
    .selectAll('button')
    .data(filterOptions)
    .join('button')
    .attr('type', 'button')
    .attr('class', 'filter')
    .text((d) => d.label);
  function selectFilter(id) {
    activeFilter = id;
    buttons.classed('active', (d) => d.id === id).attr('aria-pressed', (d) => String(d.id === id));
    updateHistogram(id);
    applyEnergyRange();
  }
  buttons.on('click', (event, d) => selectFilter(d.id));
  selectFilter('all');
}

function setEnergyRangeControls(min, max) {
  d3.select('#energy-min').property('value', min);
  d3.select('#energy-max').property('value', max);
  d3.select('#energy-range-value').text(`${min.toLocaleString()}–${max.toLocaleString()} kWh/year`);
}

function applyEnergyRange() {
  const min = +d3.select('#energy-min').property('value');
  const max = +d3.select('#energy-max').property('value');
  histogramState.resetBinSelection(false);
  activeBin = min === 0 && max === 1800 ? null : { x0: min, x1: max };
  updateHistogramRangeHighlight();
  updateScatterplot();
  d3.select('#hist-bin-status').text(
    activeBin
      ? `Highlighting models using ${min.toLocaleString()}–${max.toLocaleString()} kWh/year.`
      : 'Select a bin or adjust the range to highlight matching scatterplot points.',
  );
}

function setupEnergyRangeControls() {
  d3.select('#energy-min').on('input', function () {
    const min = +this.value;
    const max = +d3.select('#energy-max').property('value');
    if (min >= max) d3.select('#energy-max').property('value', Math.min(1800, min + 100));
    setEnergyRangeControls(min, +d3.select('#energy-max').property('value'));
    applyEnergyRange();
  });
  d3.select('#energy-max').on('input', function () {
    const max = +this.value;
    const min = +d3.select('#energy-min').property('value');
    if (max <= min) d3.select('#energy-min').property('value', Math.max(0, max - 100));
    setEnergyRangeControls(+d3.select('#energy-min').property('value'), max);
    applyEnergyRange();
  });
  d3.select('#energy-reset').on('click', () => {
    setEnergyRangeControls(0, 1800);
    applyEnergyRange();
  });
}
function createTooltip() {
  const tooltip = scatterState.plot
    .append('g')
    .attr('class', 'tooltip')
    .attr('opacity', 0)
    .attr('pointer-events', 'none');
  tooltip
    .append('rect')
    .attr('width', 230)
    .attr('height', 102)
    .attr('rx', 8)
    .attr('fill', '#153d57')
    .attr('opacity', 0.94);
  const text = tooltip.append('text').attr('fill', 'white').attr('font-size', 12);
  [19, 39, 59, 79].forEach((y) => text.append('tspan').attr('x', 11).attr('y', y));
  scatterState.tooltip = tooltip;
}
function handleMouseEvents() {
  const { points, tooltip } = scatterState;
  function show(event, d) {
    const x = +event.currentTarget.getAttribute('cx'),
      y = +event.currentTarget.getAttribute('cy');
    tooltip
      .selectAll('tspan')
      .data([
        `${d.brand} ${d.model}`.slice(0, 31),
        `${d.screenSizeInches} in · ${d.screenTech}`,
        `${d.starRating} stars`,
        `${Math.round(d.energyConsumption)} kWh/year`,
      ])
      .text((line) => line);
    tooltip
      .attr(
        'transform',
        `translate(${Math.min(x + 12, innerWidth - 230)},${Math.max(0, Math.min(y - 110, innerHeight - 102))})`,
      )
      .interrupt()
      .transition()
      .duration(120)
      .attr('opacity', 1);
    d3.select(event.currentTarget).attr('opacity', 1).attr('r', 6);
  }
  function hide(event) {
    tooltip.interrupt().transition().duration(120).attr('opacity', 0);
    const data = d3.select(event.currentTarget).datum();
    d3.select(event.currentTarget)
      .attr('r', 3.4)
      .attr('opacity', pointIsVisible(data) ? 0.48 : 0.045);
  }
  points.on('mouseenter', show).on('focus', show).on('mouseleave', hide).on('blur', hide);
  scatterState.resetSelection = enableMarkInteraction(
    points,
    '#scatter-status',
    (d) =>
      `${d.brand} ${d.model}: ${d.screenSizeInches} in, ${d.screenTech}, ${d.starRating} stars, ${Math.round(d.energyConsumption)} kWh/year`,
  );
}

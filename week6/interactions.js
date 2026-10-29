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
    updateScatterplot();
  }
  buttons.on('click', (event, d) => selectFilter(d.id));
  selectFilter('all');
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

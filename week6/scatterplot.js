function drawScatterplot(data) {
  const svg = d3
    .select('#scatterplot')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'group')
    .attr('aria-label', 'Scatterplot of TV energy use by star rating, coloured by technology');
  const plot = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.starRating)])
    .nice()
    .range([0, innerWidth]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.energyConsumption)])
    .nice()
    .range([innerHeight, 0]);
  const points = plot
    .append('g')
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(d.starRating))
    .attr('cy', (d) => yScale(d.energyConsumption))
    .attr('r', 3.4)
    .attr('fill', (d) => colorScale(d.screenTech))
    .attr('opacity', 0.48)
    .attr('tabindex', 0)
    .attr(
      'aria-label',
      (d) =>
        `${d.brand} ${d.model}, ${d.screenSizeInches} inch, ${d.screenTech}, ${d.starRating} stars, ${d.energyConsumption} kilowatt hours per year`,
    );
  plot
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(10));
  plot.append('g').attr('class', 'axis').call(d3.axisLeft(yScale).ticks(6));
  svg
    .append('text')
    .attr('class', 'chart-label')
    .attr('x', margin.left + innerWidth / 2)
    .attr('y', height - 9)
    .attr('text-anchor', 'middle')
    .text('Energy star rating');
  svg
    .append('text')
    .attr('class', 'chart-label')
    .attr('transform', `translate(18,${margin.top + innerHeight / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('Annual energy use (kWh/year)');
  const legend = svg
    .append('g')
    .attr('transform', `translate(${width - margin.right + 20},${margin.top + 8})`);
  colorScale.domain().forEach((tech, i) => {
    legend
      .append('circle')
      .attr('cx', 0)
      .attr('cy', i * 25)
      .attr('r', 6)
      .attr('fill', colorScale(tech));
    legend
      .append('text')
      .attr('class', 'legend')
      .attr('x', 13)
      .attr('y', i * 25 + 4)
      .text(tech);
  });
  scatterState = { svg, plot, points, data };
}
function updateScatterplot() {
  scatterState.resetSelection?.();
  scatterState.tooltip.interrupt().attr('opacity', 0);
  scatterState.points
    .attr('r', 3.4)
    .attr('opacity', (d) => (pointIsVisible(d) ? 0.48 : 0.045))
    .attr('pointer-events', (d) => (pointIsVisible(d) ? 'auto' : 'none'))
    .attr('tabindex', (d) => (pointIsVisible(d) ? 0 : -1));
}

function drawHistogram(data) {
  const svg = d3
    .select('#histogram')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'group')
    .attr('aria-label', 'Histogram of annual TV energy consumption by 100 kilowatt-hour bins');
  const plot = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  const xScale = d3.scaleLinear().domain([0, 1800]).range([0, innerWidth]);
  const allBins = binGenerator(data);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(allBins, (d) => d.length)])
    .nice()
    .range([innerHeight, 0]);
  const bars = plot
    .append('g')
    .selectAll('rect')
    .data(allBins)
    .join('rect')
    .attr('x', (d) => xScale(d.x0) + 1)
    .attr('width', (d) => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
    .attr('y', (d) => yScale(d.length))
    .attr('height', (d) => innerHeight - yScale(d.length))
    .attr('fill', '#236f64');
  const resetBinSelection = enableMarkInteraction(
    bars,
    '#hist-bin-status',
    (d) => `${d.x0}–${d.x1} kWh per year: ${d.length} models in the current filter`,
    (d) => {
      setEnergyRangeControls(d ? d.x0 : 0, d ? d.x1 : 1800);
      activeBin = d ? { x0: d.x0, x1: d.x1 } : null;
      updateHistogramRangeHighlight();
      if (scatterState) updateScatterplot();
    },
  );
  plot
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).tickValues(d3.range(0, 1801, 300)));
  plot.append('g').attr('class', 'axis').call(d3.axisLeft(yScale).ticks(6));
  svg
    .append('text')
    .attr('class', 'chart-label')
    .attr('x', margin.left + innerWidth / 2)
    .attr('y', height - 9)
    .attr('text-anchor', 'middle')
    .text('Annual energy use (kWh/year)');
  svg
    .append('text')
    .attr('class', 'chart-label')
    .attr('transform', `translate(18,${margin.top + innerHeight / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('TV models');
  const tooltipWidth = 190;
  const tooltipHeight = 58;
  const tooltip = plot
    .append('g')
    .attr('class', 'histogram-tooltip')
    .attr('opacity', 0)
    .attr('pointer-events', 'none');
  tooltip
    .append('rect')
    .attr('width', tooltipWidth)
    .attr('height', tooltipHeight)
    .attr('rx', 8)
    .attr('fill', '#153d57')
    .attr('opacity', 0.94);
  const tooltipText = tooltip.append('text').attr('fill', 'white').attr('font-size', 13);
  tooltipText.append('tspan').attr('x', 12).attr('y', 23);
  tooltipText.append('tspan').attr('x', 12).attr('y', 43);

  function showTooltip(event, bin) {
    const bar = d3.select(event.currentTarget);
    const barX = +bar.attr('x');
    const barY = +bar.attr('y');
    const rightX = barX + +bar.attr('width') + 10;
    const tooltipX = rightX + tooltipWidth <= innerWidth
      ? rightX
      : Math.max(0, barX - tooltipWidth - 10);
    const tooltipY = Math.max(0, Math.min(barY - 12, innerHeight - tooltipHeight));
    tooltipText.selectAll('tspan')
      .data([`${bin.x0}–${bin.x1} kWh/year`, `${bin.length.toLocaleString()} TV models`])
      .text((line) => line);
    tooltip.attr('transform', `translate(${tooltipX},${tooltipY})`).attr('opacity', 1);
  }
  function hideTooltip() {
    tooltip.attr('opacity', 0);
  }
  bars
    .on('mouseenter.histogramTooltip focus.histogramTooltip', showTooltip)
    .on('mouseleave.histogramTooltip blur.histogramTooltip', hideTooltip);
  histogramState = { bars, yScale, data, resetBinSelection, tooltip };
}
function updateHistogramRangeHighlight() {
  histogramState.bars.attr('opacity', (d) =>
    !activeBin || (d.x0 >= activeBin.x0 && d.x1 <= activeBin.x1) ? 1 : 0.25,
  );
}
function updateHistogram(selected) {
  const { bars, yScale, data, resetBinSelection, tooltip } = histogramState;
  resetBinSelection(false);
  tooltip.attr('opacity', 0);
  const filtered = selected === 'all' ? data : data.filter((d) => d.screenTech === selected);
  const bins = binGenerator(filtered);
  bars
    .data(bins)
    .interrupt()
    .transition()
    .duration(400)
    .ease(d3.easeCubicOut)
    .attr('y', (d) => yScale(d.length))
    .attr('height', (d) => innerHeight - yScale(d.length));
  updateHistogramRangeHighlight();
  const excluded = filtered.filter((d) => d.energyConsumption > 1800).length;
  d3.select('#hist-status').text(
    `${filtered.length.toLocaleString()} models selected; ${excluded} above 1,800 kWh/year excluded from the histogram.`,
  );
}

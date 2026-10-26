function drawHistogram(data) {
  const svg=d3.select('#histogram').append('svg').attr('viewBox',`0 0 ${width} ${height}`)
    .attr('role','img').attr('aria-label','Histogram of annual TV energy consumption by 100 kilowatt-hour bins');
  const plot=svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`);
  const xScale=d3.scaleLinear().domain([0,1800]).range([0,innerWidth]);
  const allBins=binGenerator(data);
  const yScale=d3.scaleLinear().domain([0,d3.max(allBins,d=>d.length)]).nice().range([innerHeight,0]);
  const bars=plot.append('g').selectAll('rect').data(allBins).join('rect')
    .attr('x',d=>xScale(d.x0)+1).attr('width',d=>Math.max(0,xScale(d.x1)-xScale(d.x0)-2))
    .attr('y',d=>yScale(d.length)).attr('height',d=>innerHeight-yScale(d.length))
    .attr('fill','#236f64');
  bars.append('title').text(d=>`${d.x0}–${d.x1} kWh: ${d.length} models`);
  plot.append('g').attr('class','axis').attr('transform',`translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).tickValues(d3.range(0,1801,300)));
  plot.append('g').attr('class','axis').call(d3.axisLeft(yScale).ticks(6));
  svg.append('text').attr('class','chart-label').attr('x',margin.left+innerWidth/2)
    .attr('y',height-9).attr('text-anchor','middle').text('Annual energy use (kWh/year)');
  svg.append('text').attr('class','chart-label').attr('transform',`translate(18,${margin.top+innerHeight/2}) rotate(-90)`)
    .attr('text-anchor','middle').text('TV models');
  histogramState={bars,yScale,data};
}
function updateHistogram(selected) {
  const {bars,yScale,data}=histogramState;
  const filtered=selected==='all'?data:data.filter(d=>d.screenTech===selected);
  const bins=binGenerator(filtered);
  bars.data(bins).interrupt().transition().duration(400).ease(d3.easeCubicOut)
    .attr('y',d=>yScale(d.length)).attr('height',d=>innerHeight-yScale(d.length));
  bars.select('title').text(d=>`${d.x0}–${d.x1} kWh: ${d.length} models`);
  const excluded=filtered.filter(d=>d.energyConsumption>1800).length;
  d3.select('#hist-status').text(`${filtered.length.toLocaleString()} models selected; ${excluded} above 1,800 kWh/year excluded from the histogram.`);
}

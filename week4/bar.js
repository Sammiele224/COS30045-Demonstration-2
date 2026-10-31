const chartWidth = 850, chartHeight = 620;
const margin = {top: 25, right: 75, bottom: 55, left: 165};
const innerWidth = chartWidth - margin.left - margin.right;
const innerHeight = chartHeight - margin.top - margin.bottom;

d3.csv('../data/brand_counts.csv', d => ({brand: d.brand, count: +d.count}))
  .then(data => {
    console.table(data);
    const svg = d3.select('#bar-chart').append('svg')
      .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)
      .attr('role', 'img').attr('aria-label', 'Horizontal bar chart of TV model counts by brand');
    const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const xScale = d3.scaleLinear().domain([0, d3.max(data, d => d.count)]).nice().range([0, innerWidth]);
    const yScale = d3.scaleBand().domain(data.map(d => d.brand)).range([0, innerHeight]).padding(0.22);
    chart.selectAll('.bar').data(data).join('rect').attr('class', 'bar')
      .attr('x', 0).attr('y', d => yScale(d.brand))
      .attr('width', d => xScale(d.count)).attr('height', yScale.bandwidth())
      .attr('rx', 4).attr('fill', '#236f64');
    chart.selectAll('.value').data(data).join('text').attr('class', 'value')
      .attr('x', d => xScale(d.count) + 7).attr('y', d => yScale(d.brand) + yScale.bandwidth()/2 + 4)
      .attr('font-size', 12).attr('fill', '#50645a').text(d => d.count);
    chart.append('g').attr('class', 'axis').call(d3.axisLeft(yScale).tickSize(0)).select('.domain').remove();
    chart.append('g').attr('class', 'axis').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(6));
    svg.append('text').attr('class', 'chart-label').attr('x', margin.left + innerWidth/2)
      .attr('y', chartHeight - 7).attr('text-anchor', 'middle').text('Registered TV models');
  }).catch(error => d3.select('#bar-chart').append('p').attr('class','error').text(`Could not load chart: ${error.message}`));

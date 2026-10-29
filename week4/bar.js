const chartWidth = 850,
  chartHeight = 620;
const margin = { top: 25, right: 75, bottom: 55, left: 165 };
const innerWidth = chartWidth - margin.left - margin.right;
const innerHeight = chartHeight - margin.top - margin.bottom;

d3.csv('../data/brand_counts.csv', (d) => ({ brand: d.brand, count: +d.count }))
  .then((data) => {
    console.table(data);
    const svg = d3
      .select('#bar-chart')
      .append('svg')
      .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)
      .attr('role', 'group')
      .attr('aria-label', 'Horizontal bar chart of TV model counts by brand');
    const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .nice()
      .range([0, innerWidth]);
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.brand))
      .range([0, innerHeight])
      .padding(0.22);
    const bars = chart
      .selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.brand))
      .attr('width', (d) => xScale(d.count))
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('fill', '#236f64');
    const values = chart
      .selectAll('.value')
      .data(data)
      .join('text')
      .attr('class', 'value')
      .attr('x', (d) => xScale(d.count) + 7)
      .attr('y', (d) => yScale(d.brand) + yScale.bandwidth() / 2 + 4)
      .attr('font-size', 12)
      .attr('fill', '#50645a')
      .text((d) => d.count);
    const yAxis = chart.append('g').attr('class', 'axis').call(d3.axisLeft(yScale).tickSize(0));
    yAxis.select('.domain').remove();
    const xAxis = chart
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6));
    const xLabel = svg
      .append('text')
      .attr('class', 'chart-label')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', chartHeight - 7)
      .attr('text-anchor', 'middle')
      .text('Registered TV models');

    const resetSelection = enableMarkInteraction(
      bars,
      '#bar-status',
      (d) => `${d.brand}: ${d.count.toLocaleString()} TV models`,
    );

    function updateView() {
      resetSelection();
      const ordered = [...data].sort(
        d3.select('#bar-sort').property('value') === 'brand'
          ? (a, b) => d3.ascending(a.brand, b.brand)
          : (a, b) => d3.descending(a.count, b.count) || d3.ascending(a.brand, b.brand),
      );
      const limit = +d3.select('#bar-limit').property('value');
      const visible = ordered.slice(0, limit);
      const shown = new Set(visible.map((d) => d.brand));
      const visibleHeight = Math.min(innerHeight, visible.length * 36);
      yScale.domain(visible.map((d) => d.brand)).range([0, visibleHeight]);
      svg.attr('viewBox', `0 0 ${chartWidth} ${margin.top + visibleHeight + margin.bottom}`);
      bars
        .attr('display', (d) => (shown.has(d.brand) ? null : 'none'))
        .attr('tabindex', (d) => (shown.has(d.brand) ? 0 : -1));
      values.attr('display', (d) => (shown.has(d.brand) ? null : 'none'));
      bars
        .transition()
        .duration(400)
        .attr('y', (d) => yScale(d.brand))
        .attr('height', yScale.bandwidth());
      values
        .transition()
        .duration(400)
        .attr('y', (d) => yScale(d.brand) + yScale.bandwidth() / 2 + 4);
      yAxis.transition().duration(400).call(d3.axisLeft(yScale).tickSize(0));
      yAxis.select('.domain').remove();
      xAxis.transition().duration(400).attr('transform', `translate(0,${visibleHeight})`);
      xLabel.attr('y', margin.top + visibleHeight + margin.bottom - 7);
      d3.select('#bar-limit-value').text(`${visible.length} of ${data.length}`);
    }

    d3.select('#bar-sort').on('change', updateView);
    d3.select('#bar-limit').on('input', updateView);
  })
  .catch((error) =>
    d3
      .select('#bar-chart')
      .append('p')
      .attr('class', 'error')
      .text(`Could not load chart: ${error.message}`),
  );

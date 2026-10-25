d3.csv('../data/tv_clean.csv',d=>({brand:d.brand,model:d.model,screenSizeInches:+d.screenSizeInches,
  screenTech:d.screenTech,energyConsumption:+d.energyConsumption,starRating:+d.starRating,sizeGroup:d.sizeGroup}))
  .then(data=>{console.log(`${data.length} TV models loaded`);console.table(data.slice(0,5));
    drawHistogram(data);drawScatterplot(data);createTooltip();handleMouseEvents();populateFilters()})
  .catch(error=>d3.select('main').append('p').attr('class','error').text(`Could not load charts: ${error.message}`));

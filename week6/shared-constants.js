const width = 850, height = 480;
const margin = {top: 28, right: 155, bottom: 62, left: 72};
const innerWidth = width-margin.left-margin.right;
const innerHeight = height-margin.top-margin.bottom;
const colorScale = d3.scaleOrdinal().domain(['LED','LCD','OLED']).range(['#168f9b','#d88842','#8056af']);
const binGenerator = d3.bin().value(d=>d.energyConsumption).domain([0,1800]).thresholds(d3.range(0,1801,100));
const filterOptions = [{id:'all',label:'All types'},{id:'LED',label:'LED'},{id:'LCD',label:'LCD'},{id:'OLED',label:'OLED'}];
let histogramState, scatterState, activeFilter = 'all';

// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgRon = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("weather.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.actual_mean_temp = +d.actual_mean_temp;
    });
    //group cities together
    const cities = d3.group(data, d => d.city);

    //rollup the data to group by date and then by city
    const citiesRollup = d3.rollup(data, 
        v => v.map(d => d.actual_mean_temp), 
        d => d.date, 
        d => d.city
    );
    console.log("Full Categories Map:", citiesRollup);
    // 3.a: SET SCALES FOR CHART 1
    const maxTemp = d3.max(data, d => d.actual_mean_temp);
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, maxTemp + 10])
        .range([height, 0]);

    //Define color scale 
    const color = d3.scaleOrdinal()
        .domain(cities.keys())
        .range(d3.schemeCategory10);

    //line generator
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.actual_mean_temp));

    // 4.a: PLOT DATA FOR CHART 1
    //used chat cause I was unable to figure out why my code wasnt working
    const formattedData = new Map();

    citiesRollup.forEach((cityMap, date) => {
        cityMap.forEach((temps, city) => {
            if (!formattedData.has(city)) {
                formattedData.set(city, []);
            }
            formattedData.get(city).push({ date: date, actual_mean_temp: temps[0] }); // Take first temperature
        });
    });

    // Convert to array for D3 processing
    const dataArray = Array.from(formattedData.entries());
    dataArray.forEach(([city, cityData]) => {
        cityData.sort((a, b) => a.date - b.date); // Ensure data is in order

    svgRon.append("path")
        .datum(dataArray)
        .attr("fill", "none")
        .attr("stroke", color(city))
        .attr("stroke-width", 2)
        .attr("d", line)});
    
    // 5.a: ADD AXES FOR CHART 1
    svgRon.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%b")));

    svgRon.append("g")
        .call(d3.axisLeft(yScale));

    // 6.a: ADD LABELS FOR CHART 1
    svgRon.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Date");
    
    svgRon.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Temperature (F)");

        
  

    // 7.a: ADD INTERACTIVITY FOR CHART 1
    
    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 2


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2

});
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

const svgElianna = d3.select("#lineChart2")
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

    // 4.a: PLOT DATA FOR CHART 1
   

    // 5.a: ADD AXES FOR CHART 1
    

    // 7.a: ADD INTERACTIVITY FOR CHART 1
    
    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // Load data
    d3.csv("pivot_table.csv").then(data => {
        // 2.b: TRANSFORM DATA
    
        data.forEach(d => {
            d.record_max_temp_year = d3.timeParse("%Y")(d.record_max_temp_year); // Assuming it's in 'YYYY' format
            d.count_record_max_temp_year = +d.count_record_max_temp_year; // Convert count to a number
        });

        console.log(data);
    
    });

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 2


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2

});
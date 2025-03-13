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
const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


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
        .datum(cityData)
        .attr("fill", "none")
        .attr("stroke", color(city))
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("data-city", city); // Tag each path with its city
});
svgRon.selectAll("path[data-city]")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html("City: " + d3.select(this).attr("data-city"))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event, d) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

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
    const filterWidget = d3.select("#widget1")
    .append("select")
    .attr("id", "cityFilter")
    .attr("multiple", "")  // allow multiple selection
    .on("change", function() {
        const selectedCities = Array.from(this.selectedOptions)
            .map(opt => opt.value);

        // If "All" is selected or nothing is selected, show all paths, else filter by city.
        if (selectedCities.includes("All") || selectedCities.length === 0) {
            svgRon.selectAll("path[data-city]").style("display", null);
        } else {
            svgRon.selectAll("path[data-city]")
                .style("display", function() {
                    const city = d3.select(this).attr("data-city");
                    return selectedCities.includes(city) ? null : "none";
                });
        }
    });

    // Populate the select element with options
    filterWidget.append("option")
        .attr("value", "All")
        .text("All");

    Array.from(cities.keys()).forEach(city => {
        filterWidget.append("option")
            .attr("value", city)
            .text(city);
    });

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================
    d3.csv("pivot_table.csv").then(data => {
        // Clean column names (fixing spaces in column names)
        data.forEach(d => {
            d.count_record_max_temp_year = +d["COUNT of record_max_temp_year"] || 0; // Convert count to number
        });
    
        // Remove empty records
        data = data.filter(d => d.record_max_temp_year !== "");
    
        // Parse year
        const parseYear = d3.timeParse("%Y");
        data.forEach(d => {
            d.record_max_temp_year = parseYear(d.record_max_temp_year);
        });
        
        // 3.b: SET SCALES FOR CHART 2
        const xScale2 = d3.scaleTime()
            .domain(d3.extent(data, d => d.record_max_temp_year))
            .range([0, width]);
    
        const yScale2 = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count_record_max_temp_year)])
            .range([height + 3, 0]);
    
        // 4.b: PLOT DATA FOR CHART 2
        const line2 = d3.line()
            .x(d => xScale2(d.record_max_temp_year))
            .y(d => yScale2(d.count_record_max_temp_year));
    
        svgElianna.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line2);
    
        // 5.b: ADD AXES FOR CHART 2
        svgElianna.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale2).tickFormat(d3.timeFormat("%Y")));
        
        svgElianna.append("g")
            .call(d3.axisLeft(yScale2));
    
        // 6.b ADD LABELS FOR CHART 2
        svgElianna.append("text")
            .attr("transform", `translate(${width / 2}, ${height + 40})`)
            .style("text-anchor", "middle")
            .text("Year");
    
        svgElianna.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 40)
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle")
            .text("Number of Record High Temps");

         // 7.b: ADD INTERACTIVITY FOR CHART 2
        // Trendline: Linear Regression
        function linearRegression(data) {
            const n = data.length;
            const sumX = d3.sum(data, d => d.record_max_temp_year.getFullYear());
            const sumY = d3.sum(data, d => d.count_record_max_temp_year);
            const sumXY = d3.sum(data, d => d.record_max_temp_year.getFullYear() * d.count_record_max_temp_year);
            const sumX2 = d3.sum(data, d => d.record_max_temp_year.getFullYear() * d.record_max_temp_year.getFullYear());

            // Calculate slope and intercept
            const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const b = (sumY - m * sumX) / n;

            // Generate points for the trendline
            const trendlineData = data.map(d => ({
                record_max_temp_year: d.record_max_temp_year,
                count_record_max_temp_year: m * d.record_max_temp_year.getFullYear() + b
            }));

            return trendlineData;
        }

        // Draw Trendline
        function drawTrendline() {
            const trendlineData = linearRegression(data);

            // Draw the trendline
            svgElianna.append("path")
                .data([trendlineData])
                .attr("class", "trendline")
                .attr("d", d3.line()
                    .x(d => xScale2(d.record_max_temp_year))
                    .y(d => yScale2(d.count_record_max_temp_year))
                )
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");
        }

        // Event listener for trendline toggle
        d3.select("#trendline-toggle").on("change", function() {
            const isChecked = d3.select(this).property("checked");
            if (isChecked) {
                drawTrendline();
            } else {
                svgElianna.selectAll(".trendline").remove();
            }
        });

    });
});
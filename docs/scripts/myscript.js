document.addEventListener('DOMContentLoaded', function() {
    // Path to your CSV file
    const csvFilePath = 'https://raw.githubusercontent.com/fangaomingyu/EDAV-Final-Project/main/merged_DATA.csv';

    // SVG dimensions and margins
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Append the SVG object to the body of the page
    const svg = d3.select("#plot1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X and Y scales
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Add X and Y axis
    const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
    const yAxis = svg.append("g");

    const xAxisLabel = svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("PM2.5 Concentration");

    const yAxisLabel = svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Lung and bronchus cancer counts/100k people");

    const slopeText = svg.append("text")
        .attr("class", "slope-text")
        .attr("x", 10)
        .attr("y", 30)
        .attr("fill", "black");


    // Function to calculate linear regression
    const linearRegression = data => {
        const n = data.length;
        const sumX = data.reduce((acc, val) => acc + val.x, 0);
        const sumY = data.reduce((acc, val) => acc + val.y, 0);
        const sumXY = data.reduce((acc, val) => acc + val.x * val.y, 0);
        const sumXX = data.reduce((acc, val) => acc + val.x * val.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    };

    // Function to update the chart
    const updateChart = (data) => {
        console.log("Updating chart with data:", data); // Log for debugging

        const { slope, intercept } = linearRegression(data);

        // Update scales
        x.domain([0, d3.max(data, d => d.x)]);
        y.domain([0, d3.max(data, d => d.y)]);

        // Update axes
        xAxis.transition().duration(1000).call(d3.axisBottom(x));
        yAxis.transition().duration(1000).call(d3.axisLeft(y));

        // Bind the line data
        const line = svg.selectAll(".regression-line").data([data]);

        // Enter + Update
        line.enter()
            .append("line")
            .attr("class", "regression-line")
            .merge(line)
            .transition()
            .duration(2000)
            .attr("x1", x(0))
            .attr("y1", y(intercept))
            .attr("x2", x(d3.max(data, d => d.x)))
            .attr("y2", y(slope * d3.max(data, d => d.x) + intercept))
            .attr("stroke", "blue")
            .attr("stroke-width", 2);

        slopeText.text("Slope: " + slope.toFixed(2));
    };

    // Read and process the CSV data
    d3.csv(csvFilePath, row => {
        return {
            x: +row.avg_pm25_pop_pred,
            y: +row.total_cancer_rate,
            state: row.States
        };
    }).then(fullData => {
        console.log("Full data loaded:", fullData); // Log for debugging

        let data = fullData;

        // Initial chart
        updateChart(data);

        // Event listener for the 'Remove Utah' button
        d3.select("#removeUtah").on("click", function() {
            data = fullData.filter(d => d.state !== 'Utah');
            updateChart(data);
        });

        // Event listener for the 'Add Utah' button
        d3.select("#allStates").on("click", function() {
            data = fullData; // Restore original data
            updateChart(data);
        });

        d3.select("#removeKentucky").on("click", function() {
            data = fullData.filter(d => d.state !== 'Kentucky');
            updateChart(data);
        });

        d3.select("#removeVirginia").on("click", function() {
            data = fullData.filter(d => d.state !== 'West Virginia');
            updateChart(data);
        });

    }).catch(error => {
        console.error("Error reading the CSV file:", error);
        console.error("Make sure the file path is correct and the server allows access to the file.");
    });

});

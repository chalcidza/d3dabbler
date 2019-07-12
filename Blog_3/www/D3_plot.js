d3.json("data.json").then(showData)
//The “monthyear” field is a key field to include in the data.
//The field contains both the month and the year of the date which is particularly important if the data 
//is spread over more than 12 months to allow us to differentiate between, for example, May 2018 and May 2019. 

function showData(data) {

    //STEP 1: Set the size of the plot area
    let width = 1000
    let height = 600
    let margin = 60;
    let bodyWidth = width - 2 * margin;
    let bodyHeight = height - 2 * margin;

    //STEP 2: Extract a list of the months (or “monthyears”) and years represented in the data 
    let months = []
    for (var i = 0; i < data.length; i++) {
      if (months.indexOf(data[i].monthyear)==-1) {
        months.push(data[i].monthyear)
      } else {
        months = months
      }
    }

    let years = []
    for (var i = 0; i < data.length; i++) {
      if (years.indexOf(data[i].year)==-1) {
        years.push(data[i].year)
      } else {
        years = years
      }
    }

    //STEP 3: Draw and annotate the plot
    d3.select("#line").select("svg").remove();

    let svg = d3.select("#line")
        .attr("width", width)
        .attr("height", height)

    let maxCount = d3.max(data, d => d.count)

    let chart = svg.append("g")
        .attr("transform", `translate(${margin}, ${margin})`)

    //The first x-axis is for the DAY part of the date. Note that it is drawn using the “date” field but labelled with the “day” field     
    let xScale = d3.scaleBand()
        .domain(data.map(d => d.date))
        .range([0, bodyWidth])
    
    chart.append("g").call(d3.axisBottom(xScale).tickFormat((_,i)=>data[i].day))
        .attr("transform", `translate(0, ${bodyHeight})`)

    let yScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range([bodyHeight, 0])
       
    chart.append("g").call(d3.axisLeft(yScale))

    //The second x-axis is for the MONTH part of the date (drawn with the help of the "monthyear" field). 
    //Each month is drawn as a separate line and all month lines are then positioned in their appropriate places next to each other. 
    //The same applies for the year axis below.
    let month_ranges = [0]
    let monthcount = 0

    for (var i = 1; i <= months.length; i++) {
        let totalcount = data.length
        monthcount += data.filter(options => options.monthyear === months[i-1]).length

        month_ranges[i] = bodyWidth/totalcount*monthcount
        
        let xScale2 = d3.scaleBand()
            .range([month_ranges[i-1], month_ranges[i]])

        chart.append("g")
            .attr('transform', `translate(0, ${bodyHeight+30})`)
            .call(d3.axisBottom(xScale2).tickSize(-5))

        chart.append("text")
            .attr("class", "axis")
            .data(data)
            .attr("y", bodyHeight + 50)
            .attr("x", month_ranges[i-1] + (month_ranges[i] - month_ranges[i-1])/2)
            .style("text-anchor", "middle")
            .text(months[i-1].split(" ")[0])
    }

    //The third x-axis is for the YEAR part of the date. 
    let year_ranges = [0]
    let yearcount = 0
    
    for (var i = 1; i <= years.length; i++) {
        let totalcount = data.length
        yearcount += data.filter(options => options.year === years[i-1]).length

        year_ranges[i] = bodyWidth/totalcount*yearcount
            
        let xScale2 = d3.scaleBand()
            .range([year_ranges[i-1], year_ranges[i]])
    
        chart.append("g")
            .attr('transform', `translate(0, ${bodyHeight+65})`)
            .call(d3.axisBottom(xScale2).tickSize(-5))
    
        chart.append("text")
            .attr("class", "axis")
            .data(data)
            .attr("y", bodyHeight + 85)
            .attr("x", year_ranges[i-1] + (year_ranges[i] - year_ranges[i-1])/2)
            .style("text-anchor", "middle")
            .text(years[i-1])
    }

    let valueline = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.count))
        .curve(d3.curveMonotoneX);
     
    chart.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", valueline)
        .attr("transform", `translate(${bodyWidth/(data.length*2)}, 0)`);

    let points = chart.selectAll("points")
        .data(data)
        .enter()
        .append("g")

    points.append("circle")
        .attr("class", "point")
        .attr("r", 2)
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.count))
        .attr("transform", `translate(${bodyWidth/(data.length*2)}, 0)`)

        
    svg.append("text")
        .attr("class", "label")
        .text("Count")
        .attr("x", -(bodyHeight / 2) - margin)
        .attr("y", margin / 2.4)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")

    svg.append("text")
        .attr("class", "label")
        .text("Date")
        .attr("x", bodyWidth / 2 + margin)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        
    svg.append("text")
        .attr("class", "title")
        .text("Number of Jelly Beans Eaten Per Day")
        .attr("x", bodyWidth / 2 + margin)
        .attr("y", 40)
        .attr("text-anchor", "middle")
}
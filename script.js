'use strict'

function getHeatColor(tempVariance, heatArray) {
    return colors[heatArray.findIndex(t => t > tempVariance)]
}


function getMonthName(month) {
    return months[month - 1]
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const colors = [
    "rgb(0,139,133)",
    "rgb(0, 104, 55)",
    "rgb(26, 152, 80)",
    "rgb(102, 189, 99)",
    "rgb(166, 217, 106)",
    "rgb(217, 239, 139)",
    "rgb(215,179,11)",
    "rgb(253, 174, 97)",
    "rgb(244, 109, 67)",
    "rgb(215, 48, 39)",
    "rgb(165, 0, 38)"
]

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
$.getJSON(url, (json, textStatus) => {
    const baseTemperature = json.baseTemperature
    const data = json.monthlyVariance
    const numberOfElements = data.length

    const firstYear = d3.min(data, (d) => d.year),
        lastYear = d3.max(data, (d) => d.year)
    const formatTime = d3.timeFormat('%B')
    const maxTempDiff = d3.max(data, (d) => d.variance),
        minTempDiff = d3.min(data, (d) => d.variance)
    const heatSteps = colors.length - 1 

    const tempStep = +(d3.format(".2f")((Math.abs(minTempDiff) + Math.abs(maxTempDiff)) / heatSteps))
    let heatArray = [], currTemp = minTempDiff
    while (currTemp < maxTempDiff) {
        currTemp += tempStep
        heatArray.push(currTemp)
    }

    const margins = { top: 100, right: 20, bottom: 60, left: 120 }
    const chartHeight = 600 - margins.top - margins.bottom
    const chartWidth = 1300 - margins.left - margins.right
    const barWidth = chartWidth / numberOfElements

    const x = d3.scaleLinear()
        .domain([firstYear, lastYear])
        .range([0, chartWidth])

    const y = d3.scaleTime()
        .domain([new Date(2001, 0, 1), new Date(2000, 0, 1)]) 
        .range([chartHeight, 0])

    const svgchart = d3.select('#svgchart') 
        .attr("width", chartWidth + margins.left + margins.right) 
        .attr("height", chartHeight + margins.top + margins.bottom) 
        .append("g") 
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")

   
    d3.select('#svgchart')
        .append("text")
        .classed("subtitle", true)
        .text("Reference absolute temperature is 8.66 °C. Estimated Jan 1951-Dec 1980.")
        .attr("x", "300px")
        .attr("y", "30px")

   
    const legendSquareWidth = 50,
        legendSquareHeight = 20
    d3.select('#svgchart')
        .append("g")
        .classed("legend", true)
        .selectAll(".legendPoint")
        .data(colors)
        .enter()
        .append("rect")
        .classed("legendPoint", true)
        .attr("fill", (d) => d)
        .attr("width", legendSquareWidth)
        .attr("height", legendSquareHeight)
        .attr("x", (d, i) => (i + 6) * legendSquareWidth)
        .attr("y", "45px")
        .append("text")
        .classed("legendPointText", true)
        .text((d, i) => heatArray[i])
 
    d3.select('#svgchart')
        .append("g")
        .classed("legend", true)
        .selectAll(".legendPointText")
        .data(heatArray)
        .enter()
        .append("text")
        .classed("legendPointText", true)
        .text((d) => "<" + d3.format(".3f")(d) + " °C")
        .attr("y", "75px")
        .attr("x", (d, i) => (i + 6) * (legendSquareWidth + 0.5))

    
    const tooltip = d3.select('#mainContainer').append("div")
        .classed("tooltip", true)
        .style("opacity", 0) 

   
    const heatPointHeight = chartHeight / 12
    const heatPointWidth = chartWidth / (lastYear - firstYear)
    const heatPoint = svgchart.selectAll("g")
        .data(data)
        .enter().append("rect")
        .classed("heatPoint", true)
        .attr("width", heatPointWidth)
        .attr("height", heatPointHeight)
        .attr("x", (d) => x(d.year))
        .attr("y", (d) => (d.month - 1) * heatPointHeight)
        .attr("fill", (d) => getHeatColor(d.variance, heatArray))
        .on("mouseover", function (d) {
            const temperature = d3.format(".3f")(baseTemperature + d.variance) 
            d3.select(this).classed("overed", true) 
            tooltip.transition()
                .duration(300)
                .style("opacity", 1) 
            let tooltipContent = getMonthName(d.month) + " " + d.year +
                "<br> Temperature: " + temperature + " °C" +
                "<br> Variance: " + d.variance + " °C"
            tooltip.html(tooltipContent)
                .style("left", (d3.event.pageX - d3.select('.tooltip').node().offsetWidth - 5) + "px")
                .style("top", (d3.event.pageY - d3.select('.tooltip').node().offsetHeight) + "px");
        })
        .on("mouseleave", function (d) {
            d3.select(this).classed("overed", false)
            tooltip.transition()
                .duration(300)
                .style("opacity", 0)
            tooltip.html("")
        })

    
    const xAxis = svgchart.append('g')
        .classed("x-axis", true)
        .attr("transform", "translate(0," + chartHeight + ")") 
        .call(d3.axisBottom(x).tickValues(x.ticks()).tickFormat(d3.format("")))
    							    
    xAxis.append("text")
        .classed("axisLabel", true)
        .text("Year")
        .attr("dx", chartWidth / 2) 
        .attr("dy", "2.5em") 
    xAxis.selectAll("text").style("text-anchor", "middle") 

   
    const yAxis = svgchart.append('g')
        .classed("y-axis", true)
        .call(d3.axisLeft(y).tickFormat(formatTime))
    yAxis.selectAll("g.tick:first-of-type text").html("") 
    yAxis.selectAll("g.tick text").attr("dy", "2em") 
    yAxis.append("text")
        .attr("id", "yAxisLabel")
        .classed("axisLabel", true)
        .text("Month")
        .attr("dx", -(chartHeight - 50) / 2) 
        .attr("dy", "-4.9em") 
        .attr("transform", "rotate(-90)")
    xAxis.selectAll("text").style("text-anchor", "middle")
})

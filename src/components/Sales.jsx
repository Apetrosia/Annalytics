import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import data from "../../data/Steam Trends 2023.json"

function Sales({ data }) {
    const svgRef = useRef(null)

    useEffect(() => {
        const margin = { top: 24, right: 24, bottom: 40, left: 80 }
        const width = 700
        const height = 400
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        svg.attr("width", width).attr("height", height)

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        const xScale = d3
            .scalePoint()
            .domain(d3.range(0, 12))
            .range([0, innerWidth])
            .padding(0.5)

        const xAxis = d3
            .axisBottom(xScale)
            .tickFormat((d) => d3.timeFormat("%b")(new Date(2023, d, 1)))
        
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("font-size", "12px")

        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 32)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Месяц")

        const yScale = d3
            .scaleLinear()
            .domain([0, 1])
            .range([innerHeight, 0])
        
        const yAxis = d3.axisLeft(yScale).ticks(5)

        g.append("g")
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "12px")

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", -56)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Суммарная выручка, $");
    }, [])

    return (
        <div
        style={{
            border: "1px solid #ccc",
            padding: "16px",
            marginBottom: "16px"
        }}>
            <h2>Продажи по месяцам</h2>
            <svg ref={svgRef} />
        </div>
    )
}

export default Sales

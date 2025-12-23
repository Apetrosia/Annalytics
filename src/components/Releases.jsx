import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Releases({ data }) {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        const countsByMonth = new Array(12).fill(0);
        data.forEach((d) => {
            const m = d.releaseMonth;
            if (m >= 1 && m <= 12) {
                countsByMonth[m - 1] += 1;
            }
        });

        const points = countsByMonth.map((v, i) => ({
            monthIndex: i,
            value: v,
        }));

        const margin = { top: 24, right: 24, bottom: 40, left: 80 };
        const width = 700;
        const height = 400;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        svg.attr("width", width).attr("height", height);

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // шкалы
        const xScale = d3
            .scalePoint()
            .domain(d3.range(0, 12))
            .range([0, innerWidth])
            .padding(0.5);

        const yScale = d3
            .scaleLinear()
            .domain([d3.min(points, (d) => d.value) - 3, d3.max(points, (d) => d.value) + 3])
            .nice()
            .range([innerHeight, 0]);

        const xAxis = d3
            .axisBottom(xScale)
            .tickFormat((d) => d3.timeFormat("%b")(new Date(2023, d, 1)));
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis);

        const yAxis = d3.axisLeft(yScale).ticks(5);
        g.append("g").call(yAxis);

        const line = d3
            .line()
            .x((d) => xScale(d.monthIndex))
            .y((d) => yScale(d.value));

        g.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "#1976d2")
            .attr("stroke-width", 2)
            .attr("d", line);

        const tooltip = d3.select(tooltipRef.current);

        g.selectAll(".point")
            .data(points)
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("cx", (d) => xScale(d.monthIndex))
            .attr("cy", (d) => yScale(d.value))
            .attr("r", 4)
            .attr("fill", "#1976d2")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "#42a5f5");
                tooltip
                    .style("opacity", 1)
                    .html(`Релизов: ${d.value}`)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px");
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "#1976d2");
                tooltip.style("opacity", 0);
            });
    }, [data]);

    console.log("Data is ready");

    return (
        <div
            style={{
                border: "1px solid #ccc",
                padding: "16px",
                marginBottom: "16px",
                position: "relative",
            }}
        >
            <h2>Релизы по месяцам года</h2>
            <svg ref={svgRef} />
            <div
                ref={tooltipRef}
                style={{
                    position: "absolute",
                    pointerEvents: "none",
                    background: "rgba(0,0,0,0.75)",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    opacity: 0,
                    transition: "opacity 0.1s",
                }}
            />
        </div>
    );
}

export default Releases;

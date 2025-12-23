import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Tags({ data, setSelectedTag }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const tagCounts = new Map();

    data.forEach((d) => {
      const tagsStr = d.Tags;
      if (!tagsStr) return;

      tagsStr.split(",").forEach((rawTag) => {
        const tag = rawTag.trim();
        if (!tag) return;
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9);

    const otherCount = Array.from(tagCounts.values()).reduce((sum, count) => {
      if (sortedTags.find(([tag]) => tagCounts.get(tag) === count)) return sum;
      return sum + count;
    }, 0);

    if (otherCount > 0) {
      sortedTags.push(["Другое", otherCount]);
    }

    const tags = sortedTags.map(([label, value]) => ({ label, value }));

    d3.select(svgRef.current).selectAll("*").remove();
    const tooltip = d3.select(tooltipRef.current);

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("font-family", "sans-serif");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3
      .scaleOrdinal()
      .domain(tags.map((d) => d.label))
      .range(d3.schemeCategory10.map(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`));

    const pie = d3.pie().value((d) => d.value);
    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius + 20);

    const arcs = g
      .selectAll(".arc")
      .data(pie(tags))
      .enter()
      .append("g")
      .attr("class", "arc")
      .style("cursor", "pointer");

    const paths = arcs
      .append("path")
      .attr("fill", (d) => color(d.data.label))
      .attr("d", arc)
      .style("stroke", "white")
      .style("stroke-width", 1)
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .html(`${d.data.label}: ${d.data.value}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(this)
          .transition()
          .duration(300)
          .ease(d3.easeCubicInOut)
          .attr("d", arcHover(d));
      })
      .on("mouseout", function (event, d) {
        tooltip.style("opacity", 0);

        d3.select(this)
          .transition()
          .duration(300)
          .ease(d3.easeCubicInOut)
          .attr("d", arc(d));
      })
      .on("click", function (event, d) {
        if (setSelectedTag) {
          if (d.data.label === "Другое") {
            setSelectedTag("all");
          } else {
            setSelectedTag(d.data.label);
          }
        }
      });

    const total = d3.sum(tags, (d) => d.value);
    const labelThreshold = total * 0.07;

    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .style("fill", "#f3f3f3ff")
      .style("pointer-events", "none")
      .text((d) => {
        return d.data.value >= labelThreshold && d.data.label.length <= 10 ? d.data.label : "";
      });
  }, [data]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Теги вышедших игр</h2>
      <div style={{ position: "relative" }}>
        <svg ref={svgRef} />
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            transition: "opacity 0.2s",
            zIndex: 1000,
            whiteSpace: "nowrap",
          }}
        />
      </div>
    </div>
  );
}

export default Tags;

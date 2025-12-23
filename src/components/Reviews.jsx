import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Reviews({ data }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!Array.isArray(data) || data.length === 0) return;

        const categories = [
            { key: "0-5", label: "≤ 10", min: 0, max: 5 },
            { key: "6-10", label: "6–10", min: 6, max: 10 },
            { key: "11-20", label: "11–20", min: 11, max: 20 },
            { key: "21-30", label: "21–30", min: 21, max: 30 },
            { key: "31-40", label: "31–40", min: 31, max: 40 },
            { key: "41-50", label: "41–50", min: 41, max: 50 },
            { key: "51-100", label: "51–100", min: 51, max: 100 },
            { key: "100+", label: "> 100", min: 101, max: Infinity },
        ];

        const buckets = new Map(
            categories.map((c) => [c.key, { label: c.label, count: 0 }])
        );

        // предполагаем, что в препроцессе у игр уже есть числовое поле price
        data.forEach((d) => {
            const price = Number(d.price) || 0;
            const reviews = Number(d["Reviews Total"]) || 0;
            if (reviews <= 0) return;

            const cat = categories.find(
                (c) => price >= c.min && price <= c.max
            );
            if (!cat) return;

            const bucket = buckets.get(cat.key);
            bucket.count += reviews;
        });

        const chartData = Array.from(buckets.values());

        // 2. Настройки размеров
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

        // 3. Шкалы
        const xScale = d3
            .scaleBand()
            .domain(chartData.map((d) => d.label))
            .range([0, innerWidth])
            .padding(0.2);

        const maxCount = d3.max(chartData, (d) => d.count) || 0;

        const yScale = d3
            .scaleLinear()
            .domain([0, maxCount || 1])
            .nice()
            .range([innerHeight, 0]);

        // 4. Ось X
        const xAxis = d3.axisBottom(xScale);

        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("font-size", "12px");

        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 32)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Ценовые категории, $");

        // 5. Ось Y
        const yAxis = d3
            .axisLeft(yScale)
            .ticks(6)
            .tickFormat((d) => d3.format(".2s")(d).replace("G", "B"));

        g.append("g")
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "12px");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", -56)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Количество обзоров");

        // 6. Столбики
        g.selectAll(".bar")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(d.label))
            .attr("y", (d) => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => innerHeight - yScale(d.count))
            .attr("fill", "#1976d2");
    }, [data]);

    return (
        <div
            style={{
                border: "1px solid #c0c0c0ff",
                padding: "16px",
                marginBottom: "16px",
            }}
        >
            <h2>Обзоры по ценовым категориям</h2>
            <svg ref={svgRef} />
        </div>
    );
}

export default Reviews;

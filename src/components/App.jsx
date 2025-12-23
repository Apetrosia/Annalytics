import React, { useEffect, useMemo, useState } from "react";
import Releases from "./Releases";
import Reviews from "./Reviews";
import Tags from "./Tags";

import rawData from "../../data/Steam Trends 2023.json";

function parsePrice(str) {
  if (!str) return 0;
  const normalized = str.replace(/\$/g, "").replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isNaN(value) ? 0 : value;
}

function parsePercent(str) {
  if (!str) return null;
  const normalized = str.replace("%", "").trim();
  const value = Number(normalized);
  return Number.isNaN(value) ? null : value;
}

function App() {
  const [processedData, setProcessedData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function preprocess() {
      try {
        setProcessing(true);

        const mapped = await new Promise((resolve) => {
          setTimeout(() => {
            const result = rawData.map((d) => {
              const price = parsePrice(d["Launch Price"]);
              const reviewsTotal = Number(d["Reviews Total"]) || 0;
              const sales = price * reviewsTotal;

              const dateStr = d["Release Date"];
              const dateObj = dateStr ? new Date(dateStr) : null;

              const releaseYear = dateObj ? dateObj.getFullYear() : null;
              const releaseMonth = dateObj ? dateObj.getMonth() + 1 : null;
              const releaseDay = dateObj ? dateObj.getDate() : null;
              const releaseHour = dateObj ? dateObj.getHours() : null;
              const releaseMinute = dateObj ? dateObj.getMinutes() : null;

              const reviewScore = parsePercent(d["Reviews Score Fancy"]);

              const {
                "Launch Price": _launchPrice,
                "Release Date": _releaseDate,
                "Reviews D7": _reviewsD7,
                "Reviews D30": _reviewsD30,
                "Reviews D90": _reviewsD90,
                "Revenue Estimated": _revenueEstimated,
                name_slug: _nameSlug,
                ...rest
              } = d;

              return {
                ...rest,
                price,
                sales,
                releaseYear,
                releaseMonth,
                releaseDay,
                releaseHour,
                releaseMinute,
                reviewScore,
              };
            });
            resolve(result);
          }, 0);
        });

        if (cancelled) return;

        const years = Array.from(
          new Set(mapped.map((d) => d.releaseYear).filter(Boolean))
        ).sort((a, b) => b - a);

        setProcessedData(mapped);
        setAvailableYears(years);
        setSelectedYear((prev) => prev ?? years[0] ?? 2023);

        const tagsForInitialYear = new Set();
        mapped
          .filter((d) => d.releaseYear === selectedYear)
          .forEach((d) => {
            const tagsStr = d.Tags;
            if (!tagsStr) return;
            tagsStr.split(",").forEach((raw) => {
              const t = raw.trim();
              if (t) tagsForInitialYear.add(t);
            });
          });

        setAvailableTags(["all", ...Array.from(tagsForInitialYear).sort()]);
        setSelectedTag("all");

        console.log("Processed data (first 3 rows):", mapped.slice(0, 3));
      } finally {
        if (!cancelled) setProcessing(false);
      }
    }

    preprocess();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedYear || !processedData.length) return;

    const tagsSet = new Set();

    processedData
      .filter((d) => Number(d.releaseYear) === Number(selectedYear))
      .forEach((d) => {
        const tagsStr = d.Tags;
        if (!tagsStr) return;
        tagsStr.split(",").forEach((raw) => {
          const t = raw.trim();
          if (t) tagsSet.add(t);
        });
      });

    const tags = Array.from(tagsSet).sort();
    setAvailableTags(["all", ...tags]);

    setSelectedTag((prev) =>
      prev && tags.includes(prev) ? prev : "all"
    );
  }, [selectedYear, processedData]);


  const filteredData = useMemo(() => {
    if (!selectedYear) return processedData;

    let result = processedData.filter(
      (d) => Number(d.releaseYear) === Number(selectedYear)
    );

    if (selectedTag && selectedTag !== "all") {
      result = result.filter((d) => {
        const tagsStr = d.Tags;
        if (!tagsStr) return false;
        return tagsStr.split(",").map((t) => t.trim()).includes(selectedTag);
      });
    }

    return result;
  }, [processedData, selectedYear, selectedTag]);


  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        display: "flex",
        gap: "24px",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: "1 1 auto",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        <h1>Steam Trends 2023</h1>

        {processing && (
          <div style={{ marginBottom: "12px", fontSize: "12px", color: "#777" }}>
            Идёт обработка данных…
          </div>
        )}

        <Releases data={filteredData} />
        <Reviews data={filteredData} />
        <Tags data={filteredData} setSelectedTag={setSelectedTag} />
      </div>

      <div
        style={{
          flex: "0 0 260px",
          position: "sticky",
          top: "24px",
          alignSelf: "flex-start",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          height: "fit-content",
          background: "#fafafa",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Фильтры</h3>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", color: "#555", marginBottom: "4px" }}>
            Год
          </div>
          <select
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ width: "100%", padding: "4px 8px" }}
            disabled={!availableYears.length}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div style={{ fontSize: "12px", color: "#555", marginBottom: "4px" }}>
            Тег
          </div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            style={{ width: "100%", padding: "4px 8px" }}
            disabled={!availableTags.length}
          >
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag === "all" ? "Все теги" : tag}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;

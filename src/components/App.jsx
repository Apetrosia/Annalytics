import React, { useEffect, useMemo, useState } from "react";
import Releases from "./Releases";
import Smth from "./Reviews";
import Tags from "./Tags";

import rawData from "../../data/Steam Trends 2023.json"; // синхронная загрузка файла [file:128]

// вспомогательная: строку "$14,99" -> число 14.99
function parsePrice(str) {
  if (!str) return 0;
  const normalized = str.replace(/\$/g, "").replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isNaN(value) ? 0 : value;
}

// вспомогательная: строку "88%" -> число 88
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
  const [processing, setProcessing] = useState(true);

  // асинхронный препроцесс уже загруженного rawData
  useEffect(() => {
    let cancelled = false;

    async function preprocess() {
      try {
        setProcessing(true);

        // имитируем «асинхронность», чтобы не блокировать основной поток
        // можно убрать setTimeout, если данных немного
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

  // фильтрация по выбранному году
  const filteredData = useMemo(() => {
    if (!selectedYear) return processedData;
    return processedData.filter(
      (d) => Number(d.releaseYear) === Number(selectedYear)
    );
  }, [processedData, selectedYear]);

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
      {/* Левая колонка: графики со скроллом */}
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
        <Tags data={filteredData} />
      </div>

      {/* Правая колонка: фиксированная панель фильтров */}
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

        {/* Фильтр по году */}
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
        </div>

        <div style={{ fontSize: "12px", color: "#777" }}>
          Здесь будут элементы управления фильтрами (год, жанры, теги и т.д.).
        </div>
      </div>
    </div>
  );
}

export default App;

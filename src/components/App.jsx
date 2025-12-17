import React from "react";
import Sales from "./Sales";
import Releases from "./Releases";
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

const data = rawData.map((d) => {
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

console.log("Processed data (first 3 rows):", data.slice(0, 3));

function App() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>Steam Trends 2023</h1>

      <Sales data={data} />
      <Releases data={data} />
      <Tags data={data} />
    </div>
  );
}

export default App;

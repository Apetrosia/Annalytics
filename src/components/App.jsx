import React from "react";
import Releases from "./Releases";
import Sales from "./Sales";
import Tags from "./Tags";

function App() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>Steam Trends 2023 — тестовые виджеты</h1>
      <Releases />
      <Sales />
      <Tags />
    </div>
  );
}

export default App;

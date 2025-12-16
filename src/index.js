import React from "react"
import { createRoot } from "react-dom/client"
import App from "./components/App"

const container = document.getElementById("root")
const root = createRoot(container)

root.render(<App></App>)

/*
fetch('Steam Trends 2023.json')
  .then(response => response.json())
  .then(data => {
    const titles = data.map(item => item.Title);
    const reviewsTotal = data.map(item => item['Reviews Total']);
    const ctx = document.getElementById('reviewsChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: titles,
        datasets: [{
          label: 'Всего отзывов',
          data: reviewsTotal,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }]
      }
    });
  });
*/
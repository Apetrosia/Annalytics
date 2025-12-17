import React from "react";

function Releases({ data }) {
    return (
        <div
        style={{
            border: "1px solid #ccc",
            padding: "16px",
            marginBottom: "16px",
        }}
        >
        <h2>Количество релизов по месяцам</h2>
        <div>Здесь позже будет столбчатая диаграмма</div>
        </div>
    );
}

export default Releases;

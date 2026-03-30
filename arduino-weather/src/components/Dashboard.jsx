import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend);

const [history, setHistory] = useState([]);

function Dashboard() {
  const [temperature, setTemperature] = useState(null);
  const [co2, setCo2] = useState(null);
  const [humidity, setHumidity] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch()//vores backend url
        .then((res) => res.json())
        .then((data) => {
          setTemperature(data.temperature);
          setCo2(data.co2);
          setHumidity(data.humidity);

          setHistory((prev) => [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              temperature: data.temperature,
              co2: data.co2,
              humidity: data.humidity,
            },
          ]);
        });
    };

    fetchData(); //første load
    const interval = setInterval(fetchData, 5000); //hvert 5 sekundt

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h1>Dashboard</h1>

      <div style={styles.grid}>
        {/* Temperature */}
        <div style={styles.card}>
          <h2>Temperature</h2>
          <p>{temperature !== null ? `${temperature} °C` : "Loading..."} </p>
        </div>

        {/* CO2 */}
        <div style={styles.card}>
          <h2>CO₂</h2>
          <p>{co2 !== null ? `${co2} ppm` : "Loading..."}</p>
        </div>

        {/* Humidity */}
        <div style={styles.card}>
          <h2>Humidity</h2>
          <p>{humidity !== null ? `${humidity} %` : "Loading..."}</p>
        </div>

        {/* Graph */}
        <div style={{ marginTop: "40px" }}>
          <h2>Sensor Graph</h2>
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
}

const chartData = {
  labels: history.map((item) => item.time),
  datasets: [
    {
      label: "Temeprature (°C)",
      data: history.map((item) => item.temperature),
      borderColor: "red",
      fill: false,
    },
    {
      label: "CO₂ (ppm)",
      data: history.map((item) => item.co2),
      borderColor: "blue",
      fill: false,
    },
    {
      label: "Humidity (%)",
      data: history.map((item) => item.humidity),
      borderColor: "green",
      fill: false,
    },
  ],
};

const styles = {
  container: { padding: "20px" },
  grid: { display: "flex", gap: "20px" },
  card: {
    background: "#f5f5f5",
    padding: "20px",
    borderRadius: "10px",
    width: "200px",
    textAlign: "center",
  },
};

export default Dashboard;
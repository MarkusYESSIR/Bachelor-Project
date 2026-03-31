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

// 1. Accept 'sensorData' as a prop from App.jsx
function Dashboard({ sensorData }) {
  const [history, setHistory] = useState([]);

  // 2. Automatically update the graph history whenever new MQTT data arrives
  useEffect(() => {
    if (sensorData) {
      setHistory((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          temperature: sensorData.temperature,
          co2: sensorData.correctedGasValue, 
          humidity: sensorData.humidity,
        };
        // Keep only the last 20 dots so the browser doesn't crash over time
        return [...prev, newPoint].slice(-20);
      });
    }
  }, [sensorData]);

  // 3. chartData is safely in the main function scope!
  const chartData = {
    labels: history.map((item) => item.time),
    datasets: [
      {
        label: "Temperature (°C)",
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

  return (
    <div style={styles.container}>
      {/* Wrapped the chart in the new chartCard style */}
      <div style={styles.chartCard}>
        <h2 style={styles.chartTitle}>Live Sensor Graph</h2>
        <Line data={chartData} />
      </div>
    </div>
  );
}

const styles = {
  container: { 
    width: "100%", 
    maxWidth: "800px",
    margin: "0 auto" 
  },
  chartCard: {
    backgroundColor: "#ffffff", // Makes the box solid white like the sensor cards
    borderRadius: "12px",       // Rounds the corners
    padding: "24px",            // Gives the chart breathing room away from the edges
    marginTop: "20px",          // Spaces it out from the row of cards above it
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)" // A very subtle shadow to match floating cards
  },
  chartTitle: {
    color: "#6b7280",           // A nice professional grey to match your card labels
    fontSize: "14px",
    textTransform: "uppercase", // MATCHES the "TEMPERATURE" style font
    letterSpacing: "1px",
    marginTop: "0",
    marginBottom: "20px",
    fontWeight: "600",
    fontFamily: "system-ui, sans-serif"
  }
};

export default Dashboard;
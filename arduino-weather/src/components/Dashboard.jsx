import React, { useEffect, useState } from "react";
import SensorGraph from "./SensorGraph"; // Import your new Graph component
import SensorCard from "./SensorCard";   // Import your existing Card component

function Dashboard({ sensorData }) {
  const [history, setHistory] = useState([]);

  // Automatically update the graph history whenever new MQTT data arrives
  useEffect(() => {
    if (sensorData) {
      setHistory((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          temperature: sensorData.temperature,
          co2: sensorData.correctedGasValue,
          humidity: sensorData.humidity,
        };
        // Keep the last 20 dots
        return [...prev, newPoint].slice(-20);
      });
    }
  }, [sensorData]);

  // Safely extract current values for the cards
  const currentTemp = sensorData?.temperature ?? "--";
  const currentHumidity = sensorData?.humidity ?? "--";
  const currentCo2 = sensorData?.correctedGasValue ?? "--";

  return (
    <div style={styles.container}>
      
      {/* --- TEMPERATURE SECTION --- */}
      <div style={styles.metricWrapper}>
        <SensorGraph 
          title="Temperature (°C)" 
          historyData={history} 
          dataKey="temperature" 
          color="red" 
        />
        <SensorCard label="Temperature" value={currentTemp} unit="°C" />
      </div>

      {/* --- HUMIDITY SECTION --- */}
      <div style={styles.metricWrapper}>
        <SensorGraph 
          title="Humidity (%)" 
          historyData={history} 
          dataKey="humidity" 
          color="green" 
        />
        <SensorCard label="Humidity" value={currentHumidity} unit="%" />
      </div>

      {/* --- CO2 SECTION --- */}
      <div style={styles.metricWrapper}>
        <SensorGraph 
          title="CO₂ (ppm)" 
          historyData={history} 
          dataKey="co2" 
          color="blue" 
        />
        <SensorCard label="Corrected Gas" value={currentCo2} unit="ppm" />
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  },
  metricWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "10px", // Adds a nice small gap between the Graph and the Card below it
  },
};

export default Dashboard;
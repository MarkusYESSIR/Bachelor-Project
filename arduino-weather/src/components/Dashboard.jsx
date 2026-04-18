import React, { useEffect, useState } from "react";
import SensorGraph from "./SensorGraph"; // Import Graph component
import SensorCard from "./SensorCard";   // Import Card component

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

  // Current values for the cards
  const currentTemp = sensorData?.temperature ?? "--";
  const currentHumidity = sensorData?.humidity ?? "--";
  const currentCo2 = sensorData?.correctedGasValue ?? "--";

// Helper function for the temperature alert
  const getTempAlert = (temp) => {
    if (temp === "--") return null; // Don't show alert if no data
    if (temp >= 35) return "⚠️ Temperature is too high right now, open a window";
    if (temp <= 15) return "❄️ Temperature is too low, close the window";
    return null;
  };

// Provides alerts for humidity and CO2 levels, similar to the temperature alert logic
  const getHumidityAlert = (humidity) => {
    if (humidity === "--") return null;
    if (humidity > 60) return "💧 Too humid: Open a window";
    if (humidity < 30) return "🌵 Air too dry: Use a humidifier";
    return null;
  };

  const getCo2Alert = (co2) => {
    if (co2 === "--") return null;
    // 1000ppm is the Danish Arbejdstilsynet limit for schools/offices
    if (co2 > 1000) return "🧠 CO₂ High: Open window for focus!";
    return null;
  };

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
        <SensorCard 
        label="Temperature" 
          value={currentTemp} 
          unit="°C" 
          alertMessage={getTempAlert(currentTemp)} // Passing currentTemp into the function
/>
      </div>

      {/* --- HUMIDITY SECTION --- */}
      <div style={styles.metricWrapper}>
        <SensorGraph 
          title="Humidity (%)" 
          historyData={history} 
          dataKey="humidity" 
          color="green" 
        />
        <SensorCard 
        label="Humidity"
        value={currentHumidity}
        unit="%" 
        alertMessage={getHumidityAlert(currentHumidity)} />
      </div>

      {/* --- CO2 SECTION --- */}
      <div style={styles.metricWrapper}>
        <SensorGraph 
          title="CO₂ (ppm)" 
          historyData={history} 
          dataKey="co2" 
          color="blue" 
        />
        <SensorCard
        label="Corrected Gas" 
        value={currentCo2}
        unit="ppm" 
        alertMessage={getCo2Alert(currentCo2)} />
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
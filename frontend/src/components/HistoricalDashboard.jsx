import React, { useState, useEffect } from "react";
import SensorGraph from "./SensorGraph";

function HistoricalDashboard({ historyData }) {
  // --- 1. Mobile Detection Logic (Copied from Dashboard.jsx) ---
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- 2. Styles (Reusing your layout logic) ---
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "40px",
      width: "100%",
      maxWidth: "800px",
      margin: "0 auto",
      padding: "10px 0",
      boxSizing: "border-box",
      alignItems: "center"
    },
    metricWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      // On mobile, take full width; on desktop, keep it readable
      width: isMobile ? "100%" : "90%", 
      alignItems: "stretch",
    },
    titleHeader: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#ffffff"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.titleHeader}>
        <h2>30-Day Historical Trends</h2>
        <p style={{ color: '#cbd5e1' }}>Hourly averages from InfluxDB</p>
      </div>
      
      {/* --- TEMPERATURE HISTORY --- */}
      <div style={styles.metricWrapper}>
        <SensorGraph 
          title="Temperature History (°C)" 
          historyData={historyData} 
          dataKey="temperature" 
          color="red" 
        />
      </div>

      {/* --- HUMIDITY HISTORY --- */}
      <div style={styles.metricWrapper}>
        <SensorGraph 
          title="Humidity History (%)" 
          historyData={historyData} 
          dataKey="humidity" 
          color="green" 
        />
      </div>

      {/* --- CO2 HISTORY --- */}
      <div style={styles.metricWrapper}>
        <SensorGraph 
          title="CO₂ History (ppm)" 
          historyData={historyData} 
          dataKey="correctedGasValue" 
          color="blue" 
        />
      </div>
    </div>
  );
}

export default HistoricalDashboard;
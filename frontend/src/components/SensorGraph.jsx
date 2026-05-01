import React from "react";
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

function SensorGraph({ title, historyData, dataKey, color }) {

  const isMobile = window.innerWidth < 768;

  const chartData = {
    labels: historyData.map((item) => item.time),
    datasets: [
      {
        label: title,
        data: historyData.map((item) => item[dataKey]),
        borderColor: color,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows the graph to fill the container height
  };

  const styles = {
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    width: "100%", 
    height: isMobile ? "200px" : "350px",
    boxSizing: "border-box",
  },
};



  return (
    <div style={styles.chartCard}>
      <Line data={chartData} />
    </div>
  );
}



export default SensorGraph;
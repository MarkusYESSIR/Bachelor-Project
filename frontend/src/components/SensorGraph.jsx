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

function SensorGraph({ title, historyData, dataKey, color }) {

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Simple mobile detection

  // Listen for window resize to update mobile state  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartData = {
    // This formats the time labels for both live and historical data
    labels: historyData.map((item) => {
      const date = new Date(item.time);
      // If the time is valid, format it; otherwise use raw string
      return isNaN(date) ? item.time : date.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }),
    datasets: [
      {
        label: title,
        data: historyData.map((item) => item[dataKey]),
        borderColor: color,
        fill: false,
        tension: 0.3, // Adds a slight curve to the lines
        pointRadius: isMobile ? 0 : 3, // Hides dots on mobile for a cleaner look
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          // Shrinks the colored box and text at the top
          boxWidth: isMobile ? 12 : 40,
          font: { size: isMobile ? 11 : 14 }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          // Shrinks the timestamps at the bottom
          font: { size: isMobile ? 10 : 12 },

          autoSkip: true,            // Tells Chart.js to hide overlapping labels
          maxTicksLimit: isMobile ? 5 : 10, // Limits the number of labels shown[cite: 4]
          maxRotation: 0,            // Keeps labels horizontal (optional, but cleaner)[cite: 4]
        },
        grid: {
          display: false
        } 
      },

      y: {
        ticks: {
          // Shrinks the numbers on the left
          font: { size: isMobile ? 10 : 12 }
        }, 
        grid: {
          color: 'rgba(0, 0, 0, 0.05)' // Light grid lines for better readability
        }
      }
    }
  };

  const styles = {
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: isMobile ? "12px" : "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    width: "100%", 
    boxSizing: "border-box",
  },
  chartWrapper: {
    width: "100%",
    // MOVE 'height' here!
    height: isMobile ? "200px" : "350px", 
    position: "relative", // This is vital for Chart.js responsiveness
  },
};



  return (
  <div style={styles.chartCard}>
    <div style={styles.chartWrapper}>
      <Line 
        key={isMobile ? 'mobile' : 'desktop'} // THIS IS THE MAGIC LINE
        data={chartData} 
        options={options} 
      />
    </div>
  </div>
);
}



export default SensorGraph;
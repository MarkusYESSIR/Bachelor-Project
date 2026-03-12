import { useState, useEffect } from 'react';
// Import your custom component from the new components folder!
import SensorCard from './components/SensorCard';

function App() {
  // Set up state to hold all three sensor readings
  const [sensorData, setSensorData] = useState({ 
    temperature: null, 
    humidity: null, 
    gas: null 
  });

  useEffect(() => {
    // Function to fetch data from our Node.js server
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/sensor');
        const data = await response.json();
        
        // Update the state with the new data
        if (data.temperature !== undefined) {
          setSensorData(data);
        }
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    // Fetch immediately on load, then set an interval for every 2 seconds
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // Basic styling for the main layout container
  const styles = {
    container: { 
      // Add Flexbox to force perfect centering
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%', // Tell it to take up the entire screen width
      marginTop: '50px', 
      fontFamily: 'system-ui, sans-serif', 
      padding: '0 20px',
      boxSizing: 'border-box'
    },
    cardContainer: { 
      display: 'flex', 
      justifyContent: 'center', 
      gap: '20px', 
      flexWrap: 'wrap', 
      marginTop: '20px', 
      maxWidth: '800px', 
      width: '100%' // Ensure the cards can spread out
    }
  };

  return (
    <div style={styles.container}>
      <h1>Air Quality Dashboard</h1>
      <div style={styles.cardContainer}>
        
        {/* We use our custom component 3 times, passing in the specific props */}
        <SensorCard 
          label="Temperature" 
          value={sensorData.temperature} 
          unit="°C" 
        />
        <SensorCard 
          label="Humidity" 
          value={sensorData.humidity} 
          unit="%" 
        />
        <SensorCard 
          label="Gas Level" 
          value={sensorData.gas} 
          unit="ppm" 
        />

      </div>
    </div>
  );
}

export default App;
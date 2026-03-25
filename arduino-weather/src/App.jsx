import { useState, useEffect } from 'react';
import SensorCard from './components/SensorCard';

function App() {

  const [sensorData, setSensorData] = useState({ 
    temperature: null, 
    humidity: null, 
    rawGasValue: null,
    correctedGasValue: null 
  });

  useEffect(() => {

    /*
    const fetchSensorData = async () => { ... }
    */

    // --- MOCK DATA GENERATOR ---
    // This simulates the backend sending us a new reading every 2 seconds
    const interval = setInterval(() => {
      setSensorData({
        // Generate a random temperature between 20.0 and 25.0
        temperature: (20 + Math.random() * 5).toFixed(1), 
        // Generate random humidity between 40.0 and 50.0
        humidity: (40 + Math.random() * 10).toFixed(1),   
        // Generate random gas values
        rawGasValue: Math.floor(300 + Math.random() * 50),
        correctedGasValue: Math.floor(310 + Math.random() * 50)
      });
    }, 2000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);


  const styles = {
    container: { 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%', 
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
      width: '100%' 
    }
  };

  return (
    <div style={styles.container}>
      <h1>Air Quality Dashboard</h1>
      <hr style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', color: '#ccc' }} />
      <div style={styles.cardContainer}>
        
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
          label="Raw Gas Value" 
          value={sensorData.rawGasValue} 
          unit="ppm" 
        />
        <SensorCard 
          label="Corrected Gas Value" 
          value={sensorData.correctedGasValue} 
          unit="ppm" 
        />

      </div>
    </div>
  );
}

export default App;
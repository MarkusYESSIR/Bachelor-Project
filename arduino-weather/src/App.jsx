
import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import SensorCard from './components/SensorCard';
import Dashboard from './components/Dashboard';

function App() {

  const [sensorData1, setSensorData1] = useState(null);
  const [sensorData2, setSensorData2] = useState(null);


 useEffect(() => {
    const fetchSensorData = async () => {
      try {
        // We are back to HTTPS and your secure DuckDNS domain!
        const response = await fetch('https://indoor-climate-measure.duckdns.org/api/sensors'); 
        
        if (!response.ok) throw new Error("API not answering");
        
        const data = await response.json();
        
        if (data.sensor1) setSensorData1(data.sensor1);
        if (data.sensor2) setSensorData2(data.sensor2);
        
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 2000);
    return () => clearInterval(intervalId);
  }, []);

  //Function to calculate the avg of the 2 sensors. If 1 of them is null, it will return the other one. If both are null, it will return null.
const getAverage = (key) => { 
if (sensorData1 && sensorData2) {
  return ((sensorData1[key] + sensorData2[key]) / 2).toFixed(1); //Calculate the average and round to 1 decimals
}
  else if (sensorData1) {
    return sensorData1[key].toFixed(1); //Return the value from sensor 1 if sensor 2 is null
  }
  else if (sensorData2) {
    return sensorData2[key].toFixed(1); //Return the value from sensor 2 if sensor 1 is null
  }
  else {
    return null; //Return null if both sensors are null
  };
};

// --- NEW: Assemble the data package for the Dashboard charts ---
  let averagedSensorPackage = null;
  if (sensorData1 || sensorData2) {
    averagedSensorPackage = {
      // parseFloat converts the string from .toFixed(1) back into a safe number for Chart.js
      temperature: parseFloat(getAverage('temperature')),
      correctedGasValue: parseFloat(getAverage('correctedGasValue')),
      humidity: parseFloat(getAverage('humidity')),
    };
  }

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
        
    //The graph with the cards. 
      <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
         <Dashboard sensorData={averagedSensorPackage} />
      </div>
       
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import SensorCard from './components/SensorCard';

function App() {

  const [sensorData, setSensorData] = useState({ 
    temperature: null, 
    humidity: null, 
    rawGasValue: null,
    correctedGasValue: null 
  });

  useEffect(() => {

  const brokerUrl = 'ws://51.20.131.161:9001';
  const client = mqtt.connect(brokerUrl);

  client.on('connect', () => {console.log('Connected to MQTT Broker');
  client.subscribe('bachelor-project/sensors');  
  });

  client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log('Reading recieved', data);
    setSensorData(data);}
    catch (error) {console.error('Error parsing MQTT message:', error);}
  });

  // Cleanup on unmount. LOWK CHECK DET HER TOG DET FRA STACKOVERFLOW FATTER DET IKKE HELT
    return () => {
      if (client) {
        client.end();
      }
    };
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
import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import Dashboard from './components/Dashboard';

function App() {

  const [sensorData1, setSensorData1] = useState(null);
  const [sensorData2, setSensorData2] = useState(null);

  // --- 1. MQTT Connection Logic ---
  useEffect(() => {
    const connectionOptions = {
      username: 'frontend_user', 
      password: 'hemmelig123',
      protocol: 'wss',
      clientid: 'react-client-' + Math.random().toString(16).substring(2, 10)
    };
    
    const brokerUrl = 'wss://indoor-climate-measure.duckdns.org:9001/mqtt'; 
    const client = mqtt.connect(brokerUrl, connectionOptions);
    
    client.on('error', (err) => {
      console.error('MQTT error: ', err);
    });

    client.on('connect', () => {
      console.log('Connected to MQTT Broker');
      client.subscribe('bachelor-project/sensors/#');  
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());

        // Sort into the right bucket
        if (topic === 'bachelor-project/sensors/1') {
            setSensorData1(data);  
        }
        else if (topic === 'bachelor-project/sensors/2') {
            setSensorData2(data);  
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);


  // ====================2. API Gateway, that tracks page viisits =====================
  useEffect(() => {
    // IMPORTANT: Replace this with your actual API Gateway Invoke URL
    const API_URL = 'https://qg85l35qh4.execute-api.eu-north-1.amazonaws.com/log-visit';

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'page_view' })
    })
    .then(response => response.json())
    .then(data => console.log('Successfully logged visit to AWS:', data))
    .catch(err => console.error('Failed to log visit:', err));
    
  }, []); // The empty array ensures this only fires once when the user loads the page


  // --- 3. Data Processing ---
  // Function to calculate the avg of the 2 sensors.
  const getAverage = (key) => { 
    if (sensorData1 && sensorData2) {
      return ((sensorData1[key] + sensorData2[key]) / 2).toFixed(1); 
    }
    else if (sensorData1) {
      return sensorData1[key].toFixed(1); 
    }
    else if (sensorData2) {
      return sensorData2[key].toFixed(1); 
    }
    else {
      return null; 
    };
  };

  // Assemble the data package for the Dashboard charts
  let averagedSensorPackage = null;
  if (sensorData1 || sensorData2) {
    averagedSensorPackage = {
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
        <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
           <Dashboard sensorData={averagedSensorPackage} />
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import SensorCard from './components/SensorCard';
import Dashboard from './components/Dashboard';

function App() {

  const [sensorData1, setSensorData1] = useState(null);
  const [sensorData2, setSensorData2] = useState(null);

 useEffect(() => {

// (This is where our .env security fix will go eventually!)
  const connectionOptions = {
      username: 'frontend_user', 
      password: 'hemmelig123',
  };
    
//Using websockets
   const brokerUrl = 'wss://indoor-climate-measure.duckdns.org:9001/mqtt'; 
   const client = mqtt.connect(brokerUrl, connectionOptions);
  client.on('error', (err) => {
    console.error('MQTT error: ', err);
  });

  client.on('connect', () => {console.log('Connected to MQTT Broker');
  client.subscribe('bachelor-project/sensors/#');  //Subscribe to all topics under bachelor-project/sensors (/# means all subtopics mqtt bs)
  });

  client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

   // Sort into the right sheit / bucket
if (topic === 'bachelor-project/sensors/1') {
    setSensorData1(data);  // <--- Must be setSensorData1
}
else if (topic === 'bachelor-project/sensors/2') {
    setSensorData2(data);  // <--- Must be setSensorData2
}
  }
    catch (error) {console.error('Error parsing MQTT message:', error);}
  });

  // Cleanup on unmount.
    return () => {
      if (client) {
        client.end();
      }
    };
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

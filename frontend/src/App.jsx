import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import Dashboard from './components/Dashboard';
import HistoricalDashboard from './components/HistoricalDashboard';

function App() {

  const [sensorData1, setSensorData1] = useState(null);
  const [sensorData2, setSensorData2] = useState(null);

// View and History State ---
  const [view, setView] = useState('live'); // 'live' or 'historical'
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);


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


  // ====================2. API Gateway, that tracks page visits =====================
  useEffect(() => {
    // IMPORTANT: Replace this with your actual API Gateway Invoke URL
    const API_URL = 'https://0gc81hv77f.execute-api.eu-north-1.amazonaws.com/log-visit';

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
  

// --- NEW: 3. Fetch Historical Data from AWS ---
  const handleFetchHistory = async () => {
    setIsLoadingHistory(true);
    // Replace this with your new API Gateway History Resource URL
    const HISTORY_API = 'https://0gc81hv77f.execute-api.eu-north-1.amazonaws.com/history'; 

    try {
      const response = await fetch(HISTORY_API);
      const data = await response.json();
      setHistoryData(data); // This should be the 720 points from InfluxDB
      setView('historical'); // Switch the view once data is loaded
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
      alert("Could not load history. Check API Gateway.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
    },
    nav: { 
      display: 'flex', 
      gap: '15px', 
      marginBottom: '20px' 
    },
    navButton: { 
      padding: '10px 20px', 
      cursor: 'pointer', 
      borderRadius: '5px', 
      border: '1px solid #ccc', 
      backgroundColor: '#374151', // Dark grey for the "inactive" state
      color: 'white',             // This prevents the white-on-white text
      fontSize: '14px',
      transition: '0.3s'
    },
    activeButton: { 
      backgroundColor: '#3b82f6', // Bright blue to show which page you're on
      color: 'white', 
      border: '1px solid #3b82f6' 
    }
  };

  return (
  <div style={styles.container}>
    <h1>Air Quality Dashboard</h1>

    {/* NEW: This is the navigation bar using the new styles */}
    <div style={styles.nav}>
      <button 
        style={view === 'live' ? {...styles.navButton, ...styles.activeButton} : styles.navButton}
        onClick={() => setView('live')}
      >
        Live View
      </button>
      
      <button 
        style={view === 'historical' ? {...styles.navButton, ...styles.activeButton} : styles.navButton}
        onClick={handleFetchHistory} // This triggers the AWS fetch
      >
        30-Day History
      </button>
    </div>

    <hr style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', color: '#ccc' }} />
    
    {/* Removed the extra cardContainer div to prevent nesting alignment issues */}
    <div style={{ width: '100%', maxWidth: '800px' }}>
        {/* THIS IS THE BIG CHANGE: It swaps the component based on 'view' */}
      {view === 'live' ? (
        <Dashboard sensorData={averagedSensorPackage} />
      ) : (
        <HistoricalDashboard historyData={historyData} />
      )}
    </div>
  </div>
);
}

export default App;
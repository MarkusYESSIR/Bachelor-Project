const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
app.use(cors()); // Allows React to fetch data from this server

// --- IMPORTANT: UPDATE YOUR PORT NAME ---
// Windows is usually 'COM3', 'COM4', etc.
// Mac/Linux is usually '/dev/tty.usbmodem...' or '/dev/ttyUSB0'
const portName = '/dev/ttyACM0'; 

// Connect to the Arduino
const port = new SerialPort({ path: portName, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// We will store the latest reading here
let latestData = { humidity: null, temperature: null };

// Listen for incoming data from the Arduino
parser.on('data', (data) => {
  try {
    latestData = JSON.parse(data); // Convert the JSON string into a JavaScript object
    console.log('Latest reading:', latestData);
  } catch (error) {
    console.error('Waiting for clean data...', data);
  }
});

// Create an endpoint for React to get the data
app.get('/api/sensor', (req, res) => {
  res.json(latestData);
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Node server is running on http://localhost:${PORT}`);
});
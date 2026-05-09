# Air Quality Dashboard Project

This project provides an end-to-end IoT solution for monitoring indoor climate. It captures temperature, humidity, and CO₂ equivalent (gas) readings using Arduino-based nodes, forwards them securely through a local Raspberry Pi edge gateway, and displays both live and 30-day historical data on a React-based web dashboard.

---

## 🏗️ Architecture Overview

The system is broken down into three main tiers:

1. **Sensor Nodes (Arduino):** Collects environmental data and sends it over local Wi-Fi to an edge gateway.
2. **Edge Gateway (Raspberry Pi):** Acts as a local MQTT broker to receive unencrypted data from the sensor nodes, then securely forwards it to a cloud broker (AWS EC2) using mTLS encryption.
3. **Web Dashboard (React):** Connects to the cloud MQTT broker via WebSockets for live data and fetches historical data from an AWS API Gateway, presenting metrics and actionable alerts to the user.

---

## 🔌 Hardware Requirements

**Microcontroller:** Arduino board with Wi-Fi capabilities (using the `WiFiNINA.h` library).
 
**Sensors:** * DHT11 Temperature and Humidity sensor connected to Pin 2.

* MQ135 Gas sensor connected to analog Pin A0.
 
**Gateway:** A Raspberry Pi to act as the local edge gateway.
---

## 💻 Software Components

### 1. Arduino Sensor Node (`arduino_sensor_sketch.ino`)

The sensor node connects to your local Wi-Fi and begins measuring the environment.

* The system allows the MQ135 sensor 3 minutes to warm up before taking its first measurement.


* It reads data from the DHT11 and MQ135 sensors.


* The baseline (R0) value for the MQ135 (Sensor 2) is pre-calibrated to 360.65.


* Measurements are packaged into a JSON payload containing the sensor ID, humidity, temperature, and corrected gas value .


* This payload is published to a local topic (`local/sensors/<sensorID>`).


* The node connects to the local Raspberry Pi gateway.


* The local MQTT broker is targeted at IP `172.18.206.73`.


* The connection utilizes the standard, unencrypted port 1883.



### 2. Baseline Calibration (`baseline-measure.ino`)

A helper script is included to calibrate the MQ135 sensor.

* It instructs the user to wait 3 minutes for the sensor to warm up.


* After the warmup period, it continuously calculates and prints the `R0` baseline value to the Serial monitor, which can then be hardcoded into the main sensor sketch.



### 3. Edge Gateway (`edge_gateway.py`)

This Python script runs on the Raspberry Pi and utilizes the `paho-mqtt` library to bridge the local network and the cloud.

* **Local Listener:** Subscribes to `local/sensors/#` on the Pi's internal broker (`127.0.0.1:1883`) to capture data from the Arduinos.
* **Cloud Forwarder:** Re-publishes the intercepted payloads to an AWS EC2 instance (`51.20.131.161:8883`) under the topic `bachelor-project/sensors/<sensor_id>`. It secures this external connection using mTLS (Mutual TLS) with custom certificates.

### 4. React Frontend (`App.jsx` & Components)

A responsive web application built with React and Chart.js to visualize the indoor climate.

* **Live View:** Connects to a cloud MQTT broker over WebSockets (`wss://indoor-climate-measure.duckdns.org:9001/mqtt`). It listens to the `bachelor-project/sensors/#` topic to plot real-time data across three `SensorGraph` components (Temperature, Humidity, CO₂).
* **Historical View:** By clicking the "30-Day History" button, the app fetches hourly average data from an AWS API Gateway (backed by InfluxDB) and updates the charts with long-term trends.
* **Alert System:** The `SensorCard` components monitor incoming live data and trigger text-based alerts if values fall out of healthy ranges (e.g., CO₂ > 1000ppm or Temperature > 25°C).

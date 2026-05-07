#include <SPI.h>
#include <WiFiNINA.h>
#include <PubSubClient.h>
#include "DHT.h"
#include "MQ135.h"

// ------------------------------Network credentials:--------------------
const char ssid[] = "OnePlus 8";
const char password[] = "m59uwjbf";

//-------------------- MQTT Local Gateway Settings:------------------------
// IMPORTANT: This must be the local Wi-Fi IP address of your Raspberry Pi!
const char* mqttServer = "192.168.1.X"; 
const int mqttPort = 1883; // Standard, unencrypted local port

// Set the sensor ID here:
String sensorID = "2";

// ---------------------The sensor setup: ----------------------
#define DHTPIN 2
#define DHTTYPE DHT11
#define PIN_MQ135 A0

DHT dht(DHTPIN, DHTTYPE);

// Baseline for Sensor 2 is 360.65
MQ135 gasSensor = MQ135(PIN_MQ135, 360.65, 10);

//------------- Standard Client Setup: ----------------
WiFiClient wifiClient;
PubSubClient client(wifiClient);

void setup() {
  Serial.begin(9600);
  dht.begin();

  Serial.print("Connecting to WiFi...");
  Serial.println(ssid);
  while (WiFi.begin(ssid, password) != WL_CONNECTED) { 
    delay(5000);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi!");

  client.setServer(mqttServer, mqttPort);
  
  Serial.println("Warming up the MQ135 sensor for 3 minutes...");
  delay(180000);
}

void loop() {
  delay(10000);

  if (!client.connected()) {
    Serial.println("Connecting to local Raspberry Pi Gateway...");
    
    // Set user and password for each arduino here!!!
    if (client.connect(("UnoNode-" + sensorID).c_str(), "sensor_node_2", "your_local_password")) {      Serial.println("Connected to local Gateway!");
    } else { 
      Serial.print("Failed to connect. State: ");
      Serial.println(client.state());
      return;
    }
  }

  client.loop();

  float humidity = dht.readHumidity();
  float tempC = dht.readTemperature();

  if (isnan(humidity) || isnan(tempC) || tempC > 35 || tempC < 5 || humidity > 80 || humidity < 10) {
    Serial.println("Error: Sensor bounds. Skipping publish.");
    return;
  }

  float correctedGasValue = gasSensor.getCorrectedPPM(tempC, humidity);

  if (isnan(correctedGasValue) || correctedGasValue > 5000 || correctedGasValue < 200) { 
    Serial.println("Error: MQ135 bounds. Skipping publish.");
    return;
  }

  // Construct JSON Payload
  String payload = "{"; 
  payload += "\"sensor_id\": \"" + sensorID + "\", ";
  payload += "\"humidity\": " + String(humidity);
  payload += ", \"temperature\": " + String(tempC);
  payload += ", \"correctedGasValue\": " + String(correctedGasValue);
  payload += "}";

  Serial.print("Sending to Gateway: ");
  Serial.println(payload); 

  // Publish to a local topic
  String localTopic = "local/sensors/" + sensorID;
  client.publish(localTopic.c_str(), payload.c_str()); 
} 
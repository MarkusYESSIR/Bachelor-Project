#include <SPI.h>
#include <WiFiNINA.h>
#include <PubSubClient.h>
#include "DHT.h"
#include "MQ135.h"

// ------------------------------Network credentials:--------------------
const char ssid[] = "Markus konrad ";
const char password[] = "mit12345";

//-------------------- MQTT Local Gateway Settings:------------------------
// IMPORTANT: This must be the local Wi-Fi IP address of your Raspberry Pi!
const char* mqttServer = "172.18.206.73"; 
const int mqttPort = 1883; // Standard, unencrypted local port

// Set the sensor ID here:
String sensorID = "1";

// ---------------------The sensor setup: ----------------------
#define DHTPIN 2
#define DHTTYPE DHT11
#define PIN_MQ135 A0
#define BUZZER_PIN 8

//Thresholds and time between beeps
const float TEMP_ALARM_THRESHOLD = 25.0; //beeps if tempC is over 25C
const float GAS_ALARM_THRESHOLD = 1000.0; //beeps if ppm > 1000
const unsigned long ALARM_COOLDOWN = 30000; // so it max beeps once every 30s
unsigned long lastAlarmTime = 0;
bool isFirstAlarm = true;


DHT dht(DHTPIN, DHTTYPE);

// Baseline for Sensor 2 is 360.65
MQ135 gasSensor = MQ135(PIN_MQ135, 360.65, 10);

//------------- Standard Client Setup: ----------------
WiFiClient wifiClient;
PubSubClient client(wifiClient);

void setup() {
  Serial.begin(9600);
  dht.begin();

  //set to output
  pinMode(BUZZER_PIN, OUTPUT);
  //STARTS of low
  digitalWrite(BUZZER_PIN, LOW);


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
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("WiFi connection lost. Reconnecting to ");
    Serial.print(ssid);
    
    // Loop until reconnected
    while (WiFi.status() != WL_CONNECTED) {
      WiFi.begin(ssid, password);
      delay(5000);
      Serial.print(".");
    }
    Serial.println("\nReconnected to WiFi!");
  }

    if (!client.connected()) {
    Serial.println("Connecting to local Raspberry Pi Gateway...");
    
    // Set user and password for each arduino here!!!
    if (client.connect(("UnoNode-" + sensorID).c_str(), "sensor_node1", "hejsa1")) {      Serial.println("Connected to local Gateway!");
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

  //----------Logic for alarm:)------------------
  // Check if valid readings exceed your defined thresholds
  if (tempC > TEMP_ALARM_THRESHOLD || correctedGasValue > GAS_ALARM_THRESHOLD) {
    Serial.println("ALARM: Threshold exceeded! Sounding buzzer...");
    digitalWrite(BUZZER_PIN, HIGH); // Turn buzzer ON
    delay(200);                     // Short beep duration
    digitalWrite(BUZZER_PIN, LOW);  // Turn buzzer OFF
  }


  // Construct JSON Payload
  String payload = "{"; 
  payload += "\"sensor_id\": \"" + sensorID + "\", ";
  payload += "\"humidity\": " + String(humidity);
  payload += ", \"temperature\": " + String(tempC);
  payload += ", \"correctedGasValue\": " + String(correctedGa sValue);
  payload += "}";

  Serial.print("Sending to Gateway: ");
  Serial.println(payload); 

  // Publish to a local topic
  String localTopic = "local/sensors/" + sensorID;
  client.publish(localTopic.c_str(), payload.c_str()); 
}
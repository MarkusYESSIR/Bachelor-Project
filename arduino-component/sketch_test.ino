#include <SPI.h>
#include <WiFiNINA.h>
#include <PubSubClient.h>
#include "DHT.h"
#include "MQ135.h"

// ------------------------------Network credentials:--------------------
const char ssid[] = "Network SSID";
const char password[] = "Network Password";


//-------------------- MQTT settinfs:------------------------
const char* mqttServer = "51.20.131.161";
const int mqttPort = 8883;
const char mqtt_user[] = "sensor_node";
const char mqtt_pass[] = "bachelorproject2026"; //might be thesis2026 but not sure yet, will update if needed


// ---------------------The sensor setup: ----------------------
// Define the pin the DHT11 is connected to (Digital Pin 2)
#define DHTPIN 2

// Define the type of DHT sensor we are using
#define DHTTYPE DHT11

// Define the pin the MQ135 is connected to is Analog Pin A0. When we reference this pin in the code, we will use the name PIN_MQ135 instead of A0 for better readability and maintainability. 
// This way, if we ever need to change the pin in the future, we only need to update it in one place.
#define PIN_MQ135 A0

// Initialize the DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// We link the gasSensor object to the correct pin for the MQ135 sensor (A0)
// this must be updated with baseline meassurement and resitande of 10kOhm.
MQ135 gasSensor = MQ135(PIN_MQ135);

//-------------  Secure client setup for MQTT: ----------------
WiFiSSLClient sslClient;
PubSubClient client(sslClient);


void setup() {
  // Start the Serial Monitor at 9600 baud rate
  Serial.begin(9600);

  // Start the dht11 sensor
  dht.begin();

  //Establish wifi connection
  Serial.print("Connecting to WiFi...");
  Serial.println(ssid);
  while (WiFi.begin(ssid, password) != WL_CONNECTED) {
    delay(5000);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");


 //Tell the MQTT client where to send data to. 
 client.setServer(mqttServer, mqttPort);

  Serial.println("Warming up theMQ135 sensor for 3 minutes...");
  delay(180000); 
}

void loop() {
  // Defines a delay of 10 seconds between each reading
  delay(10000);


//----------Establish connection to EC2 server----------
 // Check if we are connected to the MQTT broker. If not, connect securely!
 if (!client.connected()) {
  Serial.println("Trying to connect to  encrypted MQTT broker...");
// Connect using the secure port AND the username/password
//IMPORTANT: # MUST BE CHANGED TO EITHER 1 OR 2 DEPENDING ON WHICH SENSOR WE ARE USING. BOTH MUST NOT BE THE SAME!!!!!!!!!!!!!!!!!!!
if (client.connect("UnoWifiClient-#", mqtt_user, mqtt_pass)) {
  Serial.println("Connected to MQTT broker securely!");
 } else { Serial.print("Failed to connect to MQTT broker. Will retry in 10 secinds");
  return;
 }
}

// Keep the server connection alive
  client.loop();



//----------Sensor readings ----------------
  // Read humiditywith decimals
  float humidity = dht.readHumidity();
  
  // Read temperature as Celsius
  float tempC = dht.readTemperature();


  // Check if any reads failed from dht11 gives an erro and then sets default values for DHT11
  if (isnan(humidity) || isnan(tempC)) {
    Serial.println("{\"warning\": \"Failed to read DHT. Using default climate values for MQ135.\"}");
    
    tempC = 22.0;
    humidity = 40.0;
  }
  /* Get the corrected gas value based on the current temperature and humidity
   in line 19 we created the gasSensor object and linked it to the correct pin for the MQ135 sensor (A0)
   The function getCorrectedGas takes the raw gas value, temperature, and humidity as inputs
   and returns a corrected gas value that accounts for the influence of temperature and humidity on the sensor's readings.
   This function comes with the MQ135 library. This is because the MQ135 can only meassure gas not specific types*/
  float correctedGasValue = gasSensor.getCorrectedPPM(tempC, humidity);

  if (isnan(correctedGasValue)) {
    Serial.println("{\"warning\": \"Failed to read MQ135. Using default gas values.\"}");
    
    correctedGasValue = 0;
  }

// --- BUILD AND SEND JSON ---
  // We piece together the JSON String 
  String payload = "{\"humidity\": ";
  payload += humidity;
  payload += ", \"temperature\": ";
  payload += tempC;
  payload += ", \"correctedGasValue\": ";
  payload += correctedGasValue;
  payload += "}";

  // Print it to the Serial Monitor 
  Serial.print("Publishing to EC2: ");
  Serial.println(payload);

  // Send the payload securely over Wi-Fi to your EC2 Server!
  //IMPORTANT: # MUST BE CHANGED TO EITHER 1 OR 2 DEPENDING ON WHICH SENSOR WE ARE USING. BOTH MUST NOT BE THE SAME!!!!!!!!!!!!!!!!!!!
  client.publish("bachelor-project/sensors/#", payload.c_str());
}
#include "DHT.h"

// Define the pin the DHT11 is connected to (Digital Pin 2)
#define DHTPIN 2

// Define the type of DHT sensor we are using
#define DHTTYPE DHT11

// Initialize the DHT sensor
DHT dht(DHTPIN, DHTTYPE);


void setup() {
  // put your setup code here, to run once:
  // Start the Serial Monitor at 9600 baud rate
  Serial.begin(9600);

  // Start the sensor
  dht.begin();

}

void loop() {
  // put your main code here, to run repeatedly:
  // Wait a few seconds between measurements (DHT11 is a slow sensor)
  delay(2000);

  // Read humiditywith decimals
  float humidity = dht.readHumidity();
  
  // Read temperature as Celsius
  float tempC = dht.readTemperature();

  // Check if any reads failed and exit early (to try again)
  if (isnan(humidity) || isnan(tempC) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
 // Print the results as a JSON string
  Serial.print("{\"humidity\": ");
  Serial.print(humidity);
  Serial.print(", \"temperature\": ");
  Serial.print(tempC);
  Serial.println("}");

} 

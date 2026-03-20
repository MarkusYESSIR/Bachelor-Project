#include "DHT.h"
#include "MQ135.h"

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
MQ135 gasSensor = MQ135(PIN_MQ135);

void setup() {
  // Start the Serial Monitor at 9600 baud rate
  Serial.begin(9600);

  // Start the dht11 sensor
  dht.begin();
  delay(180000); 
}

void loop() {
  // Defines a delay of 10 seconds between each reading
  delay(10000);

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

  // Read the air quality from the MQ135 sensor
  int rawGasValue = analogRead(PIN_MQ135);

  /* Get the corrected gas value based on the current temperature and humidity
   in line 19 we created the gasSensor object and linked it to the correct pin for the MQ135 sensor (A0)
   The function getCorrectedGas takes the raw gas value, temperature, and humidity as inputs
   and returns a corrected gas value that accounts for the influence of temperature and humidity on the sensor's readings.
   This function comes with the MQ135 library. This is because the MQ135 can only meassure gas not specific types*/
  float correctedGasValue = gasSensor.getCorrectedPPM(tempC, humidity);

  if (isnan(rawGasValue) || isnan(correctedGasValue)) {
    Serial.println("{\"warning\": \"Failed to read MQ135. Using default gas values.\"}");
    
    rawGasValue = 0;
    correctedGasValue = 0;
  }

 // Print the results as a JSON string
  Serial.print("{\"humidity\": ");
  Serial.print(humidity);
  Serial.print(", \"temperature\": ");
  Serial.print(tempC);
  Serial.print(", \"rawGasValue\": ");
  Serial.print(rawGasValue);
  Serial.print(", \"correctedGasValue\": ");
  Serial.print(correctedGasValue);
  Serial.println("}");
} 

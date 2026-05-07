#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoBearSSL.h>
#include <PubSubClient.h>
#include "DHT.h"
#include "MQ135.h"

// ------------------------------Network credentials:--------------------
const char ssid[] = "Markus konrad";
const char password[] = "mit12345";

//-------------------- MQTT settings:------------------------
const char* mqttServer = "51.20.131.161"; 
const int mqttPort = 8883;
const char mqtt_user[] = "sensor_node";
const char mqtt_pass[] = "bachelorproject2026";

// Set the sensor ID here:
String sensorID = "2";

//-------------Certificates for mTLS with out broker: --------------
// PASTE YOUR CERTIFICATES BETWEEN THE R"( )" BRACKETS BELOW
const char broker_ca_cert[] = R"(
-----BEGIN CERTIFICATE-----
MIIDozCCAougAwIBAgIUdyiQIko2GbTx7CjwD6DtN9ZU8YswDQYJKoZIhvcNAQEL
BQAwYTELMAkGA1UEBhMCREsxEDAOBgNVBAgMB0Rlbm1hcmsxEzARBgNVBAcMCkNv
cGVuaGFnZW4xGDAWBgNVBAoMD0JhY2hlbG9yUHJvamVjdDERMA8GA1UEAwwITXlS
b290Q0EwHhcNMjYwNTA1MTAzNzI4WhcNMzYwNTAyMTAzNzI4WjBhMQswCQYDVQQG
EwJESzEQMA4GA1UECAwHRGVubWFyazETMBEGA1UEBwwKQ29wZW5oYWdlbjEYMBYG
A1UECgwPQmFjaGVsb3JQcm9qZWN0MREwDwYDVQQDDAhNeVJvb3RDQTCCASIwDQYJ
KoZIhvcNAQEBBQADggEPADCCAQoCggEBAMAIsyKmQpQEqvFeYjkAqZ9c9t7Xfxf0
r0TyT0xs+DlEpxHtjAoNeQPeRtV0X6jqJPxLFHMgR6BYvpmsg92R/Wds23JR0bjW
KBKxLrrW+mf/w92VdnzaAUu4etlLBnu+MyiYSdyBFr0Xle2Z2fyavuEmL5Ott8D6
gnby3W3J8DzmM4z9u21UYLNZouEQTpTUTLpwCd5l3c16fb8sUzzc2KabbXg11G+H
gLFDq3vHMxGr0jocXlBiS/ASBam/a0HuXpwG/AK0EbfOaqd2AdZvj5bkccbw95lE
jJqb0fSo9c3mY8OndEWzZNDpDGJW2I2APsqC8OnMrf65UBTLJ2VRf2kCAwEAAaNT
MFEwHQYDVR0OBBYEFDu0SiOv7FA3PeXWLu5eQW8rM7vAMB8GA1UdIwQYMBaAFDu0
SiOv7FA3PeXWLu5eQW8rM7vAMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQEL
BQADggEBAKJmgAqMKKjymt21t78KLIc6hyp4oVnSLy7AQgteL+5pQguMlODwpU8y
0dNPgzp+Tm1oaqeAgiWKKVzobw3+XJm1/aF8OpclA/tIPrcnhL+PZ362tlyU//4c
WLEtF/Hnkj//PZcR50gOf+Tq8jiqVNUQvU6VGcrMvAlMlv3upT9w0bwbZSEQDEca
7tVbFhqMSIKrBSm0Lol/5FM1VjlfIo78aFbwAxzowCBo7MXAKBV/oMCpOXVuGGPF
ZcK140rHwStw5Km0X/08NNB77BJblk/1EIttZWG24g4otcbAO+55JqaIJcU333dM
vaTG0+4Ww1YMGfDxVttSkDF+RLz92Z8=
-----END CERTIFICATE-----
)";

const char client_cert[] = R"(
-----BEGIN CERTIFICATE-----
MIICgTCCAWkCFF0DwBSDQowwKYzkZaRn0+0EzKfqMA0GCSqGSIb3DQEBCwUAMGEx
CzAJBgNVBAYTAkRLMRAwDgYDVQQIDAdEZW5tYXJrMRMwEQYDVQQHDApDb3Blbmhh
Z2VuMRgwFgYDVQQKDA9CYWNoZWxvclByb2plY3QxETAPBgNVBAMMCE15Um9vdENB
MB4XDTI2MDUwNTEwNDE0MloXDTM2MDUwMjEwNDE0MlowZDELMAkGA1UEBhMCREsx
EDAOBgNVBAgMB0Rlbm1hcmsxEzARBgNVBAcMCkNvcGVuaGFnZW4xGDAWBgNVBAoM
D0JhY2hlbG9yUHJvamVjdDEUMBIGA1UEAwwLU2Vuc29yTm9kZTIwWTATBgcqhkjO
PQIBBggqhkjOPQMBBwNCAARAOoQFDpRBjUZAEYZ3+SW6gVfuGeHIx2wMpbs9wF8u
xZtD29iLNt1skzmWOrHw8A7oMzfailkq866MuHbb87V5MA0GCSqGSIb3DQEBCwUA
A4IBAQAJ+/+njIQ4Djr8ivhbEuCRUul/xM0YaFlhU+L27DUG68R4VcyGO+fr9KnP
7U7ahRrOKMxwxrqzDAGbYBRrr6EOfUC6jihePY+kjOnsvN4hj+7AHND5Be+2i0fS
sVJhR+CbOZV6kQDwr2aQJQyoB+s5sIOZrQ/zXeFFVinpRQlV7W6N9iEMdqeEUZlY
vlM8SHd0RB618QQbnl+LHDoctF2ljTLqXvZACFD13XZHvvWlr3AO2tUwyavqKLXZ
xDMk9QydOdsSsHmMg7OZGJBRUHAS80x/rW/UKXVVb5WN/DRhhv9+mi64DpNnKJFS
BvCH8dTrDXVzciBzo/maUOCk7dP4
-----END CERTIFICATE-----
)";

const char client_key[] = R"(
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIDh1T++hRGfe0jKrGz4+uEhF+LrO7EriqNqFJQNhijANoAoGCCqGSM49
AwEHoUQDQgAEQDqEBQ6UQY1GQBGGd/kluoFX7hnhyMdsDKW7PcBfLsWbQ9vYizbd
bJM5ljqx8PAO6DM32opZKvOujLh22/O1eQ==
-----END EC PRIVATE KEY-----
)";

// ---------------------The sensor setup: ----------------------
#define DHTPIN 2
#define DHTTYPE DHT11
#define PIN_MQ135 A0

DHT dht(DHTPIN, DHTTYPE);

// for sensor 1 baseline is 109.67 and for sensor 2 baseline is 360.65 
MQ135 gasSensor = MQ135(PIN_MQ135, 360.65, 10);

//-------------  Secure client setup for MQTT: ----------------
WiFiClient wifiClient;
BearSSLClient sslClient(wifiClient);
PubSubClient client(sslClient);

unsigned long getTime() {
  return WiFi.getTime();
}

void setup() {
  Serial.begin(9600);
  dht.begin();

  Serial.print("Connecting to WiFi...");
  Serial.println(ssid);
  while (WiFi.begin(ssid, password) != WL_CONNECTED) { 
    delay(5000);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");

  Serial.println("Syncing time for the mTLS validation");
  ArduinoBearSSL.onGetTime(getTime);

  sslClient.setTrustAnchors(broker_ca_cert);
  sslClient.setClientECCert(client_cert, client_key);

  client.setServer(mqttServer, mqttPort);
  
  Serial.println("Warming up theMQ135 sensor for 3 minutes...");
  delay(180000);
}

void loop() {
  delay(10000);

  if (!client.connected()) {
    Serial.println("Trying to connect to  encrypted MQTT broker...");
    
    if (client.connect(("UnoWifiClient-" + sensorID).c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("Connected to MQTT broker securely!");
    } else { 
      Serial.print("Failed to connect to MQTT broker. State: ");
      Serial.println(client.state());
      Serial.println("Will retry in 10 seconds."); 
      return;
    }
  }

  client.loop();

  float humidity = dht.readHumidity();
  float tempC = dht.readTemperature();

  if (isnan(humidity) || isnan(tempC) || tempC > 35 || tempC < 5 || humidity > 80 || humidity < 10) {
    Serial.println("Error: Failed to read from DHT sensor or reading out of bounds. Skipping publish.");
    return;
  }

  float correctedGasValue = gasSensor.getCorrectedPPM(tempC, humidity);

  if (isnan(correctedGasValue) || correctedGasValue > 5000 || correctedGasValue < 200) { 
    Serial.println("Error: Failed to read from MQ135 sensor or reading our of bound. Skipping publish.");
    return;
  }

  String payload = "{"; // [cite: 30]
  payload += "\"sensor_id\": \"" + sensorID + "\", ";
  payload += "\"humidity\": " + String(humidity);
  payload += ", \"temperature\": " + String(tempC);
  payload += ", \"correctedGasValue\": " + String(correctedGasValue);
  payload += "}";

  Serial.print("Publishing to EC2: ");
  Serial.println(payload); 

  String fullTopic = "bachelor-project/sensors/" + sensorID;
  client.publish(fullTopic.c_str(), payload.c_str()); 

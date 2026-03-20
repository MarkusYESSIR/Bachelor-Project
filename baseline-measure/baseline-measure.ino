#include <MQ135.h>


#define PIN_MQ135 A0


MQ135 gasSensor = MQ135(PIN_MQ135);

void setup() {
  Serial.begin(9600);
  Serial.println("vent 3 minutter, så MQ135 kan blive varm:)");
  delay(180000); 
}

void loop() {
 float R0 = gasSensor.getRZero();

 Serial.println(R0);

  delay(2000);
}
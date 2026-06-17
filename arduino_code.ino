
float voltage = 3.60;
float current = 64.3;
float temperature = 32.8;

void setup() {
  
  Serial.begin(9600);
  
  while (!Serial) {
    ;
  }
}

void loop() {
  voltage += random(-15, 16) / 1000.0;
  voltage = constrain(voltage, 2.5, 4.2);
  
  current += random(-20, 21) / 10.0;
  current = constrain(current, 10.0, 200.0);
  
  temperature += random(-5, 6) / 10.0;
  temperature = constrain(temperature, 15.0, 60.0);
 
  Serial.print(voltage, 3);
  Serial.print(",");
  Serial.print(current, 1);
  Serial.print(",");
  Serial.print(temperature, 1);
  Serial.println(); 
  delay(1000);
}

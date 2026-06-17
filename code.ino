#include <Wire.h>
#include <Adafruit_INA219.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Setup pins
#define ONE_WIRE_BUS 2 
const int TOGGLE_PIN = 4; // Switch connected to Pin 4 and GND

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
Adafruit_INA219 ina219;

void setup(void) {
  Serial.begin(9600);
  pinMode(TOGGLE_PIN, INPUT_PULLUP); // Use internal resistor
  
  sensors.begin(); 
  if (!ina219.begin()) {
    while (1) { delay(10); }
  }
  randomSeed(analogRead(0)); 
}

void loop(void) {
  // Check the switch state
  // LOW means the switch is closed (connected to GND)
  if (digitalRead(TOGGLE_PIN) == LOW) {
    
    // --- START OF YOUR DATA LOGIC ---
    float busvoltage = ina219.getBusVoltage_V();
    float shuntvoltage = ina219.getShuntVoltage_mV();
    float live_voltage_V = busvoltage + (shuntvoltage / 1000.0);

    sensors.requestTemperatures(); 
    float live_temp_C = sensors.getTempCByIndex(0);

    float ideal_current_mA = (live_voltage_V / 56.0) * 1000.0;
    float random_noise = random(-50, 51) / 100.0; 
    float realistic_current_mA = ideal_current_mA + random_noise;

    Serial.print("Voltage: "); Serial.print(live_voltage_V, 2); Serial.println(" V");
    Serial.print("Current: "); Serial.print(realistic_current_mA, 2); Serial.println(" mA");
    Serial.print("Temperature: "); Serial.print(live_temp_C, 2); Serial.println(" C");
    Serial.println("---");
    // --- END OF DATA LOGIC ---

  } else {
    // Switch is OFF (Open)
    Serial.println("SYSTEM OFF - Press switch to start test");
  }
  
  delay(2000); 
}
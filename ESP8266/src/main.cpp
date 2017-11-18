#include "Arduino.h"
#include "ArduinoJson.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include "MAX30105.h"
#include <Wire.h>
#include "SparkFunLIS3DH.h"
#include "SPI.h"

const String deviceName = "CS244";
const char *ssid = "UCInet Mobile Access";

LIS3DH myIMU(SPI_MODE, 4); // constructed with parameters for SPI and cs pin number
MAX30105 particleSensor;

void connectWiFi()
{
    WiFi.begin(ssid);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected.");
}

void initializePPGSensor() {
    //Use default I2C port, 400kHz speed
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("MAX30105 was not found. Please check wiring/power.");
        while (1);
    }
    particleSensor.setup();
}

void initializeACCSensor() {
    myIMU.begin();
}

void setup()
{
    // initialize LED digital pin as an output.
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.begin(115200);
    Serial.println("Program started");

    connectWiFi();
    initializeACCSensor();
    initializePPGSensor();
}

void loop()
{
    // Configure http connection and set headers
    HTTPClient http;
    http.begin("http://169.234.44.2:8888/ppg_motion");
    http.addHeader("Content-Type", "application/json");

    // Render Json request
    StaticJsonBuffer<300> JSONbuffer;
    JsonObject& root = JSONbuffer.createObject();

    // Record to json
    root["time"] = millis();
    root["Red"] = particleSensor.getRed();
    root["IR"] = particleSensor.getIR();  
    root["X"] = myIMU.readFloatAccelX();
    root["Y"] = myIMU.readFloatAccelY();
    root["Z"] = myIMU.readFloatAccelZ();

    // Convert Json object to string
    char jsonBuffer[300];
    root.printTo(jsonBuffer, sizeof(jsonBuffer));
    Serial.println(jsonBuffer);

    // Post request, receive http response and print
    int httpCode = http.POST(jsonBuffer);
    String payload = http.getString();
    Serial.println(httpCode);
    Serial.println(payload);

    // End session
    http.end();
}
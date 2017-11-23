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
    // Define amount of data
    const size_t batch_size = 1 * 1 * 50;
    const size_t buffer_size = 6 * JSON_ARRAY_SIZE(batch_size) + JSON_OBJECT_SIZE(6) + 100;

    // Render Json request
    DynamicJsonBuffer JSONbuffer(buffer_size);
    JsonObject& root = JSONbuffer.createObject();
    JsonArray& Time = root.createNestedArray("time");
    JsonArray& Red = root.createNestedArray("Red");
    JsonArray& IR = root.createNestedArray("IR");
    JsonArray& X = root.createNestedArray("X");
    JsonArray& Y = root.createNestedArray("Y");
    JsonArray& Z = root.createNestedArray("Z");

    for (size_t i = 0; i < batch_size; i++) {
        Time.add(millis());
        Red.add(particleSensor.getRed());
        IR.add(particleSensor.getIR());
        X.add(myIMU.readFloatAccelX());
        Y.add(myIMU.readFloatAccelY());
        Z.add(myIMU.readFloatAccelZ());
    }

    // Convert Json object to string
    String jsonStr;
    root.printTo(jsonStr);
    Serial.println(jsonStr);

    // Configure http connection and set headers
    HTTPClient http;
    http.begin("http://169.234.55.2:8888/ppg_motion_in_batch");
    http.addHeader("Content-Type", "application/json");

    // Post request, receive http response and print
    int httpCode = http.POST(jsonStr);
    String payload = http.getString();
    Serial.println(httpCode);
    Serial.println(payload);

    // End session
    http.end();
}
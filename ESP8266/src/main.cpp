#include "Arduino.h"
#include "ArduinoJson.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include "MAX30105.h"
#include <Wire.h>

String deviceName = "CS244";
MAX30105 particleSensor;

// WiFi settings
const char *ssid = "UCInet Mobile Access";

void connectWiFi()
{
    WiFi.begin(ssid);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected");
    // Print the IP address
    Serial.println(WiFi.localIP());
}

void setup()
{
    // initialize LED digital pin as an output.
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.begin(115200);
    Serial.println("Program started");

    // connect WiFi
    connectWiFi();

    // Initialize sensor
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) //Use default I2C port, 400kHz speed
    {
        Serial.println("MAX30105 was not found. Please check wiring/power. ");
        while (1);
    }
    
    //Configure sensor. Use 6.4mA for LED drive
    particleSensor.setup();

    //byte powerLevel = 0x02; //0.4mA - Presence detection of ~4 inch
    byte powerLevel = 0x1F; // 6.4mA - Presence detection of ~8 inch
    //byte powerLevel = 0x7F; //25.4mA - Presence detection of ~8 inch
    //byte powerLevel = 0xFF; //50.0mA - Presence detection of ~12 inch
    particleSensor.setPulseAmplitudeRed(powerLevel);
    particleSensor.setPulseAmplitudeIR(powerLevel);
    particleSensor.setPulseAmplitudeGreen(powerLevel);
    particleSensor.setPulseAmplitudeProximity(powerLevel);
}

void loop()
{
    // Configure http connection and set headers
    HTTPClient http;
    http.begin("http://169.234.17.0:8888/");
    http.addHeader("Content-Type", "application/json");

    // Render Json request
    StaticJsonBuffer<300> JSONbuffer;    
    JsonObject& root = JSONbuffer.createObject();
    root["Red"] = particleSensor.getRed();
    root["IR"] = particleSensor.getIR();

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
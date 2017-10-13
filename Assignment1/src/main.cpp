#include "Arduino.h"
#include "ArduinoJson.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

String deviceName = "CS244";

// WiFi settings
const char *ssid = "UCInet Mobile Access";

void printMacAddress()
{
    byte mac[6];
    WiFi.macAddress(mac);

    char MAC_char[18]="";
    for (int i = 0; i < sizeof(mac); ++i)
        sprintf(MAC_char, "%s%02x:", MAC_char, mac[i]);

    Serial.print("Mac address : ");
    Serial.print(MAC_char);

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
    printMacAddress();
}

void loop()
{
    // Configure http connection and set headers
    HTTPClient http;
    http.begin("http://169.234.29.200:8888/");
    http.addHeader("Content-Type", "application/json");

    // Render Json request
    StaticJsonBuffer<300> JSONbuffer;    
    JsonObject& root = JSONbuffer.createObject();
    root["dataType"] = "Heart Beats";
    JsonArray& value = root.createNestedArray("value");
    value.add(66);
    value.add(67);
    value.add(68);
    JsonArray& time = root.createNestedArray("time");
    time.add("01:00");
    time.add("02:00");
    time.add("03:00");
    
    // Convert Json object to string
    char jsonBuffer[300];
    root.printTo(jsonBuffer, sizeof(jsonBuffer));

    // Post request, receive http response and print
    int httpCode = http.POST(jsonBuffer);
    String payload = http.getString();
    Serial.println(httpCode);
    Serial.println(payload);

    // End session
    http.end();

    // Configure LED digital pattern
    digitalWrite(LED_BUILTIN, HIGH);
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
    delay(1000);
}


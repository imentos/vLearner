/*****************************
     RFID-powered lockbox

This sketch will move a servo when
a trusted tag is read with the 
ID-12/ID-20 RFID module

Pinout for SparkFun RFID USB Reader
Arduino ----- RFID module
5V            VCC
GND           GND
D2            TX

Pinout for SparkFun RFID Breakout Board
Arduino ----- RFID module
5V            VCC
GND           GND
D2            D0

Connect the servo's power, ground, and
signal pins to VCC, GND,
and Arduino D9

If using the breakout, you can also 
put an LED & 330 ohm resistor between 
the RFID module's READ pin and GND for 
a "card successfully read" indication

by acavis, 3/31/2015

Inspired by & partially adapted from
http://bildr.org/2011/02/rfid-arduino/

******************************/

#include <SoftwareSerial.h>
#include <Servo.h>
#include <SPI.h>            // To talk to the SD card and MP3 chip
#include <SdFat.h>          // SD card file system
#include <SFEMP3Shield.h>   // MP3 decoder chip


SFEMP3Shield MP3player;
SdFat sd;


// Choose two pins for SoftwareSerial
SoftwareSerial rSerial(A0, 3); // RX, TX

// Make a servo object
//Servo lockServo;

// Pick a PWM pin to put the servo on
const int servoPin = 9;

// For SparkFun's tags, we will receive 16 bytes on every
// tag read, but throw four away. The 13th space will always
// be 0, since proper strings in Arduino end with 0

// These constants hold the total tag length (tagLen) and
// the length of the part we want to keep (idLen),
// plus the total number of tags we want to check against (kTags)
const int tagLen = 16;
const int idLen = 13;
const int kTags = 2;

// Put your known tags here!
char knownTags[kTags][idLen] = {
 "7C00577B0A5A",
 "7C00574C99FE"
};

// Empty array to hold a freshly scanned tag
char newTag[idLen];




const int ROT_LEDR = 10; // Red LED in rotary encoder (optional)
const int EN_GPIO1 = A2; // Amp enable + MIDI/MP3 mode select
const int SD_CS = 9;     // Chip Select for SD card
boolean debugging = true;


void setup() {
  SdFile file;
  byte result;

  if (debugging) {
    Serial.begin(9600);
    Serial.println(F("Lilypad MP3 Player trigger sketch"));
  }
  
  if (debugging) {
    Serial.print(F("initialize SD card... "));
  }

  result = sd.begin(SD_CS, SPI_HALF_SPEED); // 1 for success
  
  if (result != 1) { // Problem initializing the SD card
    if (debugging) {
      Serial.print(F("error, halting"));
    }
    errorBlink(1); // Halt forever, blink LED if present.
  } else { 
    if (debugging) Serial.println(F("success!"));
  }
  // Start up the MP3 library

  if (debugging) {
    Serial.print(F("initialize MP3 chip... "));
  }

  result = MP3player.begin(); // 0 or 6 for success

  // Check the result, see the library readme for error codes.

  if ((result != 0) && (result != 6)) {// Problem starting up
    if (debugging) {
      Serial.print(F("error code "));
      Serial.print(result);
      Serial.print(F(", halting."));
    }
    errorBlink(result); // Halt forever, blink red LED if present.
  } else {
    if (debugging) Serial.println(F("success!"));
  }

  MP3player.setVolume(10,10);






  // Starts the hardware and software serial ports
  rSerial.begin(9600);

   // Attaches the servo to the pin
   //lockServo.attach(servoPin);

   // Put servo in locked position
   //lockServo.write(0);
 }

 void errorBlink(int blinks)
 {

 }

 void loop() {
  // Counter for the newTag array
  int i = 0;
  // Variable to hold each byte read from the serial buffer
  int readByte;
  // Flag so we know when a tag is over
  boolean tag = false;

  // This makes sure the whole tag is in the serial buffer before
  // reading, the Arduino can read faster than the ID module can deliver!
  if (rSerial.available() == tagLen) {
    tag = true;
  }

  if (tag == true) {
    while (rSerial.available()) {
      // Take each byte out of the serial buffer, one at a time
      readByte = rSerial.read();

      /* This will skip the first byte (2, STX, start of text) and the last three,
      ASCII 13, CR/carriage return, ASCII 10, LF/linefeed, and ASCII 3, ETX/end of 
      text, leaving only the unique part of the tag string. It puts the byte into
      the first space in the array, then steps ahead one spot */
      if (readByte != 2 && readByte!= 13 && readByte != 10 && readByte != 3) {
        newTag[i] = readByte;
        i++;
      }

      // If we see ASCII 3, ETX, the tag is over
      if (readByte == 3) {
        tag = false;
      }

    }
  }


  // don't do anything if the newTag array is full of zeroes
  if (strlen(newTag)== 0) {
    return;
  } else {
    int total = 0;
    int currentIndex = 0;
    for (currentIndex=0; currentIndex < kTags; currentIndex++){
      total = checkTag(newTag, knownTags[currentIndex]);
      if (total > 0) {
        break;
      }
    }

    // If newTag matched any of the tags
    // we checked against, total will be 1
    if (total > 0) {

      // Put the action of your choice here!

      // I'm going to rotate the servo to symbolize unlocking the lockbox

      Serial.println("Success!");

      // map from tag id to index because mp3 only supports 8.3 file names.
      char mp3[idLen];
      sprintf(mp3, "%d.mp3", currentIndex + 1);

      byte result;
      result = MP3player.playMP3(mp3);

      if(debugging) {
        if(result != 0) {
          Serial.print(F("error "));
          Serial.print(result);
          Serial.print(F(" when trying to play track "));
        } else {
          Serial.print(F("playing "));
        }
        Serial.println(mp3);
      }
    } else {
        // This prints out unknown cards so you can add them to your knownTags as needed
        Serial.print("Unknown tag! ");
        Serial.print(newTag);
        Serial.println();
      }
    }

  // Once newTag has been checked, fill it with zeroes
  // to get ready for the next tag read
  for (int c=0; c < idLen; c++) {
    newTag[c] = 0;
  }
}

// This function steps through both newTag and one of the known
// tags. If there is a mismatch anywhere in the tag, it will return 0,
// but if every character in the tag is the same, it returns 1
int checkTag(char nTag[], char oTag[]) {
  for (int i = 0; i < idLen; i++) {
    if (nTag[i] != oTag[i]) {
      return 0;
    }
  }
  return 1;
}








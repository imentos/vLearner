var tessel = require('tessel');
var audio = require('audio-vs1053b').use(tessel.port['A']);
var fs = require('fs');

var chunks = [];

// When we get data, push it into our array
audio.on('data', function(data) {
  chunks.push(data);
});

// Wait for the module to connect
audio.on('ready', function() {
  console.log('Hold the config button to record...');
  // When the config button is pressed, start recording
  tessel.button.once('press', play);
});

function play() {
                            var audioFile = fs.readFileSync('micdata');
                            // Play the file
                            audio.play(audioFile);  
}


function startRecording() {
  // Tell the audio module to start recording
  audio.startRecording('voice', function() {
    console.log('Recording...');
    // Once the button is released, stop recording
    tessel.button.once('release', stopRecording);
  });
}

function stopRecording() {
  // Tell the audio module to stop recording
  console.log('stopping the recording...');
  audio.stopRecording(function() {
    console.log('Playing it back...');
    // Concat the data and play it
    audio.play(Buffer.concat(chunks), function(err) {
      // When we're done playing, clear recordings
      chunks = [];
      console.log('Hold the config button to record...');
      // Wait for a button press again
      tessel.button.once('press', startRecording);
    });
  });
}


// If there is an error, report it
audio.on('error', function(err) {
  throw err;
});
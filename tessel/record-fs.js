var tessel = require('tessel');
var audio = require('audio-vs1053b').use(tessel.port['D']);
var currentId = null;
var chunks = [];
var fs = require('fs');

audio.on('ready', function() {
    // Start recording data for a second into a file
    audio.setInput('mic', function(err) {

        var chunks = [];

        audio.on('data', function(data) {
            chunks.push(data);
        });

        // Start the recording
        audio.startRecording(function(err) {
            // In one second
            setTimeout(function() {
                // Stop recording
                audio.stopRecording(function(err) {
                    // Write the buffer to a file
                    fs.writeFile("micdata", Buffer.concat(chunks), function(err) {
                        console.log("Wrote to a file");

                        audio.setOutput('headphones', function(err) {
                            // Open a file
                            var audioFile = fs.readFileSync('micdata');
                            // Play the file
                            audio.play(audioFile);
                        });

                    });
                });
            }, 1000);
        });
    });
});

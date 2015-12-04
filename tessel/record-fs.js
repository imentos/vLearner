var tessel = require('tessel');
var audio = require('audio-vs1053b').use(tessel.port['D']);
var currentId = null;
var chunks = [];
var fs = require('fs');

// audio.startRecording(function(err) {
//     // In one second
//     setTimeout(function() {
//         // Stop recording
//         audio.stopRecording(function(err) {

//             console.log('Writing...');
//             fs.writeFile('someFile.txt', 'Hey Tessel SDCard!', function(err) {
//                 console.log("Wrote to a file");

//                 audio.setOutput('headphones', function(err) {

//                     // Open a file
//                     console.log('Write complete. Reading...');
//                     fs.readFile('someFile.txt', function(err, data) {
//                         console.log('Read someFile.txt:\n');

//                         // Play the file
//                         // audio.setVolume(1.0, function(err) {
//                         audio.play(data, function(err) {
//                             chunks = [];
//                             currentId = null;
//                         });
//                     });

//                 });


//             });
//         });

//     });
// });



// audio.on('ready', function() {
//     console.log('Ready to record audio');
//     audio.on('data', function(data) {
//         chunks.push(data);
//     });
// });


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

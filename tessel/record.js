var tessel = require('tessel');
var rfid = require('rfid-pn532').use(tessel.port['A']);
var audio = require('audio-vs1053b').use(tessel.port['D']);
var sdcard = require('sdcard').use(tessel.port['C']);
var currentId = null;
var chunks = [];
var fs = null;

rfid.on('ready', function(version) {
    console.log('Ready to read RFID card');

    rfid.on('data', function(card) {
        if (card.uid.toString('hex') === currentId) {
            return;
        }
        currentId = card.uid.toString('hex');
        console.log('UID:', card.uid.toString('hex'));

        audio.startRecording(function(err) {
            // In one second
            setTimeout(function() {
                // Stop recording
                audio.stopRecording(function(err) {

                    console.log('Writing...');
                    fs.writeFile('someFile.txt', 'Hey Tessel SDCard!', function(err) {
                        console.log("Wrote to a file");

                        audio.setOutput('headphones', function(err) {

                            // Open a file
                            console.log('Write complete. Reading...');
                            fs.readFile('someFile.txt', function(err, data) {
                                console.log('Read someFile.txt:\n');

                                // Play the file
                                // audio.setVolume(1.0, function(err) {
                                audio.play(data, function(err) {
                                    chunks = [];
                                    currentId = null;
                                });
                            });

                        });


                    });
                });

            });
        }, 3000);
    });
});


audio.on('ready', function() {
    console.log('Ready to record audio');
    audio.on('data', function(data) {
        chunks.push(data);
    });
});

sdcard.on('ready', function() {
    sdcard.getFilesystems(function(err, fss) {
        fs = fss[0];
    });
});


// audio.on('ready', function() {
//     // Start recording data for a second into a file
//     audio.setInput('mic', function(err) {

//         var chunks = [];

//         audio.on('data', function(data) {
//             chunks.push(data);
//         });

//         // Start the recording
//         audio.startRecording(function(err) {
//             // In one second
//             setTimeout(function() {
//                 // Stop recording
//                 audio.stopRecording(function(err) {
//                     // Write the buffer to a file
//                     fs.writeFile("micdata", Buffer.concat(chunks), function(err) {
//                         console.log("Wrote to a file");

//                         audio.setOutput('headphones', function(err) {
//                             // Open a file
//                             var audioFile = fs.readFileSync('micdata');
//                             // Play the file
//                             audio.play(audioFile);
//                         });

//                     });
//                 });
//             }, 1000);
//         });
//     });
// });

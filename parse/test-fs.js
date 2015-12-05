var tessel = require('tessel');
var audio = require('audio-vs1053b').use(tessel.port['D']);
var currentId = null;
var chunks = [];
var fs = require('fs');
var https = require('https');
var qs = require('querystring');

// Constants
var PARSE_APP = 'Ay8q1Mpu2lRLchKr9rQZtYuM8cBRuLU2zHiZ78fu';
var PARSE_KEY = 'QsBKuLB5KBwKxWYDT88uQbO6oQz1OXySxAe3KnFt';


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





function postFile(file) {
    console.log("post:" + id + "," + data);
    var options = {
        headers: {
            'Content-Type': 'audio/mpeg',
            'X-Parse-Application-Id': PARSE_APP,
            'X-Parse-REST-API-Key': PARSE_KEY
        },
        host: 'proxy',
        port: 8080,
        hostname: 'api.parse.com',
        method: 'POST',
        path: '/1/files/micdata.mp3',
        port: 443
    };

    // Make request
    var request = https.request(options, function(response) {
        // Got a response
        response.on('data', function(data) {
            console.log(data.toString().trim());
            chunks = [];
        });
    });
    request.write(file);
    request.end();

    // Handle HTTPS error
    request.on('error', function(err) {
        console.error(err);
    });    
}

function get(id, fnCallback) {
    console.log("get:" + id);
    var query = qs.stringify({
        where: JSON.stringify({
            rfid: id
        })
    });
    var options = {
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': PARSE_APP,
            'X-Parse-REST-API-Key': PARSE_KEY
        },
        host: 'proxy',
        port: 8080,
        hostname: 'api.parse.com',
        method: 'GET',
        path: '/1/classes/Audio/RXVYgK38Wn',
        port: 443
    };

    // Make request
    var request = https.request(options, function(response) {
        var str = '';
        response.on('data', function(data) {
            str += data;
        });

        response.on('end', function() {
            var result = JSON.parse(str);
            console.log(result.data.length);
        });
    });
    request.end();

    // Handle HTTPS error
    request.on('error', function(err) {
        console.error(err);
    });
}

function post(id, file) {
    console.log("post:" + id + "," + data);
    var options = {
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': PARSE_APP,
            'X-Parse-REST-API-Key': PARSE_KEY
        },
        host: 'proxy',
        port: 8080,
        hostname: 'api.parse.com',
        method: 'POST',
        path: '/1/classes/Audio',
        port: 443
    };

    // Make request
    var request = https.request(options, function(response) {
        // Got a response
        response.on('data', function(data) {
            console.log(data.toString().trim());
            chunks = [];
        });
    });
    request.write(JSON.stringify({
        rfid: id,
        data: data
    }));
    request.end();

    // Handle HTTPS error
    request.on('error', function(err) {
        console.error(err);
    });
}


var tessel = require('tessel');
var wifi = require('wifi-cc3000');
var https = require('https');
var rfid = require('rfid-pn532').use(tessel.port['A']);
var audio = require('audio-vs1053b').use(tessel.port['D']);
var qs = require('querystring');

// Constants
var PARSE_APP = 'Ay8q1Mpu2lRLchKr9rQZtYuM8cBRuLU2zHiZ78fu';
var PARSE_KEY = 'QsBKuLB5KBwKxWYDT88uQbO6oQz1OXySxAe3KnFt';

var wifi = require('wifi-cc3000');
var wifiSettings = {
    ssid: "Rayphone",
    password: "8128178128",
    timeout: 40
};

var currentId = null;
var chunks = [];
var port = 8000;

// Workaround: wait 3secs before starting
setTimeout(function() {
    init();
}, 10000);

function checkConnection() {
    if (wifi.isConnected()) {
        console.log('Connected.');
        init();
    } else {
        console.log('Connecting...');
        wifi.connect(wifiSettings, function(err, res) {
            if (err) {
                console.log('Error connecting:', err);
            }
            checkConnection();
        });
    }
}

wifi.on('disconnect', function() {
    console.log('Disconnected.');
    tessel.led[1].output(0);
    checkConnection();
});



// Create the websocket server, provide connection callback
function init() {
    console.log("connected");

    rfid.on('data', function(card) {
        if (card.uid.toString('hex') === currentId) {
            return;
        }
        currentId = card.uid.toString('hex');
        console.log('UID:', currentId);


        get(currentId, function(data) {
            audio.play(data, function(err) {
                console.log("play audio");
                // When we're done playing, clear recordings
                // chunks = [];
                // console.log('Hold the config button to record...');
                // Wait for a button press again
                // tessel.button.once('press', startRecording);
            });
        });





        // console.log('startRecording for one second');
        // audio.startRecording(function(err) {
        //     setTimeout(function() {
        //         console.log('stopRecording');
        //         audio.stopRecording(function(err) {
        //             post(currentId, Buffer.concat(chunks));
        //         });
        //     }, 1000);
        // });
    });
}

audio.on('ready', function() {
    console.log('Ready to record audio');
    audio.on('data', function(data) {
        chunks.push(data);
    });
});

rfid.on('ready', function(version) {
    console.log('Ready to read RFID card');
});






// function onPress() {
//     post(200);

//     tessel.button.once('release', onRelease);
// }

// function onRelease() {
//     get();

//     tessel.button.once('press', onPress);
// }

function get(id, fnCallback) {
    console.log("get:" + id);
    var query = qs.stringify({
        where: JSON.stringify({
            rfid: currentId
        })
    });
    var options = {
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': PARSE_APP,
            'X-Parse-REST-API-Key': PARSE_KEY
        },
        hostname: 'api.parse.com',
        method: 'GET',
        path: '/1/classes/Audio?' + query,
        port: 443
    };

    // Make request
    var request = https.request(options, function(response) {
        // Got a response
        response.on('data', function(data) {
            fnCallback(data);
            // console.log(data.toString().trim());
        });
    });
    request.end();

    // Handle HTTPS error
    request.on('error', function(err) {
        console.error(err);
    });
}

function post(id, data) {
    console.log("post:" + id + "," + data);
    var options = {
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': PARSE_APP,
            'X-Parse-REST-API-Key': PARSE_KEY
        },
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
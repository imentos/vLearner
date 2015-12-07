var tessel = require('tessel');
var wifi = require('wifi-cc3000');
var https = require('https');
var http = require('http');
var rfid = require('rfid-pn532').use(tessel.port['A']);
var audio = require('audio-vs1053b').use(tessel.port['D']);
var qs = require('querystring');
var url = require('url');

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
var configPressed = false;

// Workaround: wait 3secs before starting
setTimeout(function() {
    init();
}, 3000);

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

function init() {
    console.log("connected");
    tessel.button.once('press', onPress);

    rfid.on('data', function(card) {
        console.log("rfid tagged");
        if (card.uid.toString('hex') === currentId) {
            console.log("same");
            return;
        }
        currentId = card.uid.toString('hex');
        console.log('UID:', currentId);

        // when hold config button and tag rfid
        if (configPressed) {
            console.log('start recording');

            audio.startRecording(function(err) {
                tessel.button.once('release', onRelease);
            });

        } else {
            console.log('start playing');

            get(currentId, function(data) {
                console.log("audo.play");
                currentId = null;
                chunks = [];
            });
        }
    });
}

audio.on('ready', function() {
    console.log('Ready to record audio');
    audio.setOutput('lineOut', function(error) {
        audio.on('data', function(data) {
            console.log('chunks is added data');
            chunks.push(data);
        });
    });
});

rfid.on('ready', function(version) {
    console.log('Ready to read RFID card');
});

function onPress() {
    console.log("config pressed");
    configPressed = true;
}

function onRelease() {
    console.log("config released");
    audio.stopRecording(function(err) {
        postFile(currentId, Buffer.concat(chunks), function() {
            chunks = [];
            currentId = null;
            configPressed = false;
            tessel.button.once('press', onPress);
        });
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
        path: '/1/classes/Audio?' + query,
        port: 443
    };

    var request = https.request(options, function(response) {
        var str = '';
        response.on('data', function(data) {
            str += data;
        });

        response.on('end', function() {
            var results = JSON.parse(str).results;
            console.log(str);

            getFile(results[results.length - 1].file.url, fnCallback);
        });
    });
    request.end();

    request.on('error', function(err) {
        console.error(err);
    });
}

function getFile(urlPath, fnCallback) {
    console.log("getFile:" + urlPath);
    var urlObj = url.parse(urlPath);
    var options = {
        // host: 'proxy',
        // port: 8080,
        hostname: urlObj.hostname,
        method: 'GET',
        path: urlObj.path
    };

    var stream = audio.createPlayStream();
    var request = http.request(options, function(response) {
        response.pipe(stream);
        fnCallback();
    });
    request.end();

    request.on('error', function(err) {
        console.error(err);
    });
}

function postFile(id, buffer, fnCallback) {
    console.log("postFile:" + id);
    var options = {
        headers: {
            'Content-Type': 'audio/mpeg',
            'X-Parse-Application-Id': PARSE_APP,
            'X-Parse-REST-API-Key': PARSE_KEY
        },
        // host: 'proxy',
        // port: 8080,
        hostname: 'api.parse.com',
        method: 'POST',
        path: '/1/files/' + id + '.mp3',
        port: 443
    };

    var request = https.request(options, function(response) {
        response.on('data', function(data) {
            console.log(data.toString().trim());
            var result = JSON.parse(data.toString().trim());
            post(id, result.name);
            fnCallback();
        });
    });
    request.write(buffer);
    request.end();

    request.on('error', function(err) {
        console.error(err);
    });
}

function post(id, file) {
    console.log("post:" + id + "," + file);
    var options = {
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': PARSE_APP,
            'X-Parse-REST-API-Key': PARSE_KEY
        },
        // host: 'proxy',
        // port: 8080,
        hostname: 'api.parse.com',
        method: 'POST',
        path: '/1/classes/Audio',
        port: 443
    };

    var request = https.request(options, function(response) {
        response.on('data', function(data) {
            console.log(data.toString().trim());
            chunks = [];
        });
    });
    request.write(JSON.stringify({
        rfid: id,
        file: {
            "name": file,
            "__type": "File"
        }
    }));
    request.end();

    request.on('error', function(err) {
        console.error(err);
    });
}

var https = require('https');
var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var url = require('url');

// Constants
var PARSE_APP = 'Ay8q1Mpu2lRLchKr9rQZtYuM8cBRuLU2zHiZ78fu';
var PARSE_KEY = 'QsBKuLB5KBwKxWYDT88uQbO6oQz1OXySxAe3KnFt';

// getFile('test');
get('test', function(data) {});
//postFile('test', 'sample.mp3');


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

    // Make request
    var request = https.request(options, function(response) {
        var str = '';
        response.on('data', function(data) {
            str += data;
        });

        response.on('end', function() {
            var results = JSON.parse(str).results;
            console.log(str);

            getFile(results[0].file.url);
        });
    });
    request.end();

    // Handle HTTPS error
    request.on('error', function(err) {
        console.error(err);
    });
}

function getFile(urlPath) {
    console.log("getFile:" + urlPath);
    var urlObj = url.parse(urlPath);
    var options = {
        // host: 'proxy',
        // port: 8080,
        hostname: urlObj.hostname,
        method: 'GET',
        path: urlObj.path
    };

    // Make request
    var request = http.request(options, function(response) {
        var chunks = [];
        response.on('data', function(data) {
            chunks.push(data);
        });

        response.on('end', function() {
            fs.writeFile("test.mp3", Buffer.concat(chunks), function(err) {
                console.log("Wrote to a file");
            });
        });
    });
    request.end();

    // Handle HTTPS error
    request.on('error', function(err) {
        console.error(err);
    });
}

function postFile(id, file) {
    console.log("postFile:" + file);
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
            var result = JSON.parse(data.toString().trim());
            post(id, result.name);

        });
    });
    var song = fs.readFileSync('sample.mp3');
    request.write(song);
    request.end();

    // Handle HTTPS error
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
        file: {
            "name": file,
            "__type": "File"
        }
    }));
    request.end();

    // Handle HTTPS error
    request.on('error', function(err) {
        console.error(err);
    });
}

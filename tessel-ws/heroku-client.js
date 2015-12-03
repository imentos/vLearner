// Find the IP address of your Tessel with `tessel wifi -l` and copy it here
var ipAddress = 'intense-dusk-3168.herokuapp.com';

// Run this file with node once your server is running on Tessel
var ws = require('nodejs-websocket');

var tessel = require('tessel');
//var servoLib = require('servo-pca9685');
//var servo = servoLib.use(tessel.port['A']);

var wifi = require('wifi-cc3000');
var wifiSettings = {
    ssid: "HOME-1A58",
    password: "8128178128",
    timeout: 40
};

var port = 8000;

// Workaround: wait 3secs before starting
setTimeout(function() {
    checkConnection();
}, 10000);

function checkConnection() {
    if (wifi.isConnected()) {
        console.log('Connected.');
        createServer();
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

function createServer() {
    // Set the binary fragmentation to 1 byte so it instantly sends anything we write to it
    ws.setBinaryFragmentation(1);

    // When we get a connection
    var connection = ws.connect('ws://' + ipAddress, function() {
        console.log('Connected to bot! Control by entering WASD controls. Enter any other key to stop.');
        // Pipe the data to our server
        // process.stdin.on('data', function(data) {
        //     // Send data
        //     connection.sendBinary(new Buffer(data));
        // });

        connection.sendText("My milkshake brings all the boys to the yard")
    });

    connection.on('text', function(text) {
        // print it out
        console.log("Echoed back from server:", text);
    })
}

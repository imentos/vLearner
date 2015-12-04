// Find the IP address of your Tessel with `tessel wifi -l` and copy it here
var ipAddress = 'intense-dusk-3168.herokuapp.com';

// Run this file with node once your server is running on Tessel
var ws = require('nodejs-websocket');

//var servoLib = require('servo-pca9685');
//var servo = servoLib.use(tessel.port['A']);


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
    	setInterval(function() {
    		connection.sendText("My milkshake brings all the boys to the yard");
    	}, 1000);
        
    });

    connection.on('text', function(text) {
        // print it out
        console.log("Echoed back from server:", text);
    })


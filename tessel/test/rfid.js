var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var fs = require('fs');
// PUBNUB = require("pubnub").init({
//     publish_key: "pub-c-6a4ad5a0-04ca-48bd-a6ae-61b01b118bcf",
//     subscribe_key: "sub-c-28fac692-8350-11e5-9e96-02ee2ddab7fe"
//     // uuid: uuid
// });

var rfid = rfidlib.use(tessel.port['A']);

rfid.on('ready', function(version) {
    console.log('Ready to read RFID card');

    rfid.on('data', function(card) {
        console.log('UID:', card.uid.toString('hex'));

        fs.writeFile("micdata", 'Hello World!', function(err) {
            console.log("Wrote to a file");

            var audioFile = fs.readFileSync('micdata');
            console.log(audioFile);
        });
        // PUBNUB.publish({
        //     channel: 'test',
        //     message: {
        //         uid: card.uid.toString('hex')
        //     }
        // });
    });
});

rfid.on('error', function(err) {
    console.error(err);
});

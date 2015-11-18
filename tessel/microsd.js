var tessel = require('tessel');
var sdcardlib = require('sdcard');
var rfid = require('rfid-pn532').use(tessel.port['A']);
var sdcard = sdcardlib.use(tessel.port['C']);
var currentId;
var fs;
rfid.on('ready', function(version) {
    console.log('Ready to read RFID card');

    rfid.on('data', function(card) {
        if (card.uid.toString('hex') === currentId) {
            return;
        }
        fs.writeFile('someFile.txt', card.uid.toString('hex'), function(err) {
            console.log('Write complete. Reading...');
            fs.readFile('someFile.txt', function(err, data) {
                console.log('Read:\n', data.toString());
            });
        });

    });
});

sdcard.on('ready', function() {
    sdcard.getFilesystems(function(err, fss) {
        console.log('Ready for MicroSD card');
        fs = fss[0];

        fs.readFile('someFile.txt', function(err, data) {
            console.log('Read:\n', data.toString());
        });
    });
});

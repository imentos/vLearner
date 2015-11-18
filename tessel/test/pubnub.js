var pubnub = require("pubnub").init({
    publish_key: "pub-c-6a4ad5a0-04ca-48bd-a6ae-61b01b118bcf",
    subscribe_key: "sub-c-28fac692-8350-11e5-9e96-02ee2ddab7fe"
});
var tessel = require("tessel");

pubnub.subscribe({
    channel: "tessel-light",
    message: function() {
        tessel.led[1].toggle();
    }
});



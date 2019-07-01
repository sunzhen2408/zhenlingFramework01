var NATS = require('nats');
const ServerConfig = require('../ServerConfig');
var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});
const cache = require("../tempdata/UECache");

// Simple Publisher
// nats.publish('foo', 'Hello World!');
//
// Simple Subscriber
// module.exports =

function startSubscribeServer(ueList) {
    //nats.publish('foo', result);
    nats.subscribe('foo', function (msg) {
        //console.log('Received a message: ' + msg);
        cache.add(ueList,"temperature", msg.temperature);
        cache.add(ueList,"humidity", msg.humidity);
        cache.add(ueList,"pm2p5CC", msg.pm2p5CC);
        cache.add(ueList,"pm10CC", msg.pm10CC);
        cache.add(ueList,"VOCH2S", msg.VOCH2S);
        cache.add(ueList,"CH20NH3", msg.CH20NH3);
        //console.log(ueList);savingData = savingData.concat(ueInfos)
    });
}
// // Unsubscribing
// var sid = nats.subscribe('foo', function(msg) {});
// nats.unsubscribe(sid);
//
// // Request Streams
// var sid = nats.request('request', function(response) {
//     console.log('Got a response in msg stream: ' + response);
// });
//
// // Request with Auto-Unsubscribe. Will unsubscribe after
// // the first response is received via {'max':1}
// nats.request('help', null, {'max':1}, function(response) {
//     console.log('Got a response for help: ' + response);
// });
//
//
// // Request for single response with timeout.
// nats.requestOne('help', null, {}, 1000, function(response) {
//     // `NATS` is the library.
//     if(response instanceof NATS.NatsError && response.code === NATS.REQ_TIMEOUT) {
//         console.log('Request for help timed out.');
//         return;
//     }
//     console.log('Got a response for help: ' + response);
// });
//
// // Replies
// nats.subscribe('help', function(request, replyTo) {
//     nats.publish(replyTo, 'I can help!');
// });
//
// // Close connection
//nats.close();

module.exports.startSubscribeServer = startSubscribeServer;

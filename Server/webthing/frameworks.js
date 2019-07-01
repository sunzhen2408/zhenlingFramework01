// const SensorMsgHandler = require('../SmokeSensorClient/SensorMsgHandler');
// const SensorFsmFactory = require('../SmokeSensorClient/SensorFsmFactory');
// //const {ueList} = require("../tempdata/UECache");
// // const level = new Value(0.0);
// // var
// var NATS = require('nats');
// var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});
//
// // Simple Publisher
// // nats.publish('foo', 'Hello World!');
// //
// // Simple Subscriber
//
//
// const {startClient} = require('./client');
//
// var humidity = undefined;
// const {
//     Action,
//     Event,
//     MultipleThings,
//     Property,
//     Thing,
//     Value,
//     WebThingServer,
// } = require('webthing');
// // var result = SensorMsgHandler.handleMsg(client, data);
// // console.log(result.CH20NH3);
//
//
//
// class SmokeSensor extends Thing {
//
//
//     constructor() {
//         super('My Humidity Sensor',
//             ['MultiLevelSensor'],
//             'A web connected humidity sensor');
//
//         this.level = new Value(0.0);
//
//         this.addProperty(
//             new Property(
//                 this,
//                 'level',
//                 this.level,
//                 {
//                     '@type': 'LevelProperty',
//                     label: 'Humidity',
//                     type: 'number',
//                     description: 'The current humidity in %',
//                     minimum: 0,
//                     maximum: 100,
//                     unit: 'percent',
//                     readOnly: true,
//                 }));
//
//         // Poll the sensor reading every 3 seconds
//         setInterval(() => {
//             // Update the underlying value, which in turn notifies all listeners
//           // var temp_d =  Math.abs(70.0 * Math.random() * (-0.5 + Math.random()));
//             const newLevel = this.readFromGPIO();
//             // this.readFromGPIO();
//             //console.log('setting new humidity level:', newLevel);
//         // this.level.set(level);
//             this.level.notifyOfExternalUpdate(newLevel);
//         }, 3000);
//
//
//     }
//
//
//     /**
//      * Mimic an actual sensor updating its reading every couple seconds.
//      */
//
//
//
//     readFromGPIO() {
//         //     //this.level.notifyOfExternalUpdate(99999);
//         // console.log(ueList);
//         return Math.abs(70.0 * Math.random() * (-0.5 + Math.random()));
//     }
//
//
// }
// module.exports = SmokeSensor;
//

//const SmokeSensor = require('./frameWorks');
const SensorMsgHandler = require('../SmokeSensorClient/SensorMsgHandler');
const SensorFsmFactory = require('../SmokeSensorClient/SensorFsmFactory');
//const {ueList} = require("../tempdata/UECache");
// const level = new Value(0.0);
// var
const {startClient} = require('./client');
const ServerConfig = require('../ServerConfig');
// const startAlarmSensorServer = require('../Alarm/Alarm.js')

var humidity = undefined;
var NATS = require('nats');
var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});
const {startSmokeSensorServer} = require('../SmokeSensorClient/TCPConn');
const {startAlarmSensorServer} = require('../Alarm/Alarm')
const {startSubscribeServer} = require('../NATS/natstest');
const ueList = new Map();
const {emit} = require('../NATS/NATSRouter');
const cache = require("../tempdata/UECache");

// let savingData= []
const {
    Action,
    Event,
    SingleThing,
    Property,
    Thing,
    Value,
    WebThingServer,
} = require('webthing');

// var result = SensorMsgHandler.handleMsg(client, data);
// console.log(result.CH20NH3);



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
//             // var temp_d =  Math.abs(70.0 * Math.random() * (-0.5 + Math.random()));
//             const newLevel = this.readFromGPIO();
//             // this.readFromGPIO();
//             //console.log('setting new humidity level:', newLevel);
//             // this.level.set(level);
//
//             this.level.notifyOfExternalUpdate(newLevel);
//         }, 2500);
//
//
// //3500
//
//
//
//     }
// }
class SmokeSensor extends Thing {


    constructor() {
        super('My Humidity Sensor',
            ['MultiLevelSensor'],
            'A web connected humidity sensor');
this.temperature = new Value(0.0);
this.humidity = new Value(0.0);
this.pm2p5CC = new Value(0.0);
this.pm10CC = new Value(0.0);
this.VOCH2S = new Value(0.0);
this.CH20NH3 = new Value(0.0);

this.addProperty(
    new Property(
        this,
        'temperature',
        this.temperature,

        {
            '@type': 'TemperatureProperty',
            title: 'Temperature',
            type: 'number',
            description: 'The current temperature in %',
            minimum: -100,
            maximum: 100,
            // unit: 'percent',
            readOnly: true,
        }));

// this.humidity = this.dataSturcture.get('humidity');
this.addProperty(
    new Property(
        this,
        'humidity',
        this.humidity,
        {
            '@type': 'LevelProperty',
            title: 'Humidity',
            type: 'number',
            description: 'The current humidity in %',
            minimum: -100,
            maximum: 100,
            unit: 'percent',
            readOnly: true,
        }));

// this.pm2p5CC = this.dataSturcture.get('pm2p5CC');
this.addProperty(
    new Property(
        this,
        'pm2p5CC',
        this.pm2p5CC,
        {
            '@type': 'LevelProperty',
            title: 'pm2p5CC',
            type: 'number',
            description: 'The current pm2p5CC in %',
            minimum: -100,
            //此处涉及到最大值 就是前端配置的最大值
            maximum: 1000,
            // unit: 'percent',
            readOnly: true,
        }));

// this.pm10CC = this.dataSturcture.get('pm10CC');
this.addProperty(
    new Property(
        this,
        'pm10CC',
        this.pm10CC,
        {
            '@type': 'LevelProperty',
            title: 'pm10CC',
            type: 'number',
            description: 'The current pm10CC in %',
            minimum: -100,
            maximum: 100,
            // unit: 'percent',
            readOnly: true,
        }));


// this.VOCH2S = this.dataSturcture.get('VOCH2S');
this.addProperty(
    new Property(
        this,
        'VOCH2S',
        this.VOCH2S,
        {
            '@type': 'LevelProperty',
            title: 'VOCH2S',
            type: 'number',
            description: 'The current VOCH2S in %',
            minimum: -100,
            maximum: 100,
            // unit: 'percent',
            readOnly: true,
        }));

// this.CH20NH3 = this.dataSturcture.get('CH20NH3');
this.addProperty(
    new Property(
        this,
        'CH20NH3',
        this.CH20NH3,
        {
            '@type': 'LevelProperty',
            title: 'CH20NH3',
            type: 'number',
            description: 'The current CH20NH3 in %',
            minimum: -100,
            maximum: 100,
            // unit: 'percent',
            readOnly: true,
        }));

// Poll the sensor reading every 3 seconds
        // Update the underlying value, which in turn notifies all listeners
setInterval(() => {
    const data_temperature = this.readFromGPIO("temperature");
    const data_humidity = this.readFromGPIO("humidity");
    const data_pm2p5CC= this.readFromGPIO("pm2p5CC");
    const data_pm10CC = this.readFromGPIO("pm10CC");
    const data_VOCH2S = this.readFromGPIO("VOCH2S");
    const data_CH20NH3 = this.readFromGPIO("CH20NH3");
    this.temperature.notifyOfExternalUpdate(data_temperature);
    this.humidity.notifyOfExternalUpdate(data_humidity);
    this.pm2p5CC.notifyOfExternalUpdate(data_pm2p5CC);
    this.pm10CC.notifyOfExternalUpdate(data_pm10CC);
    this.VOCH2S.notifyOfExternalUpdate(data_VOCH2S);
    this.CH20NH3.notifyOfExternalUpdate(data_CH20NH3);
}, 5000);
}

    /**
     * Mimic an actual sensor updating its reading every couple seconds.
     */



    readFromGPIO(key) {
        //     //this.level.notifyOfExternalUpdate(99999);
        // console.log("孙震");
        // console.log(ueList.get(key));
        let ueInfos = ueList.get(key);
        if(ueInfos != undefined){
            var len = ueInfos.length;
            ueInfos = ueInfos.slice(len-1, len);  //slice
            return ueInfos;
        }
        return 0;
        // return Math.abs(70.0 * Math.random() * (-0.5 + Math.random()));
    }


}
//
// class temperatureSensor extends Thing {
//
//
//     constructor() {
//         super('My Temperature Sensor',
//             ['TemperatureSensor'],
//             'A web connected Temperature sensor');
//         this.temperature = new Value(0.0);
//
//
//         this.addProperty(
//             new Property(
//                 this,
//                 'temperature',
//                 this.temperature,
//
//                 {
//                     '@type': 'TemperatureProperty',
//                     title: 'Temperature',
//                     type: 'number',
//                     description: 'The current temperature in %',
//                     minimum: -100,
//                     maximum: 100,
//                     // unit: 'percent',
//                     readOnly: true,
//                 }));
//
//
//
// // Poll the sensor reading every 3 seconds
//         // Update the underlying value, which in turn notifies all listeners
//         setInterval(() => {
//             const data_temperature = this.readFromGPIO("temperature");
//
//             this.temperature.notifyOfExternalUpdate(data_temperature);
//
//         }, 5000);
//     }
//
//     /**
//      * Mimic an actual sensor updating its reading every couple seconds.
//      */
//
//
//
//     readFromGPIO(key) {
//         //     //this.level.notifyOfExternalUpdate(99999);
//         // console.log("孙震");
//         // console.log(ueList.get(key));
//         let ueInfos = ueList.get(key);
//         if(ueInfos != undefined){
//             var len = ueInfos.length;
//             ueInfos = ueInfos.slice(len-1, len);  //slice
//             return ueInfos;
//         }
//         return 0;
//         // return Math.abs(70.0 * Math.random() * (-0.5 + Math.random()));
//     }
//
//
// }





// class AlarmEvent extends Event {
//     constructor(thing, data) {
//         super(thing, 'triggered', data);
//     }
// }
class AlarmSensor extends Thing {


    constructor() {
        super('My Alarm Sensor',
            ['Alarm'],
            'A web  alarm sensor');
                // this.addProperty(
                //     new Property(
                //         this,
                //         'on',
                //         new Value(true, (v) => console.log('On-State is now', v)),
                //         {
                //             '@type': 'OnOffProperty',
                //             title: 'On/Off',
                //             type: 'boolean',
                //             description: '@context of "https://iot.mozilla.org/schemas"',
                //         }));
        this.addProperty(
            new Property(
                this,
                'on',
                new Value(true, (v) => {
                    console.log(v)
                     // if(v==true){
                     //     console.log("1")
                         emit('alarmflag',v);
                         // startAlarmSensorServer(1);

                     // }else{
                     //     console.log("0")
                     //     startAlarmSensorServer(0);
                     // }
                    // startAlarmSensorServer();
                }),
                {
                    "@context": "https://iot.mozilla.org/schemas/",
                    '@type': 'OnOffProperty',
                    title: 'On/Off',
                    type: 'boolean',
                    description: '@context of "https://iot.mozilla.org/schemas"',
                    // href: "/things/lamp/properties/on"
                }));


    }

    /**
     * Mimic an actual sensor updating its reading every couple seconds.
     */




    // // 方案2
    // readFromGPIO2() {
    //     //     //this.level.notifyOfExternalUpdate(99999);
    //     console.log("孙震");
    //     console.log(ueList.get("humidity"));
    //     let ueInfos = ueList.get("humidity");
    //
    //     var len = ueInfos.length;
    //     ueInfos = ueInfos.slice(0,1)//slice
    //
    //     console.log(ueInfos);
    //     console.log(typeof ueInfos);
    //     console.log("孙震");
    //     return ueInfos;
    //     // return Math.abs(70.0 * Math.random() * (-0.5 + Math.random()));
    // }

}

function runServer() {
    // Create a thing that represents a dimmable light
    //const light = new ExampleDimmableLight();

    // Create a thing that represents a humidity sensor



     const sensor = new SmokeSensor();//correct

     const sensor2 = new AlarmSensor();

     // const sensor3 = new temperatureSensor();
    // SmokeSensor.readFromGPIO(22);


     startSmokeSensorServer();
     // setTimeout("startSubscribeServer(ueList)",3000);
 //
    startSubscribeServer(ueList);

    // setTimeout(() => {
    //     console.log('尝试重新订阅');
    //     startSubscribeServer(ueList);
    // }, 1000);
//在startSmokeSenSor之前启动


    // //   ok
    // nats.subscribe('foo', function (msg) {
    //     //console.log('Received a message: ' + msg);
    //     cache.add(ueList,"humidity", msg.humidity);
    //
    //     //console.log(ueList);savingData = savingData.concat(ueInfos)
    // });
    //





    //
    // console.log(result);
   // sensor.level.notifyOfExternalUpdate(result.humidity);
    // If adding more than one thing, use MultipleThings() with a name.
    // In the single thing case, the thing's name will be broadcast.
     const server = new WebThingServer(new SingleThing(sensor),
        8181);
    const server2 = new WebThingServer(new SingleThing(sensor2),
        8182);
    // const server3 = new WebThingServer(new SingleThing(sensor3),
    //     8183);
    // sensor.readFromGPIO();
    // process.on('SIGINT', () => {
    //     server.stop().then(() => process.exit()).catch(() => process.exit());
    // });




    server.start().catch(console.error);
    server2.start().catch(console.error);
    // server3.start().catch(console.error);
    startAlarmSensorServer()

}

// runServer();

module.exports.runServer = runServer;

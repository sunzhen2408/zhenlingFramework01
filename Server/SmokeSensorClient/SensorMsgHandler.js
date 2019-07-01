// import SmokeSensor from '../webthing/frameworks.js'
const moment = require("moment");
const _struct = require('../utils/Struct/struct');
const {TIME_FORMAT} = require('../utils/TimeUtils');
const {ArrayBufferToBuffer} = require('../utils/BufferUtils');
// const {readFromGPIO} = require('../webthing/frameworks');
const AerialFsmFactory = require('./SensorFsmFactory');
let sender = undefined;
const {toBD} = require('../WiFICP/WifiMsgParser');

const {crc16modbus} = require('crc');
// const SmokeSensor = require('../webthing/frameworks');

const queryStruct = new _struct.Struct({
    addressNum: 'uint8',
    functionNum: 'uint8',
    startAdd: 'uint16',
    length: 'uint16',
}, 0, true);

const ackStruct = new _struct.Struct({
    addressNum: 'uint8',
    functionNum: 'uint8',
    validByteLength: 'uint8',
    pm2p5CC: 'uint16',
    temperature: 'uint16',
    humidity: 'uint16',
    PCO2: 'uint16',
    VOCH2S: 'uint16',
    CH20NH3: 'uint16',
    pm10CC: 'uint16',


    PM1p0: 'uint16',
    verifyNum: 'uint16'
}, 0, true);

module.exports = {
    /**
     * 消息头统一预处理，消息体分别对应处理
     * @param client 传入LTE设备对应的client
     * @param data 传入待解析的数据
     */
    handleMsg: (client, data) => {
        try {
            // console.log(data);
            let ackMsg = ackStruct.read(data.buffer);
            ackMsg = toBD(ackStruct, ackMsg);
            const {addressNum, temperature, humidity, pm2p5CC, pm10CC,VOCH2S,CH20NH3} = ackMsg;
 ///a.(pm2)
           // AerialFsmFactory.updateSensorData(ackMsg.addressNum, {temperature, humidity, pm2p5CC, pm10CC,VOCH2S,CH20NH3});
            // console.log(ackMsg);

            // SmokeSensor.readFromGPIO(pm2p5CC);
            //console.log(pm2p5CC);
            //readFromGPIO(pm2p5CC);
            return {temperature, humidity, pm2p5CC, pm10CC,VOCH2S,CH20NH3};
        } catch (e) {
            console.log(e);
        }
    },
     // readFromGPIO:(data)
     // {
     //
     //

    handleMsg2:(data) => {
        try {
            // console.log(data);
            let ackMsg = ackStruct.read(data.buffer);
            ackMsg = toBD(ackStruct, ackMsg);
            const {addressNum, temperature, humidity, pm2p5CC, pm10CC,VOCH2S,CH20NH3} = ackMsg;

            AerialFsmFactory.updateSensorData(ackMsg.addressNum, {temperature, humidity, pm2p5CC, pm10CC,VOCH2S,CH20NH3});
            // console.log(ackMsg);
            return {temperature, humidity, pm2p5CC, pm10CC,VOCH2S,CH20NH3};
        } catch (e) {
            console.log(e);
        }
    },

    initSender: (client) => {
        if (sender === undefined) {
            console.log('串口服务器初始化连接');
        } else {
            console.log('串口服务器已存在，重新替换为最新的服务器');
        }
        sender = client;
        AerialFsmFactory.initSensorData();
    },
    //room id == sensor address(must begin 1====)
    queryData: (address) => {
        let sendData;
        sendData = {
            addressNum: address,
            functionNum: 0x03,
            startAdd: 0x0000,
            length: 0x000B,
        };
        try {
            sendData = toBD(queryStruct, sendData);
            let sendDataArrayBuffer = queryStruct.write(sendData);
            let vertifyNum = crc16modbus(sendDataArrayBuffer);
            let vertifyNumBuffer = Buffer.from([vertifyNum & 0x00ff, (vertifyNum & 0xff00) >> 8]);
            let sendBuffer = ArrayBufferToBuffer(queryStruct.write(sendData));
            sendBuffer = Buffer.concat([sendBuffer, vertifyNumBuffer], sendBuffer.length + vertifyNumBuffer.length);
            if (sender !== undefined) {
                // console.log(`发送消息到传感器[${address}] data:${JSON.stringify(sendData)}`);
                //01 03 00 00 00 0A C5 CD
                sender.write(sendBuffer);
            } else {
                console.log('串口服务器未连接，暂时无法发送');
            }
           // console.log(sendData);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
};

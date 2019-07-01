const sensorDataMap = {};
const {getAllRoomInfo} = require('../DB/DBRouter');
let timeClock = undefined;
let senderClock = undefined;
//const SmokeSensor = require('../webthing/frameworks');
// global.temp

function initSensorData() {
    // let dbRes = getAllRoomInfo();
    // dbRes.promise.then(res => {
    //     if (res.rowCount > 0) {
    //         let roomList = res.rows;
    //         roomList.forEach(item => {
    var room_no = 1;
                sensorDataMap[room_no] = {
                    roomNo: +room_no,
                    pm2p5CC: '未测出',
                    temperature: '未测出',
                    humidity: '未测出',
                    pm10CC: '未测出'
                };
            // });
        // }
        module.exports.startUpdateSensorData();
        // dbRes.client.end();
    // });
    console.log("function");
}

module.exports = {
    initSensorData: initSensorData,

    startUpdateSensorData: () => {
        console.log('开始发送查询消息');
        const {queryData} = require('./SensorMsgHandler');
        // const {emit} = require('../EventRouter');
        let roomNoList = Object.keys(sensorDataMap);
        //如果已经存在定时器则先清除，保证同时只能存在一个定时器
        if (timeClock !== undefined) {
            clearInterval(timeClock);
            clearInterval(senderClock);
        }
        // timeClock = setInterval(() => {
        //     emit('currentSensorData', sensorDataMap);
        // }, 5 * 1000);
        let roomNo = 1;
        let maxRoomNo = roomNoList.length;
        senderClock = setInterval(() => {
            queryData(roomNo);
            if (roomNo === maxRoomNo) {
                roomNo = 1;
            } else {
                roomNo += 1
            }
        }, 500);
    },
    closeclock:()=>{
        if (timeClock !== undefined && senderClock !== undefined) {
            clearInterval(timeClock);
            clearInterval(senderClock);
            console.log(' ===   close timer when client disconnect  === = ');
        }
    },
    /**
     *
     * @param roomNo
     * @param data {pm2p5CC,temperature,humidity,pm10CC}这四个值其中一个
     */
    updateSensorData: (roomNo, data) => {
         // console.log(data);
         //调用B，
        // console.log("data"+"locate");
        //;
        //this.level.notifyOfExternalUpdate(data[humidity]);
       //console.log();
        global.temp = data;
      // console.log(global.temp);
        if (sensorDataMap.hasOwnProperty(`${roomNo}`)) {
            sensorDataMap[roomNo] = {
                ...sensorDataMap[roomNo],
                ...data
            };

        } else {
            console.log('不存在此房间');
        }
    },

    getRoomSensorData: (roomNo) => {
        console.log(sensorDataMap);
        console.log("sensorDataMap");
        if (sensorDataMap.hasOwnProperty(`${roomNo}`)) {
            return sensorDataMap[roomNo];
        } else {
            console.log('无此房间传感器数据');
            return {
                pm2p5CC: '未测出',
                temperature: '未测出',
                humidity: '未测出',
                pm10CC: '未测出'
            };
        }
    }
};

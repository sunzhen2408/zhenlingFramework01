// const _ClientRouter = require('./WebServer/ClientRouter');
// const _LTEMsgHandle = require('./BP/LTEMsgHandle');
// const _EventEmitter = require('events').EventEmitter;
// const _DBRouter = require('./DB/DBRouter');
// const routerEvent = new _EventEmitter();
//
// /**
//  * 消息路由监听事件
//  * @param EventName 事件名称
//  * @param handler 回调处理函数
//  */
// function on(EventName, handler) {
//     routerEvent.on(EventName, function (data) {
//         console.log(`处理事件[${EventName}]中 data:${JSON.stringify(data)}\n`);
//         handler(data);
//     });
// }
//
// module.exports = {
//     /**
//      * 消息路由激活事件
//      * @param EventName 事件名称
//      * @param data 传入数据
//      */
//     emit: function (EventName, data) {
//         console.log(`激活事件[${EventName}]`);
//         routerEvent.emit(EventName, data);
//     },
//
//     startMsgPush: () => {
//         //client -->> server
//
//         on('setArfcn', function (arfcnInfo) {
//             _LTEMsgHandle.buildCell(arfcnInfo.boardsn, arfcnInfo);
//         });
//
//         on('deactivate', function (deactivateInfo) {
//             let ifActivated = false;
//             _LTEMsgHandle.setCellState(deactivateInfo.boardsn, ifActivated);
//         });
//
//         on('remInfo', function (remInfo) {
//             _LTEMsgHandle.startRem(remInfo.boardsn, remInfo);
//         });
//
//         on('setQRxLevMin', function (QRxLevMinInfo) {
//             _LTEMsgHandle.setQRxLevMin(QRxLevMinInfo.boardsn, QRxLevMinInfo.QRxLevMin);
//         });
//
//         on('setLteCellState', function (cellStateInfo) {
//             _LTEMsgHandle.setCellState(cellStateInfo.boardsn, cellStateInfo.checked);
//         });
//
//         on('setLteSelfActive', function (selfActivatedInfo) {
//             _LTEMsgHandle.setSelfActive(selfActivatedInfo.boardsn, selfActivatedInfo.checked);
//         });
//
//         on('setLtePower', function (powerInfo) {
//             _LTEMsgHandle.setPower(powerInfo.boardsn, powerInfo);
//         });
//
//         on('setLteWorkMode', function (workModeInfo) {
//             _LTEMsgHandle.setUEWorkMode(workModeInfo.boardsn, workModeInfo);
//         });
//
//         on('setLteRemMode', function (syncInfo) {
//             _LTEMsgHandle.setRemMode(syncInfo.boardsn, syncInfo.RemMode);
//         });
//
//         on('setLMTIP', function (LMTIPInfo) {
//             _LTEMsgHandle.setLMTIP(LMTIPInfo.boardsn, LMTIPInfo);
//         });
//
//         on('setLteSysMode', function (sysModeInfo) {
//             _LTEMsgHandle.setSysMode(sysModeInfo.boardsn, parseInt(sysModeInfo.sysMode));
//         });
//
//         on('lteReboot', function (rebootInfo) {
//             _LTEMsgHandle.reboot(rebootInfo.boardsn);
//         });
//         //server -->> client
//         /**
//          * 检测设备状态的更新
//          */
//         on('updateLTEState', function (stateInfo) {
//             let boardsn = stateInfo.boardsn;
//             _DBRouter.getUseridByBoardsn(boardsn).then(res => {
//                 let userInfo = res.rows[0];
//                 _ClientRouter.emit(userInfo.userid, "updateLTEState", stateInfo);
//             });
//         });
//
//         /**
//          * 监听终端采集LTE设备的请求发送需求
//          * 根据ueInfo中的boardsn找到对应的userId，再根据userId找到该用户web前端的client并将数据发送出去
//          */
//         on('sendCurrentUE', function (data) {
//             _ClientRouter.emit(data.userid, 'sendCurrentUE', data.ueInfos);//向所有连接的web前端发送增加ue显示的请求
//         });
//
//         on('updateLteSelfActive', function (selfActiveInfo) {
//             let boardsn = selfActiveInfo.boardsn;
//             _DBRouter.getUseridByBoardsn(boardsn).then(res => {
//                 let userInfo = res.rows[0];
//                 _ClientRouter.emit(userInfo.userid, 'updateLteSelfActive', selfActiveInfo);
//             });
//         });
//
//         on('sendRemInfo', function (remInfo) {
//             let boardsn = remInfo.boardsn;
//             _DBRouter.getUseridByBoardsn(boardsn).then(res => {
//                 let userInfo = res.rows[0];
//                 _ClientRouter.emit(userInfo.userid, 'sendRemInfo', remInfo);
//             });
//         });
//
//         on('LTEReport', function (reportInfo) {
//             let boardsn = reportInfo.boardsn;
//             _DBRouter.getUseridByBoardsn(boardsn).then(res => {
//                 let userInfo = res.rows[0];
//                 _ClientRouter.emit(userInfo.userid, 'LTEReport', reportInfo);
//             });
//         });
//
//         /**
//          * 检测WIFI设备发送的消息
//          */
//         on('sendCurrentMAC', function (macInfo) {
//             let APMAC = macInfo.APMAC;
//             _DBRouter.getUseridByAPMAC(APMAC).then(res => {
//                 let userInfo = res.rows[0];
//                 _ClientRouter.emit(userInfo.userid, 'sendCurrentMAC', macInfo.dataSource);
//             });
//         });
//
//         on('updateLTESyncInfo', function (syncInfo) {
//             let boardsn = syncInfo.boardsn;
//             _DBRouter.getUseridByBoardsn(boardsn).then(res => {
//                 let userInfo = res.rows[0];
//                 _ClientRouter.emit(userInfo.userid, 'updateLTESyncInfo', syncInfo);
//             });
//         });
//
//         on('updateLTEQRxLevMin', function (QRxLevMinInfo) {
//             let boardsn = QRxLevMinInfo.boardsn;
//             _DBRouter.getUseridByBoardsn(boardsn).then(res => {
//                 let userInfo = res.rows[0];
//                 _ClientRouter.emit(userInfo.userid, 'updateLTEQRxLevMin', QRxLevMinInfo);
//             });
//         });
//
//         on('roomActivated', function (activatedInfo) {
//             let aerialSN = activatedInfo.AerialStatus.aerialSN;
//             let dbRes = _DBRouter.getUseridOfAerial(aerialSN);
//             dbRes.promise.then(res => {
//                 if (res.rowCount > 0) {
//                     let userInfo = res.rows[0];
//                     _ClientRouter.emit(userInfo.userid, 'roomActivated', activatedInfo);
//                     dbRes.client.end();
//                 } else {
//                     dbRes.client.end();
//                 }
//             }).catch(err => {
//                 dbRes.client.end();
//             });
//         });
//
//         on('currentSensorData', function (sensorDataMap) {
//             _ClientRouter.emit(2, 'currentSensorData', sensorDataMap);
//         });
//     }
// };

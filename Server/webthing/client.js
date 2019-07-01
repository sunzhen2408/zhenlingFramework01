// const net = require('net');
// const  {handleMsg2}=require('../SmokeSensorClient/SensorMsgHandler')
//
//
// function startClient() {
//
//     var client=net.connect(1000,'15.200.19.168',function(){
//         client.write('hello my client');
//         console.log("hello connection is done");
//     });
//     client.on('error',function(error){
//         console.log("error");
//
//
//     });
//     client.on('data',function(data){
//         console.log(handleMsg2(data));
//         var data2 = handleMsg2(data).humidity;
//         console.log(data2);
//         return data2;
//
//     });
// }
// startClient();
//module.exports.startClient = startClient;
// function startSmokeSensorServer() {
//     console.log("TCP before start aerial");
//     aerialServer.on('connection', function (client) {
//         console.log("TCP after start aerial");
//         client.name = '';
//         client.setTimeout(40 * 1000000, function () {
//             console.warn("设备client" + client.name + "断开连接");
//             broadcast();
//         });
//         allClientList.push(client);
//         client.on('data', function (data) {
//             if (data != null) {
//                 //接收返回值 handleMsg
//                 var result = handleMsg(client, data);
//                 console.log(result);
//
//             }
//         });
//
//         /*监听客户端终止*/
//         client.on('end', function () {//如果某个客户端断开连接，node控制台就会打印出来
//             broadcast();
//             console.log("串口服务器" + client.name + 'quit');
//         });
//         /*记录错误*/
//         client.on('error', function (e) {
//             broadcast();
//             console.log(e);
//         });
//         initSender(client);
//     });
//
//     aerialServer.listen(1000);
//     console.log('Smoke Sensor Server Server listening on ' + PORT);
// }

//  JavaScript source code
//  新建server服务器
//  接受所有的板子socket连接并且为其分配相应的处理事件

const net = require('net');

const WifiCtlFactory = require('./WifiCtlFactory');
const ServerConfig = require('./../ServerConfig');
const {handleMsg} = require('./WifiMsgHandler');
const hashmap = require('hashmap');
const {WIFIServerCfg} = ServerConfig;
const PORT = WIFIServerCfg.serverPort;
const wifiServer = net.createServer();
//get the configuration of the server for Lte devices
let allClientList = [];
const clientMap = new hashmap.HashMap;//仅存放LTE设备对应的 client，<boardsn,client>

const LTEFramerHeader = "5555AAAA";

// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
// 创建一个TCP服务器实例，调用listen函数开始监听指定端口

/*启动接收Lte Client的Server*/
function startWifiServer() {
    wifiServer.on('connection', function (client) {
        client.name = "";
        client.setTimeout(70 * 1000, function () {
            console.warn("设备client" + client.name + "断开连接");
            broadcast();
        });
        allClientList.push(client);
        client.on('data', function (data) {
            if (data != null) {
                //todo 开始解析消息
                handleMsg(client, data);
            }
        });
        /*监听客户端终止*/
        client.on('end', function () {//如果某个客户端断开连接，node控制台就会打印出来
            broadcast();
            console.log(client.remoteAddress + "[" + client.name + "]" + 'quit');
        });
        /*记录错误*/
        client.on('error', function (e) {
            broadcast();
            console.log(e);
        });
    });
    wifiServer.listen(PORT);
    console.log('Wifi Server listening on ' + PORT);
}

function broadcast() {
    let cleanup = [];//断开了的客户端们
    allClientList = allClientList.filter(client => {
        let connecting = client.connecting;
        if (!connecting) {
            //todo 处理断线设备
            WifiCtlFactory.removeWifiCtl(client.name);
        }
        return connecting;
    });
}

module.exports.startWifiServer = startWifiServer;
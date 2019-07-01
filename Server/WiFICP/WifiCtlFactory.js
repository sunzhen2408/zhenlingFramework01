const DBRouter = require('../DB/DBRouter');
const {toStringMAC} = require('../utils/BufferUtils');

const wifiCtlsMap = new Map();
module.exports = {
    creatWifiCtl: function (client, mac) {
        mac = toStringMAC(mac);
        if (!wifiCtlsMap.has(mac)) {
            client.name = mac;
            let wifiController = {
                client: client,
                mac: mac
            };
            DBRouter.insertGetWifiDev({
                name: 'wifi',
                APMAC: mac,
                groupId: 0
            }).then(res => {
                if (res[1].rowCount > 0) {
                    let groupInfo = res[1].rows[0];
                    wifiController.groupInfo = {...groupInfo};
                }
            });
            wifiCtlsMap.set(mac, wifiController);
            console.log(`为WIFI嗅探设备${mac}初始化状态机`);
        }
    },
    getWifiCtl: function (mac) {
        if (wifiCtlsMap.has(mac)) {
            return wifiCtlsMap.get(mac);
        } else {
            console.warn(`[${mac}]目标状态机不存在`);
            return null;
        }
    },
    removeWifiCtl: function (mac) {
        if (wifiCtlsMap.has(mac)) {
            wifiCtlsMap.delete(mac);
            return true;
        } else {
            console.log(`[${mac}]目标状态机不存在`);
            return false;
        }
    }
};
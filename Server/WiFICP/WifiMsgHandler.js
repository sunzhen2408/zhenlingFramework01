const moment = require("moment");
const {TIME_FORMAT} = require("../utils/TimeUtils");

const PULEN = 28;
const WifiMsgPaser = require('./WifiMsgParser');
const WifiMsgType = require('./WifiMsgType');
const BufferUtils = require('../utils/BufferUtils');
const WifiCtlFactory = require('./WifiCtlFactory');
const EventRouter = require('../EventRouter');
const {insertNewMAC} = require('../DB/DBRouter');

const sendAck = function (client, PU) {
    PU = {...PU};
    let buf;
    let arrBuf;
    if (PU.DUType === 3) {
        arrBuf = WifiMsgPaser.write('PU', {
            ...PU,
            DUType: 8,
            DUNum: 0,
            DULen: 0
        });
        buf = BufferUtils.ArrayBufferToBuffer(arrBuf);
    } else {
        arrBuf = WifiMsgPaser.write('PU', {
            ...PU,
            DUType: 9,
            DUNum: 0,
            DULen: 0
        });
        buf = BufferUtils.ArrayBufferToBuffer(arrBuf);
    }
    client.write(buf);
    console.log(`发送：`);
    console.log(buf);
};

module.exports = {
    handleMsg: function (client, data) {
        try {
            let PUBuf = new Buffer(PULEN);
            let DUListBuf = new Buffer(data.length - PULEN);
            //将接收的数据划分成消息头和消息体
            data.copy(PUBuf, 0, 0, PULEN);
            data.copy(DUListBuf, 0, PULEN, data.length);
            let PU;
            console.log('长度:', DUListBuf.length.toString(16));
            if (PUBuf.length !== 0) {
                PU = WifiMsgPaser.read('PU', PUBuf.buffer);
                if (PU.MagicNum !== 0x7C83) {
                    return;
                }
                console.log(Object.keys(PU).map(item => {
                    return `${item}:${PU[item].toString(16)}`
                }));
                WifiCtlFactory.creatWifiCtl(client, PU.APMAC);
                sendAck(client, PU);
                let DUNum = PU.DUNum;
                let parsedLen = PULEN;
                switch (PU.DUType) {
                    case WifiMsgType.MAC_INFO: {
                        let macInfoList = [];
                        for (let i = 0; i < DUNum; i++) {
                            let DU_base;
                            let DU_base_buf = new Buffer(20);
                            data.copy(DU_base_buf, 0, parsedLen, parsedLen + 20);
                            DU_base = WifiMsgPaser.read(WifiMsgType.MAC_INFO, DU_base_buf.buffer);
                            if (DU_base.MagicNum !== 0x7C84) {
                                break;
                            }
                            parsedLen += DU_base.Length;
                            //扩展单元buffer
                            //todo 暂不解析
                            DU_base.APMAC = BufferUtils.toStringMAC(PU.APMAC);
                            DU_base.SourceMAC = BufferUtils.toStringMAC(DU_base.SourceMAC);
                            DU_base.Time = moment().format(TIME_FORMAT);
                            DU_base.RSSI = DU_base.RSSI - 255;
                            DU_base.groupName = WifiCtlFactory.getWifiCtl(DU_base.APMAC).groupInfo.groupName;
                            macInfoList.push(DU_base);
                            insertNewMAC(DU_base);
                            console.log(`第${i}个：${JSON.stringify(DU_base)}`);
                            if (i > 50) {
                                break;
                            }
                        }
                        EventRouter.emit('sendCurrentMAC', {
                            dataSource: macInfoList,
                            APMAC: BufferUtils.toStringMAC(PU.APMAC),
                        });
                        break;
                    }
                    default:
                        break;
                }
                console.log(DUListBuf);
                // console.log(JSON.stringify(PU));
                // console.log(DUListBuf);
                console.log('\n\n\n')
            }
        } catch (e) {
            console.error(e);
        }
    }
};
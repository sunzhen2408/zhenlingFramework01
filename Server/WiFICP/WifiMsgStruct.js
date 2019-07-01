const _struct = require('./../utils/Struct/struct');
const WifiMsgType = require('./WifiMsgType');

const PUStruct = new _struct.Struct({
    //固定的头两个字节
    MagicNum: 'uint16',
    //协议版本号 4bit
    //协议头长度，单位为4字节 4bit
    VersionAndHeadLength: 'uint8',
    /**
     * DU部分是否加密
     * 0：不加密
     * 1：加密
     */
    Encrypted: 'uint8',
    //报文序列号，每个报文增加1
    Sequence: 'uint16',
    //采集设备的mac
    APMAC: ['uint8', [], 6],
    //数据单元总长度，该长度为完成压缩/加密后的长度，不包含加密的补齐部分，实际长度按照加密补齐方式计算
    DULen: 'uint16',
    //数据单元个数
    DUNum: 'uint16',
    //数据单元类型
    DUType: 'uint8',
    //DU部分是否压缩
    Compressed: 'uint8',
    //厂商组织机构代码
    OrgID: ['uint8', [], 9],
    //保留，用于四字节补齐
    Reserved: 'uint8'
}, 0, true);

const macInfo = new _struct.Struct({
    //固定的头两个字节
    MagicNum: 'uint16',
    //数据单元总长度
    Length: 'uint16',
    //信号源的MAC地址
    SourceMAC: ['uint8', [], 6],
    //扫描到该MAC的时间
    Time: 'uint32',
    //扫描到该MAC时的信道
    Channel: 'uint8',
    /**
     * 该MAC的类型
     * 0:未知
     * 1:STA
     * 2:AP
     * 3:Adhoc
     * 其他:保留
     */
    MACType: 'uint8',
    //STA是否连接到AP，仅在MAC Type为STA有效
    IsAssociated: 'uint8',
    /**
     * 加密类型
     * 0:Open
     * 1:WEP
     * 2:WPA
     * 3:WPA2
     */
    EncryptType: 'uint8',
    //接收到该MAC的信号强度
    RSSI: 'uint8',
    //保留字节
    Reserved: 'uint8'
}, 0, true);

//心跳消息
const heartBeatInfo = new _struct.Struct({
    //总长度
    Length: 'uint32',
    //发送信息的时间，绝对秒
    Time: 'uint32',
    //心跳间隔内发送采集到sta的mac总数
    StaMacNum: 'uint32',
    //心跳间隔内发送采集到ap的mac的总数
    ApMacNum: 'uint32',
    //心跳间隔内发送采集到虚拟身份的总数
    VidNum: 'uint32'
}, 0, true);

module.exports = {
    getHeadStruct: function () {
        return PUStruct;
    },
    getBodyStruct: function (msgType) {
        switch (msgType) {
            case 0: {
                return macInfo;
            }
            case 1: {
                return;
            }
            case 2: {
                return heartBeatInfo;
            }
            case 3: {
                return;
            }
            case 4: {
                return;
            }
            case 5: {
                return;
            }
            case 6: {
                return;
            }
            case 7: {
                return;
            }
            case 8: {
                return;
            }
            case 9: {
                return;
            }
            default: {
                return;
            }
        }
    }
};
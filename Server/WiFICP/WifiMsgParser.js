const WifiMsgStruct = require('./WifiMsgStruct');
const ByteUtils = require('../utils/ByteUtils');
const BufferUtils = require('../utils/BufferUtils');
module.exports = {
    toBD: function (struct, object) {
        let parsed = {};
        try {
            let keys = Object.keys(struct.struct);
            keys.forEach(st => {
                parsed[st] = BufferUtils.clearNullChar(
                    ByteUtils.Swap_LD_BD(struct.struct[st][0], object[st]));
            });
        } catch (e) {
            console.log(e);
        }
        return parsed;
    },
    read(msgType, buffer) {
        let msg;
        if (msgType === 'PU') {
            let puStruct = WifiMsgStruct.getHeadStruct();
            msg = puStruct.read(buffer);
            msg = this.toBD(puStruct, msg);
            msg.Version = ByteUtils.get4HighBit(msg.VersionAndHeadLength);
            msg.HeadLength = ByteUtils.get4LowBit(msg.VersionAndHeadLength);
        } else {
            let duStruct = WifiMsgStruct.getBodyStruct(msgType);
            msg = duStruct.read(buffer);
            msg = this.toBD(duStruct, msg);
        }
        return msg;
    },
    write(msgType, data) {
        let dataStruct;
        if (msgType === 'PU') {
            dataStruct = WifiMsgStruct.getHeadStruct();
        } else {
            dataStruct = WifiMsgStruct.getBodyStruct(msgType);
        }
        let packedData = this.toBD(dataStruct, data);
        return dataStruct.write(packedData);
    }
};
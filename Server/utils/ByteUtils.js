module.exports = {
    get4LowBit: function (byte) {
        return byte & 0x0f;
    },
    get4HighBit: function (byte) {
        return (byte & 0xf0) >> 4;
    },
    /**
     * 小端格式大端格式相互转换
     * @param type 指明消息类型（）
     * @param data
     * @returns {*}
     * @constructor
     */
    Swap_LD_BD: function (type, data) {
        switch (type) {
            case 'uint8': {
                return data;
            }
            case 'uint16': {
                let byte = [];
                byte.push((data & 0xFF) << 8);
                byte.push((data & 0xFF00) >> 8);
                return byte[0] | byte[1];
            }
            case 'uint32': {
                let byte = [];
                byte.push((data & 0x000000FF) << 24);
                byte.push((data & 0x0000FF00) << 8);
                byte.push((data & 0x00FF0000) >> 8);
                byte.push((data & 0xFF000000) >> 24);
                return byte[0] | byte[1] | byte[2] | byte[3];
            }
            default:
                return data;
        }
    }
};
const ArrayBufferToBuffer = function (arrayBuffer) {
    try {
        let array = new Int8Array(arrayBuffer);
        let buffer = new Buffer(array);
        return buffer;
    } catch (e) {
        console.log(e);
    }

};

function clearNullChar(str) {
    if (typeof str === "string") {
        do {
            let len = str.length;
            str = str.replace("\00", "").replace("\0", "").replace(" ", "");
            len = str.length;
        } while (str.replace("\0", "").length !== str.length);
    }
    return str;
}

function toStringMAC(arr) {
    if (typeof mac !== 'string') {
        let args = arr.map(item => item < 16 ? `0${item.toString(16)}` : item.toString(16));
        return args.join(":").toUpperCase();
    }
    return arr;
}

module.exports.ArrayBufferToBuffer = ArrayBufferToBuffer;
module.exports.clearNullChar = clearNullChar;
module.exports.toStringMAC = toStringMAC;
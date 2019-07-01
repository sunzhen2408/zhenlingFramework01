const {getPhoneNum} = require('./PhoneNumberUtils');
module.exports = {
    getCarrieroperator: (imsi) => {
        let MNC = imsi.substring(3, 5);
        if (MNC === '00' || MNC === '02' || MNC === '07' || MNC === '08' || MNC === '02' || MNC === '04') {
            return '中国移动';
        } else if (MNC === '01' || MNC === '06' || MNC === '09') {
            return '中国联通';
        } else if (MNC === '03' || MNC === '05' || MNC === '11') {
            return '中国电信';
        }
    },

    getPhoneNum: getPhoneNum
};
if (typeof EventList === 'undefined') {
    var EventList = {
        LTEOffline: 101,
        WIFIOffline: 102,
        LTEOnline: 201,
        WIFIOnline: 202,
        LTEReboot: 203,
        LTEChangeState: 204,
        LTERun: 301,
    }
}

module.exports = EventList;
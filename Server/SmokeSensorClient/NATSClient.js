const NATS = require('nats');

function initNATS(nats, config) {
    nats.on('connect', function () {
        console.log('连接成功');
    });

    nats.on('error', function (err) {
        console.log(err);
    });

    nats.on('connect', function (nats) {
        console.log('connected');
    });

    nats.on('disconnect', function () {
        console.log('disconnect');
    });

    nats.on('reconnecting', function () {
        console.log('reconnecting');
    });

    nats.on('reconnect', function (nats) {
        console.log('reconnect');
    });

    nats.on('close', function () {
        console.log('close');
    });
}

// 更改地址  先启动NATSROUTER，再去启动client
module.exports = {
    NATSClient: function (config) {
        this.nats = NATS.connect({
            servers: config.SERVERIPS,
            maxReconnectAttempts: -1,
            reconnect: true,
            json: true
        });
        this.publish = (eventID, data) => {
            if (this.nats.connected) {
                this.nats.publish(eventID, data);
                // console.log(`发布事件${eventID},数据长度：${data.length}`);
            } else {
                console.log(`事件${eventID}未发送,请检查NATS服务器是否联通`);
            }
        };

        this.subscribe = (eventID,ueList, callback) => {
            if (this.nats.connected) {
                this.nats.subscribe(eventID, callback);
                console.log(`订阅事件${eventID}`);
            } else {
                console.log(`无法订阅事件${eventID},请检查NATS服务器是否联通`);
                setTimeout(() => {
                    console.log('尝试重新订阅');
                    this.subscribe(eventID, callback);
                }, 1000);
            }
        };
        //监听NATS所有状态切换事件
        initNATS(this.nats, config);
        /**
         * 获取 nats 连接状态
         * @return {*}
         */
        this.isConnected = () => this.nats.connected();
        setTimeout(() => {

        },5*1000);
    }
};

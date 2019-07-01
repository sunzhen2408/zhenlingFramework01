module.exports = {

    //与LTE设备之间通信服务的配置
    BPServerCfg: {
        serverPort: "3347",

        setBPServer: function (port) {
            BPServerCfg.serverPort = port;
        }
    },

    WIFIServerCfg: {
        serverPort: '7778'
    },

    //socket.io 的配置
    WebSocketServerCfg: {
        serverPort: "8097",

        setWebServer: function (port) {
            WebSocketServerCfg.serverPort = port;
        }
    },

    //http协议的配置
    httpServerCfg: {
        jwtSecret: '1984871009@qq.com',
        jwtTimeOut: 1000 * 60 * 60 * 24 * 7,//jwt过期时间
        jwtCertification: 'zhenling_shanghai',
        cookieTimeOut: 1000 * 60 * 60 * 24 * 7
    },

    weChatCfg: {
        appid: 'wx1dd95f4ccf656a7b',
        secret: '3c2299b8594c98312c01a4fb843e246d',
        token: '1984871009shanghaizhenlin',
        encodingAESKey: '2cK5YnQzrdvQIVkutT9fNnZkTMY7mVfeELqG4RJhLsH',
        checkSignature: true
    },

    aerialCfg: {
        serverPort: "8098",
    },
    alarmServerCfg:{
        port:6000
    },
    smokeSensorServerCfg: {
        port: 1000
    },
    ONOFFAlert: {
        port: 8091
    },
    NATSCONFIG: {
        // SERVERIPS: ['nats://15.200.19.143:4222'],
        SERVERIPS: ['nats://15.200.19.125:4222'],
        reconnectDelay: 2 * 1000
    }

};

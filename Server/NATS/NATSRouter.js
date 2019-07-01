const {NATSClient} = require('../SmokeSensorClient/NATSClient');
const {NATSCONFIG} = require('../ServerConfig');
const mNats = new NATSClient(NATSCONFIG);
mNats.sayHello = () => {
    console.log('NATS Server For Video Server Started');
};
// 如何调用emit？？
module.exports = {
    mNats: mNats,
    emit: (EventName, data) => {
        // mNats.publish(EventName, JSON.stringify({userid: 0, data}));
        mNats.publish(EventName, data);
        //为什么publish的参数是data  源码库里  是callback函数
    },
    // 等待回来看看
    // emit_subscribe:(EventName,ueList,callback)=>{
    //     mNats.subscribe(EventName,ueList,callback);
    //
    // }
};


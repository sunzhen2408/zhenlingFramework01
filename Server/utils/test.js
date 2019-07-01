const Recorder = require('./recorder');

const recorder = new Recorder({
    sampleRate: 44100, //采样频率，默认为44100Hz(标准MP3采样率)
    bitRate: 128, //比特率，默认为128kbps(标准MP3质量)
    success: function () { //成功回调函数
        console.log('success');
    },
    error: function (msg) { //失败回调函数
        console.log('error' + msg);
    },
    fix: function (msg) { //不支持H5录音回调函数
        console.log('fix' + msg);
    }
});

recorder.start();
setTimeout(() => {
    recorder.stop();
    recorder.getBuffer((buf) => {
        console.log(buf);
    });
}, 10 * 1000);

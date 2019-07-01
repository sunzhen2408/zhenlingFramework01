// open a serial port
var SerialPort = require("serialport");
var serialPort = new SerialPort("COM5", {baudRate: 9600, autoOpen: false});

// create a modbus client using the serial port
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU(serialPort);

// open connection to a serial port
client.open();

client.setID(1);

// read the values of 10 registers starting at address 0
// on device number 1. and log the values to the console.
setInterval(function () {
    try {
        client.readHoldingRegisters(4, 1, function (err, data) {
            console.log(data.data);
        });
    } catch (e) {
        console.log(e);
    }
}, 1000);
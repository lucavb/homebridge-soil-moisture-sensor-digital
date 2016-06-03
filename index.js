var Service;
var Characteristic;
var HomebridgeAPI;
var Gpio = require('onoff').Gpio;
var ads1x15 = require('./node-ads1x15/index'); // i2c module does not compile on the raspberry pi
// you will need to place it in a folder here and try to satisfy it's dependencies. check out the node-i2c repo for hints
var inherits = require('util').inherits;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    HomebridgeAPI = homebridge;

    homebridge.registerAccessory("homebridge-soil-moisture-sensor-digital", "SoilMoistureSensorDigital", SoilMoistureSensorDigital);
};

function SoilMoistureSensorDigital(log, config) {
    /*
    example configuration
        {
            "accessory" : "SoilMoistureSensorDigital",
            "name" : "Fiscus Benjamina 'Natasja'",
            "pinRead" : 25,
            "pinVCC" : 23,
            "serial" : "882F49F96115"
        }
    */
    var that = this;
    this.log = log;
    this.name = config.name;
    this.pinVCC = new Gpio(config.pinVCC, 'out');

    this.adc = new ads1x15(config.adsChip || 1);
    this.channel = config.adcChannel || 0;
    this.samplesPerSecond =  config.samplesPerSecond || '250';
    this.progGainAmp = config.progGainAmp || '4096';

    this.wetValue = config.wetValue || 0;
    this.dryValue = config.dryValue || 32767;

    // info service
    this.informationService = new Service.AccessoryInformation();

    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, config.manufacturer ||  "Vani")
        .setCharacteristic(Characteristic.Model, config.model || "YL-69")
        .setCharacteristic(Characteristic.SerialNumber, config.serial || "8C247807-D125-4B36-94D5-36622D49A2FB");


    this.service_humid = new Service.HumiditySensor(this.name);
    this.service_humid.getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on('get', this.getMoisture.bind(this));

    if (config.autoRefresh && config.autoRefresh > 0) {
        setInterval(function() {
            that.getMoisture(function(err, value) {
                if (!err) {
                    that.service_humid.getCharacteristic(Characteristic.CurrentRelativeHumidity)
                        .setValue(value);
                }
            });
        }, config.autoRefresh * 1000 * 60);
    }

}

SoilMoistureSensorDigital.prototype.getMoisture = function(callback) {
    this.pinVCC.writeSync(1);
    var that = this;
    setTimeout(function() {
        // giving the sensors some time to get started
        if(!that.adc.busy) {
            that.adc.readADCSingleEnded(that.channel, that.progGainAmp, that.samplesPerSecond, function(err, data) {
                that.pinVCC.write(0);
                if(err) {   
                    throw err;
                }
                var value = Math.abs(data);
                var percent = ((value - that.wetValue) / (that.dryValue - that.wetValue)) * 100;
                percent = (percent > 100) ? 100 : percent;
                percent = (percent < 0) ? 0 : percent;
                percent = 100 - percent;
                callback(null, parseFloat(percent.toFixed(0)));
            });
        }
    }, 150);
}


SoilMoistureSensorDigital.prototype.getServices = function() {
    return [this.informationService, this.service_humid];
};
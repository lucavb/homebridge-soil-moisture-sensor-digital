var Service;
var Characteristic;
var HomebridgeAPI;
var Gpio = require('onoff').Gpio;
var inherits = require('util').inherits;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    HomebridgeAPI = homebridge;

    homebridge.registerAccessory("homebridge-soil-moisture-sensor-digital", "SoilMoistureSensorDigital", SoilMoistureSensorDigital);
};

function SoilMoistureSensorDigital(log, config) {
    var that = this;
    this.log = log;
    this.name = config.name;
    this.pinRead = new Gpio(config.pinRead, 'in', 'both');
    this.pinVCC = new Gpio(config.pinVCC, 'out');

    // info service
    this.informationService = new Service.AccessoryInformation();
       
    this.informationService
    .setCharacteristic(Characteristic.Manufacturer, "Vani")
    .setCharacteristic(Characteristic.Model, config.model || "YL-69")
    .setCharacteristic(Characteristic.SerialNumber, config.serial || "8C247807-D125-4B36-94D5-36622D49A2FB");




    // moisture service
    SoilMoisture = function() {
       Characteristic.call(this, 'Soil Moisture', 'C160D589-9510-4432-BAA6-5D9D77957138');
       this.setProps({
           format: Characteristic.Formats.STRING,
           perms: [Characteristic.Perms.READ]
       });
       this.value = this.getDefaultValue();
    };

    inherits(SoilMoisture, Characteristic);

    SoilMoisture.UUID = 'C160D589-9510-4432-BAA6-5D9D77957138';

    SoilMoistureSensor = function(displayName, subtype) {
       call(this, displayName, '3C233958-B5C4-4218-A0CD-60B8B971AA0A', subtype);

       // Required Characteristics
       this.addCharacteristic(SoilMoisture);
    };

    inherits(SoilMoistureSensor, Service);

    SoilMoistureSensor.UUID = '0000003E-0000-1000-8000-0026BB765291';

    this.moistureSensor = new SoilMoistureSensor(this.name);
    this.moistureSensor.getCharacteristic(SoilMoisture)
        .on('get', this.getMoisture.bind(this));
}

SoilMoistureSensorDigital.prototype.getMoisture = function(callback) {
    this.pinVCC.writeSync(1);
    var that = this;
    setTimeout(function() {
        var val = that.pinRead.readSync();
        pinVCC.write(0);
        callback(null, (val == 0) ? "Dry" : "Wet");
    }, 500);
}

SoilMoistureSensorDigital.prototype.getServices = function() {
    return [this.informationService, this.moistureSensor];
};
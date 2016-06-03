var ads1x15 = require('./index');
var chip = 0; //0 for ads1015, 1 for ads1115
var adc = new ads1x15(chip); //optionally i2c address as (chip, address) but only if addr pin NOT tied to ground...
var channel = 0; //channel 0, 1, 2, or 3...
var samplesPerSecond = '250'; // see index.js for allowed values for your chip
var progGainAmp = '4096'; // see index.js for allowed values for your chip

//somewhere to store our reading
var reading = 0;
if(!adc.busy) {
	adc.readADCSingleEnded(channel, progGainAmp, samplesPerSecond, function(err, data) {
	if(err) {
		//logging / troubleshooting code goes here...
		throw err;
	}
	// if you made it here, then the data object contains your reading!
	reading = data;
	console.log(data);
	// any other data processing code goes here...
	});
}
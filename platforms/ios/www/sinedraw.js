window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	  window.setTimeout(callback, 1000 / 60);
	};
})();

var canvas = document.getElementById('majorCanvas');
var ctx = canvas.getContext('2d');
var width = 1536;

var x = 0;
var y = 125;

var time = 0;

var speed = 15;
var frequency = 1;
var previousFreq = 0;
var newFrequency = 1;
var changeFrequency = false;
var currentFreq = previousFreq;
var fadeIn = 30;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.lineWidth = 6;
	ctx.lineJoin = 1;
	x = 0;
	ctx.strokeStyle = '#0000ff';
	time += 1 ;
	if (time < fadeIn)
	{
		ctx.moveTo(x, y + amplitude * gain.gain.value * Math.cos((x + time * speed) * Math.pow((previousFreq+(((-.5) * Math.cos(time / fadeIn * 3.14159) + .5) * (frequency - previousFreq))), 1/3) / 100));
		for (x = 0; x < width; x += 3)
		{
			ctx.lineTo(x, y + amplitude * gain.gain.value * Math.cos((x + time * speed) * Math.pow((previousFreq + (((-.5) * Math.cos(time / fadeIn * 3.14159) + .5) * (frequency - previousFreq))),1/3) / 100));
		}
	}else
	{
		ctx.moveTo(x, y + amplitude * gain.gain.value * Math.cos((x + time * speed) * Math.pow(frequency, 1/3) / 100));
		previousFreq=frequency;
		for (x = 0; x < width; x += 3)
		{
			ctx.lineTo(x, y + amplitude * gain.gain.value * Math.cos((x + time * speed) * Math.pow(frequency, 1/3) / 100));
		}
	}
	ctx.stroke();
	if ((newFrequency != frequency) && (Math.cos(time * speed * Math.pow(frequency, 1/3) / 100) > 0.995))
	{
		time = 0;
		frequency = newFrequency;
	}
    requestAnimFrame(function() {
      animate();
    });
}
animate();

$(document).ready(function() {
	context = new webkitAudioContext;
	window.gain = context.createGainNode();
	window.gain.connect(context.destination);

	var height = $(window).height();
	var width = $(window).width();
	var timer = 1000000;
	var frequencies = []
	for (var i = 0; i <= 12; i++) {
		frequencies.push(Math.round(523 * Math.pow(Math.pow(2, 1/12), i)));
	}	
	var major = [frequencies[0],frequencies[2],frequencies[4],frequencies[5],frequencies[7],frequencies[9],frequencies[11],frequencies[12]]
	var minor = [frequencies[0],frequencies[2],frequencies[3],frequencies[5],frequencies[7],frequencies[8],frequencies[10],frequencies[12]]
	var pentatonic = [frequencies[0],frequencies[2],frequencies[4],frequencies[7],frequencies[9],frequencies[12]]
	var blues = [frequencies[0],frequencies[3],frequencies[4],frequencies[5],frequencies[7],frequencies[9],frequencies[10],frequencies[12]]
	var scales = [major,minor,pentatonic,blues]
	var currentScale = pentatonic
	var newFrequency = 1;

	//$("#positions").html(frequencies)


	meSpeak.loadConfig("mespeak_config.json");
	meSpeak.loadVoice('voices/en/en-us.json');

	var recording = true;
	var recorded = [];
	var phrase = "There once was a man with a poodle butt which he took to the market in order to strut";
	$("#text-box").val(phrase)
	var phraseArray = phrase.split(" ");

	var touchActive = false;

	$(document).on("touchmove", function(e) {
		e.preventDefault();
        var x = e.originalEvent.changedTouches[0].pageX
        var y = e.originalEvent.changedTouches[0].pageY
        timer += 1
		window.clearTimeout(window.timeout);
		window.oscillator = window.oscillator || context.createOscillator();

		currentScale = getScale(y);
		closest_f = getFreq(x, currentScale);

		window.oscillator.frequency.value = closest_f;
		window.oscillator.connect(gain)
		
		gain.gain.value = 1;
		$(".inner-gradient").removeClass("visible");
		if ($(e.target).hasClass("middle-text")) {
			$("#minor .inner-gradient").addClass("visible")
		} else if ($(e.target).hasClass("canvas")) {
			$("#" + $(e.target).attr("id").split("Can")[0] + " .inner-gradient").addClass("visible");
		} else {
			$(e.target).addClass("visible");
		}
		canvasObjs[scales.indexOf(currentScale)].enableGain = 1;
		window.oscillator.start(0)

		window.stopTimer = setTimeout(function() {
			clearTimeout(stopTimer);
			if (window.oscillator && !touchActive) {
				window.oscillator.stop(0);
				window.oscillator = false;
			}
		}, 5000);
   	});

	var touchTimer = 0;
	var startX = 0;
	var startY = 0;
	var curX = 0;
	var curY = 0;
	$(document).on("touchstart", function(e) {
		touchInterval = setInterval(function() {
			touchTimer += 1
			if (touchTimer > 100 && touchActive) {
				currentScale = getScale(curY);
				var freq = getFreq(curX, currentScale);
				recorded.push(freq);
				console.log(recorded)
				$("body").append("<div class='circle-hint' style='top:" + (curY - 30) + "px; left:" + (curX - 30) +"px;'>" + "</div>");
				clearInterval(touchInterval)
			}
		},1)
		startX = e.originalEvent.changedTouches[0].pageX;
		startY = e.originalEvent.changedTouches[0].pageY;
		touchActive = true;
	});
	$(document).on("touchmove", function(e) {
		curX = e.originalEvent.changedTouches[0].pageX,
		curY = e.originalEvent.changedTouches[0].pageY;
		if (Math.abs(curX - startX) < 50 && Math.abs(curY - startY) < 50) {
		} else {

			touchTimer = 0;
			startX = curX;
			startY = curY;
		}
	});
	$(document).on("touchend", function(e) {
		clearInterval(touchInterval);
		touchTimer = 0;
		touchActive = false;

		setTimeout(function() {
			$(".circle-hint").remove();
		}, 500);
	});
	$(document).on("touchcancel", function(e) {
		clearInterval(touchInterval);
		touchTimer = 0;
		touchActive = false;

		setTimeout(function() {
			$(".circle-hint").remove();
		}, 500);
	});

	var playCount = 0;
	$("#play").on("touchstart", function(e) {
		var soundBytes = []
		$("#page-message").html("LOADING");
		$("#page-message").addClass("visible")
		var phraseCopy = [];
		setTimeout(function () {
			cacheInterval = setInterval(function() {
				playCount += 1;
				var phrase = phraseArray.shift();
				phraseCopy.push(phrase);
				console.log((100/12) * frequencies.indexOf(recorded[playCount]))
				soundBytes.push(meSpeak.speak(phrase, {pitch: (100/frequencies.length) * frequencies.indexOf(recorded[playCount]), rawdata: true}));
				if (playCount > recorded.length - 1){
					playCount = 0;
				};
				if (phraseArray.length < 1) {
					clearInterval(cacheInterval);
					phraseArray = phraseCopy;
					$("#page-message").html("PLAYING")
					setTimeout(function() {
						$("#page-message").removeClass("visible");
					}, 1000);
					$("#white-text").html(phraseCopy.join(" "));
					$("#white-text").addClass("visible");
					playInterval = setInterval(function() {
						if (soundBytes.length < 1) {
							clearInterval(playInterval);
							$("#white-text").removeClass("visible");
							$("#red-text").html(" ");
						} else {
							$("#red-text").html($("#red-text").html() + " " + phraseCopy.shift());
							meSpeak.play(soundBytes.shift());
						}
					}, 500)
				};
			}, 1);
		}, 500);
		

	});

	var getScale = function(y) {
		var closest = 5000;
		var closest_scale = 0;
		for (var i=0; i < scales.length; i++) {
			if ( y > 250 * i) {
				closest_scale = i
			}
		}
		return scales[closest_scale];
	}
	var getFreq = function(x, currentScale) {
		console.log(width, x)
		var closest_f = 440;
		for (var i=0; i < currentScale.length; i++) {
			if ( x > width / currentScale.length * i) {
				closest_f = currentScale[i]
			}
		}
		newFrequency = closest_f;
		return closest_f;
	};
	setInterval(function() {
		if (!touchActive) {
	        if (gain.gain.value > 0) {
	            gain.gain.value = gain.gain.value - 0.05;
	            $(".inner-gradient.visible").css("opacity", gain.gain.value * 20);
	        } else {
	        	$(".inner-gradient").removeAttr("style");
	        	$(".inner-gradient").removeClass("visible");
	        	for (var i = 0; i < canvasObjs.length; i++) {
	        		canvasObjs[i].enableGain = 0;
	        	}
	        }
	    }
	}, 20);
	$("#text-button").on("touchstart", function() {
		$("#text-container").toggleClass("animate-up");
	})
	$("#text-box").on("change", function() {
		phrase = $(this).val();
		phraseArray = phrase.split(" ");
	});


	window.requestAnimFrame = (function(callback) {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(callback) {
		  window.setTimeout(callback, 1000 / 60);
		};
	})();

	
	var canvasWidth = 1536;

	var x = 0;
	var y = 75;

	var time = 0;

	var speed = 8;
	var frequency = 1;
	var previousFreq = 0;
	var amplitude = 40;
	var currentFreq = previousFreq;
	var fadeIn = 30;
	var scaleFactor = 1/5;

	var canvasObj = function(name, ctx) {
		this.name = name;
		this.newFrequency = 1;
		this.ctx = ctx;
		this.enableGain = 0;

		this.animate = function() {
		    ctx.clearRect(0, 0, canvas1.width, canvas1.height);
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.lineJoin = 1;
			x = 0;
			ctx.strokeStyle = '#EEE';
			time += 1;
			if (time < fadeIn) {
				ctx.moveTo(x, y + amplitude * window.gain.gain.value * this.enableGain * Math.cos((x + time * speed) * Math.pow((previousFreq+(((-.5) * Math.cos(time / fadeIn * 3.14159) + .5) * (frequency - previousFreq))), scaleFactor) / 100));
				for (x = 0; x < canvasWidth; x += 3) {
					ctx.lineTo(x, y + amplitude * window.gain.gain.value * this.enableGain * Math.cos((x + time * speed) * Math.pow((previousFreq + (((-.5) * Math.cos(time / fadeIn * 3.14159) + .5) * (frequency - previousFreq))),scaleFactor) / 100));
				}
			} else {
				ctx.moveTo(x, y + amplitude * window.gain.gain.value * this.enableGain * Math.cos((x + time * speed) * Math.pow(frequency, scaleFactor) / 100));
				previousFreq=frequency;
				for (x = 0; x < canvasWidth; x += 3) {
					ctx.lineTo(x, y + amplitude * window.gain.gain.value * this.enableGain * Math.cos((x + time * speed) * Math.pow(frequency, scaleFactor) / 100));
				}
			}
			ctx.stroke();
			if ((newFrequency != frequency) && (Math.cos(time * speed * Math.pow(frequency, scaleFactor) / 100) > 0.995)) {
				console.log("different!")
				time = 0;
				frequency = newFrequency;
			}
			var that = this;
		    requestAnimFrame(function() {
		      that.animate();
		    });
		}
	}

	var canvas1 = document.getElementById('majorCanvas');
	var canvasObj1 = new canvasObj('majorCanvas', canvas1.getContext('2d'));
	
	var canvas2 = document.getElementById('minorCanvas');
	var canvasObj2 = new canvasObj('minorCanvas', canvas2.getContext('2d'));
	
	var canvas3 = document.getElementById('pentatonicCanvas');
	var canvasObj3 = new canvasObj('pentatonicCanvas', canvas3.getContext('2d'));
	
	var canvas4 = document.getElementById('bluesCanvas');
	var canvasObj4 = new canvasObj('bluesCanvas', canvas4.getContext('2d'));

	
	canvasObj1.animate();
	canvasObj2.animate();
	canvasObj3.animate();
	canvasObj4.animate();

	var canvasObjs = [canvasObj1,canvasObj2,canvasObj3,canvasObj4];
});




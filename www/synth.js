
$(document).ready(function() {
	context = new AudioContext;
	var height = $(window).height();
	var width = $(window).width();
	
	$(document).on("touchmove", function(e) {
		$("#positions").html(e.changedTouches[0].pageX + " " + e.changedTouches[0].pageX);
		/*if window.oscillator
			window.oscillator.stop();

		window.oscillator = context.createOscillator();
		window.oscillator.frequency.value = 200;

		window.oscillator.connect(context.destination);

		window.oscillator.start(0);*/
	})
	
})

var c = document.getElementById("pictureContainer");
var ctx = c.getContext("2d");

var dt;
var lastUpdateFrame = performance.now();

var width = 740;
var height = 560;

async function main() {

	window.gameloop = function() {
		var now = performance.now();
		dt = now - lastUpdateFrame;
        dt_c = 1000 / dt;
        dt_t = dt / 1000;

		ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
	};
	window.requestAnimationFrame(window.gameloop);
}

main();
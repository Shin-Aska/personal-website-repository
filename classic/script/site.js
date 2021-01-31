var circleContainer = [];
var circleInitialize = false;
var lastTime = 0;
var lagCounter = 0;
var animationBackground;

var show_fps     = false;
var oldtime = +new Date;
var fps = 0;
var stats = new Stats();
var showStats = false;

function webglAvailable() {
	try {
		var canvas = document.createElement( 'canvas' );
		return !!( window.WebGLRenderingContext && (
			canvas.getContext( 'webgl' ) ||
			canvas.getContext( 'experimental-webgl' ) )
		);
	} catch ( e ) {
		return false;
	}
}

$( document ).ready(function() {
	
	for (var i = 0; i < menus.length; i++) {
		document.getElementById("menu").innerHTML += "<div class=\"menuButton\" onclick=\"javascript:window.location.href='" + menus[i].url +"'\">" + menus[i].name + "</div>"; 
	}
    //document.getElementById("header").innerHTML = sky.header;
});

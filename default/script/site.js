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
	

	if (showStats) {
		stats.setMode(0);
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';

		document.body.appendChild( stats.domElement );
	}

	try {
		sky.init();
	}
	catch (ex) {
		window.location = window.location.href.replace(window.location.hostname, "classic.richardorilla.website");
	}
	
	window.siteMenuURLs = {}
	for (var i = 0; i < menus.length; i++) {
		//document.getElementById("menu").innerHTML += "<div class=\"menuButton\" onclick=\"javascript:window.location.href='" + menus[i].url +"'\">" + menus[i].name + "</div>";
		document.getElementById("menu").innerHTML += "<div id=\"siteMenu_entry_" + (i+1) + "\" class=\"menuButton\">" + menus[i].name + "</div>"; 
		window.siteMenuURLs["siteMenu_entry_" + (i+1)] = menus[i].url;
	}
    document.getElementById("header").innerHTML = sky.header;
	document.getElementById("mainLabel").style.display = "none";
	document.getElementById("backgroundLabel").style.display = "none";

	for (var i = 0; i < menus.length; i++) {
		document.getElementById("siteMenu_entry_" + (i+1)).onclick = function(elem) {
			window.location.href = window.siteMenuURLs[elem.target.id];
		}
	}
});

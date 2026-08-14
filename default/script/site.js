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
	
	var menu = document.getElementById("menu");
	for (var i = 0; i < menus.length; i++) {
		var menuLink = document.createElement("a");
		menuLink.id = "siteMenu_entry_" + (i + 1);
		menuLink.className = "menuButton";
		menuLink.href = menus[i].url;
		menuLink.textContent = menus[i].name;
		if (window.location.pathname.split("/").pop() === menus[i].url ||
			(window.location.pathname.endsWith("/") && menus[i].url === "about.html") ||
			(window.location.pathname.endsWith("index.html") && menus[i].url === "about.html")) {
			menuLink.classList.add("is-active");
			menuLink.setAttribute("aria-current", "page");
		}
		menu.appendChild(menuLink);
	}
	menu.setAttribute("aria-label", "Primary navigation");
	menu.setAttribute("role", "navigation");

	// Article pages do not have their own top-level menu entry, so keep readers
	// oriented by treating them as part of the Blogs section.
	if (!menu.querySelector(".is-active") &&
		(document.getElementById("headingBlog") || document.getElementById("tableContents"))) {
		var blogLink = document.querySelector('#menu a[href="blog.html"]');
		if (blogLink) {
			blogLink.classList.add("is-active");
			blogLink.setAttribute("aria-current", "page");
		}
	}
	document.getElementById("header").innerHTML = sky.header;
	document.getElementById("mainLabel").style.display = "none";
	document.getElementById("backgroundLabel").style.display = "none";

	var codeBlocks = document.querySelectorAll('pre > code');
	for (var i = 0; i < codeBlocks.length; i++) {
		var pre = codeBlocks[i].parentNode;
		pre.style.position = 'relative';

		var btn = document.createElement('button');
		btn.className = 'copy-btn';
		btn.textContent = 'Copy';
		btn.type = 'button';

		btn.addEventListener('click', function(block, button) {
			return function() {
				navigator.clipboard.writeText(block.textContent).then(function() {
					button.textContent = 'Copied!';
					button.classList.add('copied');
					setTimeout(function() {
						button.textContent = 'Copy';
						button.classList.remove('copied');
					}, 2000);
				});
			};
		}(codeBlocks[i], btn));

		pre.appendChild(btn);
	}
});

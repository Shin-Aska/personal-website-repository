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
var backgroundThemeStorageKey = "backgroundTheme";

function getStoredBackgroundTheme() {
	try {
		var storedTheme = window.localStorage.getItem(backgroundThemeStorageKey);
		return storedTheme === "sea" || storedTheme === "sky" ? storedTheme : null;
	} catch (error) {
		return null;
	}
}

function storeBackgroundTheme(themeName) {
	try {
		window.localStorage.setItem(backgroundThemeStorageKey, themeName);
	} catch (error) {
		// Theme switching remains available when browser storage is unavailable.
	}
}

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
	var storedBackgroundTheme = getStoredBackgroundTheme();
	if (storedBackgroundTheme === "sky" && window.legacySky) {
		window.sky = window.legacySky;
	} else if (storedBackgroundTheme === "sea" && window.sea) {
		window.sky = window.sea;
	}

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
	var header = document.getElementById("header");
	header.innerHTML = sky.header;
	document.documentElement.dataset.backgroundTheme = window.sky === window.sea ? "sea" : "sky";

	var themeContainer = header.querySelector(".themeContainer");
	var themeContainerClickCount = 0;
	var backgroundThemeSwitching = false;
	var reducedMotionQuery = window.matchMedia
		? window.matchMedia("(prefers-reduced-motion: reduce)")
		: null;

	function waitForBackgroundFade(canvas) {
		if (!canvas || (reducedMotionQuery && reducedMotionQuery.matches)) {
			return Promise.resolve();
		}
		return new Promise(function(resolve) {
			var resolved = false;
			var timeout;
			var finish = function() {
				if (resolved) return;
				resolved = true;
				clearTimeout(timeout);
				canvas.removeEventListener("transitionend", handleTransitionEnd);
				resolve();
			};
			var handleTransitionEnd = function(event) {
				if (event.propertyName === "opacity") finish();
			};
			canvas.addEventListener("transitionend", handleTransitionEnd);
			timeout = setTimeout(finish, 650);
		});
	}

	function waitForPaint() {
		return new Promise(function(resolve) {
			requestAnimationFrame(function() {
				requestAnimationFrame(resolve);
			});
		});
	}

	themeContainer.addEventListener("click", async function() {
		if (backgroundThemeSwitching) return;
		themeContainerClickCount++;
		if (themeContainerClickCount < 5) return;
		themeContainerClickCount = 0;

		var currentTheme = window.sky;
		var nextTheme = currentTheme === window.sea ? window.legacySky : window.sea;
		if (!nextTheme || nextTheme === currentTheme) return;

		backgroundThemeSwitching = true;
		var root = document.documentElement;
		var currentCanvas = document.getElementById("threejsmain");
		root.classList.add("background-theme-is-switching");
		try {
			await waitForBackgroundFade(currentCanvas);
			if (typeof currentTheme.destroy === "function") currentTheme.destroy();
			window.sky = nextTheme;
			await Promise.resolve(nextTheme.init());
			var nextThemeName = nextTheme === window.sea ? "sea" : "sky";
			document.documentElement.dataset.backgroundTheme = nextThemeName;
			storeBackgroundTheme(nextThemeName);
			await waitForPaint();
			root.classList.remove("background-theme-is-switching");
			await waitForBackgroundFade(document.getElementById("threejsmain"));
		} catch (error) {
			console.error("Unable to switch background themes:", error);
			if (typeof nextTheme.destroy === "function") nextTheme.destroy();
			window.sky = currentTheme;
			await Promise.resolve(currentTheme.init());
			document.documentElement.dataset.backgroundTheme = currentTheme === window.sea ? "sea" : "sky";
			await waitForPaint();
			root.classList.remove("background-theme-is-switching");
			await waitForBackgroundFade(document.getElementById("threejsmain"));
		} finally {
			root.classList.remove("background-theme-is-switching");
			backgroundThemeSwitching = false;
		}
	});
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

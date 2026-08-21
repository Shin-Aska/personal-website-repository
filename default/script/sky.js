(function() {
var sky =  {
	
	canvas: null,
	ctx: null,
	camera: null,
	scene: null,
	renderer: null,
	meshMaterial: null,
	mesh: null,
	geometry: null,
	mouseX: null,
	mouseY: null,
	startTime: null,
	position: null,
	windowHalfX: null,
	windowHalfY: null,
	drawInterval: null,
	_colorSchemeQuery: null,
	_colorSchemeListener: null,
	_reducedMotionQuery: null,
	_reducedMotionListener: null,
	header: '<div class="center themeContainer"><img class="themepicture" src="images/pen.png" alt="Logo"></div><p class="headingBase start">= Skies of the lost cause +</p><p class="headingBase middle">Personal website of Richard Orilla</p><br><div class="center lineContainer"><img class="linePNG" src="images/hr.png" alt="Decorative divider"></div>',
	vertexShaderContext:  '   varying vec2 vUv;  \n               void main() {  \n                   vUv = uv;  \n                   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );  \n              }  ',
	fragmentShaderContext:  '   uniform sampler2D map;  \n               uniform vec3 fogColor;  \n               uniform float fogNear;  \n               uniform float fogFar;  \n               varying vec2 vUv;  \n               void main() {  \n                   float depth = gl_FragCoord.z / gl_FragCoord.w;  \n                   float fogFactor = smoothstep( fogNear, fogFar, depth );  \n                   gl_FragColor = texture2D( map, vUv );  \n                   gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );  \n                   gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );  \n              }  ',

	stats: {
		oldTime: null,
		fps: 0,
	},

	fail: {
		img: undefined
	},

	loadTexture: function(onLoad) {
		// Dispose of the old texture if it exists

		var texturePath = "images/clouds.png";
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			texturePath = "images/clouds-inverted.png";
		}

		var texture = THREE.ImageUtils.loadTexture(texturePath, undefined, onLoad);
		texture.magFilter = THREE.LinearMipMapLinearFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		
		return texture;
	},

	setupColorSchemeListener: function() {
		if (sky._colorSchemeQuery) {
			return;
		}
		const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleColorSchemeChange = (e) => {
			if (!sky.meshMaterial) {
				return;
			}
			const newTexture = sky.loadTexture(sky.drawReducedMotionScene);
			sky.meshMaterial.uniforms.map.texture = newTexture;
			sky.meshMaterial.needsUpdate = true;
		};
		sky._colorSchemeQuery = colorSchemeQuery;
		sky._colorSchemeListener = handleColorSchemeChange;

		// Add listener for color scheme changes
		if (colorSchemeQuery.addEventListener) {
			colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
		} else {
			// For older browsers
			colorSchemeQuery.addListener(handleColorSchemeChange);
		}
	},

	prefersReducedMotion: function() {
		return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	},

	drawReducedMotionScene: function() {
		if (sky.prefersReducedMotion() && sky.renderer) {
			sky.drawScene();
		}
	},

	applyMotionPreference: function() {
		if (sky.prefersReducedMotion()) {
			if (sky.drawInterval) {
				clearInterval(sky.drawInterval);
				sky.drawInterval = null;
			}
			return;
		}

		if (!sky.drawInterval) {
			sky.drawInterval = setInterval(sky.drawScene, 30);
		}
	},

	setupReducedMotionListener: function() {
		if (sky._reducedMotionQuery) {
			return;
		}
		const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const handleReducedMotionChange = () => sky.applyMotionPreference();
		sky._reducedMotionQuery = reducedMotionQuery;
		sky._reducedMotionListener = handleReducedMotionChange;

		if (reducedMotionQuery.addEventListener) {
			reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
		} else if (reducedMotionQuery.addListener) {
			reducedMotionQuery.addListener(handleReducedMotionChange);
		}
	},

	init: function() {
		if (sky.renderer) {
			sky.applyMotionPreference();
			return sky;
		}
		var background = document.getElementById("background");
		var bgContext = background.getContext("2d");
		bgContext.rect(0, 0, background.width, background.height);

		sky.startTime = new Date().getTime();
		sky.canvas = document.getElementById("main");
		sky.ctx	   = sky.canvas.getContext("2d");
		sky.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
		sky.camera.position.z = 4000;

		sky.scene = new THREE.Scene();
		sky.geometry = new THREE.Geometry();

		var fog = new THREE.Fog(0x251d32, -100, 5000);
		var texture = sky.loadTexture(sky.drawReducedMotionScene);

		sky.meshMaterial = new THREE.ShaderMaterial({
			uniforms: {
				'map': {type: 't', value: 2, texture: texture},
				'fogColor': {type: 'c', value: fog.color},
				'fogNear': {type: 'f', value: fog.near},
				'fogFar': {type: 'f', value: fog.far},
			},
			vertexShader: sky.vertexShaderContext,
			fragmentShader: sky.fragmentShaderContext,
			depthTest: false,
		});

		// Set up color scheme change listener
		sky.setupColorSchemeListener();

		var planeMesh = new THREE.Mesh(new THREE.PlaneGeometry(64, 64));
		for (var i = 0; i < 10000; i++) {
			planeMesh.position.x = Math.random() * 1000 - 500;
			planeMesh.position.y = - Math.random() * Math.random() * 200 - 15;
			planeMesh.position.z = i * 2;
			planeMesh.rotation.z = Math.random() * Math.PI;
			planeMesh.scale.x = planeMesh.scale.y = Math.random() * Math.random() * 1.5 + 0.5;
			THREE.GeometryUtils.merge(sky.geometry, planeMesh);
		}

		sky.mesh = new THREE.Mesh(sky.geometry, sky.meshMaterial);
		sky.scene.add(sky.mesh);

		sky.mesh = new THREE.Mesh(sky.geometry, sky.meshMaterial);
		sky.mesh.position.z = -10000;
		sky.scene.add(sky.mesh);

		if (webglAvailable()) {
			sky.renderer = new THREE.WebGLRenderer({antialias: false});
		}
		else {
			throw "Not supported";
		}
		
		window.addEventListener("resize", sky.onResize, false);
		var finalRenderer = sky.renderer.domElement;
		finalRenderer.id = "threejsmain";
		finalRenderer.dataset.backgroundTheme = "sky";
		finalRenderer.innerHTML = "Your browser doesn't support canvas"
		document.body.appendChild(finalRenderer);
		sky.setupReducedMotionListener();
		sky.applyMotionPreference();
	},

	onResize: function() {

		sky.camera.aspect = window.innerWidth / window.innerHeight;
		sky.camera.updateProjectionMatrix();
	},

	drawScene: function() {

		var newTime = new Date();
		sky.stats.fps = 1000 / (newTime - sky.stats.oldTime);

		if (showStats) {
			stats.begin();
		}
		sky.position = ((new Date().getTime() - sky.startTime) * 0.1) % 10000;
		sky.camera.position.z = - sky.position + 10000;
		sky.renderer.render(sky.scene, sky.camera);

		if (showStats) {
			stats.end();
		}

		sky.stats.oldTime = newTime;
	},

	failDraw: function() {

		try {
			var background = document.getElementById("background");
			var bgContext = background.getContext("2d");
			var canvas = bgContext.canvas;
			bgContext.clearRect(0, 0, canvas.width, canvas.height);
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			var bg = new Image();
			bg.src = "images/Tempholder.png";
			bg.onload = function() {
				bgContext.drawImage(bg, 0, 0, canvas.width, canvas.height);
			};
		}
		catch (ex) {
			window.sky.redirectToClassic();
		}
		
	},

	redirectToClassic: function() {
		window.location.href = window.location.href.replace("default", "classic").replace("www.", "classic.");
	},

	destroy: function() {
		if (sky.drawInterval) {
			clearInterval(sky.drawInterval);
			sky.drawInterval = null;
		}
		window.removeEventListener("resize", sky.onResize, false);

		if (sky._colorSchemeQuery && sky._colorSchemeListener) {
			if (sky._colorSchemeQuery.removeEventListener) {
				sky._colorSchemeQuery.removeEventListener('change', sky._colorSchemeListener);
			} else if (sky._colorSchemeQuery.removeListener) {
				sky._colorSchemeQuery.removeListener(sky._colorSchemeListener);
			}
		}
		if (sky._reducedMotionQuery && sky._reducedMotionListener) {
			if (sky._reducedMotionQuery.removeEventListener) {
				sky._reducedMotionQuery.removeEventListener('change', sky._reducedMotionListener);
			} else if (sky._reducedMotionQuery.removeListener) {
				sky._reducedMotionQuery.removeListener(sky._reducedMotionListener);
			}
		}

		if (sky.geometry && sky.geometry.dispose) sky.geometry.dispose();
		if (sky.meshMaterial && sky.meshMaterial.dispose) sky.meshMaterial.dispose();
		if (sky.renderer) {
			var rendererCanvas = sky.renderer.domElement;
			var rendererContext = sky.renderer.getContext
				? sky.renderer.getContext()
				: sky.renderer.context;
			if (rendererCanvas && rendererCanvas.parentNode) {
				rendererCanvas.parentNode.removeChild(rendererCanvas);
			}
			if (sky.renderer.dispose) sky.renderer.dispose();
			if (rendererContext) {
				var loseContext = rendererContext.getExtension('WEBGL_lose_context');
				if (loseContext) loseContext.loseContext();
			}
		}

		sky.canvas = null;
		sky.ctx = null;
		sky.camera = null;
		sky.scene = null;
		sky.renderer = null;
		sky.meshMaterial = null;
		sky.mesh = null;
		sky.geometry = null;
		sky._colorSchemeQuery = null;
		sky._colorSchemeListener = null;
		sky._reducedMotionQuery = null;
		sky._reducedMotionListener = null;
	}
}

// Keep the legacy renderer available without claiming the active-theme alias.
// When this file is used by itself it still behaves like the original sky.js.
window.legacySky = sky;
if (!window.sky) window.sky = sky;
})();

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
	header: '<center><h1 class="center headingBase start">~Skies of the lost cause~<h1/><h2 class="center headingBase middle">Personal website of Richard Orilla</h2></center>',
	vertexShaderContext:  '   varying vec2 vUv;  \n               void main() {  \n                   vUv = uv;  \n                   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );  \n              }  ',
	fragmentShaderContext:  '   uniform sampler2D map;  \n               uniform vec3 fogColor;  \n               uniform float fogNear;  \n               uniform float fogFar;  \n               varying vec2 vUv;  \n               void main() {  \n                   float depth = gl_FragCoord.z / gl_FragCoord.w;  \n                   float fogFactor = smoothstep( fogNear, fogFar, depth );  \n                   gl_FragColor = texture2D( map, vUv );  \n                   gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );  \n                   gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );  \n              }  ',

	stats: {
		oldTime: null,
		fps: 0,
	},

	fail: {
		img: undefined
	},

	init: function() {

		
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

		var texture = THREE.ImageUtils.loadTexture("images/clouds.png");
		texture.magFilter = THREE.LinearMipMapLinearFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;

		var fog = new THREE.Fog(0x251d32, -100, 5000);

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
		finalRenderer.innerHTML = "Your browser doesn't support canvas"
		document.body.appendChild(finalRenderer);
		setInterval(sky.drawScene, 30);
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

		}
		
	}
}
		
		

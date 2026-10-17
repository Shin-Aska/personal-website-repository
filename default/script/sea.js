/*
 * Sea theme
 * Dependency-free WebGL 2 FFT ocean with the existing site theme lifecycle.
 * It intentionally mirrors sky.js's public lifecycle so site.js can use either
 * theme through the global "sky" alias.
 */

const seaMath = {
    vec3: {
        create: () => new Float32Array(3),
        fromValues: (x, y, z) => new Float32Array([x, y, z]),
        add: (out, a, b) => {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            return out;
        },
        normalize: (out, a) => {
            const length = Math.hypot(a[0], a[1], a[2]);
            if (length > 0) {
                const inverseLength = 1 / length;
                out[0] = a[0] * inverseLength;
                out[1] = a[1] * inverseLength;
                out[2] = a[2] * inverseLength;
            }
            return out;
        }
    },
    mat4: {
        create: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        copy: (out, a) => {
            out.set(a);
            return out;
        },
        perspective: (out, fovy, aspect, near, far) => {
            const f = 1 / Math.tan(fovy / 2);
            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[15] = 0;
            if (far !== null && far !== Infinity) {
                const nf = 1 / (near - far);
                out[10] = (far + near) * nf;
                out[14] = 2 * far * near * nf;
            } else {
                out[10] = -1;
                out[14] = -2 * near;
            }
            return out;
        },
        lookAt: (out, eye, center, up) => {
            let z0 = eye[0] - center[0];
            let z1 = eye[1] - center[1];
            let z2 = eye[2] - center[2];
            let length = Math.hypot(z0, z1, z2) || 1;
            z0 /= length;
            z1 /= length;
            z2 /= length;

            let x0 = up[1] * z2 - up[2] * z1;
            let x1 = up[2] * z0 - up[0] * z2;
            let x2 = up[0] * z1 - up[1] * z0;
            length = Math.hypot(x0, x1, x2) || 1;
            x0 /= length;
            x1 /= length;
            x2 /= length;

            const y0 = z1 * x2 - z2 * x1;
            const y1 = z2 * x0 - z0 * x2;
            const y2 = z0 * x1 - z1 * x0;

            out[0] = x0;
            out[1] = y0;
            out[2] = z0;
            out[3] = 0;
            out[4] = x1;
            out[5] = y1;
            out[6] = z1;
            out[7] = 0;
            out[8] = x2;
            out[9] = y2;
            out[10] = z2;
            out[11] = 0;
            out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
            out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
            out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
            out[15] = 1;
            return out;
        },
        multiply: (out, a, b) => {
            const result = new Float32Array(16);
            for (let column = 0; column < 4; column++) {
                const b0 = b[column * 4];
                const b1 = b[column * 4 + 1];
                const b2 = b[column * 4 + 2];
                const b3 = b[column * 4 + 3];
                result[column * 4] = b0 * a[0] + b1 * a[4] + b2 * a[8] + b3 * a[12];
                result[column * 4 + 1] = b0 * a[1] + b1 * a[5] + b2 * a[9] + b3 * a[13];
                result[column * 4 + 2] = b0 * a[2] + b1 * a[6] + b2 * a[10] + b3 * a[14];
                result[column * 4 + 3] = b0 * a[3] + b1 * a[7] + b2 * a[11] + b3 * a[15];
            }
            out.set(result);
            return out;
        }
    }
};

function resolveElement(value) {
    if (!value) return null;
    return typeof value === 'string' ? document.querySelector(value) : value;
}

const sea = {
    canvas: null,
    ctx: null,
    camera: null,
    scene: null,
    renderer: null,
    meshMaterial: null,
    mesh: null,
    geometry: null,
    startTime: null,
    drawInterval: null,
    header: '<div class="center themeContainer"><img class="themepicture" src="images/pen.png" alt="Logo"></div><p class="headingBase start">= Skies of the lost cause +</p><p class="headingBase middle">Personal website of Richard Orilla</p><br><div class="center lineContainer"><img class="linePNG" src="images/hr.png" alt="Decorative divider"></div>',
    stats: {
        oldTime: null,
        fps: 0
    },
    _initialization: null,
    _runtime: null,
    _motionQuery: null,
    _motionListener: null,
    _generation: 0,
    backgroundOverlayEnabled: true,

    init(options = {}) {
        const query = new URLSearchParams(window.location.search);
        const overlayQuery = query.get('overlay') || query.get('glass');
        const overlayOption = options.backgroundOverlay !== undefined
            ? options.backgroundOverlay
            : options.glassOverlay;
        const useBackgroundOverlay = overlayOption !== undefined
            ? Boolean(overlayOption)
            : overlayQuery === 'on' ? true : overlayQuery === 'off' ? false : this.backgroundOverlayEnabled;
        this.setBackgroundOverlay(useBackgroundOverlay);
        if (this._initialization) return this._initialization;

        const generation = ++this._generation;
        this.startTime = performance.now();
        this._initialization = createSeaRenderer({...options, animate: false})
            .then((runtime) => {
                if (generation !== this._generation) {
                    runtime.destroy();
                    return null;
                }
                this._runtime = runtime;
                this.canvas = runtime.canvas;
                this.ctx = runtime.gl;
                this.renderer = runtime;
                this.stats = runtime.stats;
                this.setupReducedMotionListener();
                this.applyMotionPreference();
                return runtime;
            })
            .catch((error) => {
                if (generation !== this._generation) return null;
                this._initialization = null;
                this.setBackgroundOverlay(false);
                console.error('Unable to initialize the sea theme:', error);
                this.failDraw();
                throw error;
            });

        return this._initialization;
    },

    setBackgroundOverlay(enabled) {
        this.backgroundOverlayEnabled = Boolean(enabled);
        const root = document.documentElement;
        root.classList.toggle('sea-theme', this.backgroundOverlayEnabled);
        if (!this.backgroundOverlayEnabled) {
            root.classList.remove('sea-overlay-reveal');
        }
    },

    revealBackgroundOverlay() {
        const root = document.documentElement;
        root.classList.remove('sea-overlay-reveal');
        // Flush the class removal so repeated calls restart the animation.
        void root.offsetWidth;
        root.classList.add('sea-overlay-reveal');
    },

    prefersReducedMotion() {
        return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    },

    drawScene() {
        if (this._runtime) this._runtime.renderOnce();
    },

    drawReducedMotionScene() {
        if (this.prefersReducedMotion()) this.drawScene();
    },

    applyMotionPreference() {
        if (!this._runtime) return;
        if (this.prefersReducedMotion()) {
            this._runtime.pause();
            this._runtime.renderOnce();
        } else {
            this._runtime.resume();
        }
    },

    setupReducedMotionListener() {
        if (!window.matchMedia || this._motionQuery) return;
        this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this._motionListener = () => this.applyMotionPreference();
        if (this._motionQuery.addEventListener) {
            this._motionQuery.addEventListener('change', this._motionListener);
        } else if (this._motionQuery.addListener) {
            this._motionQuery.addListener(this._motionListener);
        }
    },

    failDraw() {
        const background = document.getElementById('background');
        if (!background) return;
        const context = background.getContext('2d');
        if (!context) return;
        const fallback = new Image();
        fallback.src = 'images/Tempholder.png';
        fallback.onload = () => {
            background.width = window.innerWidth;
            background.height = window.innerHeight;
            context.drawImage(fallback, 0, 0, background.width, background.height);
        };
    },

    redirectToClassic() {
        window.location.href = window.location.href
            .replace('default', 'classic')
            .replace('www.', 'classic.');
    },

    destroy() {
        this._generation++;
        if (this._runtime) this._runtime.destroy();
        document.documentElement.classList.remove('sea-theme', 'sea-overlay-reveal');
        if (this._motionQuery && this._motionListener) {
            if (this._motionQuery.removeEventListener) {
                this._motionQuery.removeEventListener('change', this._motionListener);
            } else if (this._motionQuery.removeListener) {
                this._motionQuery.removeListener(this._motionListener);
            }
        }
        this._runtime = null;
        this.canvas = null;
        this.ctx = null;
        this.renderer = null;
        this.stats.fps = 0;
        this._initialization = null;
        this._motionQuery = null;
        this._motionListener = null;
    }
};

/* GPU spectral ocean used by the sea theme and its comparison page.
 * Model: wind-driven Phillips spectrum, deep-water dispersion, choppy displacement.
 * The inverse FFT uses radix-2 butterflies with bit-reversed reads on the first
 * stage of each axis. All transforms and surface derivatives run in WebGL 2.
 */
window.SeaFFT = (() => {
    'use strict';
    const TAU = Math.PI * 2;
    const parameters = {
        height: {label:'Wave height',min:0,max:3,step:0.05,value:1.6,unit:'×'},
        windSpeed: {label:'Wind speed',min:2,max:15,step:0.5,value:6,unit:' m/s'},
        windDirection: {label:'Wind direction',min:0,max:360,step:1,value:194,unit:'°'},
        choppiness: {label:'Choppiness',min:0,max:2,step:0.05,value:2,unit:''},
        patchSize: {label:'Wave patch size',min:32,max:256,step:8,value:64,unit:' m'},
        damping: {label:'Small-wave damping',min:0.03,max:1,step:0.01,value:0.11,unit:' m'},
        speed: {label:'Animation speed',min:0,max:2,step:0.05,value:1.35,unit:'×'},
        foam: {label:'Foam amount',min:0,max:2,step:0.05,value:0.4,unit:'×'},
        roughness: {label:'Surface roughness',min:0.05,max:0.5,step:0.01,value:0.36,unit:''}
    };
    const themeRoughness = {dark:0.36, light:0.14};
    function defaultParameters(theme = 'dark') {
        return {...Object.fromEntries(Object.entries(parameters).map(([name,definition]) => [name,definition.value])),
            roughness:themeRoughness[theme] ?? themeRoughness.dark};
    }
    function normalizeParameters(values = {}, theme = 'dark') {
        const defaults = defaultParameters(theme);
        return Object.fromEntries(Object.entries(parameters).map(([name,definition]) => {
            const raw = values[name];
            const value = raw === undefined || raw === null || raw === '' ? NaN : Number(raw);
            const clamped = Number.isFinite(value) ? Math.min(definition.max,Math.max(definition.min,value)) : defaults[name];
            const stepped = definition.min + Math.round((clamped-definition.min)/definition.step)*definition.step;
            return [name,Number(stepped.toFixed(4))];
        }));
    }
    const fullscreenVertex = `#version 300 es
        out vec2 vScreen;
        void main() {
            vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
            vScreen = p * 2.0 - 1.0;
            gl_Position = vec4(vScreen, 1.0, 1.0);
        }`;

    function resources(gl) {
        const cleanup = [];
        function own(value, deleter) { cleanup.push(() => deleter.call(gl, value)); return value; }
        return {
            program(vertex, fragment) {
                const shaders = [];
                const program = own(gl.createProgram(), gl.deleteProgram);
                try {
                    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
                        const shader = gl.createShader(type);
                        shaders.push(shader);
                        gl.shaderSource(shader, source);
                        gl.compileShader(shader);
                        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                            throw new Error(gl.getShaderInfoLog(shader));
                        }
                        gl.attachShader(program, shader);
                    }
                    gl.linkProgram(program);
                    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                        throw new Error(gl.getProgramInfoLog(program));
                    }
                    return program;
                } finally { shaders.forEach(shader => gl.deleteShader(shader)); }
            },
            texture(size, data = null, linear = false, height = size) {
                const texture = own(gl.createTexture(), gl.deleteTexture);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size, height, 0, gl.RGBA, gl.FLOAT, data);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                return texture;
            },
            target(size, linear = false) {
                const texture = this.texture(size, null, linear);
                const framebuffer = own(gl.createFramebuffer(), gl.deleteFramebuffer);
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                    throw new Error('Floating-point ocean render target is unavailable.');
                }
                return { texture, framebuffer };
            },
            buffer: () => own(gl.createBuffer(), gl.deleteBuffer),
            vao: () => own(gl.createVertexArray(), gl.deleteVertexArray),
            destroy() { cleanup.reverse().forEach(dispose => dispose()); cleanup.length = 0; }
        };
    }

    function locations(gl, program, names) {
        return Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, name)]));
    }
    function bindTexture(gl, unit, texture) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    const fftFragment = `#version 300 es
        precision highp float;
        precision highp int;
        uniform highp sampler2D uInput;
        uniform highp sampler2D uTwiddle;
        uniform int uSize, uSpan, uAxis;
        out vec4 result;
        int reverseIndex(int value) {
            int reversed = 0;
            for (int bit = uSize; bit > 1; bit >>= 1) {
                reversed = (reversed << 1) | (value & 1);
                value >>= 1;
            }
            return reversed;
        }
        vec2 multiplyComplex(vec2 a, vec2 b) {
            return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x);
        }
        void main() {
            ivec2 pixel = ivec2(gl_FragCoord.xy);
            int index = uAxis == 0 ? pixel.x : pixel.y;
            int halfSpan = uSpan / 2;
            int offset = index % halfSpan;
            int first = (index / uSpan) * uSpan + offset;
            int second = first + halfSpan;
            if (uSpan == 2) { first = reverseIndex(first); second = reverseIndex(second); }
            ivec2 aPos = uAxis == 0 ? ivec2(first, pixel.y) : ivec2(pixel.x, first);
            ivec2 bPos = uAxis == 0 ? ivec2(second, pixel.y) : ivec2(pixel.x, second);
            vec4 a = texelFetch(uInput, aPos, 0), b = texelFetch(uInput, bPos, 0);
            vec2 twiddle = texelFetch(uTwiddle, ivec2(offset*(uSize/uSpan),0), 0).xy;
            float signValue = index % uSpan < halfSpan ? 1.0 : -1.0;
            result = a + signValue * vec4(multiplyComplex(b.xy, twiddle), multiplyComplex(b.zw, twiddle));
        }`;

    // Unnormalized inverse transform: spectral amplitudes already represent the
    // Fourier-series coefficients, so dividing by N² would shrink the ocean.
    function createInverseFFT(gl, size) {
        if (size < 2 || size > 512 || (size & (size - 1))) throw new Error('FFT size must be a power of two from 2 to 512.');
        const assets = resources(gl);
        try {
            const program = assets.program(fullscreenVertex, fftFragment);
            const uniforms = locations(gl, program, ['uInput', 'uTwiddle', 'uSize', 'uSpan', 'uAxis']);
            const targets = [assets.target(size), assets.target(size)];
            // Reuse accurate, invariant roots of unity. GPU trig approximations
            // can otherwise accumulate visible errors across butterfly stages.
            const roots = new Float32Array(size*4);
            for (let i = 0; i < size; i++) {
                roots[i*4] = Math.cos(TAU*i/size);
                roots[i*4+1] = Math.sin(TAU*i/size);
            }
            const twiddle = assets.texture(size,roots,false,1);
            const vao = assets.vao();
            return {
                transform(input) {
                    gl.disable(gl.DEPTH_TEST);
                    gl.disable(gl.CULL_FACE);
                    gl.disable(gl.BLEND);
                    gl.viewport(0, 0, size, size);
                    gl.bindVertexArray(vao);
                    gl.useProgram(program);
                    gl.uniform1i(uniforms.uInput, 0);
                    bindTexture(gl, 1, twiddle);
                    gl.uniform1i(uniforms.uTwiddle, 1);
                    gl.uniform1i(uniforms.uSize, size);
                    let output;
                    let pass = 0;
                    for (let axis = 0; axis < 2; axis++) {
                        gl.uniform1i(uniforms.uAxis, axis);
                        for (let span = 2; span <= size; span *= 2) {
                            output = targets[pass++ % 2];
                            gl.bindFramebuffer(gl.FRAMEBUFFER, output.framebuffer);
                            bindTexture(gl, 0, input);
                            gl.uniform1i(uniforms.uSpan, span);
                            gl.drawArrays(gl.TRIANGLES, 0, 3);
                            input = output.texture;
                        }
                    }
                    return output;
                },
                destroy: () => assets.destroy()
            };
        } catch (error) { assets.destroy(); throw error; }
    }

    function createSpectrum(size, length = 64, settings = {}) {
        const config = normalizeParameters(settings);
        const angle = config.windDirection * Math.PI / 180;
        const windX = Math.cos(angle), windZ = Math.sin(angle);
        const data = new Float32Array(size * size * 4);
        let energy = 0;
        // Coordinate-seeded Gaussian samples keep a fixed sea across reloads.
        function randomPair(x, z) {
            let state = (Math.imul(x, 374761393) ^ Math.imul(z, 668265263) ^ 19780503) >>> 0;
            function random() {
                state = (state + 0x6D2B79F5) >>> 0;
                let t = Math.imul(state ^ (state >>> 15), 1 | state);
                t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            }
            const radius = Math.sqrt(-2 * Math.log(Math.max(random(), 1e-8)));
            const angle = TAU * random();
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
        }
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {
                const nx = x < size / 2 ? x : x - size;
                const nz = z < size / 2 ? z : z - size;
                // Suppress Nyquist modes: odd displacement multipliers must
                // preserve Hermitian symmetry, including self-conjugate bins.
                if ((!nx && !nz) || x === size / 2 || z === size / 2) continue;
                const kx = TAU * nx / length, kz = TAU * nz / length;
                const k2 = kx*kx + kz*kz;
                const alignment = (kx * windX + kz * windZ) / Math.sqrt(k2);
                const windLength = config.windSpeed * config.windSpeed / 9.81;
                const power = Math.exp(-1 / (k2 * windLength * windLength)) / (k2 * k2)
                    * alignment * alignment * Math.exp(-k2 * config.damping * config.damping)
                    * (alignment < 0 ? 0.15 : 1);
                const amplitude = Math.sqrt(power * 0.5);
                const [real, imaginary] = randomPair(nx, nz);
                const offset = (z * size + x) * 4;
                data[offset] = real * amplitude;
                data[offset + 1] = imaginary * amplitude;
                energy += amplitude * amplitude * (real * real + imaginary * imaginary);
            }
        }
        // Same target RMS (world units) at either resolution, rather than
        // accidentally increasing wave height when adding more spectral bins.
        const scale = 0.24 / Math.sqrt(2 * energy);
        for (let i = 0; i < data.length; i++) data[i] *= scale;
        return data;
    }

    const evolveFragment = `#version 300 es
        precision highp float;
        uniform highp sampler2D uInitial;
        uniform int uSize;
        uniform float uLength, uTime;
        out vec4 result;
        vec2 cmul(vec2 a, vec2 b) { return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x); }
        void main() {
            ivec2 p = ivec2(gl_FragCoord.xy);
            ivec2 mode = ivec2(p.x < uSize/2 ? p.x : p.x-uSize, p.y < uSize/2 ? p.y : p.y-uSize);
            vec2 k = 6.28318530718 * vec2(mode) / uLength;
            float magnitude = length(k);
            if (magnitude < 0.00001) { result = vec4(0.0); return; }
            vec2 initial = texelFetch(uInitial, p, 0).xy;
            vec2 opposite = texelFetch(uInitial, (ivec2(uSize)-p) % uSize, 0).xy;
            float phase = sqrt(9.81 * magnitude) * uTime;
            vec2 rotation = vec2(cos(phase), sin(phase));
            vec2 h = cmul(initial, rotation) + cmul(opposite * vec2(1.0,-1.0), rotation * vec2(1.0,-1.0));
            vec2 dx = vec2(-h.y, h.x) * k.x / magnitude;
            vec2 dz = vec2(-h.y, h.x) * k.y / magnitude;
            // Pack two real spatial fields into one complex sequence: h + i*dx.
            // After IFFT RG=(height, displacementX), B=displacementZ, A≈0.
            result = vec4(h + vec2(-dx.y, dx.x), dz);
        }`;

    const normalFragment = `#version 300 es
        precision highp float;
        uniform highp sampler2D uDisplacement;
        uniform int uSize;
        uniform float uLength, uChop, uWaveScale;
        out vec4 result;
        vec3 sampleDisplacement(ivec2 p) {
            vec3 field = texelFetch(uDisplacement, (p + uSize) % uSize, 0).rgb;
            return vec3(field.g * uChop, field.r, field.b * uChop) * uWaveScale;
        }
        void main() {
            ivec2 p = ivec2(gl_FragCoord.xy);
            float stepSize = uLength / float(uSize);
            vec3 dx = (sampleDisplacement(p+ivec2(1,0)) - sampleDisplacement(p-ivec2(1,0))) / (2.0*stepSize);
            vec3 dz = (sampleDisplacement(p+ivec2(0,1)) - sampleDisplacement(p-ivec2(0,1))) / (2.0*stepSize);
            dx.x += 1.0; dz.z += 1.0;
            float jacobian = dx.x*dz.z - dx.z*dz.x;
            float foam = (1.0-smoothstep(0.30,0.65,jacobian)) * 0.45;
            result = vec4(normalize(cross(dz, dx)), foam);
        }`;

    function createSimulation(gl, size = 128, length = 64, settings = {}) {
        const assets = resources(gl);
        let fft;
        try {
            fft = createInverseFFT(gl, size);
            const initial = assets.texture(size, createSpectrum(size, length, settings));
            const evolved = assets.target(size);
            const normals = assets.target(size);
            const evolve = assets.program(fullscreenVertex, evolveFragment);
            const normal = assets.program(fullscreenVertex, normalFragment);
            const e = locations(gl, evolve, ['uInitial', 'uSize', 'uLength', 'uTime']);
            const n = locations(gl, normal, ['uDisplacement', 'uSize', 'uLength', 'uChop', 'uWaveScale']);
            const vao = assets.vao();
            return {
                size, get length() { return length; }, normals,
                setSpectrum(nextLength, nextSettings) {
                    length = nextLength;
                    bindTexture(gl,0,initial);
                    gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,size,size,gl.RGBA,gl.FLOAT,createSpectrum(size,length,nextSettings));
                },
                update(time, waveScale = 1, chop = 1.15) {
                    gl.disable(gl.DEPTH_TEST);
                    gl.disable(gl.CULL_FACE);
                    gl.disable(gl.BLEND);
                    gl.viewport(0, 0, size, size);
                    gl.bindVertexArray(vao);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, evolved.framebuffer);
                    gl.useProgram(evolve);
                    bindTexture(gl, 0, initial);
                    gl.uniform1i(e.uInitial, 0);
                    gl.uniform1i(e.uSize, size);
                    gl.uniform1f(e.uLength, length);
                    gl.uniform1f(e.uTime, time);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    const displacement = fft.transform(evolved.texture);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, normals.framebuffer);
                    gl.useProgram(normal);
                    bindTexture(gl, 0, displacement.texture);
                    gl.uniform1i(n.uDisplacement, 0);
                    gl.uniform1i(n.uSize, size);
                    gl.uniform1f(n.uLength, length);
                    gl.uniform1f(n.uChop, chop);
                    gl.uniform1f(n.uWaveScale, waveScale);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    return displacement;
                },
                destroy() { fft.destroy(); assets.destroy(); }
            };
        } catch (error) { fft?.destroy(); assets.destroy(); throw error; }
    }

    // Bilinear sampling implemented explicitly so float-linear filtering is not
    // a hardware requirement. The same field drives vertices and lighting.
    const fieldSampling = `
        uniform highp int uSize;
        vec4 sampleField(highp sampler2D field, vec2 uv) {
            vec2 p = fract(uv) * float(uSize) - 0.5;
            ivec2 cell = ivec2(floor(p));
            vec2 f = fract(p);
            ivec2 a = (cell + uSize) % uSize;
            ivec2 b = (cell + ivec2(1,0) + uSize) % uSize;
            ivec2 c = (cell + ivec2(0,1) + uSize) % uSize;
            ivec2 d = (cell + ivec2(1,1) + uSize) % uSize;
            return mix(mix(texelFetch(field,a,0),texelFetch(field,b,0),f.x),
                       mix(texelFetch(field,c,0),texelFetch(field,d,0),f.x),f.y);
        }`;
    const waterVertex = `#version 300 es
        precision highp float;
        layout(location=0) in vec3 aPosition;
        uniform highp sampler2D uDisplacement;
        uniform mat4 uViewProjection;
        uniform float uLength, uWaveScale, uChop;
        out vec3 vPosition;
        out vec2 vFieldUV;
        ${fieldSampling}
        void main() {
            vFieldUV = aPosition.xz / uLength;
            vec3 field = sampleField(uDisplacement, vFieldUV).rgb;
            vPosition = aPosition + vec3(field.g*uChop,field.r,field.b*uChop)*uWaveScale;
            gl_Position = uViewProjection * vec4(vPosition,1.0);
        }`;
    const atmosphere = `
        uniform float uDay;
        // Match the retained Gerstner theme's sun positions and colors, including the sunset
        // center just below the horizon rather than floating above the water.
        vec3 sunDirection() { return normalize(vec3(0.0, mix(-0.012,0.30,uDay), -1.0)); }
        vec3 sunColor() { return mix(vec3(1.0,0.42,0.055),vec3(1.0,0.98,0.88),uDay); }
        vec3 skyColor(vec3 direction) {
            vec3 horizon = mix(vec3(0.86,0.33,0.13),vec3(1.47,1.41,1.35),uDay);
            vec3 zenith = mix(vec3(0.28,0.08,0.06),vec3(0.06,0.30,0.58),uDay);
            float elevation = clamp(direction.y*0.88+0.08,0.0,1.0);
            return mix(horizon,zenith,pow(elevation,mix(0.32,0.38,uDay)));
        }
        vec3 sunRadiance(vec3 direction) {
            // From sea-gerstner.js's sky shader: disk size/edge, halo, inner glow.
            float sunDot = dot(direction,sunDirection());
            float sunRadius = mix(0.9962,0.99996,uDay);
            float sunEdge = mix(0.00115,0.00007,uDay);
            float sunDisk = smoothstep(sunRadius,min(0.99998,sunRadius+sunEdge),sunDot);
            float sunBase = max(sunDot,0.0);
            float halo = pow(sunBase,mix(80.0,120.0,uDay));
            float innerBloom = sunBase > 0.98045 ? pow(sunBase,700.0) : 0.0;
            return sunColor()*(sunDisk*mix(3.8,0.12,uDay)
                +halo*mix(0.95,0.24,uDay)+innerBloom*mix(1.5,0.90,uDay));
        }
        vec3 displayColor(vec3 color) {
            // Palettes are authored in display space, matching the original theme.
            return pow(color / (vec3(1.0)+color*0.35),vec3(0.95));
        }`;
    const waterFragment = `#version 300 es
        precision highp float;
        uniform highp sampler2D uNormals;
        uniform vec3 uCamera;
        uniform float uLength, uFoam, uRoughness;
        in vec3 vPosition;
        in vec2 vFieldUV;
        out vec4 result;
        ${fieldSampling}
        ${atmosphere}
        void main() {
            vec4 surface = sampleField(uNormals, vFieldUV);
            vec3 N = normalize(surface.xyz);
            vec3 V = normalize(uCamera-vPosition);
            float distanceToCamera = length(uCamera-vPosition);
            // Reduce high-frequency slopes at the horizon to limit sparkle aliasing.
            N = normalize(mix(vec3(0.0,1.0,0.0),N,1.0-smoothstep(30.0,155.0,distanceToCamera)*0.75));
            float fresnel = 0.02037 + 0.97963*pow(1.0-max(dot(N,V),0.0),5.0);
            vec3 deep = mix(vec3(0.012,0.009,0.018),vec3(0.008,0.065,0.095),uDay);
            vec3 crest = mix(vec3(0.065,0.022,0.018),vec3(0.015,0.18,0.21),uDay);
            vec3 water = mix(deep,crest,smoothstep(-0.25,0.55,vPosition.y)*0.6);
            vec3 reflected = skyColor(reflect(-V,N));
            vec3 color = mix(water,reflected,fresnel);
            vec3 H = normalize(V+sunDirection());
            float shininess = mix(180.0,260.0,uDay)*pow(0.15/uRoughness,2.0);
            float highlight = pow(max(dot(N,H),0.0),shininess);
            color += sunColor()*highlight*mix(1.7,1.25,uDay);
            vec3 foamColor = mix(vec3(0.60,0.36,0.23),vec3(0.82,0.90,0.92),uDay);
            color = mix(color,foamColor,clamp(surface.a*uFoam,0.0,1.0));
            float fog = 1.0-exp(-distanceToCamera*distanceToCamera*0.00013);
            color = mix(color,skyColor(vec3(0.0,0.0,-1.0)),fog);
            result = vec4(displayColor(color),1.0);
        }`;
    const skyFragment = `#version 300 es
        precision highp float;
        in vec2 vScreen;
        uniform float uAspect, uPitch;
        out vec4 result;
        ${atmosphere}
        void main() {
            vec3 forward = normalize(vec3(0.0,-uPitch,-15.0));
            vec3 up = vec3(0.0,-forward.z,forward.y);
            vec3 ray = normalize(forward+vec3(1.0,0.0,0.0)*vScreen.x*uAspect*0.520567
                                +up*vScreen.y*0.520567);
            vec3 color = skyColor(ray)+sunRadiance(ray);
            result = vec4(displayColor(color),1.0);
        }`;

    async function createRenderer(options = {}) {
        const requestedTheme = options.theme || new URLSearchParams(location.search).get('theme');
        const colorScheme = matchMedia('(prefers-color-scheme: light)');
        let theme = ['light','dark'].includes(requestedTheme) ? requestedTheme : colorScheme.matches ? 'light' : 'dark';
        let config = normalizeParameters(options.parameters,theme);
        let customRoughness = options.parameters?.roughness !== undefined;
        const size = options.resolution || 256;
        if (![128,256].includes(size)) throw new Error('Choose a 128 or 256 FFT grid.');
        const container = resolveElement(options.container) || document.body;
        const canvas = resolveElement(options.canvas) || document.createElement('canvas');
        canvas.id = options.canvasId || (container === document.body ? 'threejsmain' : 'sea-fft-canvas');
        canvas.dataset.backgroundTheme = 'sea';
        canvas.dataset.oceanRenderer = 'fft';
        canvas.setAttribute('aria-hidden', 'true');
        container.appendChild(canvas);
        const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
        let simulation, assets, animationFrame = null, destroyed = false;
        let running = false;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const stats = {fps:0, oldTime:null};
        let day = theme === 'light' ? 1 : 0;
        let pitch = day ? 1.77 : 2.22;
        let visualRoughness = config.roughness;
        let themeTransition = null;
        const themeTransitionMs = 900; // Same duration as the original sea theme.
        let simulationTime = 0, lastTime = 0, elapsed = 0, lastWallTime = performance.now();
        const camera = new Float32Array([0,2.2,15]);
        function cleanup() {
            if (animationFrame !== null) cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
            motion.removeEventListener('change', onMotionChange);
            colorScheme.removeEventListener('change',onColorSchemeChange);
            simulation?.destroy(); assets?.destroy();
            gl?.getExtension('WEBGL_lose_context')?.loseContext();
            canvas.remove();
        }
        const projection = seaMath.mat4.create(), view = seaMath.mat4.create(), viewProjection = seaMath.mat4.create();
        const viewTarget = new Float32Array([0,2.2-pitch,0]);
        function updateTheme(now) {
            if (themeTransition) {
                const progress = motion.matches ? 1 : Math.min(1,(now-themeTransition.start)/themeTransitionMs);
                const weight = progress*progress*(3-2*progress);
                const targetDay = theme === 'light' ? 1 : 0;
                day = themeTransition.fromDay+(targetDay-themeTransition.fromDay)*weight;
                visualRoughness = themeTransition.fromRoughness+(config.roughness-themeTransition.fromRoughness)*weight;
                if (progress === 1) themeTransition = null;
            }
            pitch = 2.22+(1.77-2.22)*day;
            viewTarget[1] = 2.2-pitch;
            seaMath.mat4.lookAt(view,camera,viewTarget,[0,1,0]);
        }
        function setTheme(nextTheme,{roughness,animate = true} = {}) {
            if (destroyed || !['light','dark'].includes(nextTheme)) return;
            const now = performance.now();
            // Start from the currently displayed state when reversing mid-flight.
            updateTheme(now);
            theme = nextTheme;
            if (roughness !== undefined) {
                customRoughness = true;
                config.roughness = normalizeParameters({...config,roughness},theme).roughness;
            } else if (!customRoughness) config.roughness = themeRoughness[theme];
            if (!animate || motion.matches) {
                day = theme === 'light' ? 1 : 0;
                visualRoughness = config.roughness;
                themeTransition = null;
            } else {
                themeTransition = {start:now,fromDay:day,fromRoughness:visualRoughness};
            }
            if (renderOnce) renderOnce(lastTime);
            // A paused ocean can still animate the lighting without advancing
            // its waves. The comparison harness supplies its own animation loop.
            if (!running && themeTransition && !options.externalAnimation && animationFrame === null) {
                animationFrame = requestAnimationFrame(tick);
            }
        }
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            seaMath.mat4.perspective(projection, 55*Math.PI/180, canvas.width/canvas.height,0.1,2000);
            if (renderOnce && !running) renderOnce(lastTime);
        }
        function onColorSchemeChange(event) {
            setTheme(event.matches ? 'light' : 'dark');
        }
        function onMotionChange() {
            if (motion.matches) { pause(); if (renderOnce) renderOnce(lastTime); }
            else resume();
        }
        function pause() {
            running = false;
            stats.fps = 0;
            stats.oldTime = null;
            if (animationFrame !== null) cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        function resume() {
            if (running || destroyed || motion.matches) return;
            if (animationFrame !== null) cancelAnimationFrame(animationFrame);
            running = true;
            lastWallTime = performance.now();
            tick();
        }
        let renderOnce;
        function tick() {
            animationFrame = null;
            renderOnce();
            if (!destroyed && (running || themeTransition)) animationFrame = requestAnimationFrame(tick);
        }
        try {
            if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
                throw new Error('FFT ocean needs WebGL 2 with floating-point render targets. Select the original sea in the comparison, or use the sky theme.');
            }
            assets = resources(gl);
            simulation = createSimulation(gl, size, config.patchSize, config);
            const water = assets.program(waterVertex, waterFragment);
            const sky = assets.program(fullscreenVertex, skyFragment);
            const w = locations(gl,water,['uDisplacement','uNormals','uViewProjection','uLength','uWaveScale','uChop','uSize','uCamera','uDay','uFoam','uRoughness']);
            const s = locations(gl,sky,['uAspect','uDay','uPitch']);
            const vao = assets.vao(), skyVao = assets.vao();
            const segments = 192, stride = segments+1;
            const vertices = new Float32Array(stride*stride*3);
            const indices = new Uint16Array(segments*segments*6);
            let v = 0, i = 0;
            // Concentrate vertices near the camera, widening toward the horizon.
            for (let z = 0; z <= segments; z++) {
                const distance = Math.pow(z/segments,1.7)*200;
                for (let x = 0; x <= segments; x++) {
                    vertices[v++] = (x/segments*2-1)*(10+distance*1.8);
                    vertices[v++] = 0;
                    vertices[v++] = 15-distance;
                }
            }
            for (let z = 0; z < segments; z++) {
                for (let x = 0; x < segments; x++) {
                    const a = z*stride+x, b = a+stride;
                    indices.set([a,a+1,b,a+1,b+1,b],i); i += 6;
                }
            }
            gl.bindVertexArray(vao);
            gl.bindBuffer(gl.ARRAY_BUFFER,assets.buffer());
            gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,assets.buffer());
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
            seaMath.mat4.lookAt(view,camera,[0,2.2-pitch,0],[0,1,0]);
            resize();
            window.addEventListener('resize',resize,{passive:true});
            if (options.animate !== false) motion.addEventListener('change',onMotionChange);
            if (!['light','dark'].includes(requestedTheme)) colorScheme.addEventListener('change',onColorSchemeChange);
            renderOnce = (time) => {
                if (destroyed) return;
                const now = performance.now();
                updateTheme(now);
                if (time === undefined) {
                    if (running) elapsed += (now-lastWallTime)/1000;
                    time = elapsed;
                } else elapsed = time;
                lastWallTime = now;
                stats.fps = !running || stats.oldTime === null ? 0 : 1000/Math.max(0.01,now-stats.oldTime);
                stats.oldTime = running ? now : null;
                simulationTime += Math.max(0,time-lastTime)*config.speed;
                lastTime = time;
                const waveScale = (1+(0.52-1)*day)*config.height;
                const displacement = simulation.update(simulationTime,waveScale,config.choppiness);
                gl.bindFramebuffer(gl.FRAMEBUFFER,null);
                gl.viewport(0,0,canvas.width,canvas.height);
                gl.clearColor(0,0,0,1);
                gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.useProgram(water);
                gl.bindVertexArray(vao);
                bindTexture(gl,0,displacement.texture);
                bindTexture(gl,1,simulation.normals.texture);
                seaMath.mat4.multiply(viewProjection,projection,view);
                gl.uniform1i(w.uDisplacement,0); gl.uniform1i(w.uNormals,1);
                gl.uniformMatrix4fv(w.uViewProjection,false,viewProjection);
                gl.uniform1f(w.uLength,simulation.length); gl.uniform1i(w.uSize,size);
                gl.uniform1f(w.uWaveScale,waveScale); gl.uniform1f(w.uChop,config.choppiness);
                gl.uniform1f(w.uFoam,config.foam); gl.uniform1f(w.uRoughness,visualRoughness);
                gl.uniform3fv(w.uCamera,camera); gl.uniform1f(w.uDay,day);
                gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
                gl.useProgram(sky); gl.bindVertexArray(skyVao);
                gl.uniform1f(s.uAspect,canvas.width/canvas.height);
                gl.uniform1f(s.uDay,day); gl.uniform1f(s.uPitch,pitch);
                gl.drawArrays(gl.TRIANGLES,0,3);
            };
            renderOnce(options.animate === false ? 0 : undefined);
            if (options.animate !== false) resume();
            return {
                canvas, gl, simulation, renderOnce, pause, resume, stats, setTheme,
                getTheme: () => theme,
                getParameters: () => ({...config}),
                setParameters(values) {
                    const next = normalizeParameters({...config,...values},theme);
                    if (values.roughness !== undefined) {
                        customRoughness = true;
                        visualRoughness = next.roughness;
                        if (themeTransition) themeTransition.fromRoughness = next.roughness;
                    }
                    if (['patchSize','windSpeed','windDirection','damping'].some(key => next[key] !== config[key])) {
                        simulation.setSpectrum(next.patchSize,next);
                    }
                    config = next;
                    return {...config};
                },
                destroy() { if (destroyed) return; destroyed = true; running = false; cleanup(); }
            };
        } catch (error) { cleanup(); throw error; }
    }
    return { parameters, themeRoughness, defaultParameters, defaultResolution:256, normalizeParameters,
        createSpectrum, createInverseFFT, createSimulation, createRenderer };
})();


async function createSeaRenderer(options = {}) {
    return SeaFFT.createRenderer(options);
}

window.sea = sea;
// site.js uses the generic sky alias for either animated background.
window.sky = sea;

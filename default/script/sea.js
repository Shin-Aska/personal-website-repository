/*
 * Sea theme
 * Adapted from the dependency-free WebGL 2 ocean experiment.
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
            : this.backgroundOverlayEnabled && overlayQuery !== 'off';
        this.setBackgroundOverlay(useBackgroundOverlay);
        if (this._initialization) return this._initialization;

        const generation = ++this._generation;
        this.startTime = performance.now();
        this._initialization = createSeaRenderer(options)
            .then((runtime) => {
                if (generation !== this._generation) {
                    runtime.destroy();
                    return null;
                }
                this._runtime = runtime;
                this.canvas = runtime.canvas;
                this.ctx = runtime.gl;
                this.renderer = runtime;
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
        this._initialization = null;
        this._motionQuery = null;
        this._motionListener = null;
    }
};

async function createSeaRenderer(options = {}) {

// Procedural simplex noise used by the water surface and crest breakup.
const simplexNoiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const waterVertexShader = `#version 300 es
layout(location = 0) in vec3 aPosition;

uniform mat4 uViewProjectionMatrix;
uniform float uTime;
uniform float uWaveScale;
uniform vec4 uWavePhasesA;
uniform vec3 uWavePhasesB;

out vec3 vWorldPosition;
out vec3 vWorldNormal;

// Classic Perlin 3D Noise 
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.y, Pi0.y, Pi1.y, Pi1.y);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
}

// Accumulates displacement and normals. All invariant wave values are
// precomputed, so every vertex only evaluates the animation-dependent math.
vec3 calcGerstnerWave(
    vec2 d,
    float k,
    float amplitude,
    float phase,
    float steepness,
    vec3 p,
    inout vec3 tangent,
    inout vec3 binormal
) {
    float f = k * dot(d, p.xz) - phase;
    float s = sin(f);
    float c_val = cos(f);
    
    float verticalSlope = amplitude * k;
    float horizontalAmplitude = amplitude * steepness;
    float horizontalSlope = horizontalAmplitude * k;

    vec3 displacement = vec3(
        d.x * (horizontalAmplitude * c_val),
        amplitude * s,
        d.y * (horizontalAmplitude * c_val)
    );
    
    tangent += vec3(
        -d.x * d.x * (horizontalSlope * s),
        d.x * (verticalSlope * c_val),
        -d.x * d.y * (horizontalSlope * s)
    );

    binormal += vec3(
        -d.x * d.y * (horizontalSlope * s),
        d.y * (verticalSlope * c_val),
        -d.y * d.y * (horizontalSlope * s)
    );
    
    return displacement;
}

void main() {
    vec3 gridPoint = aPosition;
    vec3 finalPos = gridPoint;

    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);

    vec3 displacement = vec3(0.0);
    displacement += calcGerstnerWave(vec2( 0.9400,  0.3412), 0.4487989505, 0.2050000000, uWavePhasesA.x, 0.78, gridPoint, tangent, binormal);
    displacement += calcGerstnerWave(vec2( 0.6157,  0.7880), 0.6981317008, 0.1650000000, uWavePhasesA.y, 0.68, gridPoint, tangent, binormal);
    displacement += calcGerstnerWave(vec2(-0.3420,  0.9397), 1.0134169850, 0.1200000000, uWavePhasesA.z, 0.58, gridPoint, tangent, binormal);
    displacement += calcGerstnerWave(vec2( 0.9119, -0.4104), 1.3962634016, 0.0750000000, uWavePhasesA.w, 0.48, gridPoint, tangent, binormal);
    displacement += calcGerstnerWave(vec2(-0.7193,  0.6947), 2.4166097335, 0.0380000000, uWavePhasesB.x, 0.38, gridPoint, tangent, binormal);
    displacement += calcGerstnerWave(vec2( 0.2225, -0.9749), 3.4906585040, 0.0180000000, uWavePhasesB.y, 0.30, gridPoint, tangent, binormal);
    displacement += calcGerstnerWave(vec2( 0.4894,  0.8721), 5.2359877560, 0.0080000000, uWavePhasesB.z, 0.22, gridPoint, tangent, binormal);

    // Irregular wind chop with matching normal derivatives.
    vec3 noisePoint = vec3(gridPoint.xz * 0.5, uTime * 0.3);
    float noiseVal = cnoise(noisePoint);
    float noiseX = cnoise(noisePoint + vec3(0.08, 0.0, 0.0));
    float noiseZ = cnoise(noisePoint + vec3(0.0, 0.08, 0.0));
    displacement.y += noiseVal * 0.14;
    tangent.y += (noiseX - noiseVal) * 0.875;
    binormal.y += (noiseZ - noiseVal) * 0.875;

    // The sunset reference is visibly rougher. Preserve that large swell in
    // dark mode while keeping the daylight sea lower and more finely rippled.
    displacement *= uWaveScale;
    tangent = vec3(1.0, 0.0, 0.0)
            + (tangent - vec3(1.0, 0.0, 0.0)) * uWaveScale;
    binormal = vec3(0.0, 0.0, 1.0)
             + (binormal - vec3(0.0, 0.0, 1.0)) * uWaveScale;

    finalPos += displacement;

    vec3 normal = normalize(cross(binormal, tangent));
    
    vWorldPosition = finalPos;
    vWorldNormal = normal;

    gl_Position = uViewProjectionMatrix * vec4(finalPos, 1.0);
}
`;

const waterFragmentShader = `#version 300 es
precision highp float;

uniform vec3 uColorDeep;
uniform vec3 uColorShallow;
uniform vec3 uColorHorizon;
uniform vec3 uColorZenith;
uniform vec3 uFogColor; 
uniform float uFogDensitySquared;
uniform vec3 uSunDirection;
uniform vec2 uSunPathDirection;
uniform vec3 uSunColor;
uniform vec3 uFoamSkyAmbient;
uniform float uSpecularStrength;
uniform float uShininess;
uniform float uSpecularCutoff;
uniform vec3 uCameraPosition;
uniform float uTime;
uniform float uThemeBlend; // 0 = dark/sunset, 1 = light/day
uniform sampler2D uRippleTexture;
uniform sampler2D uCloudTexture;
uniform vec3 uCloudColor;
uniform float uCloudSpeed;

in vec3 vWorldPosition;
in vec3 vWorldNormal;

out vec4 outColor;

${simplexNoiseGLSL}

vec3 sampleReflectedSky(vec3 direction) {
    float elevation = clamp(direction.y * 0.88 + 0.08, 0.0, 1.0);
    float atmosphere = pow(elevation, mix(0.32, 0.38, uThemeBlend));
    vec3 color = mix(uColorHorizon, uColorZenith, atmosphere);

    if (direction.y > 0.005) {
        vec2 projected = vec2(direction.x * 2.0 + direction.z * 0.15,
                              direction.y * 2.8 + direction.z * 0.20);
        vec2 motion = vec2(-uTime * uCloudSpeed * 0.012,
                            uTime * uCloudSpeed * 0.003);
        vec2 uv = projected + motion;
        vec3 primary = textureLod(uCloudTexture, uv, 1.0).rgb;
        vec3 warped = textureLod(uCloudTexture,
            uv * 0.61 + (primary.gb - 0.5) * 0.24 + vec2(0.17, 0.31), 1.0).rgb;
        vec3 stretched = textureLod(uCloudTexture,
            vec2(uv.x * 0.42 + uv.y * 0.08, uv.y * 1.65) - motion * 0.6, 1.0).rgb;
        vec3 storm = vec3(0.0);
        if (uThemeBlend < 1.0) {
            storm = textureLod(uCloudTexture,
                uv * 0.34 + vec2(0.27, -0.16) - motion * 0.18, 2.0).rgb;
        }
        vec3 cirrus = vec3(0.0);
        if (uThemeBlend > 0.0) {
            cirrus = textureLod(uCloudTexture,
                vec2(uv.x * 0.48 + uv.y * 0.035, uv.y * 1.35)
                + vec2(-0.11, 0.23) - motion * 1.4, 0.5).rgb;
        }
        float sunsetField = max(
            primary.r * 0.40 + warped.r * 0.32
                + primary.g * 0.12 + stretched.g * 0.22
                - warped.b * 0.10,
            storm.r * 0.58 + storm.g * 0.34 - storm.b * 0.08
        );
        float dayField = cirrus.g * 0.72 + stretched.g * 0.18
                       + cirrus.r * 0.16 - cirrus.b * 0.08;
        float field = mix(sunsetField, dayField, uThemeBlend);
        float lower = mix(0.33, 0.54, uThemeBlend);
        float density = smoothstep(lower, lower + mix(0.24, 0.18, uThemeBlend), field);
        float breakup = smoothstep(0.25, 0.73,
            primary.b * 0.42 + warped.g * 0.34 + stretched.r * 0.24);
        density *= mix(0.28, 1.0, breakup);
        vec3 sunsetCloud = mix(uCloudColor * 0.42, uColorZenith * 0.32, density);
        vec3 daylightCloud = mix(uColorHorizon * 0.82, uCloudColor * 0.98, 0.62);
        vec3 cloudReflection = mix(sunsetCloud, daylightCloud, uThemeBlend);
        color = mix(color, cloudReflection,
            density * mix(0.78, 0.42, uThemeBlend));
    }

    return color;
}

// Recover a world-XZ gradient from quad derivatives. Adjacent fragments have
// already evaluated the same scalar noise, so this closely approximates the
// former finite differences without four additional simplex calls per pixel.
vec2 worldGradientFromDerivatives(float value, vec2 worldXZ) {
    vec2 worldDx = dFdx(worldXZ);
    vec2 worldDy = dFdy(worldXZ);
    float valueDx = dFdx(value);
    float valueDy = dFdy(value);
    float determinant = worldDx.x * worldDy.y - worldDx.y * worldDy.x;
    float safeDeterminant = sign(determinant + 1e-8) * max(abs(determinant), 1e-8);
    return vec2(
        valueDx * worldDy.y - valueDy * worldDx.y,
        worldDx.x * valueDy - worldDy.x * valueDx
    ) / safeDeterminant;
}

void main() {
    vec3 toCamera = uCameraPosition - vWorldPosition;
    float distSquared = dot(toCamera, toCamera);
    float inverseDistance = inversesqrt(distSquared);
    float distToCamera = distSquared * inverseDistance;
    vec3 viewDir = toCamera * inverseDistance;
    vec3 lightDir = uSunDirection;
    
    // --- 1. Scrolling Normal Maps (Procedural Capillary Waves) ---
    float t = uTime;
    vec3 p = vWorldPosition;
    vec3 noisePoint1 = vec3(p.x * 1.5 + t * 0.8, p.y, p.z * 1.5 - t * 0.5);
    vec3 noisePoint2 = vec3(p.x * 3.0 - t * 0.5, p.y, p.z * 3.0 - t * 0.9);
    float n1 = snoise(noisePoint1);
    float n2 = snoise(noisePoint2);
    vec3 baseNormal = normalize(vWorldNormal);
    float geometricDetailFade = 1.0 - smoothstep(10.0, 38.0, distToCamera);
    baseNormal = normalize(mix(vec3(0.0, 1.0, 0.0), baseNormal,
                               mix(0.15, 1.0, geometricDetailFade)));
    vec3 N = baseNormal;
    vec2 noiseGradient1 = worldGradientFromDerivatives(n1, p.xz) / 1.5;
    vec2 noiseGradient2 = worldGradientFromDerivatives(n2, p.xz) / 3.0;
    float slopeDetailFade = 1.0 - smoothstep(12.0, 32.0, distToCamera);
    // Fine detail (n3) fades with distance to avoid near-field aliasing.
    float detailFade = 1.0 - smoothstep(4.0, 20.0, distToCamera);
    // Outside the fade range this term is multiplied by zero. Avoid evaluating
    // a full simplex-noise sample for the majority of distant water pixels.
    float n3 = 0.0;
    vec2 noiseGradient3 = vec2(0.0);
    if (distToCamera < 20.0) {
        const float gradientStep = 0.065;
        vec3 noisePoint3 = vec3(p.x * 8.0, p.y, p.z * 8.0 + t);
        n3 = snoise(noisePoint3);
        noiseGradient3 = vec2(
            snoise(noisePoint3 + vec3(gradientStep, 0.0, 0.0)) - n3,
            snoise(noisePoint3 + vec3(0.0, 0.0, gradientStep)) - n3
        ) / gradientStep;
    }
    N.xz += (noiseGradient1 * 0.070
           + noiseGradient2 * 0.045) * slopeDetailFade
           + noiseGradient3 * 0.018 * detailFade;

    // Directional capillary wavelets create the fine, coherent ridges visible in
    // real water without requiring a denser water mesh or another noise octave.
    if (distToCamera < 35.0) {
        float capillaryFade = 1.0 - smoothstep(12.0, 35.0, distToCamera);
        float cap1 = cos(dot(p.xz, vec2(0.86, 0.51)) * 11.0 + t * 2.1 + n2 * 1.1);
        float cap2 = cos(dot(p.xz, vec2(-0.34, 0.94)) * 16.0 - t * 2.8 + n1 * 0.9);
        float cap3 = cos(dot(p.xz, vec2(0.68, -0.73)) * 23.0 + t * 3.4 - n2 * 0.7);
        float cap4 = cos(dot(p.xz, vec2(-0.93, -0.37)) * 31.0 - t * 4.1 + n1 * 0.5);
        float capillaryThemeStrength = mix(0.58, 1.0, uThemeBlend);
        N.x += (cap1 * 0.013 - cap2 * 0.008 + cap3 * 0.005 - cap4 * 0.003)
             * capillaryFade * capillaryThemeStrength;
        N.z += (cap1 * 0.008 + cap2 * 0.016 - cap3 * 0.005 - cap4 * 0.007)
             * capillaryFade * capillaryThemeStrength;
    }
    if (distToCamera < 45.0) {
        vec3 rippleNormal = texture(uRippleTexture,
            p.xz * 0.09 + vec2(t * 0.018, -t * 0.014)).rgb * 2.0 - 1.0;
        vec2 rippleCoordinates = vec2(p.x * 0.71 + p.z * 0.70,
                                      -p.x * 0.70 + p.z * 0.71);
        vec3 fineRippleNormal = texture(uRippleTexture,
            rippleCoordinates * 0.19 + vec2(-t * 0.027, -t * 0.021)).rgb * 2.0 - 1.0;
        float rippleFade = 1.0 - smoothstep(18.0, 45.0, distToCamera);
        float microDetailStrength = mix(0.82, 1.40, uThemeBlend);
        N.xz += (rippleNormal.xy * 0.18
               + vec2(fineRippleNormal.y, -fineRippleNormal.x) * 0.12)
               * rippleFade * microDetailStrength;
    }
    N = normalize(N);
    
    // --- 2. Color & Subsurface Scattering (SSS) ---
    float waveHeight = vWorldPosition.y + (n1 + n2) * 0.1;

    // Depth-based base color
    float shallowMix = smoothstep(
        mix(-0.10, -2.0, uThemeBlend),
        mix(0.92, 1.2, uThemeBlend),
        waveHeight
    );
    vec3 albedo = mix(uColorDeep, uColorShallow, shallowMix);

    // Sky ambient: water surface picks up diffuse light from the sky dome
    float NdotUp = max(N.y, 0.0);
    vec3 skyAmbient = mix(uColorHorizon, uColorZenith, NdotUp)
                    * mix(0.105, 0.38, uThemeBlend);
    albedo += skyAmbient;

    // SSS: backlit wave crests glow with shallow/turquoise color
    // Strong when light passes through thin crest toward viewer
    float sssWrap = max(0.0, dot(lightDir, -N) * 0.5 + 0.5);
    float sssFactor = sssWrap * sssWrap * sssWrap
                    * smoothstep(0.0, 1.8, waveHeight) * 1.2;
    albedo += uColorShallow * sssFactor * mix(2.40, 1.45, uThemeBlend);

    // --- 3. Specular Lighting ---
    vec3 H = normalize(lightDir + viewDir);
    vec3 anisoH = normalize(vec3(H.x * 0.5, H.y, H.z));
    float NdotH = max(dot(N, anisoH), 0.0);
    vec2 viewXZ = normalize(viewDir.xz + vec2(0.001));
    float pathDot = dot(-viewXZ, uSunPathDirection);
    float pathCore = smoothstep(0.48, 0.996, pathDot);

    // The cutoff is precomputed on the CPU from the current shininess. Below it,
    // pow(NdotH, shininess) is guaranteed to be under the existing 1e-6 discard.
    float specular = 0.0;
    if (NdotH > uSpecularCutoff) {
        specular = pow(NdotH, uShininess);
        specular = step(0.6, specular) * specular * 4.0 + specular * 0.5;
        float sunPathWeight = mix(0.25, 1.0, smoothstep(0.0, 0.8, pathDot));
        specular *= sunPathWeight;
    }
    // The lower-frequency lobe ties isolated sparkles into the narrow continuous
    // column of reflected light seen under the sun in both references.
    if (pathCore > 0.0) {
        float broadSpecular = pow(NdotH, mix(95.0, 145.0, uThemeBlend));
        float reflectionSheen = pow(NdotH, mix(32.0, 48.0, uThemeBlend));
        specular += pathCore * (broadSpecular * mix(0.52, 0.36, uThemeBlend)
                              + reflectionSheen * mix(0.13, 0.085, uThemeBlend));
    }

    // --- 4. Fresnel & Sky Reflection ---
    float F0 = 0.02037; // Fresnel reflectance of water at normal incidence.
    float NdotV = max(dot(N, viewDir), 0.0);
    float oneMinusNdotV = 1.0 - NdotV;
    float oneMinusNdotV2 = oneMinusNdotV * oneMinusNdotV;
    float fresnel = F0 + (1.0 - F0)
                  * oneMinusNdotV2 * oneMinusNdotV2 * oneMinusNdotV;
    
    vec3 reflDir = reflect(-viewDir, N);
    vec3 reflectionColor = sampleReflectedSky(reflDir);
    reflectionColor *= mix(0.62, 0.68, uThemeBlend);
    float distantReflection = smoothstep(18.0, 76.0, distToCamera);
    reflectionColor *= mix(1.0, mix(0.72, 0.62, uThemeBlend), distantReflection);
    
    // --- 5. Foam (Whitecaps) ---
    // Foam concentrated at wave crests with a streak pattern following crest direction.
    // Real whitecaps streak perpendicular to wave travel — NOT random salt-and-pepper.

    float geometricSlope = max(0.0, 1.0 - baseNormal.y);
    float foamSignal = waveHeight + geometricSlope * 2.4 + n1 * 0.16 + n2 * 0.08;
    // The sunset needs sparse, broken crest threads; the daylight keeps the
    // broader whitecaps that read naturally under its cooler, diffuse light.
    float darkFoamBase = smoothstep(0.48, 0.66, foamSignal);
    float dayFoamBase = smoothstep(0.76, 1.03, foamSignal);
    float foamMask = 0.0;
    float darkFoamRim = 0.0;
    float activeFoamBase = max(darkFoamBase, dayFoamBase);
    if (uThemeBlend <= 0.0) activeFoamBase = darkFoamBase;
    if (uThemeBlend >= 1.0) activeFoamBase = dayFoamBase;
    if (activeFoamBase > 0.0) {
        // Streak noise is only visible where crest foam exists.
        const vec2 crestDir = vec2(-0.14834045, 0.98893635);
        float crestCoord = dot(vWorldPosition.xz, crestDir);
        float streakNoise = snoise(vec3(
            crestCoord * 1.2 + uTime * 0.12,
            (vWorldPosition.x + vWorldPosition.z) * 0.15,
            uTime * 0.05
        ));
        float streakMask = smoothstep(0.05, 0.75, streakNoise * 0.5 + 0.5);
        float foamErosion = snoise(vec3(
            vWorldPosition.xz * 3.7 + vec2(uTime * 0.18, -uTime * 0.12),
            uTime * 0.08
        ));
        float laceMask = smoothstep(-0.38, 0.46, foamErosion);
        float darkFoamMask = 0.0;
        if (uThemeBlend < 1.0) {
            float threadNoise = snoise(vec3(
                crestCoord * 1.62 - uTime * 0.16,
                (vWorldPosition.x - vWorldPosition.z) * 0.28,
                uTime * 0.09 + 17.0
            ));
            float threadMask = smoothstep(0.45, 0.88, 1.0 - abs(threadNoise));
            float cellNoise = snoise(vec3(
                vWorldPosition.xz * 3.25 + vec2(-uTime * 0.12, uTime * 0.09),
                uTime * 0.06 + 9.0
            ));
            float cellBreakup = smoothstep(-0.12, 0.58, cellNoise);

            // Threshold the combined field instead of softly multiplying it into
            // the crest. That leaves irregular holes and thin rims rather than
            // translucent cream-colored patches spread over an entire wave face.
            float laceField = threadMask * 0.48 + cellBreakup * 0.29 + laceMask * 0.23;
            float darkFoamThreads = smoothstep(0.53, 0.74, laceField);
            float darkFoamWash = smoothstep(0.38, 0.55, laceField) * 0.03;
            darkFoamMask = pow(darkFoamBase, 1.48)
                         * (darkFoamThreads * 0.92 + darkFoamWash)
                         * mix(0.22, 1.0, streakMask);
            darkFoamRim = smoothstep(0.70, 0.87, laceField)
                        * smoothstep(0.42, 0.86, darkFoamBase);
        }
        float dayFoamMask = 0.0;
        if (uThemeBlend > 0.0) {
            dayFoamMask = dayFoamBase * mix(0.18, 0.92, streakMask)
                        * mix(0.38, 1.0, laceMask) * 0.15;
        }
        foamMask = clamp(mix(darkFoamMask, dayFoamMask, uThemeBlend), 0.0, 1.0);
    }

    // --- 6. Composition ---
    vec3 finalColor = mix(albedo, reflectionColor, fresnel);
    finalColor += uSunColor * specular * uSpecularStrength;
    if (pathCore > 0.0) {
        float ribbonNoise = clamp(0.48 + n1 * 0.23 + n2 * 0.16, 0.0, 1.0);
        float ribbonCoverage = mix(0.070, 0.014, uThemeBlend)
                             + smoothstep(0.38, 0.68, ribbonNoise)
                             * mix(0.43, 0.13, uThemeBlend);
        float sunRibbon = pow(pathCore, 1.45) * ribbonCoverage
                        * smoothstep(-0.55, 0.55, waveHeight);
        finalColor += uSunColor * sunRibbon * mix(0.82, 0.32, uThemeBlend);
        float glitterNoise = clamp(0.52 + n1 * 0.27 + n2 * 0.21 + n3 * 0.08, 0.0, 1.0);
        float glitter = pathCore * pow(glitterNoise, 8.0)
                      * smoothstep(-0.35, 0.55, waveHeight)
                      * mix(0.65, 0.45, uThemeBlend);
        finalColor += uSunColor * glitter * uSpecularStrength
                    * mix(0.74, 0.30, uThemeBlend);
    }
    if (foamMask > 0.0) {
        vec3 foamColor = vec3(1.05, 1.05, 1.08);
        if (uThemeBlend < 1.0) {
            float foamNdotL = max(dot(N, lightDir), 0.2);
            float foamLight = 0.28 + foamNdotL * 0.72;
            vec3 foamDark = mix(vec3(0.38, 0.19, 0.095), vec3(1.04, 0.77, 0.54), foamLight)
                          + uSunColor * 0.09 + uFoamSkyAmbient * 0.07;
            foamDark += uSunColor * darkFoamRim * 0.11;
            foamDark = min(foamDark, vec3(2.0));
            foamColor = mix(foamDark, foamColor, uThemeBlend);
        }
        finalColor = mix(finalColor, foamColor, foamMask);
    }
    
    // --- 7. Atmosphere/Fog ---
    float fogFactor = 1.0 - exp(-uFogDensitySquared * distSquared);
    
    // Sun Glare in Fog
    float sunDot = max(dot(viewDir, lightDir), 0.0);
    float sunDot2 = sunDot * sunDot;
    float sunDot4 = sunDot2 * sunDot2;
    float sunDot12 = sunDot4 * sunDot4 * sunDot4;
    vec3 sunFogColor = mix(uFogColor, uSunColor, sunDot12 * 0.6);
    
    finalColor = mix(finalColor, sunFogColor, fogFactor);
    
    // Alpha is an internal surface marker for the post pass. The final pass
    // remains fully opaque, so this does not alter browser compositing.
    outColor = vec4(finalColor, 0.0);
}
`;

const skyVertexShader = `#version 300 es
layout(location = 0) in vec3 aPosition;

uniform mat4 uViewProjectionMatrix;

out vec3 vWorldPosition;

void main() {
    vec4 worldPosition = vec4(aPosition, 1.0);
    vWorldPosition = aPosition;

    gl_Position = uViewProjectionMatrix * worldPosition;
}
`;

const skyFragmentShader = `#version 300 es
precision highp float;

uniform vec3 uColorHorizon;
uniform vec3 uColorZenith;
uniform vec3 uSunPosition;
uniform vec3 uSunColor;
uniform float uSunHaloExponent;
uniform float uSunHaloCutoff;
uniform float uTime;
uniform vec3 uCloudColor;
uniform float uCloudSpeed;
uniform sampler2D uCloudTexture;
uniform float uThemeBlend;

in vec3 vWorldPosition;

out vec4 outColor;

${simplexNoiseGLSL}

float skyFbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat3 rotation = mat3(
         0.00,  0.80,  0.60,
        -0.80,  0.36, -0.48,
        -0.60, -0.48,  0.64
    );
    for (int octave = 0; octave < 5; octave++) {
        value += snoise(p) * amplitude;
        p = rotation * p * 2.03 + vec3(0.17, -0.11, 0.09);
        amplitude *= 0.50;
    }
    return value;
}

void main() {
    vec3 viewDir = normalize(vWorldPosition);
    vec3 sunDir = uSunPosition;

    // Aerial perspective compresses most of the color shift close to the horizon.
    float elevation = clamp(viewDir.y * 0.88 + 0.08, 0.0, 1.0);
    float atmosphere = pow(elevation, mix(0.32, 0.38, uThemeBlend));
    vec3 skyColor = mix(uColorHorizon, uColorZenith, atmosphere);

    // Low sunset light scatters into a broad, smooth column above the sun.
    // This restores the reference's illuminated upper atmosphere without
    // flattening the darker cloud masses at the sides.
    if (uThemeBlend < 1.0) {
        vec2 viewAzimuth = normalize(viewDir.xz + vec2(0.0001));
        vec2 sunAzimuth = normalize(sunDir.xz + vec2(0.0001));
        float azimuthBase = max(dot(viewAzimuth, sunAzimuth), 0.0);
        if (azimuthBase > 0.2848) {
            float azimuthGlow = pow(azimuthBase, 11.0);
            float upperGlow = azimuthGlow * smoothstep(0.34, 0.82, elevation)
                            * (1.0 - uThemeBlend);
            skyColor += uSunColor * upperGlow * 0.50;
        }
    }

    // Theme-specific apparent sun size: a large low sunset disk, tight high day sun.
    float sunDot = dot(viewDir, sunDir);
    float sunRadius = mix(0.9962, 0.99996, uThemeBlend);
    float sunEdge = mix(0.00115, 0.00007, uThemeBlend);
    float sunDisk = smoothstep(sunRadius, min(0.99998, sunRadius + sunEdge), sunDot);
    float sunBase = max(sunDot, 0.0);
    float halo = 0.0;
    if (sunBase > uSunHaloCutoff) {
        halo = pow(sunBase, uSunHaloExponent);
    }
    float innerBloom = 0.0;
    if (sunBase > 0.98045) {
        innerBloom = pow(sunBase, 700.0);
    }
    skyColor += uSunColor * (sunDisk * mix(3.8, 0.12, uThemeBlend)
                           + halo * mix(0.95, 0.24, uThemeBlend)
                           + innerBloom * mix(1.5, 0.90, uThemeBlend));

    // A precomputed tileable field provides five-octave structure for one texture
    // lookup; a second stretched lookup breaks repetition and creates cirrus bands.
    if (viewDir.y > 0.005) {
        // Continuous dome projection avoids a longitude seam through the sun.
        vec2 projected = vec2(viewDir.x * 2.0 + viewDir.z * 0.15,
                              viewDir.y * 2.8 + viewDir.z * 0.20);
        vec2 motion = vec2(-uTime * uCloudSpeed * 0.012, uTime * uCloudSpeed * 0.003);
        vec2 uv = projected + motion;
        // A fixed mip level prevents low-poly sky-dome triangle boundaries from
        // selecting visibly different automatic LODs.
        vec3 primary = textureLod(uCloudTexture, uv, 1.0).rgb;
        vec3 warped = textureLod(uCloudTexture,
            uv * 0.61 + (primary.gb - 0.5) * 0.24 + vec2(0.17, 0.31), 1.0).rgb;
        vec3 stretched = textureLod(uCloudTexture,
            vec2(uv.x * 0.42 + uv.y * 0.08, uv.y * 1.65) - motion * 0.6, 1.0).rgb;
        float textureField = primary.r * 0.40 + warped.r * 0.32
                           + primary.g * 0.12 + stretched.g * 0.22
                           - warped.b * 0.10;
        float organicClouds = 0.5;
        if (uThemeBlend < 1.0) {
            organicClouds = skyFbm(vec3(
                projected * vec2(0.48, 0.62),
                uTime * uCloudSpeed * 0.035
            )) * 0.5 + 0.5;
        }
        float sunsetField = mix(textureField, organicClouds, 0.76);
        float dayTextureField = primary.g * 0.58 + stretched.g * 0.31
                              + warped.g * 0.18 - primary.b * 0.07;
        float cirrusNoise = 0.5;
        float cirrusNoiseFine = 0.5;
        if (uThemeBlend > 0.0) {
            cirrusNoise = skyFbm(vec3(
                projected * vec2(0.30, 0.96) + vec2(viewDir.y * 0.17, 0.07),
                uTime * uCloudSpeed * 0.021 + 8.1
            )) * 0.5 + 0.5;
            cirrusNoiseFine = skyFbm(vec3(
                projected * vec2(0.58, 1.72) + vec2(-0.31, 0.24),
                uTime * uCloudSpeed * 0.033 + 15.3
            )) * 0.5 + 0.5;
        }
        float sunsetDensity = smoothstep(0.30, 0.67, sunsetField);
        // Thin contour ridges through a broad noise field read as cirrus rather
        // than the soft, fog-like slabs produced by thresholding it directly.
        float cirrusRidge = pow(clamp(1.0 - abs(cirrusNoise * 2.0 - 1.0), 0.0, 1.0), 7.0);
        float cirrusFineRidge = pow(clamp(1.0 - abs(cirrusNoiseFine * 2.0 - 1.0), 0.0, 1.0), 9.0);
        float cirrusCoverage = smoothstep(0.34, 0.68, dayTextureField);
        float dayCirrus = max(
            cirrusRidge * mix(0.42, 1.0, cirrusCoverage),
            cirrusFineRidge * mix(0.32, 0.82, cirrusCoverage)
        );
        float dayDensity = smoothstep(0.22, 0.72, dayCirrus);
        float density = mix(sunsetDensity, dayDensity, uThemeBlend);
        float breakup = smoothstep(0.25, 0.73, primary.b * 0.42 + warped.g * 0.34 + stretched.r * 0.24);
        density *= mix(1.0, mix(0.58, 1.0, breakup), uThemeBlend);
        float sunsetEdge = smoothstep(0.295, 0.395, sunsetField) - sunsetDensity;
        float edge = mix(sunsetEdge, dayDensity * (1.0 - dayDensity), uThemeBlend);
        float horizonFade = smoothstep(0.005, mix(0.055, 0.11, uThemeBlend), viewDir.y);
        float alpha = density * horizonFade * mix(0.62, 0.30, uThemeBlend);

        float lightFacing = pow(max(sunDot, 0.0), 10.0);
        vec3 sunsetShadow = mix(uColorZenith * 0.80, vec3(0.09, 0.018, 0.012), density);
        vec3 dayShadow = mix(uCloudColor * 0.88, uCloudColor * 1.05, 0.35 + lightFacing * 0.55);
        vec3 cloudShadow = mix(sunsetShadow, dayShadow, uThemeBlend);
        vec3 cloudLight = mix(
            uCloudColor * (0.48 + lightFacing * 1.05 + (1.0 - viewDir.y) * 0.22),
            uCloudColor * 1.08,
            uThemeBlend
        );
        vec3 cloud = mix(cloudLight, cloudShadow, smoothstep(0.25, 0.9, density));
        float cloudFine = 0.5;
        if (uThemeBlend < 1.0) {
            cloudFine = skyFbm(vec3(
                projected * vec2(1.18, 1.54) + vec2(0.41, -0.26),
                uTime * uCloudSpeed * 0.055 + 21.0
            )) * 0.5 + 0.5;
        }
        cloud *= mix(mix(0.88, 1.12, cloudFine), 1.0, uThemeBlend);
        cloud += uSunColor * edge * pow(max(sunDot, 0.0), 18.0) * mix(2.0, 0.75, uThemeBlend);
        skyColor = mix(skyColor, cloud, alpha);
    }

    outColor = vec4(skyColor, 1.0);
}
`;

const postVertexShader = `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
    vec2 position = vec2(
        gl_VertexID == 1 ? 3.0 : -1.0,
        gl_VertexID == 2 ? 3.0 : -1.0
    );
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const postFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D uSceneTexture;
uniform vec2 uResolution;
uniform float uThemeBlend;

in vec2 vUv;
out vec4 outColor;

vec3 brightSample(vec2 uv, float threshold) {
    vec3 color = texture(uSceneTexture, uv).rgb;
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float contribution = smoothstep(threshold, threshold + 1.1, luminance);
    return color * contribution;
}

void main() {
    vec4 sceneSample = texture(uSceneTexture, vUv);
    vec3 scene = sceneSample.rgb;
    vec2 texel = 1.0 / uResolution;
    float distantWaterMask = smoothstep(0.44, 0.50, vUv.y)
                           * (1.0 - smoothstep(0.60, 0.615, vUv.y));
    if (distantWaterMask > 0.0) {
        vec3 distantBlur = (
            texture(uSceneTexture, vUv + vec2(texel.x * 3.0, 0.0)).rgb
          + texture(uSceneTexture, vUv - vec2(texel.x * 3.0, 0.0)).rgb
          + texture(uSceneTexture, vUv + vec2(0.0, texel.y * 3.0)).rgb
          + texture(uSceneTexture, vUv - vec2(0.0, texel.y * 3.0)).rgb
        ) * 0.25;
        scene = mix(scene, distantBlur,
                    distantWaterMask * mix(0.40, 0.12, uThemeBlend));
    }

    // The mesh silhouette can otherwise read as a thin grey cutout where the
    // distant water meets the sky. Feather only that narrow boundary, then
    // nudge its water-side pixels toward each theme's atmospheric horizon.
    // The band is screen-space stable and ends well before mid/foreground water.
    // The wide screen-space guard avoids four alpha-neighbor reads everywhere
    // else; the silhouette marker still determines the exact feather location.
    if (vUv.y > 0.48 && vUv.y < 0.72) {
        float waterSurface = 1.0 - sceneSample.a;
        float skyAbove = max(
            texture(uSceneTexture, vUv + vec2(0.0, texel.y * 3.0)).a,
            texture(uSceneTexture, vUv + vec2(0.0, texel.y * 8.0)).a
        );
        float waterBelow = max(
            1.0 - texture(uSceneTexture, vUv - vec2(0.0, texel.y * 3.0)).a,
            1.0 - texture(uSceneTexture, vUv - vec2(0.0, texel.y * 8.0)).a
        );
        float horizonWaterEdge = waterSurface * skyAbove;
        float horizonSkyEdge = (1.0 - waterSurface) * waterBelow;
        float horizonFeather = max(horizonWaterEdge, horizonSkyEdge);
        if (horizonFeather > 0.0) {
            vec3 horizonBlur = (
                scene * 2.0
              + texture(uSceneTexture, vUv + vec2(texel.x * 5.0, 0.0)).rgb
              + texture(uSceneTexture, vUv - vec2(texel.x * 5.0, 0.0)).rgb
              + texture(uSceneTexture, vUv + vec2(texel.x * 10.0, 0.0)).rgb
              + texture(uSceneTexture, vUv - vec2(texel.x * 10.0, 0.0)).rgb
              + texture(uSceneTexture, vUv + vec2(0.0, texel.y * 4.0)).rgb
              + texture(uSceneTexture, vUv - vec2(0.0, texel.y * 4.0)).rgb
            ) * 0.125;
            scene = mix(scene, horizonBlur,
                        horizonFeather * mix(0.46, 0.34, uThemeBlend));

            vec3 horizonAtmosphere = mix(vec3(0.80, 0.245, 0.095),
                                         vec3(0.92, 1.02, 1.12), uThemeBlend);
            scene = mix(scene, horizonAtmosphere,
                        horizonWaterEdge * mix(0.055, 0.075, uThemeBlend));
        }
    }

    float waterClarityMask = 1.0 - smoothstep(0.54, 0.61, vUv.y);
    if (waterClarityMask > 0.0) {
        vec3 crossBlur = (
            texture(uSceneTexture, vUv + vec2(texel.x, 0.0)).rgb
          + texture(uSceneTexture, vUv - vec2(texel.x, 0.0)).rgb
          + texture(uSceneTexture, vUv + vec2(0.0, texel.y)).rgb
          + texture(uSceneTexture, vUv - vec2(0.0, texel.y)).rgb
        ) * 0.25;
        scene = max(scene + (scene - crossBlur)
                  * mix(0.08, 0.12, uThemeBlend) * waterClarityMask, vec3(0.0));
    }
    float threshold = mix(0.62, 0.82, uThemeBlend);

    const vec2 diagonalA = vec2(0.70710678, 0.70710678);
    const vec2 diagonalB = vec2(0.70710678, -0.70710678);
    vec3 bloom = vec3(0.0);
    bloom += brightSample(vUv + vec2( 3.0,  0.0) * texel, threshold) * 0.12;
    bloom += brightSample(vUv + vec2(-3.0,  0.0) * texel, threshold) * 0.12;
    bloom += brightSample(vUv + vec2( 0.0,  3.0) * texel, threshold) * 0.12;
    bloom += brightSample(vUv + vec2( 0.0, -3.0) * texel, threshold) * 0.12;
    bloom += brightSample(vUv + diagonalA * 8.0 * texel, threshold) * 0.085;
    bloom += brightSample(vUv - diagonalA * 8.0 * texel, threshold) * 0.085;
    bloom += brightSample(vUv + diagonalB * 8.0 * texel, threshold) * 0.085;
    bloom += brightSample(vUv - diagonalB * 8.0 * texel, threshold) * 0.085;
    bloom += brightSample(vUv + vec2( 18.0,  0.0) * texel, threshold) * 0.045;
    bloom += brightSample(vUv + vec2(-18.0,  0.0) * texel, threshold) * 0.045;
    bloom += brightSample(vUv + vec2( 0.0,  18.0) * texel, threshold) * 0.045;
    bloom += brightSample(vUv + vec2( 0.0, -18.0) * texel, threshold) * 0.045;
    bloom += brightSample(vUv + diagonalA * 42.0 * texel, threshold) * 0.018;
    bloom += brightSample(vUv - diagonalA * 42.0 * texel, threshold) * 0.018;
    bloom += brightSample(vUv + diagonalB * 42.0 * texel, threshold) * 0.018;
    bloom += brightSample(vUv - diagonalB * 42.0 * texel, threshold) * 0.018;

    vec3 color = scene + bloom * mix(0.46, 0.30, uThemeBlend);

    // Filmic highlight shoulder: preserves cloud and wave detail around the sun
    // instead of hard-clipping every value above display white.
    color = max(color, vec3(0.0));
    color = color / (vec3(1.0) + color * mix(0.11, 0.08, uThemeBlend));
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luminance), color, mix(1.10, 0.94, uThemeBlend));
    vec3 contrasted = (color - vec3(0.16)) * 1.18 + vec3(0.16);
    color = mix(max(contrasted, vec3(0.0)), color, uThemeBlend);
    color = pow(color, vec3(mix(0.94, 0.97, uThemeBlend)));

    // Camera-proximate water reflects the darker zenith, not the pale horizon.
    // A gentle foreground grade restores that depth while preserving the bright
    // sun trail and fades out before the middle distance.
    float foregroundMask = 1.0 - smoothstep(0.04, 0.38, vUv.y);
    color *= mix(1.0, mix(0.78, 0.70, uThemeBlend), foregroundMask);

    float oceanMask = 1.0 - smoothstep(0.60, 0.635, vUv.y);
    color += vec3(0.0, 0.0, 0.035) * oceanMask * (1.0 - uThemeBlend);

    float upperSunset = smoothstep(0.78, 0.98, vUv.y) * (1.0 - uThemeBlend);
    float upperCenter = 1.0 - smoothstep(0.22, 0.92, abs(vUv.x - 0.5) * 2.0);
    color += vec3(0.13, 0.14, 0.14) * upperSunset
           * (0.65 + upperCenter * 0.70);

    vec2 centered = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(centered, centered) * mix(0.075, 0.035, uThemeBlend);
    color *= clamp(vignette, 0.82, 1.0);

    outColor = vec4(color, 1.0);
}
`;


function createPlane(width, height, widthSegments, heightSegments, zCenter = 0) {
    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const gridX = Math.floor(widthSegments) || 1;
    const gridY = Math.floor(heightSegments) || 1;
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const segment_width = width / gridX;
    const segment_height = height / gridY;

    const vertexCount = gridX1 * gridY1;
    const vertices = new Float32Array(vertexCount * 3);
    let vertexOffset = 0;

    for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segment_height - heightHalf + zCenter;
        for (let ix = 0; ix < gridX1; ix++) {
            const x = ix * segment_width - widthHalf;
            vertices[vertexOffset++] = x;
            vertices[vertexOffset++] = 0;
            vertices[vertexOffset++] = y;
        }
    }

    // This backend renders a compact triangle list faster than a degenerate
    // strip. The cropped grid fits in 16-bit indices, halving index bandwidth.
    const indexCount = gridY * gridX * 6;
    const IndexArray = vertexCount <= 65535 ? Uint16Array : Uint32Array;
    const indices = new IndexArray(indexCount);
    let indexOffset = 0;
    for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
            const a = ix + gridX1 * iy;
            const b = ix + gridX1 * (iy + 1);
            const c = ix + 1 + gridX1 * (iy + 1);
            const d = ix + 1 + gridX1 * iy;
            indices[indexOffset++] = a;
            indices[indexOffset++] = b;
            indices[indexOffset++] = d;
            indices[indexOffset++] = b;
            indices[indexOffset++] = c;
            indices[indexOffset++] = d;
        }
    }

    return {
        vertices,
        indices
    };
}

function createSphere(radius, widthSegments, heightSegments) {
    widthSegments = Math.max(3, Math.floor(widthSegments) || 8);
    heightSegments = Math.max(2, Math.floor(heightSegments) || 6);

    const indices = [];
    const vertices = [];

    for (let iy = 0; iy <= heightSegments; iy++) {
        const v = iy / heightSegments;
        for (let ix = 0; ix <= widthSegments; ix++) {
            const u = ix / widthSegments;

            const x = -radius * Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI);
            const y = radius * Math.cos(v * Math.PI);
            const z = radius * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI);

            vertices.push(x, y, z);
        }
    }

    for (let iy = 0; iy < heightSegments; iy++) {
        for (let ix = 0; ix < widthSegments; ix++) {
            const a = iy * (widthSegments + 1) + (ix + 1);
            const b = iy * (widthSegments + 1) + ix;
            const c = (iy + 1) * (widthSegments + 1) + ix;
            const d = (iy + 1) * (widthSegments + 1) + (ix + 1);

            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices) // Sphere is small enough for Uint16 usually
    };
}

const container = resolveElement(options.container) || document.body;
const canvas = resolveElement(options.canvas) || document.createElement('canvas');
if (!canvas.parentNode) container.appendChild(canvas);
canvas.id = options.canvasId || (container === document.body ? 'threejsmain' : 'sea-canvas');
canvas.dataset.backgroundTheme = 'sea';
canvas.setAttribute('aria-hidden', 'true');

const gl = canvas.getContext('webgl2', {
    powerPreference: options.powerPreference || 'high-performance',
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false
});

if (!gl) {
    throw new Error('WebGL 2 is required by the sea theme');
}

// Global math access
const { mat4, vec3 } = seaMath;

// --- Helper Functions ---
function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerp3(out, a, b, t) {
    out[0] = lerp(a[0], b[0], t);
    out[1] = lerp(a[1], b[1], t);
    out[2] = lerp(a[2], b[2], t);
    return out;
}

function lerp4(out, a, b, t) {
    out[0] = lerp(a[0], b[0], t);
    out[1] = lerp(a[1], b[1], t);
    out[2] = lerp(a[2], b[2], t);
    out[3] = lerp(a[3], b[3], t);
    return out;
}

async function loadTexture(gl, relativePath) {
    const response = await fetch(relativePath);
    if (!response.ok) throw new Error(`Unable to load texture: ${relativePath}`);
    const bitmap = await createImageBitmap(await response.blob(), {
        colorSpaceConversion: 'none',
        premultiplyAlpha: 'none'
    });
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    bitmap.close();
    return texture;
}

// Start I/O and image decoding before shader compilation and mesh creation so
// startup work overlaps instead of forming a serial critical path.
const assetBaseUrl = new URL(options.assetBaseUrl || 'images/sea/', document.baseURI);
const proceduralTexturesPromise = Promise.all([
    loadTexture(gl, new URL('cloud-noise.png', assetBaseUrl)),
    loadTexture(gl, new URL('ripple-normal.png', assetBaseUrl))
]);

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source.trim());
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vsSrc, fsSrc) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    // Shader objects are no longer needed once the program has linked.
    gl.detachShader(prog, vs);
    gl.detachShader(prog, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(prog));
        gl.deleteProgram(prog);
        return null;
    }
    return prog;
}

function createMesh(gl, geometry) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Positions (Location 0)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    // Indices
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

    // Check index type
    const indexType = geometry.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

    gl.bindVertexArray(null);

    return { vao, count: geometry.indices.length, indexType };
}

// --- Initialization ---

// 1. Programs
const waterProgram = createProgram(gl, waterVertexShader, waterFragmentShader);
const skyProgram = createProgram(gl, skyVertexShader, skyFragmentShader);
const postProgram = createProgram(gl, postVertexShader, postFragmentShader);

// 2. Meshes
// High-density surface geometry keeps short wind waves and silhouettes crisp.
// Extend well behind the camera as well as toward the horizon. The reference
// frames are taller than 16:9, so a short near edge can otherwise reveal the
// underside of the sky sphere along the bottom of the viewport.
const waterGeo = createPlane(140, 120, 384, 384, -20);
const waterMesh = createMesh(gl, waterGeo);

const skyGeo = createSphere(1000, 64, 32);
const skyMesh = createMesh(gl, skyGeo);
const [cloudTexture, rippleTexture] = await proceduralTexturesPromise;
const postVao = gl.createVertexArray();

const postUniforms = {
    uSceneTexture: gl.getUniformLocation(postProgram, 'uSceneTexture'),
    uResolution:   gl.getUniformLocation(postProgram, 'uResolution'),
    uThemeBlend:   gl.getUniformLocation(postProgram, 'uThemeBlend'),
};

const hdrColorSupported = Boolean(gl.getExtension('EXT_color_buffer_float'));
let sceneFramebuffer = null;
let sceneColorTexture = null;
let sceneDepthBuffer = null;

function resizeSceneTarget(width, height) {
    if (sceneFramebuffer) gl.deleteFramebuffer(sceneFramebuffer);
    if (sceneColorTexture) gl.deleteTexture(sceneColorTexture);
    if (sceneDepthBuffer) gl.deleteRenderbuffer(sceneDepthBuffer);

    sceneFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);

    sceneColorTexture = gl.createTexture();
    // Keep the scene target permanently on its sampler unit. Selecting the unit
    // before texture setup also prevents a resize from replacing the ripple map
    // currently bound on unit 2.
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, sceneColorTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        hdrColorSupported ? gl.RGBA16F : gl.RGBA8,
        width,
        height,
        0,
        gl.RGBA,
        hdrColorSupported ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneColorTexture, 0);

    sceneDepthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, sceneDepthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, sceneDepthBuffer);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('Scene framebuffer is incomplete');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

// 3. Cached Uniform Locations — looked up once at init, not per frame
const waterUniforms = {
    uViewProjectionMatrix: gl.getUniformLocation(waterProgram, 'uViewProjectionMatrix'),
    uTime:              gl.getUniformLocation(waterProgram, 'uTime'),
    uWaveScale:         gl.getUniformLocation(waterProgram, 'uWaveScale'),
    uWavePhasesA:       gl.getUniformLocation(waterProgram, 'uWavePhasesA'),
    uWavePhasesB:       gl.getUniformLocation(waterProgram, 'uWavePhasesB'),
    uColorDeep:         gl.getUniformLocation(waterProgram, 'uColorDeep'),
    uColorShallow:      gl.getUniformLocation(waterProgram, 'uColorShallow'),
    uColorHorizon:      gl.getUniformLocation(waterProgram, 'uColorHorizon'),
    uColorZenith:       gl.getUniformLocation(waterProgram, 'uColorZenith'),
    uFogColor:          gl.getUniformLocation(waterProgram, 'uFogColor'),
    uFogDensitySquared: gl.getUniformLocation(waterProgram, 'uFogDensitySquared'),
    uSunDirection:      gl.getUniformLocation(waterProgram, 'uSunDirection'),
    uSunPathDirection:  gl.getUniformLocation(waterProgram, 'uSunPathDirection'),
    uSunColor:          gl.getUniformLocation(waterProgram, 'uSunColor'),
    uFoamSkyAmbient:    gl.getUniformLocation(waterProgram, 'uFoamSkyAmbient'),
    uSpecularStrength:  gl.getUniformLocation(waterProgram, 'uSpecularStrength'),
    uShininess:         gl.getUniformLocation(waterProgram, 'uShininess'),
    uSpecularCutoff:    gl.getUniformLocation(waterProgram, 'uSpecularCutoff'),
    uCameraPosition:    gl.getUniformLocation(waterProgram, 'uCameraPosition'),
    uThemeBlend:        gl.getUniformLocation(waterProgram, 'uThemeBlend'),
    uRippleTexture:     gl.getUniformLocation(waterProgram, 'uRippleTexture'),
    uCloudTexture:      gl.getUniformLocation(waterProgram, 'uCloudTexture'),
    uCloudColor:        gl.getUniformLocation(waterProgram, 'uCloudColor'),
    uCloudSpeed:        gl.getUniformLocation(waterProgram, 'uCloudSpeed'),
};

const skyUniforms = {
    uViewProjectionMatrix: gl.getUniformLocation(skyProgram, 'uViewProjectionMatrix'),
    uTime:              gl.getUniformLocation(skyProgram, 'uTime'),
    uColorHorizon:      gl.getUniformLocation(skyProgram, 'uColorHorizon'),
    uColorZenith:       gl.getUniformLocation(skyProgram, 'uColorZenith'),
    uSunPosition:       gl.getUniformLocation(skyProgram, 'uSunPosition'),
    uSunColor:          gl.getUniformLocation(skyProgram, 'uSunColor'),
    uSunHaloExponent:   gl.getUniformLocation(skyProgram, 'uSunHaloExponent'),
    uSunHaloCutoff:     gl.getUniformLocation(skyProgram, 'uSunHaloCutoff'),
    uCloudColor:        gl.getUniformLocation(skyProgram, 'uCloudColor'),
    uCloudSpeed:        gl.getUniformLocation(skyProgram, 'uCloudSpeed'),
    uCloudTexture:      gl.getUniformLocation(skyProgram, 'uCloudTexture'),
    uThemeBlend:        gl.getUniformLocation(skyProgram, 'uThemeBlend'),
};

// 4. State & Camera
const state = {
    startTime: performance.now(),
    camera: {
        pos: vec3.fromValues(0, 2.2, 15),
        target: vec3.fromValues(0, 0, 0),
        up: vec3.fromValues(0, 1, 0),
        fov: 55 * Math.PI / 180,
        zNear: 0.1,
        zFar: 2000.0, // Should be large mainly so water doesn't clip, sky is infinite via matrix magic ideally, but large sphere is fine too.
        projection: mat4.create(),
        view: mat4.create(),
        viewProjection: mat4.create(),
        skyView: mat4.create(), // NEW: Rotation only
        skyViewProjection: mat4.create(),
    },
    width: window.innerWidth,
    height: window.innerHeight
};

// --- Theme Configuration ---
const themes = {
    dark: {
        // Sunset reference: hot horizon, nearly black upper atmosphere and water.
        skyHorizon: [0.86, 0.33, 0.13],
        skyZenith: [0.28, 0.08, 0.06],
        sunColor: [1.0, 0.42, 0.055],
        waterDeep: [0.006, 0.0015, 0.008],
        waterShallow: [0.10, 0.024, 0.02],
        fogColor: [0.78, 0.24, 0.10],
        fogDensity: 0.022,
        clearColor: [0.075, 0.012, 0.01, 1],
        sunPosition: [0.0, -0.012, -1.0],
        specularStrength: 2.4,
        shininess: 650.0,
        cloudColor: [0.84, 0.21, 0.05],
        cloudSpeed: 0.22,
        themeBlend: 0.0
    },
    light: {
        // Day reference: pale aerial perspective and restrained blue water.
        skyHorizon: [1.47, 1.41, 1.35],
        skyZenith: [0.06, 0.30, 0.58],
        sunColor: [1.0, 0.98, 0.88],
        waterDeep: [0.004, 0.045, 0.08],
        waterShallow: [0.012, 0.16, 0.22],
        fogColor: [0.72, 0.86, 1.0],
        fogDensity: 0.010,
        clearColor: [0.68, 0.80, 0.89, 1],
        sunPosition: [0.0, 0.30, -1.0],
        specularStrength: 2.0,
        shininess: 1000.0,
        cloudColor: [0.96, 0.98, 1.0],
        cloudSpeed: 0.30,
        themeBlend: 1.0
    }
};

const requestedTheme = options.theme || new URLSearchParams(window.location.search).get('theme');
const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
let activeTheme = requestedTheme === 'light' || requestedTheme === 'dark'
    ? requestedTheme
    : systemTheme;
// Deep copy for current state
const themeState = JSON.parse(JSON.stringify(themes[activeTheme]));
let themeTransitionSeconds = 0;
let themeUniformsDirty = true;

function updateThemeValues(deltaSeconds) {
    if (themeTransitionSeconds <= 0) return;

    const target = themes[activeTheme];
    const dt = Math.min(1, deltaSeconds / themeTransitionSeconds);

    lerp3(themeState.skyHorizon, themeState.skyHorizon, target.skyHorizon, dt);
    lerp3(themeState.skyZenith, themeState.skyZenith, target.skyZenith, dt);
    lerp3(themeState.sunColor, themeState.sunColor, target.sunColor, dt);
    lerp3(themeState.waterDeep, themeState.waterDeep, target.waterDeep, dt);
    lerp3(themeState.waterShallow, themeState.waterShallow, target.waterShallow, dt);
    lerp3(themeState.fogColor, themeState.fogColor, target.fogColor, dt);
    themeState.fogDensity = lerp(themeState.fogDensity, target.fogDensity, dt);
    lerp4(themeState.clearColor, themeState.clearColor, target.clearColor, dt);
    lerp3(themeState.sunPosition, themeState.sunPosition, target.sunPosition, dt);
    themeState.specularStrength = lerp(themeState.specularStrength, target.specularStrength, dt);
    themeState.shininess = lerp(themeState.shininess, target.shininess, dt);
    lerp3(themeState.cloudColor, themeState.cloudColor, target.cloudColor, dt);
    themeState.cloudSpeed = lerp(themeState.cloudSpeed, target.cloudSpeed, dt);
    themeState.themeBlend = lerp(themeState.themeBlend, target.themeBlend, dt);

    themeTransitionSeconds = Math.max(0, themeTransitionSeconds - deltaSeconds);
    themeUniformsDirty = true;

    if (themeTransitionSeconds === 0) {
        for (const key of Object.keys(target)) {
            if (Array.isArray(target[key])) {
                themeState[key].splice(0, target[key].length, ...target[key]);
            } else {
                themeState[key] = target[key];
            }
        }
    }
}

// Toggle Handler
const toggleBtn = resolveElement(options.themeToggle);
const handleThemeToggle = () => {
    activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
    themeTransitionSeconds = 0.9;
    document.body.classList.toggle('light-mode', activeTheme === 'light');
    toggleBtn.textContent = activeTheme === 'dark' ? '☀️' : '🌙';
};
if (toggleBtn) {
    document.body.classList.toggle('light-mode', activeTheme === 'light');
    toggleBtn.textContent = activeTheme === 'dark' ? '☀️' : '🌙';
    toggleBtn.addEventListener('click', handleThemeToggle);
}

const colorSchemeQuery = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: light)')
    : null;
const handleColorSchemeChange = (event) => {
    activeTheme = event.matches ? 'light' : 'dark';
    themeTransitionSeconds = 0.9;
};
if (!toggleBtn && !requestedTheme && colorSchemeQuery) {
    if (colorSchemeQuery.addEventListener) {
        colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
    } else if (colorSchemeQuery.addListener) {
        colorSchemeQuery.addListener(handleColorSchemeChange);
    }
}

// Cached view offset — avoids a Float32Array allocation every frame
const viewOffset = vec3.fromValues(0, -3, -15);
const normalizedSunDirection = vec3.create();
const sunPathDirection = new Float32Array(2);
const foamSkyAmbient = vec3.create();
const wavePhasesA = new Float32Array(4);
const wavePhasesB = new Float32Array(3);
let projectionUniformsDirty = true;

function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = state.width;
    canvas.height = state.height;
    gl.viewport(0, 0, state.width, state.height);
    resizeSceneTarget(state.width, state.height);
    mat4.perspective(
        state.camera.projection,
        state.camera.fov,
        state.width / state.height,
        state.camera.zNear,
        state.camera.zFar
    );
    projectionUniformsDirty = true;
}
window.addEventListener('resize', resize, { passive: true });
resize();

// One-time GL state (never changes)
gl.enable(gl.DEPTH_TEST);
gl.cullFace(gl.BACK);
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, cloudTexture);
gl.useProgram(skyProgram);
gl.uniform1i(skyUniforms.uCloudTexture, 1);
gl.useProgram(waterProgram);
gl.uniform1i(waterUniforms.uCloudTexture, 1);
gl.activeTexture(gl.TEXTURE2);
gl.bindTexture(gl.TEXTURE_2D, rippleTexture);
gl.useProgram(waterProgram);
gl.uniform1i(waterUniforms.uRippleTexture, 2);
gl.useProgram(postProgram);
gl.uniform1i(postUniforms.uSceneTexture, 3);

let previousFrameTime = performance.now();
let animationFrame = null;
let animationRunning = true;
function render(scheduleNext = true) {
    const now = performance.now();
    const time = (now - state.startTime) / 1000;
    const deltaSeconds = Math.min((now - previousFrameTime) / 1000, 0.25);
    previousFrameTime = now;

    // Theme Update
    updateThemeValues(deltaSeconds);

    // Camera Animation
    state.camera.pos[1] = 2.2 + Math.sin(time * 0.5) * 0.08;
    state.camera.pos[0] = Math.sin(time * 0.3) * 0.2;

    // Each reference uses a subtly different camera pitch. Interpolate the
    // horizon position along with the rest of the theme rather than snapping it.
    viewOffset[1] = lerp(-2.22, -1.77, themeState.themeBlend);
    vec3.add(state.camera.target, state.camera.pos, viewOffset);

    mat4.lookAt(state.camera.view, state.camera.pos, state.camera.target, state.camera.up);
    mat4.multiply(state.camera.viewProjection, state.camera.projection, state.camera.view);

    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
    gl.viewport(0, 0, state.width, state.height);

    // Clear
    if (themeUniformsDirty) {
        vec3.normalize(normalizedSunDirection, themeState.sunPosition);
        const sunPathX = normalizedSunDirection[0] + 0.001;
        const sunPathZ = normalizedSunDirection[2] + 0.001;
        const inverseSunPathLength = 1 / Math.hypot(sunPathX, sunPathZ);
        sunPathDirection[0] = sunPathX * inverseSunPathLength;
        sunPathDirection[1] = sunPathZ * inverseSunPathLength;
        for (let i = 0; i < 3; i++) {
            foamSkyAmbient[i] = lerp(themeState.skyHorizon[i], themeState.skyZenith[i], 0.45) * 0.5;
        }
        gl.clearColor(themeState.clearColor[0], themeState.clearColor[1], themeState.clearColor[2], themeState.clearColor[3]);
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- Render Water first (writes depth buffer) ---
    // Sky is drawn second so its fragments behind the water surface are culled for free.
    gl.useProgram(waterProgram);
    gl.enable(gl.CULL_FACE);

    gl.uniformMatrix4fv(waterUniforms.uViewProjectionMatrix, false, state.camera.viewProjection);
    gl.uniform1f(waterUniforms.uTime, time);
    wavePhasesA[0] = time * 1.0490479053;
    wavePhasesA[1] = time * 1.3088311039;
    wavePhasesA[2] = time * 1.5763095602;
    wavePhasesA[3] = time * 1.8493242009;
    wavePhasesB[0] = time * 2.4331050121;
    wavePhasesB[1] = time * 2.9240383034;
    wavePhasesB[2] = time * 3.5816303745;
    gl.uniform4fv(waterUniforms.uWavePhasesA, wavePhasesA);
    gl.uniform3fv(waterUniforms.uWavePhasesB, wavePhasesB);
    gl.uniform3fv(waterUniforms.uCameraPosition, state.camera.pos);
    if (themeUniformsDirty) {
        gl.uniform3fv(waterUniforms.uColorDeep, themeState.waterDeep);
        gl.uniform3fv(waterUniforms.uColorShallow, themeState.waterShallow);
        gl.uniform3fv(waterUniforms.uColorHorizon, themeState.skyHorizon);
        gl.uniform3fv(waterUniforms.uColorZenith, themeState.skyZenith);
        gl.uniform3fv(waterUniforms.uFogColor, themeState.fogColor);
        gl.uniform1f(waterUniforms.uFogDensitySquared, themeState.fogDensity * themeState.fogDensity);
        gl.uniform3fv(waterUniforms.uSunDirection, normalizedSunDirection);
        gl.uniform2fv(waterUniforms.uSunPathDirection, sunPathDirection);
        gl.uniform3fv(waterUniforms.uSunColor, themeState.sunColor);
        gl.uniform3fv(waterUniforms.uFoamSkyAmbient, foamSkyAmbient);
        gl.uniform1f(waterUniforms.uSpecularStrength, themeState.specularStrength);
        gl.uniform1f(waterUniforms.uShininess, themeState.shininess);
        gl.uniform1f(waterUniforms.uSpecularCutoff,
                     Math.pow(0.000001, 1 / themeState.shininess));
        gl.uniform1f(waterUniforms.uThemeBlend, themeState.themeBlend);
        gl.uniform1f(waterUniforms.uWaveScale, lerp(1.0, 0.52, themeState.themeBlend));
        gl.uniform3fv(waterUniforms.uCloudColor, themeState.cloudColor);
        gl.uniform1f(waterUniforms.uCloudSpeed, themeState.cloudSpeed);
    }

    gl.bindVertexArray(waterMesh.vao);
    gl.drawElements(gl.TRIANGLES, waterMesh.count, waterMesh.indexType, 0);

    // --- Render Sky second (depth-culled behind water, no depth writes needed) ---
    gl.useProgram(skyProgram);
    gl.disable(gl.CULL_FACE);
    gl.depthMask(false); // Sky is background — writing depth would be wasteful

    // SKY VIEW MATRIX (Rotation Only — strips translation so sky stays at infinity)
    mat4.copy(state.camera.skyView, state.camera.view);
    state.camera.skyView[12] = 0;
    state.camera.skyView[13] = 0;
    state.camera.skyView[14] = 0;
    mat4.multiply(state.camera.skyViewProjection, state.camera.projection, state.camera.skyView);

    gl.uniformMatrix4fv(skyUniforms.uViewProjectionMatrix, false, state.camera.skyViewProjection);
    gl.uniform1f(skyUniforms.uTime, time);
    if (themeUniformsDirty) {
        gl.uniform3fv(skyUniforms.uColorHorizon, themeState.skyHorizon);
        gl.uniform3fv(skyUniforms.uColorZenith, themeState.skyZenith);
        gl.uniform3fv(skyUniforms.uSunPosition, normalizedSunDirection);
        gl.uniform3fv(skyUniforms.uSunColor, themeState.sunColor);
        const sunHaloExponent = lerp(80.0, 120.0, themeState.themeBlend);
        gl.uniform1f(skyUniforms.uSunHaloExponent, sunHaloExponent);
        gl.uniform1f(skyUniforms.uSunHaloCutoff,
                     Math.pow(0.000001, 1 / sunHaloExponent));
        gl.uniform3fv(skyUniforms.uCloudColor, themeState.cloudColor);
        gl.uniform1f(skyUniforms.uCloudSpeed, themeState.cloudSpeed);
        gl.uniform1f(skyUniforms.uThemeBlend, themeState.themeBlend);
    }

    gl.bindVertexArray(skyMesh.vao);
    gl.drawElements(gl.TRIANGLES, skyMesh.count, skyMesh.indexType, 0);

    gl.depthMask(true); // Restore for next frame's clear

    // --- Filmic composite ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(postProgram);
    if (projectionUniformsDirty) {
        gl.uniform2f(postUniforms.uResolution, state.width, state.height);
    }
    if (themeUniformsDirty) {
        gl.uniform1f(postUniforms.uThemeBlend, themeState.themeBlend);
    }
    gl.bindVertexArray(postVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.DEPTH_TEST);

    projectionUniformsDirty = false;
    themeUniformsDirty = false;

    sea.stats.fps = deltaSeconds > 0 ? 1 / deltaSeconds : 0;
    if (scheduleNext && animationRunning && !sea.prefersReducedMotion()) {
        animationFrame = requestAnimationFrame(render);
    }
}

render();

return {
    canvas,
    gl,
    renderOnce: () => render(false),
    pause: () => {
        animationRunning = false;
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    },
    resume: () => {
        if (animationRunning) return;
        animationRunning = true;
        previousFrameTime = performance.now();
        render();
    },
    destroy: () => {
        animationRunning = false;
        if (animationFrame !== null) cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', resize);
        if (toggleBtn) toggleBtn.removeEventListener('click', handleThemeToggle);
        if (!toggleBtn && !requestedTheme && colorSchemeQuery) {
            if (colorSchemeQuery.removeEventListener) {
                colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
            } else if (colorSchemeQuery.removeListener) {
                colorSchemeQuery.removeListener(handleColorSchemeChange);
            }
        }
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) loseContext.loseContext();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
};

}

window.sea = sea;
// site.js deliberately talks to a generic "sky" global. This alias is the
// compatibility seam that lets sky.js and sea.js be swapped at the script tag.
window.sky = sea;

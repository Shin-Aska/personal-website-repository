// Run with Playwright available: node --test tools/tests/sea-fft.test.cjs
// Uses the existing Chrome installation; does not download browsers or packages.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname,'../..');
let browser, server, origin;
before(async () => {
    server = createServer(async (request,response) => {
        const file = path.resolve(root,'.'+new URL(request.url,'http://localhost').pathname);
        if (!file.startsWith(root+path.sep)) { response.writeHead(403).end(); return; }
        try {
            let data = await readFile(file);
            const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'};
            const headers = {'Content-Type':mime[path.extname(file)] || 'application/octet-stream'};
            if (path.extname(file) === '.html') {
                data = data.toString().replace(/<\?php[\s\S]*?\?>/g,php => php.includes('echo $token') ? 'sea-test-nonce' : '');
                if (path.basename(file) !== 'sea-compare.html') headers['Content-Security-Policy'] = "script-src 'self' 'nonce-sea-test-nonce' 'strict-dynamic'";
            }
            response.writeHead(200,headers).end(data);
        } catch { response.writeHead(404).end(); }
    });
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({channel:'chrome',headless:true});
});
after(async () => {
    await browser?.close();
    if (server) await new Promise(resolve => server.close(resolve));
});

async function open(t, query = '') {
    const context = await browser.newContext({viewport:{width:800,height:600},reducedMotion:'reduce'});
    t.after(() => context.close());
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror',error => errors.push(error.message));
    await page.goto(`${origin}/default/sea-compare.html${query}`);
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    assert.equal(await page.locator('#error').isVisible(),false,await page.locator('#error').innerText());
    return {page,errors};
}

test('GPU inverse FFT agrees with a direct 2D Fourier sum for both packed complex fields', async t => {
    const {page} = await open(t);
    const results = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('Float render targets required for GPU tests.');
        const results = [];
        for (const size of [8,16]) {
            const input = new Float32Array(size*size*4);
            for (let i = 0; i < input.length; i++) input[i] = Math.sin(i*1.37)*0.1+Math.cos(i*0.19)*0.03;
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,texture);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,size,size,0,gl.RGBA,gl.FLOAT,input);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
            const fft = SeaFFT.createInverseFFT(gl,size);
            const output = fft.transform(texture);
            const pixels = new Float32Array(input.length);
            gl.bindFramebuffer(gl.FRAMEBUFFER,output.framebuffer);
            gl.readPixels(0,0,size,size,gl.RGBA,gl.FLOAT,pixels);
            let maxError = 0;
            for (let z = 0; z < size; z++) for (let x = 0; x < size; x++) {
                for (const channel of [0,2]) {
                    let real = 0, imaginary = 0;
                    for (let kz = 0; kz < size; kz++) for (let kx = 0; kx < size; kx++) {
                        const offset = (kz*size+kx)*4+channel;
                        const angle = 2*Math.PI*(kx*x+kz*z)/size;
                        real += input[offset]*Math.cos(angle)-input[offset+1]*Math.sin(angle);
                        imaginary += input[offset]*Math.sin(angle)+input[offset+1]*Math.cos(angle);
                    }
                    const offset = (z*size+x)*4+channel;
                    maxError = Math.max(maxError,Math.abs(pixels[offset]-real),Math.abs(pixels[offset+1]-imaginary));
                }
            }
            results.push({size,maxError,error:gl.getError()});
            fft.destroy(); gl.deleteTexture(texture);
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return results;
    });
    for (const result of results) {
        assert.ok(result.maxError < 0.0002,JSON.stringify(result));
        assert.equal(result.error,0);
    }
});

test('spectral evolution produces finite real displacement and unit normals at both resolutions', async t => {
    const {page} = await open(t);
    const results = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        gl.getExtension('EXT_color_buffer_float');
        const results = [];
        for (const size of [128,256]) {
            const first = SeaFFT.createSpectrum(size), second = SeaFFT.createSpectrum(size);
            if (!first.every((v,i) => Number.isFinite(v) && v === second[i])) throw new Error('Invalid or nondeterministic spectrum.');
            const simulation = SeaFFT.createSimulation(gl,size);
            for (const time of [0,7.25]) {
                const field = simulation.update(time);
                const pixels = new Float32Array(size*size*4);
                gl.bindFramebuffer(gl.FRAMEBUFFER,field.framebuffer);
                gl.readPixels(0,0,size,size,gl.RGBA,gl.FLOAT,pixels);
                let energy = 0, imaginary = 0, finite = true;
                for (let i = 0; i < pixels.length; i += 4) {
                    energy += pixels[i]*pixels[i]; imaginary = Math.max(imaginary,Math.abs(pixels[i+3]));
                    for (let c = 0; c < 4; c++) finite &&= Number.isFinite(pixels[i+c]);
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER,simulation.normals.framebuffer);
                gl.readPixels(0,0,size,size,gl.RGBA,gl.FLOAT,pixels);
                let normalError = 0, foamMin = 1, foamMax = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    normalError = Math.max(normalError,Math.abs(Math.hypot(pixels[i],pixels[i+1],pixels[i+2])-1));
                    foamMin = Math.min(foamMin,pixels[i+3]); foamMax = Math.max(foamMax,pixels[i+3]);
                }
                results.push({size,time,rms:Math.sqrt(energy/(size*size)),imaginary,finite,normalError,foamMin,foamMax,error:gl.getError()});
            }
            simulation.destroy();
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return results;
    });
    for (const result of results) {
        assert.equal(result.finite,true);
        assert.ok(result.rms > 0.12 && result.rms < 0.36,JSON.stringify(result));
        assert.ok(result.imaginary < 0.00001,JSON.stringify(result));
        assert.ok(result.normalError < 0.0001,JSON.stringify(result));
        assert.ok(result.foamMin >= 0 && result.foamMax <= 0.451);
        assert.equal(result.error,0);
    }
    assert.ok(Math.abs(results[0].rms-results[2].rms) < 0.025,'Grid resolution must not materially change wave energy.');
});

test('comparison switches original/FFT, lighting, grid, blur, and resize without replacing the website theme', async t => {
    const {page,errors} = await open(t,'?resolution=128');
    assert.equal(await page.locator('#blur').isChecked(),false);
    assert.equal(await page.locator('#animate').isChecked(),false,'Respect reduced motion initially.');
    assert.equal(await page.locator('#readability').isVisible(),false);
    await page.evaluate(() => sessionStorage.setItem('backgroundTheme','sky'));
    for (const renderer of ['original','fft','original','fft']) {
        await page.selectOption('#renderer',renderer);
        await page.waitForFunction(() => !document.getElementById('renderer').disabled);
        assert.equal(await page.locator('#ocean canvas').count(),1);
        assert.equal(await page.locator('#error').isVisible(),false);
        assert.equal(await page.evaluate(() => window.sky === window.sea),true);
        assert.equal(await page.evaluate(() => sessionStorage.getItem('backgroundTheme')),'sky');
    }
    await page.selectOption('#resolution','256');
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    await page.selectOption('#theme','light');
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    await page.check('#blur');
    assert.equal(await page.locator('#readability').isVisible(),true);
    await page.uncheck('#blur');
    await page.setViewportSize({width:390,height:844});
    await page.waitForFunction(() => document.querySelector('#ocean canvas').width === 390);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
    assert.match(page.url(),/renderer=fft/);
    assert.match(page.url(),/resolution=256/);
    assert.match(page.url(),/theme=light/);
    assert.match(page.url(),/blur=off/);
    assert.deepEqual(errors,[]);
});

test('an unsupported FFT GPU leaves a clear error and a working original renderer', async t => {
    const context = await browser.newContext({viewport:{width:800,height:600},reducedMotion:'reduce'});
    t.after(() => context.close());
    const page = await context.newPage();
    await page.addInitScript(() => {
        const getExtension = WebGL2RenderingContext.prototype.getExtension;
        WebGL2RenderingContext.prototype.getExtension = function(name) {
            return name === 'EXT_color_buffer_float' ? null : getExtension.call(this,name);
        };
    });
    await page.goto(`${origin}/default/sea-compare.html`);
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    assert.match(await page.locator('#error').innerText(),/floating-point/);
    assert.equal(await page.locator('#ocean canvas').count(),0);
    await page.selectOption('#renderer','original');
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    assert.equal(await page.locator('#error').isVisible(),false);
    assert.equal(await page.locator('#ocean canvas').count(),1);
});

test('live comparison records both renderers and pauses when reduced motion changes', async t => {
    const {page,errors} = await open(t,'?resolution=128');
    await page.check('#animate');
    await page.waitForFunction(() => {
        const row = document.querySelector('tr[data-active="true"]');
        return row && /^\d+$/.test(row.cells[1].textContent);
    });
    await page.selectOption('#renderer','original');
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    await page.waitForFunction(() => {
        const rows = [...document.querySelectorAll('#measurements tr')];
        return rows.slice(0,2).every(row => /^\d+$/.test(row.cells[1].textContent));
    });
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(() => !document.getElementById('animate').checked);
    assert.match(await page.locator('#status').innerText(),/still frame/);
    assert.deepEqual(errors,[]);
});

test('FFT controls update the existing context, survive reload, and reset to defaults', async t => {
    const {page,errors} = await open(t);
    await page.evaluate(() => { window.initialComparisonCanvas = document.querySelector('#ocean canvas'); });
    const values = {height:2,windSpeed:9,windDirection:110,choppiness:1.5,patchSize:96,damping:0.25,speed:0.5,foam:0.5,roughness:0.3};
    for (const [name,value] of Object.entries(values)) {
        await page.locator(`#fft-${name}`).evaluate((input,value) => {
            input.value = value;
            input.dispatchEvent(new Event('input',{bubbles:true}));
            input.dispatchEvent(new Event('change',{bubbles:true}));
        },value);
    }
    assert.equal(await page.evaluate(() => window.initialComparisonCanvas === document.querySelector('#ocean canvas')),true);
    for (const [name,value] of Object.entries(values)) assert.equal(new URL(page.url()).searchParams.get(name),String(value));
    await page.reload();
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    for (const [name,value] of Object.entries(values)) assert.equal(await page.locator(`#fft-${name}`).inputValue(),String(value));
    await page.selectOption('#renderer','original');
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    assert.equal(await page.locator('#fft-height').isDisabled(),true);
    await page.selectOption('#renderer','fft');
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    assert.equal(await page.locator('#fft-height').inputValue(),'2');
    await page.locator('#reset-fft').click();
    assert.equal(await page.locator('#fft-height').inputValue(),'1.6');
    assert.equal(new URL(page.url()).searchParams.has('height'),false);
    assert.equal(new URL(page.url()).searchParams.has('windSpeed'),false);
    assert.equal(await page.locator('#error').isVisible(),false);
    assert.deepEqual(errors,[]);
});

test('live height, wind, patch and speed changes produce valid fields, including a flat sea', async t => {
    const {page} = await open(t);
    const result = await page.evaluate(async () => {
        const host = document.createElement('div');
        const renderer = await SeaFFT.createRenderer({container:host,animate:false,resolution:128,parameters:{height:0,speed:0}});
        const {gl,simulation} = renderer;
        const canvas = renderer.canvas;
        function readNormals() {
            const pixels = new Float32Array(128*128*4);
            gl.bindFramebuffer(gl.FRAMEBUFFER,simulation.normals.framebuffer);
            gl.readPixels(0,0,128,128,gl.RGBA,gl.FLOAT,pixels);
            return pixels;
        }
        const flat = readNormals();
        const isFlat = flat.every((value,index) => Math.abs(value-(index%4 === 1 ? 1 : 0)) < 1e-6);
        renderer.setParameters({height:3,choppiness:2,windSpeed:15,patchSize:32,damping:0.03});
        renderer.renderOnce(1);
        const rough = readNormals();
        const parameters = renderer.getParameters();
        renderer.renderOnce(2);
        const stopped = readNormals();
        const stationary = stopped.every((value,index) => value === rough[index]);
        renderer.setParameters({speed:1});
        renderer.renderOnce(3);
        const moving = readNormals();
        const changed = moving.some((value,index) => Math.abs(value-stopped[index]) > 0.01);
        const result = {isFlat,stationary,changed,finite:rough.every(Number.isFinite),length:simulation.length,
            sameCanvas:renderer.canvas === canvas,parameters,error:gl.getError()};
        renderer.destroy();
        return result;
    });
    assert.equal(result.isFlat,true);
    assert.equal(result.stationary,true);
    assert.equal(result.changed,true);
    assert.equal(result.finite,true);
    assert.equal(result.length,32);
    assert.equal(result.sameCanvas,true);
    assert.equal(result.parameters.height,3);
    assert.equal(result.error,0);
});

test('FFT sunset keeps the original large sun at the horizon', async t => {
    const {page} = await open(t);
    const bounds = await page.evaluate(async () => {
        const host = document.createElement('div');
        function brightSkyBounds(renderer) {
            renderer.pause(); renderer.renderOnce(0);
            const {gl,canvas} = renderer;
            const pixels = new Uint8Array(canvas.width*canvas.height*4);
            gl.bindFramebuffer(gl.FRAMEBUFFER,null);
            gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
            let left = canvas.width, right = -1, top = -1;
            // Restrict to sky; reflections below the horizon are a different model.
            for (let y = Math.ceil(canvas.height*0.64); y < canvas.height; y++) {
                for (let x = Math.floor(canvas.width*0.3); x < canvas.width*0.7; x++) {
                    const i = (y*canvas.width+x)*4;
                    if (pixels[i] > 240 && pixels[i+1] > 200) {
                        left = Math.min(left,x); right = Math.max(right,x); top = Math.max(top,y);
                    }
                }
            }
            const bounds = {left,right,top};
            renderer.destroy(); return bounds;
        }
        const original = brightSkyBounds(await createGerstnerSeaRenderer({container:host,theme:'dark'}));
        const fft = brightSkyBounds(await SeaFFT.createRenderer({container:host,theme:'dark',animate:false}));
        return {original,fft};
    });
    assert.ok(bounds.fft.right-bounds.fft.left > 60,JSON.stringify(bounds));
    for (const edge of ['left','right','top']) assert.ok(Math.abs(bounds.fft[edge]-bounds.original[edge]) < 15,JSON.stringify(bounds));
});

async function openSite(t,{colorScheme = 'dark',floatTargets = true,query = '',reducedMotion = 'reduce'} = {}) {
    const context = await browser.newContext({viewport:{width:1000,height:720},reducedMotion,colorScheme});
    t.after(() => context.close());
    if (!floatTargets) await context.addInitScript(() => {
        const getExtension = WebGL2RenderingContext.prototype.getExtension;
        WebGL2RenderingContext.prototype.getExtension = function(name) {
            return name === 'EXT_color_buffer_float' ? null : getExtension.call(this,name);
        };
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror',error => errors.push(error.message));
    await page.goto(`${origin}/default/index.html${query}`);
    await page.waitForFunction(() => document.documentElement.dataset.backgroundTheme && document.querySelector('.perf-badge'));
    return {page,errors};
}

test('production sea.js uses the approved FFT presets and follows system lighting without a new canvas', async t => {
    const {page,errors} = await openSite(t);
    const read = () => page.evaluate(() => ({
        theme:window.sea.renderer.getTheme(),parameters:window.sea.renderer.getParameters(),
        resolution:window.sea.renderer.simulation.size,canvasId:window.sea.canvas.id,
        renderer:window.sea.canvas.dataset.oceanRenderer,overlay:window.sea.backgroundOverlayEnabled,
        background:document.documentElement.dataset.backgroundTheme
    }));
    assert.deepEqual(await read(),{
        theme:'dark',parameters:{height:1.6,windSpeed:6,windDirection:194,choppiness:2,patchSize:64,damping:0.11,speed:1.35,foam:0.4,roughness:0.36},
        resolution:256,canvasId:'threejsmain',renderer:'fft',overlay:true,background:'sea'
    });
    assert.match(await page.evaluate(() => getComputedStyle(document.body,'::before').backdropFilter),/blur\(16px\)/);
    assert.equal(await page.evaluate(() => window.sea.stats.fps),0);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForFunction(() => window.sea.stats.fps > 0);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(() => window.sea.stats.fps === 0);
    await page.evaluate(() => { window.initialSeaCanvas = window.sea.canvas; });
    await page.emulateMedia({colorScheme:'light'});
    await page.waitForFunction(() => window.sea.renderer.getTheme() === 'light');
    assert.equal((await read()).parameters.roughness,0.14);
    assert.match(await page.evaluate(() => getComputedStyle(document.body,'::before').backdropFilter),/blur\(14px\)/);
    assert.equal(await page.evaluate(() => window.initialSeaCanvas === window.sea.canvas),true);
    await page.setViewportSize({width:390,height:844});
    await page.waitForFunction(() => window.sea.canvas.width === 390);
    assert.equal(await page.evaluate(() => window.sea.canvas.height),844);
    for (let click = 0; click < 5; click++) await page.locator('.themeContainer').click();
    await page.waitForFunction(() => document.documentElement.dataset.backgroundTheme === 'sky');
    assert.equal(await page.evaluate(() => window.sky === window.legacySky),true);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('sea-theme')),false);
    for (let click = 0; click < 5; click++) await page.locator('.themeContainer').click();
    await page.waitForFunction(() => document.documentElement.dataset.backgroundTheme === 'sea');
    assert.equal((await read()).parameters.roughness,0.14);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('sea-theme')),true);
    assert.equal(await page.locator('#threejsmain').count(),1);
    assert.deepEqual(errors,[]);
});

test('production daylight defaults and explicit overlay option work under the site CSP', async t => {
    const {page,errors} = await openSite(t,{colorScheme:'light',query:'?overlay=on'});
    assert.equal(await page.evaluate(() => window.sea.renderer.getTheme()),'light');
    assert.equal(await page.evaluate(() => window.sea.renderer.getParameters().roughness),0.14);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('sea-theme')),true);
    assert.equal(await page.evaluate(() => window.sea.canvas.getContext('webgl2').getError()),0);
    assert.deepEqual(errors,[]);
});

test('the restored production overlay can still be disabled explicitly', async t => {
    const {page,errors} = await openSite(t,{query:'?overlay=off'});
    assert.equal(await page.evaluate(() => window.sea.backgroundOverlayEnabled),false);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('sea-theme')),false);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body,'::before').backdropFilter),'none');
    assert.equal(await page.evaluate(() => window.sea.canvas.dataset.oceanRenderer),'fft');
    assert.deepEqual(errors,[]);
});

test('production startup falls back to sky when FFT float targets are unavailable', async t => {
    const {page,errors} = await openSite(t,{floatTargets:false});
    assert.equal(await page.evaluate(() => document.documentElement.dataset.backgroundTheme),'sky');
    assert.equal(await page.evaluate(() => window.sky === window.legacySky),true);
    assert.equal(await page.evaluate(() => localStorage.getItem('backgroundTheme')),'sky');
    assert.equal(await page.locator('#threejsmain').count(),1);
    assert.equal(await page.locator('[data-ocean-renderer="fft"]').count(),0);
    assert.deepEqual(errors,[]);
});

test('comparison starts with approved per-theme defaults and restores them on reset', async t => {
    const {page} = await open(t,'?theme=light');
    assert.equal(await page.locator('#resolution').inputValue(),'256');
    assert.equal(await page.locator('#fft-roughness').inputValue(),'0.14');
    await page.selectOption('#theme','dark');
    await page.waitForFunction(() => !document.getElementById('renderer').disabled);
    assert.equal(await page.locator('#fft-roughness').inputValue(),'0.36');
    assert.equal(await page.locator('#fft-height').inputValue(),'1.6');
    await page.locator('#reset-fft').click();
    assert.equal(await page.locator('#fft-windDirection').inputValue(),'194');
    assert.equal(await page.locator('#fft-roughness').inputValue(),'0.36');
});

function renderedLighting(page) {
    return page.evaluate(() => {
        const gl = window.sea.ctx;
        const sky = gl.getParameter(gl.CURRENT_PROGRAM);
        return {
            day:gl.getUniform(sky,gl.getUniformLocation(sky,'uDay')),
            pitch:gl.getUniform(sky,gl.getUniformLocation(sky,'uPitch'))
        };
    });
}

test('sun and lighting blend through intermediate frames in both directions, including mid-transition reversal', async t => {
    const {page,errors} = await openSite(t,{reducedMotion:'no-preference'});
    await page.evaluate(() => { window.transitionCanvas = window.sea.canvas; });
    assert.equal((await renderedLighting(page)).day,0);
    for (const target of ['light','dark']) {
        await page.emulateMedia({colorScheme:target});
        await page.waitForFunction(target => window.sea.renderer.getTheme() === target,target);
        await page.waitForTimeout(200);
        const first = await renderedLighting(page);
        assert.ok(first.day > 0 && first.day < 1,JSON.stringify(first));
        assert.ok(first.pitch > 1.77 && first.pitch < 2.22,JSON.stringify(first));
        await page.waitForTimeout(200);
        const second = await renderedLighting(page);
        assert.ok(target === 'light' ? second.day > first.day : second.day < first.day,
            JSON.stringify({target,first,second}));
        await page.waitForFunction(target => {
            const gl = window.sea.ctx, program = gl.getParameter(gl.CURRENT_PROGRAM);
            return gl.getUniform(program,gl.getUniformLocation(program,'uDay')) === (target === 'light' ? 1 : 0);
        },target);
        assert.equal(await page.evaluate(() => window.sea.renderer.getParameters().roughness),target === 'light' ? 0.14 : 0.36);
    }
    await page.emulateMedia({colorScheme:'light'});
    await page.waitForFunction(() => window.sea.renderer.getTheme() === 'light');
    await page.waitForTimeout(250);
    const before = await renderedLighting(page);
    await page.emulateMedia({colorScheme:'dark'});
    await page.waitForFunction(() => window.sea.renderer.getTheme() === 'dark');
    const reversed = await renderedLighting(page);
    assert.ok(reversed.day > 0 && reversed.day < 1,JSON.stringify({before,reversed}));
    assert.ok(Math.abs(reversed.day-before.day) < 0.2,JSON.stringify({before,reversed}));
    await page.waitForTimeout(200);
    assert.ok((await renderedLighting(page)).day < reversed.day);
    assert.equal(await page.evaluate(() => window.transitionCanvas === window.sea.canvas),true);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(() => window.sea.stats.fps === 0);
    assert.equal((await renderedLighting(page)).day,0);
    assert.deepEqual(errors,[]);
});

test('comparison lighting transitions preserve the FFT canvas and selected parameters', async t => {
    const {page,errors} = await open(t,'?resolution=128&height=2');
    await page.evaluate(() => { window.transitionCanvas = document.querySelector('#ocean canvas'); });
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForFunction(() => document.getElementById('animate').checked);
    for (const target of ['light','dark']) {
        await page.selectOption('#theme',target);
        await page.waitForTimeout(200);
        const lighting = await page.evaluate(() => {
            const gl = document.querySelector('#ocean canvas').getContext('webgl2');
            const sky = gl.getParameter(gl.CURRENT_PROGRAM);
            return gl.getUniform(sky,gl.getUniformLocation(sky,'uDay'));
        });
        assert.ok(lighting > 0 && lighting < 1,String(lighting));
        assert.equal(await page.evaluate(() => window.transitionCanvas === document.querySelector('#ocean canvas')),true);
        assert.equal(await page.locator('#fft-height').inputValue(),'2');
        assert.equal(await page.locator('#fft-roughness').inputValue(),target === 'light' ? '0.14' : '0.36');
    }
    assert.deepEqual(errors,[]);
});

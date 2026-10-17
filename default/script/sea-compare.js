/* Isolated A/B harness; never loads site.js or changes the saved website theme. */
(() => {
    'use strict';
    const query = new URLSearchParams(location.search);
    const controls = document.getElementById('controls');
    const renderer = document.getElementById('renderer');
    const theme = document.getElementById('theme');
    const resolution = document.getElementById('resolution');
    const blur = document.getElementById('blur');
    const animate = document.getElementById('animate');
    const status = document.getElementById('status');
    const error = document.getElementById('error');
    const description = document.getElementById('description');
    const tuning = document.getElementById('fft-parameters');
    const resetFFT = document.getElementById('reset-fft');
    theme.value = query.get('theme') === 'light' ? 'light' : 'dark';
    const roughnessByTheme = {...SeaFFT.themeRoughness};
    let fftParameters = SeaFFT.normalizeParameters(Object.fromEntries(Object.keys(SeaFFT.parameters).map(name => [name,query.get(name)])),theme.value);
    roughnessByTheme[theme.value] = fftParameters.roughness;
    const parameterInputs = new Map();
    for (const [name,definition] of Object.entries(SeaFFT.parameters)) {
        const label = document.createElement('label');
        const heading = document.createElement('span');
        heading.className = 'range-heading';
        const title = document.createElement('span');
        title.textContent = definition.label;
        const output = document.createElement('output');
        const input = document.createElement('input');
        input.type = 'range'; input.id = `fft-${name}`; input.name = name;
        label.htmlFor = input.id;
        input.min = definition.min; input.max = definition.max; input.step = definition.step;
        output.htmlFor = input.id;
        heading.append(title,output); label.append(heading,input); tuning.append(label);
        parameterInputs.set(name,{input,output,definition});
    }
    function updateParameterInputs() {
        for (const [name,{input,output,definition}] of parameterInputs) {
            input.value = fftParameters[name];
            output.value = `${fftParameters[name]}${definition.unit}`;
        }
    }
    updateParameterInputs();
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    renderer.value = query.get('renderer') === 'original' ? 'original' : 'fft';
    resolution.value = query.get('resolution') === '128' ? '128' : String(SeaFFT.defaultResolution);
    blur.checked = query.get('blur') === 'on';
    animate.checked = !motion.matches;
    if (innerWidth < 600) document.querySelectorAll('details').forEach(details => details.open = false);

    let runtime = null, animationFrame = null, previousFrame = null, started = 0, lastReport = 0;
    let timerExtension = null, pendingQueries = [], frameSamples = [], gpuSamples = [];
    let busy = false;
    let parameterTimer = null, sceneTime = 0, lastSceneFrame = null;
    const records = new Map();
    const label = () => renderer.value === 'original' ? 'Original' : `FFT ${resolution.value}²`;
    const recordKey = name => `${name}/${theme.value}/${innerWidth}×${innerHeight}/${blur.checked}/${name === 'Original' ? '' : JSON.stringify(fftParameters)}`;

    function updateURL() {
        const url = new URL(location.href);
        url.searchParams.set('renderer',renderer.value);
        url.searchParams.set('theme',theme.value);
        url.searchParams.set('resolution',resolution.value);
        url.searchParams.set('blur',blur.checked ? 'on' : 'off');
        const defaults = SeaFFT.defaultParameters(theme.value);
        for (const name of Object.keys(SeaFFT.parameters)) {
            if (fftParameters[name] === defaults[name]) url.searchParams.delete(name);
            else url.searchParams.set(name,fftParameters[name]);
        }
        history.replaceState(null,'',url);
    }
    function clearQueries() {
        if (runtime) pendingQueries.forEach(query => runtime.gl.deleteQuery(query));
        pendingQueries = [];
    }
    function resetMeasurements() {
        clearQueries();
        previousFrame = null; frameSamples = []; gpuSamples = [];
        started = performance.now(); lastReport = -Infinity;
        showMeasurements();
    }
    function showMeasurements() {
        const body = document.getElementById('measurements');
        body.replaceChildren();
        for (const name of ['Original','FFT 128²','FFT 256²']) {
            const record = records.get(recordKey(name));
            const row = body.insertRow();
            row.dataset.active = String(name === label());
            row.insertCell().textContent = name;
            row.insertCell().textContent = record ? record.fps.toFixed(0) : '—';
            row.insertCell().textContent = record?.gpu !== null && record?.gpu !== undefined ? `${record.gpu.toFixed(2)} ms` : '—';
        }
    }
    function consumeQueries() {
        if (!timerExtension) return;
        const gl = runtime.gl;
        if (gl.getParameter(timerExtension.GPU_DISJOINT_EXT)) {
            clearQueries(); gpuSamples = []; return;
        }
        while (pendingQueries.length && gl.getQueryParameter(pendingQueries[0],gl.QUERY_RESULT_AVAILABLE)) {
            const query = pendingQueries.shift();
            gpuSamples.push(gl.getQueryParameter(query,gl.QUERY_RESULT)/1e6);
            if (gpuSamples.length > 90) gpuSamples.shift();
            gl.deleteQuery(query);
        }
    }
    function draw(now) {
        animationFrame = null;
        if (!runtime || busy || document.hidden) return;
        if (animate.checked && lastSceneFrame !== null) sceneTime += (now-lastSceneFrame)/1000;
        lastSceneFrame = now;
        consumeQueries();
        let timer = null;
        const warmed = now-started > 1500 && animate.checked;
        if (timerExtension && warmed && pendingQueries.length < 6) {
            timer = runtime.gl.createQuery();
            runtime.gl.beginQuery(timerExtension.TIME_ELAPSED_EXT,timer);
        }
        runtime.renderOnce(renderer.value === 'fft' ? sceneTime : undefined);
        if (timer) {
            runtime.gl.endQuery(timerExtension.TIME_ELAPSED_EXT);
            pendingQueries.push(timer);
        }
        if (warmed && previousFrame !== null) {
            frameSamples.push(now-previousFrame);
            if (frameSamples.length > 90) frameSamples.shift();
        }
        previousFrame = now;
        if (now-lastReport > 500) {
            lastReport = now;
            if (frameSamples.length >= 15) {
                const mean = values => values.reduce((a,b) => a+b,0)/values.length;
                records.set(recordKey(label()),{fps:1000/mean(frameSamples),gpu:gpuSamples.length ? mean(gpuSamples) : null});
                showMeasurements();
            }
            const timing = !timerExtension ? ' · GPU timer unavailable' : '';
            status.textContent = `${label()} · ${innerWidth} × ${innerHeight} · blur ${blur.checked ? 'on' : 'off'}${!animate.checked ? ' · still frame' : warmed ? timing : ' · warming up…'}`;
        }
        if (animate.checked) animationFrame = requestAnimationFrame(draw);
    }
    function stop() {
        if (animationFrame !== null) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        lastSceneFrame = null;
    }
    async function switchRenderer() {
        if (busy) return;
        clearTimeout(parameterTimer);
        parameterTimer = null;
        busy = true; stop(); clearQueries();
        if (runtime) runtime.destroy();
        runtime = null;
        controls.querySelectorAll('input,select,button').forEach(control => control.disabled = true);
        status.textContent = `Preparing ${label()}…`;
        error.hidden = true;
        document.body.dataset.theme = theme.value;
        document.getElementById('readability').hidden = !blur.checked;
        updateURL();
        try {
            const options = {container:document.getElementById('ocean'),theme:theme.value,animate:false};
            runtime = renderer.value === 'original'
                ? await createGerstnerSeaRenderer(options)
                : await SeaFFT.createRenderer({...options,resolution:Number(resolution.value),parameters:fftParameters,externalAnimation:true});
            // The harness owns the only animation loop for both implementations.
            runtime.pause();
            sceneTime = 0;
            timerExtension = runtime.gl.getExtension('EXT_disjoint_timer_query_webgl2');
            description.textContent = renderer.value === 'original'
                ? 'Original Gerstner renderer: seven Gerstner waves, layered noise and ripples, procedural clouds, foam and bloom.'
                : 'Phillips spectrum, GPU inverse FFT, shared displacement and normals, compression-based foam, simple sky and one sun highlight. No layered ripple noise or bloom.';
            resetMeasurements();
        } catch (failure) {
            document.querySelectorAll('#ocean canvas').forEach(canvas => canvas.remove());
            error.textContent = failure.message;
            error.hidden = false;
            status.textContent = 'Renderer unavailable. Select Original to continue comparing.';
        } finally {
            busy = false;
            controls.querySelectorAll('input,select,button').forEach(control => control.disabled = false);
            resolution.disabled = renderer.value === 'original';
            tuning.disabled = renderer.value === 'original';
            resetFFT.disabled = renderer.value === 'original';
            if (runtime) draw(performance.now());
        }
    }
    function applyParameters() {
        parameterTimer = null;
        if (!runtime || renderer.value !== 'fft' || busy) return;
        runtime.setParameters(fftParameters);
        records.delete(recordKey(label()));
        updateURL(); resetMeasurements(); stop(); draw(performance.now());
    }
    tuning.addEventListener('input',event => {
        if (!Object.hasOwn(SeaFFT.parameters,event.target.name)) return;
        fftParameters = SeaFFT.normalizeParameters({...fftParameters,[event.target.name]:event.target.value});
        roughnessByTheme[theme.value] = fftParameters.roughness;
        updateParameterInputs();
        clearTimeout(parameterTimer);
        // Spectrum edits upload into the existing texture. Debounce them while
        // dragging so Gaussian generation does not block every pointer event.
        if (['windSpeed','windDirection','patchSize','damping'].includes(event.target.name)) {
            parameterTimer = setTimeout(applyParameters,100);
        } else applyParameters();
    });
    tuning.addEventListener('change',() => { clearTimeout(parameterTimer); applyParameters(); });
    resetFFT.addEventListener('click',() => {
        clearTimeout(parameterTimer);
        fftParameters = SeaFFT.normalizeParameters({},theme.value);
        roughnessByTheme[theme.value] = fftParameters.roughness;
        updateParameterInputs(); applyParameters();
    });
    controls.addEventListener('submit',event => event.preventDefault());
    [renderer,resolution].forEach(control => control.addEventListener('change',switchRenderer));
    theme.addEventListener('change',() => {
        fftParameters.roughness = roughnessByTheme[theme.value];
        updateParameterInputs();
        if (runtime && renderer.value === 'fft' && !busy) {
            clearTimeout(parameterTimer);
            runtime.setTheme(theme.value,{roughness:fftParameters.roughness,animate:animate.checked});
            document.body.dataset.theme = theme.value;
            updateURL(); resetMeasurements(); stop(); draw(performance.now());
        } else switchRenderer();
    });
    blur.addEventListener('change',() => {
        document.getElementById('readability').hidden = !blur.checked;
        updateURL(); resetMeasurements(); stop(); draw(performance.now());
    });
    animate.addEventListener('change',() => { stop(); resetMeasurements(); draw(performance.now()); });
    motion.addEventListener('change',event => {
        animate.checked = !event.matches; stop(); resetMeasurements(); draw(performance.now());
    });
    window.addEventListener('resize',() => {
        resetMeasurements(); stop();
        // Wait until the renderer's own resize listener has updated its canvas.
        animationFrame = requestAnimationFrame(draw);
    });
    document.addEventListener('visibilitychange',() => {
        stop(); resetMeasurements();
        if (!document.hidden) draw(performance.now());
    });
    window.addEventListener('pagehide',() => { clearTimeout(parameterTimer); stop(); clearQueries(); runtime?.destroy(); runtime = null; });
    window.addEventListener('pageshow',event => { if (event.persisted) switchRenderer(); });
    switchRenderer();
})();

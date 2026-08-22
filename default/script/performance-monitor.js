/**
 * Lightweight runtime performance monitor for the animated background themes.
 *
 * Tracks both sustained low frame rate and short-term stutter using two
 * sampling windows. Reduced-motion preferences are handled by the themes
 * themselves and are left untouched here.
 */
(function() {
    "use strict";

    var CHECK_INTERVAL_MS = 100;

    // Long window: sustained throughput.
    var SUSTAINED_WINDOW_SAMPLES = 90;       // ~9 seconds
    var SUSTAINED_DOWNGRADE_P75_MS = 45;     // p75 > 45 ms ~ sustained < 22 FPS
    var SUSTAINED_UPSTEP_P75_MS = 28;        // p75 < 28 ms ~ sustained > 36 FPS
    var SUSTAINED_DOWNGRADE_WINDOWS = 3;
    var SUSTAINED_UPSTEP_WINDOWS = 6;

    // Short window: stutter / tail latency.
    var STUTTER_WINDOW_SAMPLES = 30;         // ~3 seconds
    var STUTTER_P95_MS = 48;                 // tail slower than ~21 FPS
    var STUTTER_BAD_FRAME_MS = 33;           // soft budget for smooth motion
    var STUTTER_BAD_FRAME_RATIO = 0.20;      // 20% of frames miss the soft budget
    var STUTTER_RECENT_WINDOWS = 3;          // look at last 3 short windows
    var STUTTER_REQUIRED_BAD_WINDOWS = 2;  // 2 of those 3 must be stuttery

    var OUTLIER_CAP_MS = 200;                // ignore tab-thaw / single huge pauses
    var GRACE_AFTER_SWITCH_MS = 4000;
    var GRACE_AFTER_RESIZE_MS = 1500;

    function percentile(values, p) {
        if (!values.length) return 0;
        var sorted = values.slice().sort(function(a, b) { return a - b; });
        var index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    function badFrameRatio(values, budgetMs) {
        if (!values.length) return 0;
        var bad = 0;
        for (var i = 0; i < values.length; i++) {
            if (values[i] > budgetMs) bad++;
        }
        return bad / values.length;
    }

    function PerformanceMonitor(getActiveThemeName, onDecision, onUpdate) {
        this._getActiveThemeName = getActiveThemeName;
        this._onDecision = onDecision;
        this._onUpdate = onUpdate;

        this._shortSamples = [];
        this._sustainedSamples = [];
        this._shortWindowHistory = [];       // true/false per completed short window

        this._sustainedBadCount = 0;
        this._sustainedGoodCount = 0;
        this._stutterDowngradeFired = false;

        this._ignoreUntil = 0;
        this._lastFps = 0;
        this._running = false;
        this._interval = null;
        this._resizeHandler = null;
        this._visibilityHandler = null;

        this._boundTick = this._tick.bind(this);
        this._boundHandleResize = this._handleResize.bind(this);
        this._boundHandleVisibility = this._handleVisibility.bind(this);
    }

    PerformanceMonitor.prototype._now = function() {
        return performance.now ? performance.now() : Date.now();
    };

    PerformanceMonitor.prototype._resetState = function() {
        this._shortSamples = [];
        this._sustainedSamples = [];
        this._shortWindowHistory = [];
        this._sustainedBadCount = 0;
        this._sustainedGoodCount = 0;
        this._stutterDowngradeFired = false;
    };

    PerformanceMonitor.prototype._handleResize = function() {
        this._ignoreUntil = this._now() + GRACE_AFTER_RESIZE_MS;
        this._resetState();
    };

    PerformanceMonitor.prototype._handleVisibility = function() {
        if (document.hidden) {
            this._resetState();
        } else {
            this._ignoreUntil = this._now() + GRACE_AFTER_SWITCH_MS;
        }
    };

    PerformanceMonitor.prototype._getFrameTimeMs = function() {
        var theme = window.sky;
        if (!theme || !theme.stats || typeof theme.stats.fps !== "number") {
            this._lastFps = 0;
            return null;
        }
        var fps = theme.stats.fps;
        if (!isFinite(fps) || fps <= 0) {
            this._lastFps = 0;
            return null;
        }
        this._lastFps = fps;
        return Math.min(1000 / fps, OUTLIER_CAP_MS);
    };

    PerformanceMonitor.prototype.getLastFps = function() {
        return this._lastFps || 0;
    };

    PerformanceMonitor.prototype._processShortWindow = function(windowSamples, activeTheme) {
        var p95 = percentile(windowSamples, 95);
        var ratio = badFrameRatio(windowSamples, STUTTER_BAD_FRAME_MS);
        var isStuttery = p95 > STUTTER_P95_MS || ratio > STUTTER_BAD_FRAME_RATIO;

        this._shortWindowHistory.push(isStuttery);
        if (this._shortWindowHistory.length > STUTTER_RECENT_WINDOWS) {
            this._shortWindowHistory.shift();
        }

        if (this._stutterDowngradeFired) return;

        var badWindows = 0;
        for (var i = 0; i < this._shortWindowHistory.length; i++) {
            if (this._shortWindowHistory[i]) badWindows++;
        }

        if (badWindows >= STUTTER_REQUIRED_BAD_WINDOWS) {
            this._stutterDowngradeFired = true;
            this._emit("degraded", activeTheme, p95, "stutter");
            this._ignoreUntil = this._now() + GRACE_AFTER_SWITCH_MS;
            this._resetState();
        }
    };

    PerformanceMonitor.prototype._processSustainedWindow = function(windowSamples, activeTheme) {
        var p75 = percentile(windowSamples, 75);

        if (p75 > SUSTAINED_DOWNGRADE_P75_MS) {
            this._sustainedBadCount++;
            this._sustainedGoodCount = 0;
            if (this._sustainedBadCount >= SUSTAINED_DOWNGRADE_WINDOWS) {
                this._sustainedBadCount = 0;
                this._emit("degraded", activeTheme, p75, "sustained");
                this._ignoreUntil = this._now() + GRACE_AFTER_SWITCH_MS;
                this._resetState();
            }
        } else if (p75 < SUSTAINED_UPSTEP_P75_MS) {
            this._sustainedGoodCount++;
            this._sustainedBadCount = 0;
            if (this._sustainedGoodCount >= SUSTAINED_UPSTEP_WINDOWS) {
                // Only upstep if we haven't seen stutter recently.
                var recentStutter = false;
                for (var i = 0; i < this._shortWindowHistory.length; i++) {
                    if (this._shortWindowHistory[i]) {
                        recentStutter = true;
                        break;
                    }
                }
                if (!recentStutter) {
                    this._sustainedGoodCount = 0;
                    this._emit("healthy", activeTheme, p75, "sustained");
                }
            }
        } else {
            this._sustainedBadCount = Math.max(0, this._sustainedBadCount - 1);
            this._sustainedGoodCount = Math.max(0, this._sustainedGoodCount - 1);
        }
    };

    PerformanceMonitor.prototype._tick = function() {
        if (!this._running || document.hidden) {
            return;
        }

        var now = this._now();
        if (now < this._ignoreUntil) {
            return;
        }

        var frameTime = this._getFrameTimeMs();
        if (typeof this._onUpdate === "function") {
            try {
                this._onUpdate();
            } catch (error) {
                console.error("Performance monitor update handler failed:", error);
            }
        }
        if (frameTime === null) {
            return;
        }

        this._shortSamples.push(frameTime);
        this._sustainedSamples.push(frameTime);

        var activeTheme = this._getActiveThemeName();

        if (this._shortSamples.length >= STUTTER_WINDOW_SAMPLES) {
            var shortWindow = this._shortSamples.slice(0, STUTTER_WINDOW_SAMPLES);
            this._shortSamples = this._shortSamples.slice(STUTTER_WINDOW_SAMPLES);
            this._processShortWindow(shortWindow, activeTheme);
        }

        if (this._sustainedSamples.length >= SUSTAINED_WINDOW_SAMPLES) {
            var sustainedWindow = this._sustainedSamples.slice(0, SUSTAINED_WINDOW_SAMPLES);
            this._sustainedSamples = this._sustainedSamples.slice(SUSTAINED_WINDOW_SAMPLES);
            this._processSustainedWindow(sustainedWindow, activeTheme);
        }
    };

    PerformanceMonitor.prototype._emit = function(decision, theme, frameTimeMs, reason) {
        if (typeof this._onDecision === "function") {
            try {
                this._onDecision(decision, theme, Math.round(frameTimeMs), reason);
            } catch (error) {
                console.error("Performance monitor decision handler failed:", error);
            }
        }
    };

    PerformanceMonitor.prototype.start = function() {
        if (this._running) {
            return this;
        }
        this._running = true;
        this._resetState();
        this._ignoreUntil = this._now() + GRACE_AFTER_SWITCH_MS;

        this._interval = window.setInterval(this._boundTick, CHECK_INTERVAL_MS);
        this._resizeHandler = this._boundHandleResize;
        this._visibilityHandler = this._boundHandleVisibility;
        window.addEventListener("resize", this._resizeHandler, { passive: true });
        document.addEventListener("visibilitychange", this._visibilityHandler, { passive: true });

        return this;
    };

    PerformanceMonitor.prototype.stop = function() {
        this._running = false;
        if (this._interval) {
            window.clearInterval(this._interval);
            this._interval = null;
        }
        if (this._resizeHandler) {
            window.removeEventListener("resize", this._resizeHandler);
            this._resizeHandler = null;
        }
        if (this._visibilityHandler) {
            document.removeEventListener("visibilitychange", this._visibilityHandler);
            this._visibilityHandler = null;
        }
        return this;
    };

    PerformanceMonitor.prototype.ignoreNextSwitch = function() {
        this._ignoreUntil = this._now() + GRACE_AFTER_SWITCH_MS;
        this._resetState();
    };

    window.PerformanceMonitor = PerformanceMonitor;
})();

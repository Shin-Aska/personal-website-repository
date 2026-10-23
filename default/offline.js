/* Progressive enhancement. Classic does not load this script. */
(function () {
    "use strict";
    if (!("serviceWorker" in navigator) || !window.isSecureContext || !document.currentScript) return;
    var base = new URL("./", document.currentScript.src);
    if (location.hostname === "classic.richardorilla.website" || /\/classic\//.test(location.pathname)) return;
    var status, statusLabel;
    var statusStyle = document.createElement("link");
    statusStyle.rel = "stylesheet";
    statusStyle.href = new URL("css/offline.css", base).href;
    document.head.appendChild(statusStyle);
    function show(message) {
        if (!document.body) return;
        if (!status) {
            status = document.createElement("output");
            status.id = "offline-reading-status";
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");
            status.setAttribute("aria-atomic", "true");
            var mark = document.createElement("span");
            mark.className = "offline-status-mark";
            mark.setAttribute("aria-hidden", "true");
            statusLabel = document.createElement("span");
            statusLabel.className = "offline-status-label";
            status.append(mark, statusLabel);
            document.body.appendChild(status);
        }
        status.dataset.state = /^Saving/.test(message) ? "saving"
            : /^(Available|Offline)/.test(message) && !/incomplete/.test(message) ? "ready" : "partial";
        statusLabel.textContent = message;
    }
    function message(worker, data, timeout) {
        return new Promise(function (resolve, reject) {
            var channel = new MessageChannel();
            var timer = setTimeout(function () { channel.port1.close(); reject(new Error("Worker unavailable")); }, timeout);
            channel.port1.onmessage = function (event) {
                clearTimeout(timer); channel.port1.close(); resolve(event.data);
            };
            worker.postMessage(data, [channel.port2]);
        });
    }
    // Default only. Speculation starts after the current page has finished saving.
    var prefetchInstalled = false;
    function installPrefetch(registration) {
        if (prefetchInstalled || location.hostname === "guides.richardorilla.website"
                || /\/guides\//.test(base.pathname)) return;
        prefetchInstalled = true;
        var sent = new Set(), idleCount = 0, hoverTimer, idleTimer;
        function permitted() {
            var connection = navigator.connection;
            return navigator.onLine && document.visibilityState === "visible"
                && !(connection && (connection.saveData || /^(slow-2g|2g)$/.test(connection.effectiveType)));
        }
        function candidate(anchor) {
            if (!anchor || anchor.hasAttribute("download") || anchor.target && anchor.target !== "_self"
                    || /\b(?:nofollow|external)\b/.test(anchor.rel)) return null;
            var url;
            try { url = new URL(anchor.href, base); } catch (_) { return null; }
            if (url.origin !== base.origin || url.search || url.hash || url.username || url.password
                    || !url.pathname.startsWith(base.pathname)
                    || !/^[^/]+\.html$/i.test(url.pathname.slice(base.pathname.length))
                    || url.pathname === location.pathname) return null;
            return url.href;
        }
        function warm(anchor, idle) {
            var url = candidate(anchor);
            if (!url || !permitted() || sent.has(url) || sent.size >= 3 || idle && idleCount >= 2) return;
            var worker = navigator.serviceWorker.controller || registration.active;
            if (!worker) return;
            sent.add(url);
            if (idle) idleCount++;
            message(worker, { type: "PREFETCH_PAGE", url: url, intent: !idle }, 30000).catch(function () {});
        }
        function intentElement(target) {
            return target.closest && target.closest("a[href], #blog-showcase .showcase-card, #blog-showcase .shuffle-card.active");
        }
        function anchorFor(element) {
            if (!element) return null;
            return element.matches("a[href]") ? element
                : element.querySelector(".showcase-card-title a[href], .shuffle-card-link");
        }
        document.addEventListener("pointerover", function (event) {
            clearTimeout(hoverTimer);
            if (event.pointerType === "touch") return;
            var element = intentElement(event.target);
            hoverTimer = setTimeout(function () { warm(anchorFor(element), false); }, 100);
        });
        document.addEventListener("pointerout", function (event) {
            if (!event.relatedTarget || !intentElement(event.target)?.contains(event.relatedTarget))
                clearTimeout(hoverTimer);
        });
        document.addEventListener("focusin", function (event) {
            warm(anchorFor(intentElement(event.target)), false);
        });
        function visibleArticles() {
            if (!permitted() || idleCount >= 2 || sent.size >= 3) return;
            var showcase = document.getElementById("blog-showcase") || document.getElementById("blog-articles");
            if (!showcase) return;
            showcase.querySelectorAll(".showcase-card, .shuffle-card.active, #blog-articles a[href], a[href]").forEach(function (element) {
                var rect = element.getBoundingClientRect();
                if (rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight)
                    warm(anchorFor(element), true);
            });
        }
        function idle() {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(function () {
                if (window.requestIdleCallback) requestIdleCallback(visibleArticles);
                else visibleArticles();
            }, 1200);
        }
        window.addEventListener("scroll", idle, { passive: true });
        document.addEventListener("visibilitychange", idle);
        idle();
    }
    function initialConfig() {
        if (navigator.serviceWorker.controller) {
            return message(navigator.serviceWorker.controller, { type: "GET_CONFIG" }, 2500)
                .catch(function () { return {}; });
        }
        // Only the first uncontrolled visit needs its own lightweight release check.
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 2500);
        var marker = new URL("offline-version.json", base);
        marker.searchParams.set("_swcheck", Date.now().toString(36));
        return fetch(marker.href, { cache: "no-store", signal: controller.signal })
            .then(function (response) { if (!response.ok) throw new Error("No version marker"); return response.json(); })
            .then(function (data) {
                if (!/^[a-f0-9]{64}$/.test(data.version || "")) throw new Error("Invalid version marker");
                var manifest = new URL("offline-manifest.json", base);
                manifest.searchParams.set("_swv", data.version);
                return fetch(manifest.href, { cache: "no-store", signal: controller.signal });
            }).then(function (response) { if (!response.ok) throw new Error("No asset manifest"); return response.json(); })
            .then(function (manifest) { return { worker: manifest.files["service-worker.js"].hash }; })
            .catch(function () { return {}; })
            .finally(function () { clearTimeout(timer); });
    }
    function saveVisit(registration) {
        var worker = navigator.serviceWorker.controller || registration.active;
        if (!worker) return;
        var savingNotice = setTimeout(function () { show("Saving for offline use\u2026"); }, 400);
        var urls = [];
        if (window.performance && performance.getEntriesByType) {
            performance.getEntriesByType("resource").forEach(function (entry) {
                // Explicit fetch/no-store requests and API calls must not be warmed.
                if (["script", "link", "css", "img"].indexOf(entry.initiatorType) >= 0) urls.push(entry.name);
            });
        }
        document.querySelectorAll('script[src],link[rel="stylesheet"][href],img[src]').forEach(function (element) {
            urls.push(element.src || element.href);
        });
        message(worker, { type: "SAVE_VISIT", urls: urls }, 90000).then(function (result) {
            show(result.complete ? (result.offline ? "Offline \u2014 saved copy" : "Available offline")
                : "Partly available offline");
        }).catch(function () { show("Offline saving incomplete"); })
            .finally(function () { clearTimeout(savingNotice); installPrefetch(registration); });
    }
    navigator.serviceWorker.addEventListener("message", function (event) {
        if (event.source === navigator.serviceWorker.controller
                && event.data && event.data.type === "OFFLINE_STATUS" && !event.data.complete)
            show("Partly available offline");
    });
    initialConfig().then(function (config) {
        var version = /^[a-f0-9]{64}$/.test(config.worker || "") ? config.worker : "2";
        return navigator.serviceWorker.register(new URL("service-worker.js?v=" + version, base).href,
            { scope: base.pathname, updateViaCache: "none" });
    }).then(function () { return navigator.serviceWorker.ready; })
        .then(function (registration) {
            if (document.readyState === "complete") saveVisit(registration);
            else window.addEventListener("load", function () { saveVisit(registration); }, { once: true });
            window.addEventListener("online", function () { saveVisit(registration); });
        }).catch(function (error) {
            // Reading and the classic fallback still work if registration is blocked.
            console.warn("Offline reading could not be enabled:", error);
        });
}());

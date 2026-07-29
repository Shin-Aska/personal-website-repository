# Remapad, or: How I Stopped Pretending a Gamepad Was a Keyboard

# Introduction

A few months ago, I was using my Steam Deck to browse Netflix, and I remember thinking: *this actually works*. Not because Netflix had built a great controller interface, but because Steam Input was translating everything for me. The gamepad became a mouse. The touchpads became a trackpad. The shoulder buttons clicked. I could lean back on the couch, navigate a web app built for keyboard and mouse, and it felt fine.

That experience rewired my expectations. I got used to the idea that I could sit on a couch and browse the web with a controller in my hands.

Then one evening I moved to my Linux desktop, opened Netflix, and remembered: *there is no Netflix app here*. On Linux, Netflix is a browser tab. And a browser tab assumes you have a mouse and keyboard within arm's reach. The same controller sitting next to me had nothing to say to the page.

I tried the obvious workarounds first. Keyboard mappers. Mouse emulation tools. Browser extensions that simulate keys. Each one had a flaw: some only worked in Chrome, some needed the browser in debug mode, some treated every website as if it were the same page. None of them gave me the thing I actually wanted — a controller-native way to browse the web that understood the site I was on.

So I started building one. That project became Remapad.

# Origin: A Stitch Mock and a PoC Monolith

The idea did not come from nowhere. I had already sketched out the concept as a mock in Google Stitch — a controller-first browser layer for sites that refuse to be controller-friendly. The mock made the need visible. What I wanted was a real extension that could do the same thing.

The first real commit, `a6fa8fa`, was Remapad v1.0.0. It was a proof of concept, and it looked like one: a single `content/content_script.js` that was 710 lines long, doing gamepad polling, settings handling, page actions, and UI feedback all in one file. That monolith was the right shape for a PoC. I could move fast, test the core loop, and figure out whether the idea was worth keeping.

It was. But by the time I was done, I also knew the monolith had to die.

# The Easy Part: Reading the Gamepad

The **Gamepad API** itself is not where the difficulty lives. It is stable, well-supported in Firefox and Chromium, and gives you everything you expect: analog sticks, triggers, pressure-sensitive buttons, full layouts. Reading a controller is straightforward.

The hard part is deciding what to do with that input once you have it.

# The First Real Decision: Actions, Not Keystrokes

My first approach was the naive one. A controller button maps to a keyboard key. A button press dispatches a synthetic `keydown` event. The website reacts as if the user hit a key. Problem solved.

Except it was not.

Firefox does not let an extension inject synthetic keyboard events into a page in the way you need for a generic controller-to-keyboard mapper. Chrome allows it, but only in developer-facing modes that are not acceptable for an extension normal users would install. If Remapad was going to support both browsers — and I wanted it to — keyboard simulation could not be the primary mechanism.

That constraint changed the entire shape of the project. I had to stop asking *which key does this button press?* and start asking *what action does the user want?*

If the user presses the A button on Netflix, they do not want an Enter key. They want *select the focused thing*. If they press right on the D-pad, they do not want a right-arrow key. They want *move to the next item in the carousel*. So Remapad defines a small set of generic actions — click, scroll, focus, fill, toggle, move the virtual cursor, press a physical key combination — and lets users assign them to controller inputs per domain. Netflix gets its own profile. Prime Video gets its own. Everything else falls back to a shared default.

That pivot, from keypresses to intents, is the architectural center of Remapad.

# The Collections Dead-End

With actions in place, I needed a navigation model. My first idea was console-style collections. You would specify CSS class names that group elements into a collection, then navigate left and right within a group and up and down between groups. It sounded clean. It mapped neatly to a directional pad. It made sense on paper.

It did not make sense in a browser.

Web pages are not grid menus. Carousels overlap. Rows are not uniform. Focus and hover are not the same thing. What works on a home screen breaks down on a site with a sidebar, a header, and a lazy-loaded grid. I kept bumping into edge cases where the collection model either did nothing useful or did the wrong thing. The commits from that period (`fd23f99`, `cff51bc`) show me trying to make it work — adding a tabbed interface for collection navigation, adding direct DOM actions, adding a HUD. But the core idea was fighting the medium.

I had to admit it was a dead end.

# The Accidental Cursor

Once collections failed, I asked myself what actually worked on the Steam Deck. The answer was not a grid navigator. It was a virtual cursor. A pointer that you move with a stick, just like a mouse, but driven by a gamepad.

The virtual cursor was not the plan. It was an accident. The collections failure made it obvious that trying to outsmart the page's own layout was hopeless. A cursor does not outsmart the page. It just points at things, the same way a mouse does.

The first navigable cursor landed in commit `5edb3e0` on July 19. It was large, messy, and touched almost every surface of the extension — `content_script.js`, options CSS, options HTML, and options JS all grew together. A week later, in `bcf3b8a`, I modularized it into `content/modules/cursor-controller.js` alongside the HUD controller and overlay styles.

That cursor became the foundation of the whole browsing model. Instead of tracking collection state, the extension simply asks: what is under the cursor right now? If it is inside a carousel, the user scrolls naturally. If it is on a button, the user clicks. No state machine required.

# Navigating Back

A cursor solves a lot, but it creates a new problem: what does "back" mean?

On a console, back is usually a button that takes you up one level. In a browser, back can mean browser history, escaping a focused element, closing a modal, or moving out of a submenu. I spent more time on this than I expected. There is no single commit that says "back navigation fixed" because there was no single fix.

The `ModalFocusManager` (extracted in `3ff5a49`) handles one piece: detecting modals, closing them, restoring focus. The `NavigationController` (extracted in `dda74ea`) handles collection state and spatial scoring. The HUD shows contextual bindings. "Back" ended up being a behavior that depends on context: sometimes history, sometimes focus escape, sometimes modal close. It took iteration to feel right.

# Fullscreen, Search, and the Keyboard That Made Search Make Sense

Once the cursor worked, other features fell into place — but not all at once, and not in the order I expected.

Fullscreen, for example, took longer than it should have. Commit `e3d1bfe` finally added proper browser-window fullscreen toggle support and improved element detection for media players. It sounds small, but fullscreen is one of those browser APIs that behaves slightly differently depending on whether you are targeting a video element, a container, or the document itself. Getting it consistent across sites was tedious.

Search initially did not make sense. Why would a controller user need search? Then I realized that once you have a virtual cursor, clicking a search box is easy, but typing is impossible without a physical keyboard. So I added a virtual keyboard. Commits `4ee36f9` through `cfddb38` modularized the keyboard, added per-site layouts and controller navigation, and wired backspace and enter submission. Once the keyboard existed, search became obvious. Commit `01afa55` added site-specific search selectors and cursor pinning — the final piece that made search usable.

The lesson: search did not make sense until the keyboard did.

# Autoplay: The Hurdle That Refused to Die

During the PoC, I would successfully navigate to a video with the controller, press the button to play it, and nothing would happen. The video would only start if I physically clicked it with a mouse.

It took me a while to understand why. Modern browsers aggressively gate autoplay behind user-activation policies. A controller click is not the same, in the browser's eyes, as a real user gesture. If the extension activates a video element without satisfying that policy, the browser blocks playback.

Commit `468c3f9` introduced autoplay policy detection and simulated interactions. Later, `662f88d` extracted `AutoplayService` to own the cached autoplay check, audio/video probes, and warning toast. The audio probe itself became its own mini-project: commit `1bfb553` improved the probe reliability with structured cleanup and a more distinct multi-tone WAV signal. The extension now probes whether the browser will allow media playback, warns the user if it will not, and only acts once it knows the policy state.

Autoplay was the kind of problem that sounds like a footnote until it breaks your entire use case.

# Gamepad Isolation: Two Worlds, One Controller

There is a problem you only notice once you test on a real site that already uses gamepads.

Some pages — browser games, media players, interactive demos — also read from `navigator.getGamepads()`. If your extension and the page both consume the same controller, you get duplicate behavior. The user presses up; your virtual cursor moves up, and the page's own gamepad handler moves something else up. The experience falls apart.

The fix is to separate who owns the input. Commit `0c59c77` introduced a gamepad event blocker. Commit `a6bbfb5` later transitioned this to dynamic content script injection. The blocker runs in the page's own JavaScript world at `document_start`, before the page's scripts run, and prevents the page from seeing the Gamepad API. Remapad's actual controller logic runs in the extension's isolated content-script world. The page never sees the controller. The extension does. The user gets one consistent behavior.

That split — a MAIN-world blocker and an ISOLATED-world runtime — is not in any tutorial. It is the kind of detail you only discover when you stop treating the controller as a peripheral and start treating it as the primary input device.

# Paying Down the PoC: The Module Refactor

By the last week of July, the monolith had to go. The PoC had proven the idea, but continuing to change one giant file was not sustainable.

Over a few days, I extracted the core pieces into dedicated modules: `DomSimulator` (`353344a`), `SettingsStore` and `SitePolicy` (`0a64569`), `ModalFocusManager` (`3ff5a49`), `AutoplayService` (`662f88d`), `NavigationController` (`dda74ea`), and the cursor/HUD/overlay system (`bcf3b8a`).

This refactor was not just tidiness. Remapad deliberately uses plain HTML, CSS, and JavaScript with no package manager and no bundler. That choice keeps the extension transparent and dependency-free, but it also means you cannot lean on a bundler to hide sloppy boundaries. Module discipline is the only discipline you have. Each classic script loads in a strict order and shares a namespace. If the boundaries are wrong, you feel it immediately.

# How AI Fit In (and Where It Didn't)

I should be honest about how this got built. Most of the implementation volume was done with AI, through my OMO (Oh My Opencode) setup — which I wrote about in [seting_up_opencode.html](seting_up_opencode.html) — primarily using the Sisyphus agent. Sisyphus is good at turning an architectural intent into working code across many files.

But the architecture itself was mine. The decision to stop pretending a gamepad was a keyboard. The decision that collections were a dead end. The decision that a virtual cursor was the right navigation model. The call to support both Firefox and Chrome from the start. Those were not AI suggestions. Those were product calls I made after hitting walls and testing alternatives.

AI was the implementer. I was the architect. When the direction was wrong — and collections was wrong — AI would not have saved me. I had to recognize the failure and redirect. That part is still human work.

# Polish, Then More Polish

After the hard problems were solved, there was a long tail of smaller things that mattered more than they sound.

Controller glyphs, for example. A button is not just a button. To a PlayStation user it is ✕, to an Xbox user it is A, to a Nintendo user it is B. The Gamepad API gives you an `id` string, but manufacturers do not standardize it. Remapad auto-detects PlayStation, Xbox, and Nintendo layouts and lets users override the guess. Commits `3adefd6` and `ae99713` show that detection expanding and staying in sync at runtime.

Then there was discoverability. A controller extension has no visible UI until you know the right button. I added a HUD for in-page binding hints (`2ee9463`, `2bdc7c1`), then a full interactive options tutorial (`2b524d1`), then reset/skip controls (`5dba95c`), then an activation chime with volume settings. Each one came from watching the extension almost work and realizing the user had no way to learn it.

The final commits were the practical things you need to ship: release checklist, store listing notes, promotional assets (`34050dd`).

# Conclusion

The Gamepad API is stable. It is supported in Firefox and Chromium. It works with USB and Bluetooth controllers. It has been there for years, waiting for someone to take it seriously outside of games.

Building Remapad taught me that the hard part is not reading the controller. The hard part is deciding what the input means, preventing the page from interpreting it twice, and making the whole thing discoverable without a mouse.

We do not build for controllers because most of us build for the desk. But the browser runs on TVs, handhelds, couches, and projection screens. It runs for users whose primary input device is not a keyboard. Treating gamepads as second-class input does not just limit games; it limits how and where the web can be used.

Remapad is one attempt to change that default. It builds a controller-first browsing layer on top of a web platform that already has everything it needs — we just have not been using it.

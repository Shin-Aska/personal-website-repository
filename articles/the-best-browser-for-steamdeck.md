# The Best Browser for Linux

## Introduction

One of the most common questions from new Steam Deck users is, *"How do you browse the internet with this thing?"* While the Steam Deck comes with Firefox preinstalled, it's not accessible in Gaming Mode—the default interface. To use Firefox, you have to manually add it as a non-Steam game in Desktop Mode.

Fortunately, there are [scripts<sup>[1]</sup>](https://gitlab.com/finewolf-projects/steamos-helpers/-/tree/master/firefox-in-gamemode) that enable Firefox, installed via Flatpak, to function within Gaming Mode. These scripts utilize KWin on top of Gamescope (Gaming Mode's Wayland compositor), allowing users to enjoy tab switching and other browser conveniences.

However, beyond configuring Firefox, there are many browsers available on Linux. Considering the unique form factor of the Steam Deck, its hardware constraints, and the limitations of its operating system, let's answer the question: **Which browser is the best fit for the Steam Deck?**

## Challenges

The Steam Deck's operating system, SteamOS, and its hardware present unique challenges for browsing. For instance:

### No Native Autocorrect or Spelling Suggestions

While the OS includes an on-screen keyboard, it lacks key features like autocorrect and spelling suggestions.

### Limited Voice Typing Support

Though the device has built-in microphones, SteamOS doesn’t natively support voice typing.

Typing on the Steam Deck often involves using the trackpads to mimic left and right mouse clicks, which works but can be cumbersome for prolonged sessions.

### Extensions to address these gaps

Luckily, some browsers and extensions address these gaps:

- **Voice Typing**: Extensions like Dictanote's [Voice-in](https://dictanote.co/voicein/)<sup>[2]</sup> enable voice-to-text functionality, albeit with occasional quirks.
- **Spell Checking**: Most browsers include built-in spell checkers, which, while not a replacement for autocorrect, help with typos and spelling errors.

There are plenty of more, you just have to make an effort to visit your browser's extension store.

## Browser Engines

For technical users, the choice of browser often hinges on the strengths and weaknesses of these engines. For non-technical users, the focus is more on features and usability rather than the underlying technology.

Modern browsers are built on two primary engines:

### WebKit and Its Derivatives (Chromium/Blink)

Powers popular browsers like Chrome, Edge, and Safari.

### Quantum

Powers Firefox and other Firefox-based browsers such as but not limited to: Florp, Zen, Waterfox and Tor.

## Recommendations

I have split the recommendation to two. Two browsers per engine, this is because although I recommend Quantum based browsers by default (mainly because of extended support for manifest v2 extensions such as ublock origin), there are use-cases where Webkit is better such as playing browser games.

Additionally, I do disregard if the browser is either proprietary or not. Given that most people who use the Deck do not care about it anyways (considering that Steam is proprietary) so there will be proprietary browsers in the list.

Here are the browsers I recommend:

### Webkit and derivatives based browsers

- [ ] [![](images/steamdeck.png)](images/steamdeck.png)
- [ ] Figure 1. Customized Vivaldi running on Steam deck

1. [Vivaldi](https://flathub.org/apps/com.vivaldi.Vivaldi) - Vivaldi packs alot of features to boot and some of its features are better suited for the Deck such as Built in toolbar clock, sync with notes and reading list and easy to customize user interface.
   
2. [Edge](https://flathub.org/apps/com.microsoft.Edge) - Edge is a good choice if you are looking for a chromium based browser. Although it does not contain the features Vivaldi has that I have listed above, it does however have features better suited for a browser user such as Built in coupon finder and Built in image editor.

- [ ] [![](images/steamdeck_edge_highlight.png)](images/steamdeck_edge_highlight.png)
- [ ] Figure 2. Edge running on Steam deck

It should be noted that these two browsers offer alot more than what I listed but for me these are the features that I find killer for them. Some of the features that I did not list is a way to group tabs, split view, other sort of syncing (sending files from different devices), etc.

### Quantum based browsers

- [ ] [![](images/steamdeck_firefox_highlight.png)](images/steamdeck_firefox_highlight.png)
- [ ] Figure 3. Firefox running on Steam deck

1. [Firefox](https://flathub.org/apps/org.mozilla.firefox) - The one best and most customizable browser. You can adjust Firefox's user interface via userChrome.css (same approach covered in the [Opening unlimited tabs with Firefox article<sup>[3]</sup>](https://www.richardorilla.website/firefox-unlimited-tabs-setup.html) last month). There is even a [listing of popular userChrome CSS themes<sup>[4]</sup>](https://trickypr.github.io/FirefoxCSS-Store.github.io/) themes but if you prefer other hacks such as tabs on bottom and alike, there is a [popular github repository<sup>[5]</sup>](https://github.com/MrOtherGuy/firefox-csshacks/tree/master/chrome) for that as well (Note that this is just one of the repositories containing Firefox UI hacks).

2. [Zen](https://flathub.org/apps/io.github.zen_browser.zen) - You may not enjoy the same customizability level compare to Firefox because this browser is heavily modified from the ground up. The user interface is easier to customize and offering plethora of options. It has most of my favorite extensions preinstalled (or offers something similar to) such as auto tab discard and containers. Take note that this browser is still in the beta stages as I am writing this article, so you may encounter bugs here and there. For example, the GPU acceleration does not work on my Surface device for some reason.

- [ ] [![](images/steamdeck_zen_highlight.png)](images/steamdeck_zen_highlight.png)
- [ ] Figure 4. Zen running on Steam deck

It should be noted that the links are already provided in the browser name, but to be more specific, these are flatpak links. Since I do encourage that flatpaks are used to ensure minimal interruptions during any SteamOS version upgrades.

## Decky Browser plugin

I am quite aware of the Decky Browser plugin but I highly discourage it being used because aside from the security concerns it highlights, it lacks extension support, sync and quite frankly crashes from time to time causing the whole gaming mode to break.

- [ ] [![](images/decky_browser_plugin_warning.png)](images/decky_browser_plugin_warning.png)
- [ ] Figure 5. Decky Browser plugin warning

## My recommendation

For a casual user (that may have some light or heavy browser gaming). I recommend Vivaldi. Mainly due to its' customizable user interface. I mean sure I can do the things on Firefox using userChrome.css hacks but the fact Vivaldi put huge effort to have these customization in the browser settings is just fantastic for casual users.

Then some of its features like their clock toolbar (which initially I found redundant when I use on Desktop) I find perfect on the deck because of how the Steam deck gaming mode user interface operates (accessing the time for example, I have to press Quick Access Menu).

Finally if you do play browser games, Webkit based browers are often times better than Quantum based browsers in terms of performance because of its better implementation to WebGL and WebGPU (Probably thanks to patents no doubt).

Some of the games I have observed where Webkit performs better are Flyff Universe, Hordes.io and Stumble guys (although they have a dedicated Steam app that is playable on Proton anyways).

Of course I will say that with Manifest V2 extinction happening soon, Quantum based browsers will no doubt end up having superior extensions for better browsing experience. I mean Edge and Vivaldi may have built-in adblock but it performs subpar to ublock origin.

## Closing Thoughts

There is nothing stopping you from using other browsers not on the list (such as Chrome). Although challenges may arise if the browser is not in flatpak because SteamOS is atomic Operating System.

Furthermore, I have written modifications out of finewolf's bash script  for launching Firefox for Edge, Vivaldi and Zen. They can be downloaded [here](browser-bash-scripts.zip). Feel free to use this as your base or use it as it is preconfigured.

## Update: January 29, 2025

I have revised some of the content here, removing some of the sections of the article in an effort to make the article more straight forward.
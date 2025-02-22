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

- **Voice Typing**: Extensions like Dictanote's [Voice-in<sup>[2]</sup>](https://dictanote.co/voicein/) enable voice-to-text functionality, albeit with occasional quirks.
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

1. [Firefox](https://flathub.org/apps/org.mozilla.firefox) - One of the best and most customizable browsers. You can modify its user interface using **userChrome.css**, as explained in [Opening Unlimited Tabs with Firefox article<sup>[3]</sup>](https://www.richardorilla.website/firefox-unlimited-tabs-setup.html) . There is a [list of popular userChrome.css themes<sup>[4]</sup>](https://trickypr.github.io/FirefoxCSS-Store.github.io/) available, and if one wishes to customize it even further such as having tabs on the bottom, a [popular GitHub repository<sup>[5]</sup>](https://github.com/MrOtherGuy/firefox-csshacks/tree/master/chrome) offers various Firefox UI hacks. It should be noted that this is just one of many repositories with customization options.
3. [Zen](https://flathub.org/apps/io.github.zen_browser.zen) - While not as customizable as Firefox, Zen is built from the ground up with an easier-to-tweak interface and a wide range of options. It comes with many of my favorite extensions preinstalled (or alternatives), like auto tab discard and containers. However, since the browser is still in beta at the time of writing, expect some bugs. For instance, GPU acceleration doesn’t work on my Surface device.

- [ ] [![](images/steamdeck_zen_highlight.png)](images/steamdeck_zen_highlight.png)
- [ ] Figure 4. Zen running on Steam deck

The links are already included in the browser names, but to clarify, they point to the Flatpak versions. I recommend using Flatpaks to minimize disruptions during SteamOS upgrades.

## Decky Browser plugin

I am quite aware of the Decky Browser plugin but I highly discourage it being used because aside from the security concerns it highlights, it lacks extension support, sync and quite frankly crashes from time to time causing the whole gaming mode to break.

- [ ] [![](images/decky_browser_plugin_warning.png)](images/decky_browser_plugin_warning.png)
- [ ] Figure 5. Decky Browser plugin warning

## My recommendation

For a casual user (that may have some light or heavy browser gaming). I recommend Vivaldi. Mainly due to its' customizable user interface. I mean sure I can do the things on Firefox using userChrome.css hacks but the fact Vivaldi put huge effort to have these customization in the browser settings is just fantastic for casual users.

Some features, like the clock in the toolbar **which initially felt redundant on a desktop** turned out to be perfect on the Deck. Given how Steam Deck’s gaming mode UI works (where checking the time requires opening the Quick Access Menu), having the clock always visible is a great convenience.

Finally if you do play browser games, Webkit based browers are often times better than Quantum based browsers in terms of performance because of its better implementation to WebGL and WebGPU (Probably thanks to patents no doubt).

Some of the games I have observed where Webkit performs better are Flyff Universe, Hordes.io and Stumble guys (although they have a dedicated Steam app that is playable on Proton anyways).

Although as of this writing *February 22, 2025*, Firefox is closing the gaps on these performance issues. I have noticed that the current version of Firefox 135 performs very close to Chromium on Flyff Universe. Hordes.io and Stumble guys do still have performance problems/

Of course I will say that with Manifest V2 extinction happening soon, Quantum based browsers will no doubt end up having superior extensions for better browsing experience. I mean Edge and Vivaldi may have built-in adblock but it performs subpar to ublock origin.

## Closing Thoughts

There is nothing stopping you from using other browsers not on the list (such as Chrome). Although challenges may arise if the browser is not in flatpak because SteamOS is atomic Operating System.

Furthermore, I have written modifications out of finewolf's bash script  for launching Firefox for Edge, Vivaldi and Zen. They can be downloaded [here](browser-bash-scripts.zip). Feel free to use this as your base or use it as it is preconfigured.

## Update: January 29, 2025

I have revised some of the content here, removing some of the sections of the article in an effort to make the article more straight forward.

## Update: February 22, 2025

I made some fixes in the recommended browser section for Firefox. Currently, my script that converts Markdown to HTML has a bug with links inside parenthesis, which I may fix soon. For the meantime, I just rewrote that part without using parenthesis. 

I also updated my recommendations to include a new finding regarding Firefox’s gaming performance.
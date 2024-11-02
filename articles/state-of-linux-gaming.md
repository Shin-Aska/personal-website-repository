# State of Linux Gaming in 2021

## Introduction

A decade ago, only a handful of native Linux AAA games were available in the market. The only native AAA game that I can remember back then was Amnesia, and the rest were indie games where the majority were fairly new, under the FOSS license, and made as a hobby.

Tuxkart was not that visually appealing back then as most of the developments are focused on solidifying gameplay, and Wine was still at its infancy that time and can only run old games at best. Thus, many believed that Linux was not meant for gaming.

- [ ] [![](images/tuxkarto_tmb.jpg)](images/tuxkarto.jpg)
- [ ] Figure 1\. Tuxkart version 0\.6

 Now jump back to the present; a lot of things have happened. Most of the indie FOSS license games have become mature. Tuxkart development ended, and a fork continued on its place called SuperTuxKart, which is known as a solid racing time\-killer game now that anyone can get for free and is visually appealing too. Did I forget to mention it has network multiplayer and up to 4\-player split\-screen?

- [ ] [![](images/tuxkart_tmb.jpg)](images/tuxkart.jpg)
- [ ] Figure 2\. SuperTuxkart version 0\.9\.2\. Massive difference in both functionality and graphics

Then Wine started to catch up. It can now run a huge amount of Windows applications that it can run than ever before. A lot more developers have started contributing to the project, which made it possible for newly released Windows applications to begin working on Wine. Not to mention that all of these projects are under FOSS, which in turn allows extraordinary efforts such as porting these projects to other operating systems, which is a win\-win for everyone.

Because of Wine's maturity and potential. Valve saw the opportunity to streamline Wine to Steam and developed Proton (an integrated Wine on Steam) for Linux. They even have documentation for developers to port their games over to Linux via Proton. Proton allowed Valve to open more games to Linux users. (Case in point; I could even play Resident Evil 3 and Trials of Mana on Day 1!)

- [ ] [![](images/re3_1_wine_tmb.jpg)](images/re3_1_wine.jpg)
- [ ] Figure 3\. Resident Evil 3, playable on release via Proton

Although Trials of Mana did require installing Media platform framework to fix the crashing issues (which is a bit difficult to do for a beginner) and Resident Evil 3 was not finishable during the first few versions of Proton. Eventually,  [Custom Proton builds<sup>\[1]</sup>](https://github.com/GloriousEggroll/proton-ge-custom/releases) came in and added their custom fixes to fix these issues on that particular Proton build.

It is far from perfect, and these issues are normal as the Wine community is playing the catchup for creating an unofficial compatibility layer for Windows applications. However, as you can see as well, The community, along with Valve, is doing their work pretty great and is quite fast in most cases (There are cases where it takes a while due to technical limitations like it took time for them to finally implement support for PE ntdll.dll, which is what the Street Fighter 5 DRM required to be playable)

I know why you are here, though. I or somebody else linked you to this article to get more details regarding the state of Linux gaming and is considering switching or go all\-in on Linux possible. However, I will not try to convince you, but I will discuss the technical achievements that allowed Linux gaming to become what it is today, in 2021\.

## Overall State of Wine

### Existence of superior graphical translation layers

- [ ] [![](images/hw_render.drawio.png)](images/hw_render.drawio.png)
- [ ] Figure 4\. Architecture diagram of how Wine translated a Direct3D call

To make it possible for DirectX games to run on Wine. A translation layer is needed as DirectX is exclusive to Windows only. For example, Wine translates Direct3D calls to OpenGL calls. This translation is not the best approach as Direct3D and OpenGL have different fundamental concepts and because of this, performance overheads are inenvitable because not all DirectX calls have a 1\-to\-1 equivalent with OpenGL.

As OpenGL specifications improve over time, the performance penalty should improve as the newer features that each new iterations introduce could help even the gap of the conceptual differences between OpenGL and Direct3D.

However, no matter how much you look at it, OpenGL may be simpler to code but it has been shown time and time again how Direct3D outperforms OpenGL because Direct3D allows finer lower level control in comparison to OpenGL. This may seem a hindrance to Wine's compatibility progress but two translation layers appeared and changed Linux gaming for good.

These are Gallium9 and DXVK. Gallium9 is a native implementation of D3D via Mesa. The native implementation of Direct3D calls from Mesa removes the extra step of translating D3D calls to OpenGL calls. Most GPU calls are done directly at a driver level, which provides a significant performance improvement.

DXVK is another approach where instead of relying on Mesa, it translates D3D calls to Vulkan. Vulkan is a low\-level, high\-performance, cross\-platform graphics API that allows developers to access a GPU's raw hardware power. In contrast to OpenGL, which is simplified, so there is more potential for writing a faster translation layer in Vulkan over OpenGL.

DXVK supports D3D as a whole (Originally only supporting DX10 and 11, but DX9VK is now part of DXVK, which allowed DXVK to support DX9 as well), While Gallium9 is exclusively for D3D9\.

These new translation layers are far from perfect; however, they allow more Linux games than ever before at slightly less performance impact. However, just like the introduction story earlier. It will improve and mature over time allowing more software to be run on Linux and possibly other platforms.

- [ ] [![](images/rendering_issue_megaman_2_tmb.jpg)](images/rendering_issue_megaman_2.jpg)
- [ ] Figure 5\. Rendering issue for Megaman Legacy Collection 2 due to DXVK incorrect translation

For example, the rendering issues for MMLC2 is fixed on a later version of DXVK which means that MMLC2 is now playable on Linux. But there will be games (or future newer titles) that will encounter similar issues.

### Mediaplatform support

Media Foundation/DirectShow/Media Platform are APIs provided by Microsoft to embed rich user media such as videos (for cutscenes), audio in a variety of formats, including those under encryption via DRM.

Originally the potential fix for this was to install Media foundation platform SDK (Mfplat) on your targetted Wine prefix, and it might work (Since there is still software that refuses to run even with this type of hack). Not to mention we are walking to a thin\-ice/grey area here because of the implicated legality in Microsoft's EULA, it is not legal to provide this level of support out of the box, and the user is left on their own to apply this.

Starting in Wine 6\.0, we now have proper Media platform support out of the box using clean\-room reverse engineering efforts, allowing more games to run out of the box that utilizes Media foundation platform.

### DRM Support and Anticheat

These are some of the real problems that Wine is facing right now. Many software, especially under the AAA game section, have DRMs and anti\-cheats incompatible with Wine because most of the DRMs and Anticheats directly use the NT Kernel instead of interacting with the Win32API.

Since Wine is a translation layer of Win32API calls to GNU/Linux calls, when software running on Wine will attempt to do a system call on the NT Kernel, Wine will communicate with the Linux Kernel instead and since the Linux kernel does not understand what the NT kernel system call does, it will provide an incorrect response causing the DRM module or Anticheat to fail.

Of course, there are many ways to fix this; currently, Wine developers will translate the NT Kernel calls without sending a system call directly to the kernel. Quite a hacky approach on solving the problem, This is also one of the reasons why there is massive influx of custom Wine forks that aim to be compatible with a specific game or DRM.

With Linux Kernel 5\.11, there is now syscall\_user\_dispatch that lets the kernel send back unsupported system calls back to userspace, which will help standardize this effort. The new kernel feature is not the silver bullet, but it should help make things manageable now without thousands of forks popping in.

Valve is trying to provide better Proton support for DRMs, especially for single\-player games by nature. However, for Anticheat/Multiplayer games, we are still out of luck. So if you are playing a multiplayer game using Easy Anticheat, such as Fall guys, where the game was playable on Day 1 but became incompatible because the Easy Anticheat integration on a later update.

### Overall Compatibility

- [ ] [![](images/teso_1_wine_tmb.jpg)](images/teso_1_wine.jpg)
- [ ] Figure 6\. Elder Scrolls Online, a playable MMORPG on Proton despite being a Windows only game on Steam.

Naturally, one will think that the latest version is always better. The reality is farther from the truth. Although most updates help improve general compatibility or even fix bugs, regressions exist, breaking the compatibility of a previously working game. Because of these regressions, certain applications or games are recommended to be run on a specific Wine version.

Thankfully it is possible to have multiple versions of Wine installed in a user's system. Thanks to launchers such as Lutris and Play on Linux, they have existing configurations that allow you to run/install applications with minimal effort on the user's end.

Not to mention Steam also allows you to run and configure to use specific versions of Proton (including Custom Proton forks such as Proton\-TKG and Proton\-GE) on a per\-game basis.

In general, we can say that Wine compatibility has been doing great. But it is not yet on the level of super user\-friendliness. Even with Valve's Proton, one may end up applying hacks or installing custom Proton builds to make a game run. With  [WineHQ<sup>\[2]</sup>](https://www.winehq.org/) and  [ProtonDB<sup>\[3]</sup>](https://www.protondb.com/), there is a global database of what runs and what does not and what hacks are needed for a program to run properly. But if you do not like this type of setting, I'm afraid Linux is not for you yet.

- [ ] [![](images/pte_1_wine_tmb.jpg)](images/pte_1_wine.jpg)
- [ ] Figure 7\. A Plague Tale \- Innocence: Another triple\-A game playable via Proton

Honestly, I admit it can be a hassle, but the trade\-off here is that I have more control over my computer. There is no need for me to accommodate and install powerful hardware because of the Windows bloat that later versions of Windows have.

I do not need to worry that while I am playing a game, suddenly the game turns to a crawl because, for some reason, the telemetry \& compatibility service decides to do its own thing, competing for resources with the game I am playing.

I mean, sure, you can do unofficial tweak Windows to the point where these bloat are entirely removed, but there are consequences in here. For one, it is unsupported, thus, updates can make or break the tweak or the entire system as a whole.

So for me, I would rather go for Linux, which has less bloat in general (or no bloat at all), and just tweak the translation layer until it could support the game well enough to be playable on the said system.

## State of Native games

- [ ] [![](images/eve_1_wine_tmb.jpg)](images/eve_1_wine.jpg)
- [ ] Figure 8\. EverSpace \- One of the games that has a native Linux port

Despite Wine being the main spotlight in Linux gaming lately (due to it allowing to access more Windows applications), there has been increasing traction of Linux native ports, especially on the Indie section. Not to mention that have been online games too that slowly added native Linux support.

Examples are Valheim and Skul the hero slayer; both are popular games right now.

### The rise popularity of AppImages

If Windows has static linked executables, MacOS has standalone executables, Linux has AppImages. AppImages are like standalone executables. You don't have to install it on the system; you can just run it after downloading it. All the necessary files are packed in a single container. No need to install dependencies; it just works.

I have seen many companies supporting it lately, such as Artix Games using AppImages on their Game Launcher, OnlyOffice distributing AppImages. This is great because developers do not want to adopt Linux due to its fragmented ecosystem, and now AppImage is one of the solutions for that.

If you have not visited the Goodies section of this site. Most games I have linked there for Linux are distributed under AppImage. Just download the file, store it on a flash disk storage, and then execute it.

#### Flatpak and Snap, the other answers

These are other answers to software distribution. Flatpak and Snap are somewhat similar, although they differ in implementation technicalities.

The key difference between Flatpak and Snap is its sandboxing protocol. Flatpak uses Namespaces while Snap uses AppArmor. Redhat mainly develops Flatpak while Snap is Canonical.

Snap has the most hosted applications among the three, but some are not hosted in Snap but are available in others such as Flatpak or AppImage.

- [ ] [![](images/frogatto_tmb.jpeg)](images/frogatto.jpeg)
- [ ] Figure 9\. Frogatto \- One of the indie games available on several Linux distro repositories for free

With that being said, AppImages, Flatpak, and Snap are just means for developers to effectively distribute their applications outside of using package files that may end up different per Linux distribution due to dependency conflict issues. For example, I am using Ubuntu 18\.04\.5 and will stay here until 2023, but the Glibc library I am using is far lower than what 20\.04 offers, which will be a lot of trouble on applications that require a higher version of Glibc.

I do not need to worry about it anymore with the said methods above. I do not need to worry about breaking old software compatibility since I do not need to force myself to customize my Ubuntu 18\.04\.5 even further to use a
 newer version of glibc!r to use a newer version of glibc!

Currently, there are a lot of applications already distributed using either of the three. Snap has been the most common one, and Flatpak being the second. AppImages vary since there is no consolidated storage or front for it (I know AppImageHub exists); thus, it is left to the developer to distribute their app using AppImage.

## Should I make the switch?

Now the real question. Should you? If your current setup is working fine, and you are happy with Windows as it is. Then don't. I will only recommend switching if, for example, you dislike the direction Microsoft is doing with Windows, or you are considering Linux because you are building a new machine and do not want to spend money on an extra windows license. (Which I greatly emphasize also to research the hardware that you are going to use on your new build as not all hardware are fully compatible with Linux)

If you are not much into online gaming, then you may want to take a look and venture it (as long as you understand that not all games run via proton work perfectly and you will need the time and willingness to tinker to make it work). On the other hand, if the online games you wish to play or currently playing is well known to be supported in Wine (see Figure 6 for an example, then that is another point to consider for a switch.

Here are some of the MMO games that I play that has native Linux clients.

- [ ] [![](images/rs3_tmb.jpg)](images/rs3.jpg)
- [ ] Figure 10\. Runescape \- One of the MMORPGs you can play natively Linux

- [ ] [![](images/minecraft_tmb.jpg)](images/minecraft.jpg)
- [ ] Figure 11\. Minecraft Java Edition \- A popular game that is portable due to it being developed in Java

- [ ] [![](images/tibia_tmb.jpg)](images/tibia.jpg)
- [ ] Figure 12\. Tibia \- Another MMORPG that has a native Linux client

- [ ] [![](images/dota2_tmb.jpg)](images/dota2.jpg)
- [ ] Figure 13\. Dota 2 \- A popular MOBA (Multi\-online battle arena) that has a native Linux client

- [ ] [![](images/csgo_tmb.jpg)](images/csgo.jpg)
- [ ] Figure 14\. Counterstrike Global Offensive \- A popular competitive shooting game that has a native Lnux client

Suppose you are the type of gamer that wants to try the latest multiplayer games. Then it is going to be a hit or miss. If it does work, there is a chance that the developers will outright ban you just because you are running on an unsupported platform, which is the case for a [couple of Linux gamers playing Destiny being banned permanently for "cheating"<sup>\[4]</sup>](https://www.reddit.com/r/linux/comments/dcu7pb/bungie_will_permanently_ban_anyone_who_plays/).

The takeaway here is I am more of a flexible gamer. I have a lot of games in my library, and thus, if one game will not work for me, I switch to another game. I am more into single\-player games these days as it allows me to pause whenever I need to do something else important.

## Update: July 5, 2021 (Provided video recordings in a form of links)

As of this writing, I have bought in a total of three newly released games on Steam. These are: Guilty Gear \-Strive\-, Scarlet Nexus and Legends of Mana. These games do not have native Linux ports and since I mainly game on Linux it was purely a risk in my end.

To my surprise, Guilty Gear \-Strive\- worked out of the box on day 1\. It has some issues like movement demonstration videos not playing but the core game including multiplayer worked great! [<sup>\[YT]</sup>](https://youtu.be/indGn-UrroU) [<sup>\[LC]</sup>](videos/linux_proton_strive.mp4) Scarlet Nexus too worked on day 1 and did not show any issues at all [<sup>\[YT]</sup>](https://youtu.be/TS9y05EK2FY) [<sup>\[LC]</sup>](videos/linux_proton_scarlet.mp4). Legends of Mana actually ran and was able to play for the first few minutes but is considered unplayable because it freezes randomly every so often (probably due to Denuvo) [<sup>\[YT]</sup>](https://youtu.be/Pru0qSgH1yA) [<sup>\[LC]</sup>](videos/linux_proton_lom.mp4). To be fair, the steam port for Legend of Mana is a bit of problematic anyways due to it having slow down issues that the PS4 and Switch versions do not have.

As a Resident Evil fan, I did not purchase nor tried out Resident Evil 8 (Village) \<sup>[because Resident Evil 7 is still in my backlog]. Although I am aware of its history in terms of playability status in Proton. Originally it did not play well because of Denuvo (which was apparent on the demo) but for a couple of weeks later, the Proton community was able to forge in a patch to make the game playable hence obtaining the Gold rating now. I mean as long as its a very popular game, eventually somebody is bound to be able to fix the underlying issues of Wine to be able to make the game playable.

## Update: October 11, 2021

Valve has recently made efforts to make Wine/Proton be compatible with several industry standard Anticheat \& DRM software for their upcoming Steam deck hardware which also resulted in [Epic Games adding an expansion roadmap for supporting Proton and Wine via their EasyAntiCheat while BattleEye promises to have it support on its way<sup>\[5]</sup>](https://www.theverge.com/2021/9/23/22690670/epic-eac-anti-cheat-linux-valve-steam-deck-support-games). Unfortunately there is a significant effort that is needed for developers to tweak with their Anticheat and DRM solutions so it might not be a total instant fix but atleast it is a start.

## Update: January 5, 2022

Several people have asked whether I have seen the [latest Linus tech tips series about Linux gaming<sup>\[6]</sup>](https://www.youtube.com/watch?v=0506yDSgU7M). Their 4 part video indeed shows the reality about Linux gaming. That is, it does work; you can get yourself entertained gaming on Linux.

Although that might sound different from the title of the video's finale, you must understand that it takes to consider that most of the video focuses on the typical gamer perspective, which is Luke's perspective.

Linus and I's experience are similar, and thus, we both have the same perspective since we both are flexible in our gaming experience.

That being said, it aligns with my conclusion. If you are fine with Windows. Stick with Windows. If you want to explore Linux, you can freely do so on a virtual machine or use Windows\-Subsystem for Linux. Gaming on Linux will take a commitment that will not be an attractive venture to most.

## Update: February 11, 2024

This year started with heck of releases. We had Persona 3 reloaded and Grand Blue Fantasy: relink released in the first week of February. Both games are playable on Linux via Proton. I have not seen any issues while I was playing these games using Proton GE.

Tekken 8 on the other hand runs fine but has connection issues on the online multiplayer. I have not seen any issues beyond that and to be fair, the Wine community already has a fix after a week of the game's release.
# The viability of gaming in virtual machines on 2021

## Introduction


 Windows is the de\-facto choice for gamers playing on the PC. This is because
 most games are available only on Windows. As of September 1st 2021, Steam has
 a total of 55,808 games. All of these games has a windows port. 24% (13,143\) of
 these games has a MacOS port and 15% (8,482\) of these has a Linux port.
 


 If you are non\-Windows user. You are missing approximately 70% of the games already
 on Steam. Mind you, Steam is one of the few stores that supports Windows, macOS and Linux. 
 The second one is GoG. There are couple of games out there that are not available on Steam 
 such as Epic and Origin exclusive games, both stores are Windows and MacOS exclusive stores.
 


 Even so, most of these Epic and Origin exclusive games are Windows only anyways. Linux 
 and MacOS can play some of these Windows exclusives via Wine (and Steam's implementation of Wine, Proton)
 however not all games work with it (specially Multiplayer games) which makes it not enough as a solution.
 


 Many people have considered using virtual machines as a possible solution for this problem. Thus in the
 next following section, we will discuss in great detail the possibility, viability, and pros \& cons of 
 playing games in a virtual machine.
 

## Type 1 and Type 2 Hypervisors


 Type 1 and Type 2 Hypervisors have one key difference. One runs bare\-metal (the former), the other runs on 
 an existing operating system (the latter). Type 1 has less overhead than type 2 which is why most prefer 
 type 1 if possible.
 


 The downside of this is, type 1 hypervisors are expensive. It is an enterprise class solution. It is not meant for an
 average Joe to just install, play or run some applications (that their native operating system doesnt support), 
 then turn on/off or pause whenever not needed. It requires a dedicated hardware for the task as that machine
 running the type 1 hypervisor will be running as a server that you connect on.
 


[![](images/proxmox_tmb.jpg)](images/proxmox.jpg)


Figure 1\. A proxmox server with a Windows 10 client.



 If you're interested however [it is worth the price as you can do interesting things in it\[1]](https://www.youtube.com/watch?v=gzXnCuc9bAE).
 


 Type 2 on the otherhand are much more accessible. For example a MacOSX user that wishes to run a windows specific game. For that to happen
 the easiest way to install VMWare Fusion, create a virtual machine under Fusion, install Windows on it, then install its drivers and then 
 finally you can play the game from there.
 

 
 It is pretty interesting stuff as one can do things in it that you normally cannot do 
 on real hardware. Like encountered an old game that wants you to beat it in one seating but you have to go and do something more important,
 then you can just suspend the virtual machine and continue where you left off later.
 


[![](images/vm-paused_tmb.png)](images/vm-paused.png)


Figure 2\. Suspending a virtual machine while it is running a game so that you can continue it later.


  

 Although as it is, its an expensive venture for most. As for example, for an average MacOS user, not only that person has to buy 
 a virtualization license (since Parallels and Fusion are commercial products) \[VMWare Fusion player is free for personal use 
 on MacOS Big Sur users btw], they also have to buy a Windows license. Plus if you were targetting type 1 hypervisors, you have
 to invest the necessary hardware too 
 


 Since I use Linux most of the time, I have the VMWare Workstation 16 license and it costs a significant money. Thankfully I already 
 have an existing Windows Pro license bound on my Microsoft account so I use that exclusively in a Virtual Machine but imagine the cost.
 Where 1 VMWare Workstation 16 license is 200$ and Windows 10 Pro is 200$ as well. You roughly spend 400$ just to get to the virtualization.
 gig.
 


 Parallels might be a cheaper option for most (99$ per year), but it is not a one\-time purchase, it is a subscription so if you are using it for 
 2 years, it is the same price as Fusion Pro.
 

## FOSS Type 2 Hypervisors


 Parallels and VMWare are commercial products and to some, it is hard to afford. However what about Virtualbox or KVM. Are they good for gaming?
 Although these two type 2 hypervisors are free, Virtualbox is terrible with games. Its virtualized 3D hardware performs poorly. KVM is the go\-to choice
 by some, as KVM supports GPU\-passthrough (which is typically a type\-1 hypervisor solution) but making it work is not a straight\-forward solution. Virgl is a promising project but 
 currently only works on Linux guests. As of this writing VMWare's 3D virtualized GPU is the state of the art however it only supports OpenGL 4\.1 and DirectX11\.
 The second one is Parallels but although it supports DirectX11, it only supports upto OpenGL 3\.3
 

## How good is the performance for it on gaming


 With GPU Passthrough via KVM. It almost feel as if you're not running a virtual machine. This make sense as the only real overhead is the CPU emulation and it is not
 really that felt because of IOMMU (Intel Vt\-x / AMD\-Vi). With a virtualized GPU, the performance is significantly slower. For example a GTX1050Ti can perform 
 around roughly an average of 15391\.5 FPS or 76960 frames in total in native hardware but VMWare 3D GPU running on the same GTX 1050ti can only go in an average 
 of 3609 FPS or 18051 frames. Around a 77% performance penalty. Virgl isn't any better as it can only produce an average of 2678 FPS or 13394 frames. Roughly around 25%
 slower than VMWares or around 82% performance penalty.
 


[![](images/native_render.png)](images/native_render.png)


Figure 3\. 1050Ti Glxgears in native performance


  

[![](images/vmware_render.png)](images/vmware_render.png)


Figure 4\. 1050Ti VMWare 3D Glxgears performance


  

[![](images/virgl_render.png)](images/virgl_render.png)


Figure 5\. 1050Ti Virgl 3D Glxgears performance


  

[![](images/vmbox_svga_no3d_accel.png)](images/vmbox_svga_no3d_accel.png)


Figure 6\. 1050Ti Virtualbox 3D Glxgears performance


  

 Take note that I am just measuring the initial values of the glxgears so the average values may not be an accurate benchmark (nor I want to really make a benchmark)
 but what I am trying to emphasize here is that there is a significant performance penalty in a virtualized hardware which is hard to ignore but the question now is,
 with that overhead, is it still feasible?
 


 The answer is yes, it is feasible but there are caveats.[\[LC]](videos/gaming_in_a_vm.mp4) Given that the game supports the API version these type 2 has
 such as DX11 or OpenGL 4\.1 or lower and is not that graphically demanding to the point that it pushes a GPU card to its limits. There are a plethora of games that you can play that are not compatible with Wine even with DXVK and all because of DRM and anticheats. In the video 
 you will notice that most are OK except for XMorph defense which shows FPS drops on certain instances that are not there if ran on native.
 


 However if you are planning to play lets say GTA 5 in it, you will experience performance drops here and there since the game is both CPU and GPU demanding.
 


 But it should be noted that just because you are using a virtual machine, doesn't mean it will solve everything in gaming because there are anticheats out there that specifically restricts virtual machines. So its not all a perfect solution. Not to mention that the virtualized GPU driver may have bugs and thus may be incompatible with certain games even if it uses a supported API.
 


[![](images/mc_kano_tmb.png)](images/mc_kano.png)


Figure 7\. Minecraft with Kano Shaders on Virtual machine. Everything is fine.


  

[![](images/mc_oceano_tmb.png)](images/mc_oceano.png)


Figure 8\. Minecraft with Oceano Shaders on Virtual machine. Everything is fine.


  

[![](images/mc_sildurs_problem_tmb.png)](images/mc_sildurs_problem.png)


Figure 9\. Minecraft with Sildurs Shaders on Virtual machine. Notice that it has plenty of suns? This problem doesn't happen on real hardware.


  
## What about Wine


 If the game or software runs properly on Wine, I suggest you stick with Wine as it has less performance overhead and can offer near native or 
 even faster performance (assuming the Windows native implementation sucks and the translation layer produces a better performing code). But if it doesn't work because of DRM or Anticheat then Virtualization is a good alternative assuming that the game or software you are using uses APIs that the virtualized GPU supports.
 

## Conclusions


 If you are just planning to relive your childhood and play older games or play indie games that do not aim to go for realistic physics, ray\-tracing and all that state of the art features, then gaming via virtualization is a decent alternative. Since these games do not need powerful GPUs.
 


 However if you do are planning to go with playing games that uses state of the art, it is possible as long as you go with the GPU passthrough route.
 I should warn you that it is a difficult but rewarding venture (since it requires hardware that supports GPU passthrough and you need a dual GPU setup). As this technology matures, we may end up having the feature more accessible and more user friendly in the future.
 


 Anything else, if Wine can not help you, then you're out of luck. Just do a dual boot. Playing something like Resident Evil 3 on a virtualized GPU will not be a fun experience because the performance penalty will be huge enough (because its a 77% penalty, roughly you only get 1/4th of the power that your hardware can produce if it was running natively) that it will probably be at 10\-20fps at best, even with a very high end hardware.
 

## Update: June 23, 2022


[![](images/diablo_immortal_tmb.png)](images/diablo_immortal.png)


Figure 10\. Playing Diablo Immortal on very\-high settings on VMware 16 on a Linux host and Windows 11 guest


  

 A friend of mine asked me if I could play Diablo Immortal with him earlier last week. I initially tried first on Wine with DXVK and everything, it seems that playing Immortal on Wine doesn't work yet. 
 


 I have managed to install the game successfully but whenever it runs, it crashes/closes a few seconds later. Tried using Wine builds with modifications from Glorius eggroll (Wine\-GE) to no avail.
 


 Perhaps there is an anticheat at play that prevents it from working on Wine. I investigated the system requirements and found out that the game can run on a low\-end GPU along with DirectX 11 rendering.
 


 Seeing the checklist, I gave it a go on VMware and it worked with acceptable performance. Although it does run on very\-high settings, I do notice that it drops down to 20\-30fps so I tone it down to low so that I can get
 around 40\-60fps performance, give\-or\-take.
 


 I manage to get to level 30 (10 levels higher than the screenshot) for like 4 hours of straight play. So I can say that yes, playing on a virtual machine is still viable in 2022 given that the game you are playing is not demanding enough that the performance penalty will prevent the game from becoming playable at all.
 



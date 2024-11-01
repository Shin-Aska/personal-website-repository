# My opinions on Windows 11 hardware requirements

## Introduction


 It all started with rumors, then a developer build was leaked online. The Windows 11
 hype is real. Then part of the hype, Microsoft suddenly released a tool to check and
 see if your computer is ready for Windows 11 called the PC Health Check App (which
 they pulled out after much backlash) but [alternatives\[1]](https://github.com/rcmaehl/WhyNotWin11) quickly sprout up anyway
 offering a better idea why their computers are not compatible with the upcoming operating
 system (These alternatives are just speculating by the way since Microsoft has been terrible in communicating so far)
 

## TPM 2\.0 hardware requirement


 The TPM architecture is not something that was just invented yesterday. The 2\.0 version
 has been around since 2014 and exists in several forms (hardware chip attached to the motherboard \[discrete TPM],
 a CPU on\-die implementation \[integrated TPM], virtual machines \[hypervisor TPM] and software emulation).
 


[![](images/tpm_in_vm.png)](images/re3_1_wine.jpg)


Figure 1\. TPM 2\.0 enabled virtual machine on VMWare Workstation 15\.5



 Which is why TPM hardware requirement is not much a big deal for me (even though I'm mainly
 a Linux user anyways) is because I usually run Windows on a virtual machine
 and several hypervisor solutions do support TPM emulation (VMware supports TPM 2\.0 on workstation
 since version 14\.0 which basically means you can run Windows 11 on VMWare workstation versions
 14 and up on unsupported hardware) \[Take note that VMWare's TPM implementation does not require
 the host to have TPM].
 



 But what does TPM do anyway? Apparently there are [malwares (knowns as rootkits) that reside itself from
 the disk partition itself (or even deeper than that) \[2]](https://en.wikipedia.org/wiki/Rootkit#Kernel_mode) thus preventing antiviruses from ever so removing it from the computer
 (since it resides somewhere your antivirus cannot reach). So what does it do?


Plenty of nasty stuff,
 such as being able to persist even if Windows itself is reinstalled (which is funny because reformatting
 was always considered the ultimate virus removal solution in the past) to being able to control the victim's
 computer remotely (typical targets are computers that are left unattended for long periods and since [there are ways for computers to execute code just simply by plugging in a USB \[3]](https://github.com/hak5darren/USB-Rubber-Ducky) and installing the rootkit from there).
 



 TPM tries to prevent that by verifying if the computer in question has have their hardware or operating system altered in anyway
 before it fully boots to its installed operating system. So that in anycase if a rootkit does able to reside itself deeper than what the claws
 of your antivirus can reach, the code would not be able to execute at all rendering the rootkit unuseable after restart or virus removal.
 



 But not only does TPM help solve that problem, it also contains several functionalities as well such as being able to generate and store
 encryption keys from the chip itself instead of on disk. It also contains hardware level cryptographic functions and algorithms thus help
 alleviating the load from the CPU (but its real purpose is to prevent any degree of tampering) processing it itself to simply just using 
 what the chip contains.
 


## UEFI and Secure Boot



 It has been well known for quite some time that Microsoft has been planning to dropping off legacy boot support in favor of enforcing UEFI
 for security reasons. With TPM also part of the requirement, Microsoft is basically saying that Windows 11 will only be runnable via secure\-boot
 (since secure boot requires TPM and UEFI available). I do not have any qualms over this.
 


## Windows 11 CPU requirement and lack of transparency



 The real reason of the outrage is the chosen selected chips Windows 11 is able to support. This is because it may seem like the features
 that it is asking for is too arbritary (or could possibly be a request from OEMs). The outrage is understandable so, since 2015 intels (6th gen)
 does offer most of the security features that Microsoft explained as part of the reason (and the lack of clarity).
 



 I did a research of what an i5 from 8th gen to 6th gen processors can do and here is a table that summarizes my findings:
 



 Legend:
 * \* \= No support
* \*\* \= Software emulation available but significant performance impact








| Feature | i5\-8500 | i5\-7500 | i5\-6500 |
| Intel Virtualization Technology (VT\-x) | Y | Y | Y |
| Intel Virtualization Technology for Directed I/O (VT\-d) | Y | Y | Y |
| Intel VT\-x with Extended Page Tables (EPT) | Y | Y | Y |
| Intel Transactional Synchronization Extensions | Y | Y | Y |
| Intel 64 | Y | Y | Y |
| Intel AES New Instructions | Y | Y | Y |
| Secure Key | Y | Y | Y |
| Intel Software Guard Extensions (Intel SGX) | Y with ME | Y with ME | Y with ME |
| Intel Memory Protection Extensions (Intel MPX) | Y | Y | Y |
| Intel OS Guard | Y | Y | Y |
| Intel Trusted Execution Technology | Y | Y | Y |
| Execute Disable Bit | Y | Y | Y |
| Intel Boot Guard | Y | Y | Y |
| Mode Based Execution (MBEC) | Y | Y | N\*\* |
| Hypervisor\-based Code Integrity (HVCI) | Y | Y | N\* |




Figure 2\. CPU Table of security features that Microsoft claims to use on Windows 11




 If you can see most of the features are there on previous generations with the exception of MBEC where it started
 supporting it since 7th gen but is available via software emulation on 6th gen. As for HVCI, this is a new feature 
 only supported by 7th generation processors and up. But it still does not make sense why they chose 8th gen if 7th 
 gen is just as qualified (perhaps processor related bugs?), whatever the case may be, for us we are just left with 
 speculation since Microsoft is not transparent about why.
 



 Although as of writing this. Microsoft did say that they will check 7th gen processor and AMD Zen if it is really
 compatible and stable enough with the new backend changes happening on Windows 11\.
 


## Wasn't Windows 10 the last version of Windows?



 I like how Microsoft went with the lawyer approach here. On 2015, Microsoft did said that [they are going for
 Windows as a service where Windows 10 would simply be receiving continous updates, getting new features and patching
 bugs on the Windows "10 platform" \[4]](https://www.theverge.com/2015/5/7/8568473/windows-10-last-version-of-windows).
 



 Alas! Microsoft went a complete 180 by saying [they never said Windows 10 is the last version of Windows" \[5]](https://www.independent.co.uk/life-style/gadgets-and-tech/microsoft-windows-10-11-panos-panay-stagnant-b1872972.html) which is a bit of an interesting take, because the belief that Windows 10 is the last version of Windows
 started after an interview on one of Microsoft's developers. News articles started saying Windows 10 was the last version afterwards but Microsoft did not even bother correcting them.
 



 I think what happened here is that they really planned on going to that Windows as a service model and Windows 10
 being the last version but then security concerns happened. [Spectre and Meltdown \[6]](https://meltdownattack.com/) was discovered and variants of these
 vulnerabilities sprout out in the wild but the more concerning fact is that the software fix for this (via Operating System)
 does introduce a performance hit and it requires new hardware to fully mitigate the issue.
 



 That being said since employing these security features via an update may cause more problems down the road. Microsoft simply
 just went with "Lets put a new version instead" and make those unqualified/insecure hardware stick with Windows 10 until it
 reaches End of Life.
 


## Is it worth it to upgrade hardware for Windows 11?



[![](images/win11_tmp.jpg)](images/win11.png)


Figure 3\. Windows 11 insider preview




 No, It is not worth it. The key features Windows 11 will have is native Android app support, revamped Windows store, revamped Windows interface (with new icons and taskbar) and the new snap layout (which basically means Windows will remember your settings if you change monitors). These features are really nice to
 have but these are not killer features but very nice quality of life improvements. 
 



 For example, let us tackle the elephant in the room. Native android application support. There is no doubt that this feature is very nice, for end\-users it means ever more apps! but it is not like you cannot install Bluestacks, Nox or MeMu and any other emulator out there.
 



 More importantly most who do use applications like Bluestacks or wishes that Windows to have native android application support are gamers. Currently there are no android support yet in the insider build but I am betting that the chances of having games support will be pretty slim or might be buggy at first (specially if you are gonna be playing
 the online MMO mobile games). It will take quite sometime for Microsoft to be able to catchup the same compatibility level that these emulators provide. Not to mention that it uses Amazon store instead of Google playstore which can be a turning\-off point to most.
 



 At its best, having native android application support is just emulation with less overhead for the system and quite possibly huge performance improvement (which is only possible if you have the latest hardware anyways) thus if you have a hardware that is decent enough the run the game you want in your android emulation software. There is really no need for an upgrade.
 



 The windows store overhaul update is definitely gonna hit Windows 8 and 10 soon I predict (with no Android software support for sure) and the rest are just asthetic changes that you can live without.
 



 You can live with your old hardware until 2025 (or more depending on Microsoft's case) and if it exceeds that. There is always Linux. So to me? It's not that much of a big deal as knowing Microsoft they may do something for the people who do not have the hardware requirement for Windows 11 like being able to install Windows 11 but not receive security updates or some components will not work like Device Guard which requires UEFI to function and Windows 10 devices that still uses MBR are out of luck in it. For average users anyways it doesn't matter as long as it runs Windows and it can run its average computer.
 


## Update: September 9th 2021


Apparently [Microsoft already backtracked\[7]](https://www.extremetech.com/computing/326450-microsoft-will-allow-old-systems-to-install-windows-11-just-not-automatically) their decision even before Windows 11 is released. Way earlier than I predicted. Makes sense anyways as they do not want to lose significant market share to either MacOS or Linux.


So at the end of the day? Microsoft wants to maintain its monopoly. Nothing new. If you have a 1st gen core i7 and it still works. That's great. Use it. You do not need to get the latest specs for Windows anyways but as I say to my friends, if you are using Windows you better use an SSD because its too bloated for your HDD now because of the background services that runs that is part of the Windows ecosystem.






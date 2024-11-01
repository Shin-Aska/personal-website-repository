# Is GNU/Linux really insecure?

## Introduction


 Among all the operating systems out there, GNU/Linux is one of those
 that have a very interesting history. This is because unlike other
 operating systems that started out of a commercial effort, GNU/Linux
 started and has remained as a community effort stemming from the Free
 and Open Source (FOSS) philosophy where source code of a software is
 available for everyone and everyone has the liberty to modify the
 software and redistribute them for whatever purposes.
 


 Now going back to computer security, there is a reason why Linux quickly
 dominated the server space. This is not because Linux has a superior
 architecture nor Linux offers best security but simpler than that. It
 won the server space because it is modifiable and accessibile.
 


 There might not be a financial incentive for somebody to host their own
 server if they had to purchase a Windows Server license just so they can
 host their website, but if the operating system was free as in freedom
 where we can modify it to what we want it to do along with having a
 replacement of the server\-side scripting language bundled with Windows
 Server then that changes things. There is a reason why the popularity
 between
 [Linux\[1]](https://trends.google.com/trends/explore?date=all&geo=US&q=Linux)
 and
 [PHP\[2]](https://trends.google.com/trends/explore?date=all&q=PHP)
 worldwide from 2004 to 2009 are similar in Google trends. This is not a
 coincidence.
 


 GNU/Linux was never there when it comes to computer security but I would
 not say either that it sucked because back then and even to this day
 **all desktop operating systems sucks**
 in a computer security perspective. Quite possibility the reason why
 Linux got such a reputation in computer security is possibility because
 of the myths that surrounded it such as
 **Linux does not have viruses'**,
 **'Linux code is open for everyone to read; therefore is audited;
 therefore is secure'**, **'Majority of the servers are running in Linux'** and etc.
 


 I could go on and on with the examples. I have been getting response lately
 on why I should not recommend Linux for the context of security since Linux
 is insecure. Which boils me the question, **is the sky
 really falling? should we be worried about security concerns in
 GNU/Linux?** Let us discuss some of Madaidan's points that is discussed on this
 [article\[3]](https://madaidans-insecurities.github.io/linux.html)


## Sandboxing

### "Linux still follows the MS\-DOS security model"


 A rogue application on Windows and macOS can still scan a user's
 document directory and can still download a victim's data (Even an
 innocent teamviewer session has the potential to do this). You might
 argue that on Windows and macOS users are warned about unsigned
 binaries, while true that Linux does not do that (because it is useless
 to do so) it is a non\-problem on major Linux distributions because Linux
 desktop users are encouraged to use package managers, app stores
 maintained by GNU/Linux distros, Flathub and Snapcraft instead of running
 random binaries on the internet.
 


 Ofcourse I'm not discrediting Apple's App store and Windows store which
 is also a solution for not encountering rogue applications and having
 the apps distributed on their stores sandboxed. The main point here is
 that Yes, **Linux might still follow the MS\-DOS security model but so
 are the other two major desktop operating systems**. As for sandbox, all
 apps distributed under Flatpak and Snapd are sandboxed by different security
 modules. Whether or not Flatpak and Snapd have inferior sandbox implementations
 is up for a different discussion.
 


 True, I agree that Windows 10 probably has better security mechanisms than Linux
 has by default (since it has a built\-in anti\-virus with ransomware sheild) but
 these security mechanisms are there because **Windows encourages users to always
 be an adminstrators** (which is similar to running everything as root on Unix btw)
 so much so that Microsoft has to invent UAC (User access control) and purposely downgrade
 administrators unless they elevate it purposely via a UAC prompt
 


 As for X\-server not having GUI Isolation, I agree as well that it really is a security nightmare.
 Personally I want Wayland to fully replace X in the future (but more because it hinders the Linux desktop
 from innovation such as being a performance mess and screen tearing issues). Hopefully this year Wayland
 will gain much more traction and Nvidia will start supporting Wayland properly instead of being a dickface.
 

#### I'm scared of a rogue application I installed on Linux that might be a keylogger


 Rogue keyloggers require one important thing before they can ever be useful to somebody. That is being able to
 **send data**. You can just run **nethogs under root** and inspect any suspicious network activity when
 you're being idle. We may not be able to stop a rogue program from snooping keystrokes via X but we can sure as
 hell stop it from sending data back to its creator.
 


 Besides if you're really that paraniod, you can always run virtual machines (Since Linux is free, just grab a
 a virtual machine and create as many Linux virtual machines as you want), then separate your activities to
 different virtual machines. You might want to even install Whoonix in there too! Or if you want, you can ditch
 the whole GNU/Linux distro thingy and just installed Quebes OS (which Madaidan did mention)
 

## Exploit Mitigation

### C and Cpp are both insecure


 C and C\+\+ are programming languages just like Rust. To a new programmer I will definitely recommend Rust over
 C and C\+\+ not because its a **secure/safety first** programming language but because of cargo, Rust's global
 universal package manager. Not to mention it easier to write multiprocess and multithreaded applications in Rust
 over C or C\+\+.
 


 But C and C\+\+ are just tools that are widely flexible all throughout. But more importantly there is a reason why
 they still exists today and it is because computer power is limited and there are cases where performance is more
 important than anything else. Where was the original Rust compiler (yes I know its from Ocaml but Ocaml is
 implemented in?)
 or the Python engine written from? Yep, it is written in C.
 


 C\+\+ is there to fill in the gaps that C has because C disregarded it for the sake simplicity. This is notable for
 having complex features all
 throughout (which is why alot of seniors consider C\+\+ as a mess but they still use it anyway). Both of them allows
 their
 users to shoot themselves on the foot, just like as how a gun does not prevent its user from shooting themselves
 in the head.
 Is that really the gun's fault? (Reminds me of Psycho Pass's dominator device)
 


 The answer is no, I'm guilty of this but most of the developers who write edgy/hacky code and think they know what
 they're doing are
 exactly the people who don't know what they're doing. In other words it's the engineer's fault for writing buggy
 code.
 

### Concerns about Control Flow Integrity (CFI)


 Yes, this is true that most GNU/Linux distros out there are not compiled with CFI in mind but there are kernels
 out there that
 modified for this [very purpose\[4]](https://grsecurity.net/download). If this is your first time hearing
 about custom
 kernels then fear not there are other custom kernels as well such as for [gaming
 and multimedia\[5]](https://xanmod.org/)
 and you can even built and modify your own one.
 

### Concerns about LD\_PRELOAD


 A rogue library attached to a program can indeed cause alot of trouble. But this issue is also prevalent on
 Windows too!
 Oh man! Several applications crashing because a certain dll is missing only for the user to download it on the
 internet
 and then paste it on the applications directory and now it works! with a ticking time bomb attach possibly!
 


 Well my point here is the concerns about rogue libraries are just the same as I pointed out earlier. Desktop
 security is a shitshow.
 

## Root does not have real bounderies


 That section of the article is just plain fear mongering. That script above is meant to be use as an alias to sudo
 by placing that
 script on /usr/local/bin or first executable directory under a user's local $PATH. So what's the point there? we
 cant trust a compromised Linux system?
 But that logic applies to all operating systems. It's just like trying to convince yourself that it is still safe
 even if the house is
 already burning.
 


 Not to mention, the Linux kernel is free to everyone, what is to stop from someone modifying the kernel just to
 make it completely insecure?
 Furthermore use it as the kernel for the compromised Linux system?
 


 How safe am I to use my Windows computer if a virus is already running rampant through it?
 


 Very pointless questions...
 


 Also how the hell does that **xinput test** command allow you to modprobe a system? At the best xinput test can
 only act as a keylogger
 but then again I already discussed that earlier on how to deal with that.
 

### Cutting the beef and going to a conclusion


 To be fair, Madaidan is just reviewing the Linux kernel in a pure security perspective. I agree with most of his
 points and concerns.
 The common GNU/Linux distros out there are very far from secure but more importantly what you can do that you
 can't on Windows and macOS
 is the ability to do something about it since you have the freedom to modify the code to do so.
 


 So is the sky really burning? Nope but **most of his concerns are undeniably valid** such as **GNU/Linux not 
 having a strong sandbox solution available** at the moment and each **GNU/Linux distros having their own issues**
 (Due to how each distros having their own repository and them maintaining their own version of applications).
 These issues are something to be concerned about but not to the point where I would stop using or stop recommending
 someone from using Linux as their daily driver.
 


 Is Linux insecure? Yes but not completely. Windows has its own [share of insecurity problems\[6]](https://www.forbes.com/sites/daveywinder/2020/08/13/windows-10-security-stinker-as-google-reveals-microsofts-patch-tuesday-fix-failure/?sh=26d5525557b1).
 macOS is [not also completely perfect\[7]](https://nvd.nist.gov/vuln/detail/CVE-2020-27930). Look [macOS can even share the same security problems\[8]](https://www.macworld.co.uk/news/big-sur-vulnerability-3801414/) as Linux users do!
 
 So my point? Madaidan's concerns are valid but for a typical Linux user is not a common problem. Don't worry about it.
 Like I said if you're truly concerned that the software you've been using can't be trusted, you can always run them
 inside a virtual machine or an operating system completely revolved around virtual machine level isolation such as Quebes OS
 






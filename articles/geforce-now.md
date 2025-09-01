# I Tried GeForce Now and Here's My Experience

## Introduction

Remote streaming is not a new concept. It began with technologies like **VNC**, which uses the **RFB (Remote Framebuffer)** protocol. This protocol works by sending compressed rectangular blocks of pixels at fixed intervals. This method was inefficient, as updating the entire screen required sending a complete screenshot instead of only the pixels that had changed. Consequently, implementations like VNC had very high latency and were choppy at best. While this was an acceptable trade-off for simple remote desktop control, it was impossible for game streaming.

Fast forward to the early 2010s, when game streaming became a reality. The key breakthrough was **hardware-accelerated video encoding**. GPUs were now powerful enough to encode a game's video output in real-time, making efficient codecs like **H.264** practical for this demanding task. Crucially, H.264 doesn't just send pixel updates faster; it intelligently compresses the entire video stream by analyzing motion between frames. This allowed for a fluid, interactive experience that was previously impossible.

During that time, there was also a shift from the **TCP** protocol to **UDP**. This shift led to new real-time communication frameworks, with **WebRTC** emerging as a major standard. These protocols were designed to tolerate minor packet loss, as a lost video frame is less disruptive than waiting for a re-transmission. This was all part of a relentless pursuit to minimize the delay between the server's action and what you see on your screen.

These advancements were so effective that they were adapted for a much smaller scale: your own home. This is the principle behind local streaming solutions like **Steam Link** (now part of Steam Remote Play).

Finally, these technologies were all tied together by **specialized server infrastructure**. Companies built global data centers packed with high-end gaming hardware, ensuring the physical distance, and therefore latency, to the end-user was as short as possible. Thus, services like Nvidia GeForce Now were born.

## Early Experiences with Local Streaming

My initial impression of remote streaming is positive, as I appreciate the concept of **leveraging my desktop's power and making it accessible elsewhere**. Before owning a Steam Deck, I frequently used Steam Link to play games throughout my home. Whether in the common room or in bed without needing a dedicated device.

I was quite satisfied with this setup for its cost-effectiveness. The main drawback is that **Steam Link is limited to the local network**. Anydesk also offers a smooth streaming experience on a LAN, allowing me to play games much like I could with Steam Link. However, when used remotely over the internet, its performance is good for controlling the PC but not for gaming.

## The Dream of True Remote Play

For years, I dreamed of streaming full-blown PC games from my computer over mobile data, making them truly playable anywhere.

This long-held desire to play PC games anytime, anywhere is precisely what the Steam Deck now provides. From my perspective, this makes a service like GeForce Now seem redundant from the outset. However, I decided to put that assumption to the test.

## My GeForce Now Experience: The Good, The Bad, and The Capped

Admittedly, **GeForce Now has a lower initial cost** at $198 per year, while a 512GB Steam Deck OLED is in the $600 - $700 price range. But a gaming experience is about more than just the price tag. Here in the Philippines, **reliable internet isn't a guarantee**, which is the first major hurdle for a streaming-dependent service.

### Performance on a Good Day

When the internet is stable, typically in the morning or early afternoon, the service works remarkably well. Before I even purchased the Ultimate edition for a year, I was able to play online multiplayer games like **World War Z** with little to no issues. On a good day, the technology feels like magic.

### The Latency Problem

However, there is a noticeable latency that makes a difference in certain games. For fast-paced, competitive titles that require high **APM (actions per minute)** like **StarCraft** or **Warcraft**, this input lag is a dealbreaker. I noticed I was performing poorly and missing inputs that I never have a problem with when playing on my local machine. This makes **GeForce Now unsuitable for anyone serious about their competitive performance in such games**.

### The 100-Hour Limit

The biggest issue for me, though, is the 100-hour per month limitation on the Ultimate tier. This means I have to constantly budget my playtime. For someone who can only play on weekends, it might be hard to even consume all those hours. But back in my heavy gaming periods, where playing eight hours a day was not uncommon, this limit would be gone in less than two weeks.

This restriction makes it clear that the service is meant for lite, supplemental gaming rather than being a true replacement for a dedicated machine. In contrast, on a Steam Deck, I can play 24/7 with no problem.

## Conclusion

While GeForce Now is an impressive piece of technology that shows how far cloud gaming has come, its practical limitations make it a compromised experience for me. The reliance on a perfect internet connection, the inherent latency in competitive games, and the restrictive playtime caps prevent it from fulfilling the dream of a go-anywhere, play-anything PC gaming solution.

For these reasons, **local hardware remains the clear winner**. The rise of powerful handhelds, in particular, offers the freedom and consistency that cloud gaming can't yet match, finally delivering the ability to play PC games anywhere, anytime, without compromise.
# I tried Geforce Now and here is my experience


## Introduction

Remote streaming is not a new concept. It began with technologies like **VNC**, which uses the **RFB (Remote Framebuffer)** protocol. This protocol works by sending compressed rectangular blocks of pixels at fixed intervals. This method was inefficient, as updating the entire screen required sending a complete screenshot instead of only the pixels that had changed. Consequently, implementations like VNC had very high latency and were choppy at best. While this was an acceptable trade-off for simple remote desktop control, it was impossible for game streaming.

Fast forward to the early 2010s, when game streaming became a reality. The key breakthrough was **hardware-accelerated video encoding**. GPUs were now powerful enough to encode a game's video output in real-time, making efficient codecs like **H.264** practical for this demanding task. Crucially, H.264 doesn't just send pixel updates faster; it intelligently compresses the entire video stream by analyzing motion between frames. This allowed for a fluid, interactive experience that was previously impossible.

During that time, there was also a shift from the **TCP** protocol to **UDP**. This shift led to new real-time communication frameworks, with **WebRTC** emerging as a major standard. These protocols were designed to tolerate minor packet loss, as a lost video frame is less disruptive than waiting for a re-transmission. This was all part of a relentless pursuit to minimize the delay between the server's action and what you see on your screen.

These advancements were so effective that they were adapted for a much smaller scale: your own home. This is the principle behind local streaming solutions like **Steam Link** (now part of Steam Remote Play).

Finally, these technologies were all tied together by **specialized server infrastructure**. Companies built global data centers packed with high-end gaming hardware, ensuring the physical distance, and therefore latency, to the end-user was as short as possible. Thus, services like Nvidia GeForce Now were born.

## Initial Opinions

My initial opinions for remote streaming is positive, this is because I do like the idea of using the power of my desktop and make it accessible.
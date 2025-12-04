# Why I Switched to Podman (And Why You Should Too)

## Introduction

I first discovered Podman back in 2022. It was listed as one of the supported engines for **Distrobox**, a tool I was experimenting with at the time. Back then, I was a dedicated Docker user. While I was vaguely intrigued by Podman's "daemonless" nature, I didn't feel a pressing need to switch.

I subscribe to the philosophy: *"If it works, don't fix it."* Docker was working for me or so I thought.

My perspective changed when I moved from building simple, small container images to complex, multi-layered ones. I began hitting friction points that turned my workflow into a headache, eventually forcing me to look for a better alternative. That alternative was Podman.

## The Problem with the Docker Daemon

The cracks in my Docker workflow appeared during heavy build processes. I encountered a situation where a build failed because my disk reached capacity. In a perfect world, this should just stop the build.

However, with Docker, this triggered an unrecoverable state in the storage driver. Because Docker relies on a central daemon (a background process that manages everything), when that daemon struggles to write layers to a full disk, it can corrupt the state of the engine. I wasn't just left with a failed build; I was left with a corrupted installation that required me to completely purge my Docker data and rebuild everything from scratch.

This highlighted a critical architectural flaw: **The Single Point of Failure.**

If the Docker daemon crashes or corrupts, every container it manages goes down with it. It felt fragile.

## The Podman Difference: Native Linux Architecture

This led me to seriously investigate Podman. The immediate "lifesaver" feature was its **daemonless architecture**.

Unlike Docker, which uses a client–server model (the CLI talks to a long-running daemon), Podman works like a traditional Linux command (fork/exec). When you run `podman build`, it is just a process running under your user.

- **Stability:** If a Podman build crashes due to a full disk, only that specific build process dies. My other running containers are unaffected.
- **Safety:** There is no central daemon to corrupt. If the build fails, the cleanup is usually immediate and isolated.

In a native Linux environment, this performance is raw and direct. There is no middleman. Podman interacts directly with the kernel's **cgroups** and **namespaces**, making it incredibly efficient for system resources.

## Podman on Windows: Escaping the Heavy Desktop

You might be thinking, "This sounds great for Linux, but I use Windows."

While both Docker and Podman utilize **WSL2 (Windows Subsystem for Linux 2)** to run containers on Windows, the way they package this experience is vastly different.

Docker Desktop on Windows bundles the WSL2 backend inside a heavy, commercialized application. It runs a resource-intensive GUI and background services that can eat up significant RAM even when idle.

Podman, on the other hand, offers a cleaner approach for Windows developers:

1. **Same Workflow as Linux:** Podman on Windows runs through WSL2 with the same CLI and behavior you get on a Linux machine. If you develop on Linux servers and use a Windows laptop locally, your commands and scripts stay identical.
2. **Lightweight Integration:** Because Podman doesn't force a heavy UI layer (unless you explicitly install Podman Desktop), it often feels lighter on system resources. It leverages the Fedora-based WSL2 backend strictly for the engine, keeping your development environment snappy.
3. **You Control When It Runs:** There is no always-on “big desktop app” in the background. You start what you need (e.g., a Podman machine) when you need it, and shut it down when you’re done.

The end result: Windows stops feeling like a second-class citizen for containers, and your setup is much closer to a “real Linux dev box” with fewer moving parts.

## Simplified Management: The Power of Auto-Update

One of my favorite use cases for containers is hosting [**Neko**<sup>[1]</sup>](https://github.com/m1k1o/neko), a virtual browser running inside a container. It’s excellent for testing web applications or browsing potentially unsafe sites in an isolated environment.

In the Docker world, updating Neko was a chore:

1. Stop the container.
2. Remove the container.
3. Pull the new image.
4. Re-run the container with the exact same flags as before.

If you manage a fleet of services, this becomes tedious very quickly.

Podman introduces a game-changer called **Auto-Update**. By integrating with `systemd`, I can simply run:

```bash
podman auto-update
```

Podman checks if a new image is available, pulls it, restarts the container, and even supports **automatic rollback** if the new container fails to start. It turns a 10-minute maintenance task into a background process I don't even have to think about.

This approach scales beautifully: from “my one Neko container” up to a host running multiple services that all keep themselves up to date with minimal manual intervention.

## Security by Design

Finally, we must talk about security. Docker has historically suffered from vulnerabilities related to its root-privileged daemon.

One illustrative example is [CVE-2018-15664<sup>[2]</sup>](https://nvd.nist.gov/vuln/detail/CVE-2018-15664). In affected versions of Docker, the API endpoints behind the `docker cp` command were vulnerable to a symlink race condition. A malicious process inside a container could:

- Prepare a sneaky symlink setup.
- Wait for an administrator to run `docker cp` to copy files in or out.
- Trick the **root-running Docker daemon** into reading or writing arbitrary paths on the host filesystem.

In other words: the daemon was doing filesystem operations on the host *on behalf of* a container, with full root privileges. That’s exactly the kind of risk you accept when a central, highly-privileged daemon sits in the middle of everything.

Podman drastically reduces this category of risk through two mechanisms:

1. **Daemonless:** There is no persistent root process waiting to be exploited in the same way. Each operation is a short-lived process, not a central authority holding open doors.
2. **Rootless by Default:** Podman is designed to run containers as a non-root user. The default mental model is “my user runs this process,” not “some root daemon runs things for me.”

While Docker now supports "Rootless Mode," it is often more complex to configure and not how most existing Docker installations are set up. Podman works rootless out of the box, which encourages safer defaults, especially on multi-user systems.

### How it Works Under the Hood

Technically, Podman interfaces directly with the Linux kernel's **cgroups** and **namespaces**, adhering strictly to OCI (Open Container Initiative) standards. It uses the same low-level container runtimes (like `runc`) under the hood that Docker does, but without inserting a long-lived daemon into the middle.

The result is a tool that is:

- **Secure:** Less privileged glue code running all the time.
- **Compliant:** Built on open standards that play well in the broader container ecosystem.
- **Lightweight:** Doing only what it needs to, when it needs to, as normal user processes.

## When Docker Is Still the Right Tool (Caveats)

I didn’t throw Docker out overnight, and you probably shouldn’t either. There are still situations where Docker makes sense:

- **Existing Team Workflows:** If your whole team is standardized on Docker, with dozens of scripts, CI pipelines, and docs written around `docker` and Docker Desktop, a migration has a real cost. Podman is mostly compatible but “mostly” still means testing and tweaks.
- **Tooling Ecosystem:** A lot of third-party tools, tutorials, and examples still assume Docker. Podman’s compatibility (`alias docker=podman`) helps, but some edge cases (especially around Docker Desktop–specific features) may not translate perfectly.
- **Mac-Centric Teams:** On macOS, Docker Desktop is still the “default” experience many developers know. Podman has solutions (e.g., Podman Machine), but if your org is heavily Mac-based and fully comfortable with Docker, the switching cost might outweigh the benefits right now.
- **You Haven’t Felt the Pain Yet:** If you’re not hitting daemon corruption issues, not running multi-user hosts, and your threat model is relatively relaxed, Docker might be “good enough” for your current needs.

The point isn’t that Docker is unusable, it’s that, once you’ve seen what a daemonless, rootless-first model feels like, it’s hard to go back.

## Conclusion

I didn't switch to Podman just to be a contrarian. I switched because it treats containers the way they were meant to be treated: as standard Linux processes, not as children of a monolithic server.

We are past the era where we need a daemon to hold our hands. If you value stability, security, and open-source freedom, the question isn't "Why switch to Podman?" it is **"Why are you still tying your containers to a fragile, root-privileged daemon?"**.

At the very least, Podman deserves a spot in your toolbox. In my case, it replaced the toolbox entirely.
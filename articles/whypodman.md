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

Unlike Docker, which uses a client-server model (the CLI talks to a long-running Daemon), Podman works like a traditional Linux command (fork/exec). When you run `podman build`, it is just a process running under your user.

- **Stability:** If a Podman build crashes due to a full disk, only that specific build process dies. My other running containers are unaffected.
- **Safety:** There is no central daemon to corrupt. If the build fails, the cleanup is usually immediate and isolated.

In a native Linux environment, this performance is raw and direct. There is no middleman. Podman interacts directly with the kernel's **cgroups** and **namespaces**, making it incredibly efficient for system resources.

## Podman on Windows: Escaping the "Docker Tax"

You might be thinking, "This sounds great for Linux, but I use Windows."

While both Docker and Podman utilize **WSL2 (Windows Subsystem for Linux 2)** to run containers on Windows, the way they package this experience is vastly different.

Docker Desktop on Windows bundles the WSL2 backend inside a heavy, commercialized application. It runs a resource-intensive GUI and background services that can eat up significant RAM even when idle.

Podman, on the other hand, offers a cleaner approach for Windows developers:

1. **No Licensing Headaches:** This is the most critical difference. **Docker Desktop** requires a paid subscription for larger organizations (companies with over 250 employees or $10M in revenue). Podman is strictly open source (Apache 2.0). You can deploy it across your entire engineering team without worrying about compliance audits or procurement costs.
2. **Lightweight Integration:** Because Podman doesn't force a heavy UI layer (unless you explicitly install Podman Desktop), it often feels lighter on system resources. It leverages the Fedora-based WSL2 backend strictly for the engine, keeping your development environment snappy.

## Simplified Management: The Power of Auto-Update

One of my favorite use cases for containers is hosting **Neko**, a virtual browser running inside a container. It’s excellent for testing web applications or browsing potentially unsafe sites in an isolated environment.

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

## Security by Design

Finally, we must talk about security. Docker has historically suffered from vulnerabilities related to its root-privileged daemon. For example, [CVE-2025-3224](https://www.cve.news/cve-2025-3224/) was a vulnerability where an attacker could potentially execute code with root privileges because the Docker daemon runs as root.

Podman mitigates this entirely through two mechanisms:

1. **Daemonless:** There is no persistent root process waiting to be exploited.
2. **Rootless by Default:** Podman is designed to run containers as a non-root user.

While Docker now supports "Rootless Mode," it is often difficult to configure. Podman works rootless out of the box.

### How it Works Under the Hood

Technically, Podman interfaces directly with the Linux kernel's **cgroups** and **namespaces**. This adheres strictly to OCI (Open Container Initiative) standards, making it highly secure, compliant, and lightweight.

## Conclusion

I didn't switch to Podman just to be a contrarian. I switched because it treats containers the way they were meant to be treated: as standard Linux processes, not as children of a monolithic server.

We are past the era where we need a daemon to hold our hands. If you value stability, security, and open-source freedom, the question isn't "Why switch to Podman?" it is "Why are you still paying for Docker?"
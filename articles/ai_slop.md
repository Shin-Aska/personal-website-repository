# Addressing AI Slop: What It Is and When It Is Not

## Introduction

Recently, drama unfolded regarding Larian Studios and AI. It started with a tweet from Kami confirming that Larian is using generative AI in their upcoming game, *Divinity*.

This tweet sparked an AI "hate mob" on social media, leading to widespread backlash and accusations that Larian is using AI to replace human creativity and craftsmanship. There is also an angle where critics accuse Larian of producing "AI slop," which I find confusing because their previous work is anything but.

The situation escalated to the point that Swen Vincke, the CEO, had to address the issue publicly. He stated that they use AI mainly to search for references and speed up their workflow. This got mixed reactions. Half accepted his explanation, but the other half stuck hard to saying "NO AI."

In light of this, I have written this article to share my observations regarding this backlash and to inform readers what "AI slop" really means and when it becomes problematic. It should be noted that I work mainly with AI in B2B markets. This involves using all kinds of AI, not just LLMs but also "traditional" models, such as neural networks that offer deterministic predictability.

## Definition of Terms

Before we begin, I would like to clarify the terminology and acronyms I will use throughout this article:

* **AI** – Artificial Intelligence, encompassing all forms of AI, including LLMs and traditional machine learning models.
* **B2B** – Business-to-Business, referring to a business model that caters to other businesses.
* **LLM** – Large Language Model, a type of AI designed for natural language understanding and generation.
* **Neural Network** – A type of machine learning model consisting of interconnected nodes organized in layers.

## What is AI Slop?

"AI Slop" is a term coined online to describe low-quality, unoriginal digital content created via generative AI by unskilled individuals. It often implies a lack of creativity, effort, or expertise in the final product. It is typically associated with users who claim AI-generated work as their own.

I observed that this term originated in art circles on X (formerly Twitter), where users would post AI artwork and claim it as their own creation without giving credit or mentioning AI help. Personally, I don't have a problem with people using AI to generate images, but I do take issue when it's used to replace genuine creativity and craftsmanship, like in competitions where originality and skill are expected.

Unfortunately, as generative AI becomes more accessible, "slop" has surfaced in other fields such as music, writing, and software development (including the generation of assets like textures and models).

## The Backlash Against AI Slop

In art circles, the backlash intensified when people began using AI tools without disclosure. This led to the discovery that these tools were trained on vast amounts of copyrighted data, raising concerns about intellectual property and fair use. This revelation sparked a broader conversation about the ethics of training data and the responsibility of the creators using these tools.

It didn’t help that services like Midjourney trained their models on public sites like Pixiv, where artists shared work without explicit permission. This issue was highlighted by the [Midjourney/Artist Database Incident<sup>[1]</sup>](https://www.artnews.com/art-news/news/midjourney-database-leaked-names-16000-artists-1234691955/).

Then there was the Amazon incident, which saw a rise in books published using AI-generated content, often featuring nonsensical titles and fake authors ([Amazon’s AI-generated book problem<sup>[2]</sup>](https://www.pcmag.com/news/amazon-limits-authors-to-self-publishing-3-books-per-day-amid-flood-of)).

In software development, there has been a rise in AI-generated "commits" in open-source projects. These often contain nonsensical code and are pushed by developers who double down on their errors and refuse to acknowledge mistakes, as seen in [The Curl AI-generated bug report incident<sup>[3]</sup>](https://daniel.haxx.se/blog/2024/01/02/the-i-in-llm-stands-for-intelligence/).

Finally, as generative AI improves, companies have begun replacing creative roles with AI. I remember when AI struggled to generate hands or complex structures like a gun, but now companies are pushing it further, such as with the AI-generated intro for Marvel’s *Secret Invasion* ([Marvel’s Secret Invasion AI intro controversy<sup>[4]</sup>](https://deadline.com/2023/06/secret-invasion-opening-credits-ai-backlash-marvel-mcu-disney-1235421667/)).

These events have fostered the opinion that AI-assisted work is just low-quality junk, leading to deep skepticism across many creative and technical fields.

## Beyond Content Generation

Because of the negative perception of AI-generated content, public opinion of AI in general has soured. It doesn't help that as generative AI gets better at producing decent outputs, companies are incorporating these technologies more aggressively, like Microsoft integrating AI into Windows. This gives the impression that companies are forcing "AI slop" onto users.

But AI is more than just content generation. It has been used since the early days of computing for automation, optimization, and decision-making. For example, machine learning techniques detect anomalies in system behavior to improve security. This heuristic technology is what powers modern anti-virus software, like Windows Defender.

Even Photoshop featured AI long before the current hype. "Content-Aware Fill" uses AI to figure out which pixels should fill a selected area, showing the utility of AI way before generative models became popular. People also overlook how AI is used in scientific research. From drug discovery to climate modeling, AI speeds up research by identifying patterns at scales impossible for humans. It also powers recommendation systems. That's how Netflix and Spotify suggest your next favorite show or song.

## An Appeal to the Critics

Let's not throw the baby out with the bathwater. AI has genuine utility beyond content generation, and dismissing it entirely because of poor implementation is shortsighted. Just because a project uses AI doesn't mean the output is low-quality.

The problem is not the AI itself, but the lack of quality control and responsible use. We need better standards, and I want to help educate people about AI beyond the (completely understandable) "slop" hate.

Will AI take our jobs? It’s a valid concern, but AI is more likely to augment roles than replace them. Many companies that went "all-in" on AI have already begun to regret it, realizing they still need human oversight ([MSN replaces human editors with AI then faces backlash<sup>[5]</sup>](https://www.entrepreneur.com/business-news/microsoft-ai-publishes-fake-news-on-msn-angers-the/464775)).

Consider automated compliance checking in the B2B sector. LLMs can help draft and review documents to ensure consistency. However, I’ve found that the non-deterministic nature of LLMs is a major hurdle for production use where reliability is crucial. Businesses are hesitant to rely solely on AI for compliance because AI makes mistakes, and someone must be held accountable for those liabilities.

While someone could try to replace me as a developer with AI (and I do use AI as a tool to enhance my work), it is not perfect. It can introduce errors that are tough to trace. An LLM might generate a solid system from a single prompt, but it struggles to maintain that code over time. LLMs have dataset limitations and context window limits. They might not know the latest patterns or get the nuances of a complex, evolving project.

## Conclusion

The rise of "AI slop" has created a justified skepticism toward generative tools, but it's important to distinguish between low-effort shortcuts and meaningful AI implementation. While AI is a powerful tool for processing data and augmenting workflows, its limitations, like a lack of reliability, "hallucinations," and a finite context window, mean it cannot replace the nuance and accountability of human expertise.

The finite context window has a physical and computational limit that, as far as I know, has no simple circumvention. While some providers attempt to "compact" information or create summaries when the flow hits the limit, these summaries often lose critical nuance ([Do We Need More RAM? Is 32GB the New 16GB?<sup>[6]</sup>](https://www.richardorilla.website/32gb_the_new_16gb.html)).

Furthermore, VRAM and system RAM remain incredibly expensive. This hardware bottleneck is real; I recently published an article regarding the necessity of 32GB of RAM in 2026, specifically because prices have surged due to AI demand [RAM Price Surge: Up to 619% in 2025<sup>[7]</sup>](https://www.glukhov.org/post/2025/12/ram-price-increase/). This leads to deeper concerns about whether we are in an "AI Bubble" or, more accurately, a "Black Hole" of investment where massive capital is consumed with uncertain long-term returns ([The $60T AI Black Hole Theory<sup>[8]</sup>](https://www.reddit.com/r/aiwars/comments/1pm72e4/why_the_ai_bubble_is_actually_a_60t_black_hole/)).

Moving forward, the goal should not be to ban AI or mindlessly attack anyone using it. Instead, we must insist on quality control, ethical training data, and the responsible use of these technologies across all industries. That, to me, makes much more sense.